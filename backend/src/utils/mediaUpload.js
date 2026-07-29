/**
 * Mahsulot media fayllari (rasm va tanishtiruv videosi) uchun yuklash qoidalari.
 * Frontenddagi `src/utils/media.js` bilan bir xil cheklovlar — lekin yakuniy
 * qaror doim shu yerda, server tomonida qabul qilinadi.
 *
 * Fayllar `UPLOAD_DIR` (bo'sh bo'lsa `backend/uploads`) ichida saqlanadi va
 * `/api/uploads/...` manzili orqali statik tarqatiladi. Fayl nomi doim server
 * tomonida yangidan yaratiladi — mijoz yuborgan nom hech qachon yo'lga tushmaydi.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const multer = require('multer');
const { ApiError } = require('../middleware/errorHandler');

const MB = 1024 * 1024;

/** Statik tarqatish `/api` ostida — Vite dev-proxy faqat shu prefiksni uzatadi. */
const PUBLIC_PREFIX = '/api/uploads';

const MEDIA_RULES = {
  image: {
    label: 'Rasm',
    directory: 'images',
    maxSize: 15 * MB,
    maxSizeLabel: '15 MB',
    formatLabel: 'JPEG, JPG yoki PNG',
    mimeTypes: ['image/jpeg', 'image/png'],
    extensions: ['.jpg', '.jpeg', '.png'],
    fallbackExtension: { 'image/jpeg': '.jpg', 'image/png': '.png' },
  },
  video: {
    label: 'Video',
    directory: 'videos',
    maxSize: 50 * MB,
    maxSizeLabel: '50 MB',
    formatLabel: 'MP4',
    mimeTypes: ['video/mp4'],
    extensions: ['.mp4'],
    fallbackExtension: { 'video/mp4': '.mp4' },
  },
};

/** Fayl kengaytmasi yolg'on bo'lishi mumkin — mazmuni ham tekshiriladi. */
const SIGNATURES = {
  image: [
    { offset: 0, bytes: [0xff, 0xd8, 0xff] }, // JPEG
    { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }, // PNG
  ],
  video: [
    { offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }, // MP4/ISO BMFF: "ftyp" box
  ],
};

function rulesFor(kind) {
  const rule = MEDIA_RULES[kind];
  if (!rule) throw new ApiError(400, "Media turi noto'g'ri");
  return rule;
}

function formatMessage(kind) {
  const rule = rulesFor(kind);
  return `${rule.label} formati noto'g'ri. Faqat ${rule.formatLabel} fayl yuklang.`;
}

function sizeMessage(kind) {
  const rule = rulesFor(kind);
  return `${rule.label} hajmi ${rule.maxSizeLabel} dan oshmasligi kerak.`;
}

function contentMessage(kind) {
  const rule = rulesFor(kind);
  return `Fayl buzilgan yoki uning mazmuni ${rule.formatLabel} formatiga mos kelmadi.`;
}

/** Yuklangan fayllar ildizi. Absolyut yo'l qaytaradi. */
function uploadRoot() {
  const configured = (process.env.UPLOAD_DIR || '').trim();
  return configured ? path.resolve(configured) : path.resolve(__dirname, '../../uploads');
}

function mediaDir(kind) {
  return path.join(uploadRoot(), rulesFor(kind).directory);
}

/** Server ishga tushganda papkalar mavjudligini kafolatlaydi. */
function ensureUploadDirs() {
  for (const kind of Object.keys(MEDIA_RULES)) {
    fs.mkdirSync(mediaDir(kind), { recursive: true });
  }
  return uploadRoot();
}

function extensionOf(name) {
  return path.extname(String(name || '')).toLowerCase();
}

/** MIME va kengaytma — ikkalasi ham ruxsat etilgan ro'yxatda bo'lishi shart. */
function isAcceptedFile(kind, file) {
  const rule = rulesFor(kind);
  const mime = String(file.mimetype || '').toLowerCase().split(';')[0].trim();
  const ext = extensionOf(file.originalname);
  return rule.mimeTypes.includes(mime) && rule.extensions.includes(ext);
}

/** Saqlanadigan kengaytma: mijoznikini emas, MIME turidan kelib chiqqanini olamiz. */
function safeExtension(kind, file) {
  const rule = rulesFor(kind);
  const mime = String(file.mimetype || '').toLowerCase().split(';')[0].trim();
  const ext = extensionOf(file.originalname);
  if (rule.extensions.includes(ext)) return ext === '.jpeg' ? '.jpg' : ext;
  return rule.fallbackExtension[mime] || rule.extensions[0];
}

function randomFileName(extension) {
  return `${Date.now().toString(36)}-${crypto.randomBytes(8).toString('hex')}${extension}`;
}

/**
 * `multer` middleware'i: bitta `file` maydonini qabul qiladi, hajm/format
 * cheklovlarini qo'llaydi va xatolarni o'zbekcha `ApiError`ga aylantiradi.
 */
function uploadMedia(kind) {
  const rule = rulesFor(kind);

  const handler = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        const dir = mediaDir(kind);
        fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
      },
      filename(req, file, cb) {
        cb(null, randomFileName(safeExtension(kind, file)));
      },
    }),
    limits: { fileSize: rule.maxSize, files: 1 },
    fileFilter(req, file, cb) {
      if (!isAcceptedFile(kind, file)) {
        cb(new ApiError(400, formatMessage(kind)));
        return;
      }
      cb(null, true);
    },
  }).single('file');

  return (req, res, next) => {
    handler(req, res, (err) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          next(new ApiError(413, sizeMessage(kind)));
          return;
        }
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
          next(new ApiError(400, 'Bir vaqtning o\'zida faqat bitta fayl yuklash mumkin'));
          return;
        }
        next(new ApiError(400, 'Faylni yuklashda xatolik'));
        return;
      }
      next(err);
    });
  };
}

function matchesSignature(kind, head) {
  return SIGNATURES[kind].some(({ offset, bytes }) =>
    bytes.every((byte, i) => head[offset + i] === byte)
  );
}

/**
 * Diskka tushgan faylning haqiqiy mazmunini tekshiradi. Mos kelmasa fayl
 * o'chiriladi va xatolik qaytariladi — ".png" deb nomlangan skript saqlanmaydi.
 */
async function verifyUploadedFile(kind, file) {
  const head = Buffer.alloc(16);
  let bytesRead = 0;

  const descriptor = await fsp.open(file.path, 'r');
  try {
    ({ bytesRead } = await descriptor.read(head, 0, head.length, 0));
  } finally {
    await descriptor.close();
  }

  if (bytesRead < 12 || !matchesSignature(kind, head)) {
    await fsp.unlink(file.path).catch(() => {});
    throw new ApiError(400, contentMessage(kind));
  }
}

function publicUrl(kind, filename) {
  return `${PUBLIC_PREFIX}/${rulesFor(kind).directory}/${filename}`;
}

/**
 * `/api/uploads/...` manzilini diskdagi yo'lga aylantiradi. Manzil bizga
 * tegishli bo'lmasa yoki papkadan chiqib ketishga urinsa — `null`.
 */
function resolveUploadPath(rawUrl) {
  const value = String(rawUrl || '').trim();
  if (!value) return null;

  let pathname = value;
  if (/^https?:\/\//i.test(value)) {
    try {
      pathname = new URL(value).pathname;
    } catch {
      return null;
    }
  }

  const match = pathname.match(/^\/api\/uploads\/(images|videos)\/([A-Za-z0-9_-]+\.[A-Za-z0-9]+)$/);
  if (!match) return null;

  const [, directory, filename] = match;
  const kind = Object.keys(MEDIA_RULES).find((k) => MEDIA_RULES[k].directory === directory);
  if (!kind || !MEDIA_RULES[kind].extensions.includes(extensionOf(filename))) return null;

  const root = uploadRoot();
  const absolute = path.resolve(root, directory, filename);
  if (absolute !== path.join(root, directory, filename)) return null;

  return absolute;
}

/** Yuklangan faylni o'chiradi. Manzil noto'g'ri bo'lsa `false` qaytaradi. */
async function removeUploadedFile(rawUrl) {
  const absolute = resolveUploadPath(rawUrl);
  if (!absolute) return false;
  await fsp.unlink(absolute).catch((err) => {
    if (err.code !== 'ENOENT') throw err;
  });
  return true;
}

/**
 * Mahsulot saqlanayotganda media maydonini tekshiradi: bo'sh, to'liq http(s)
 * havola yoki bizning yuklangan faylimiz bo'lishi mumkin.
 */
function assertMediaValue(kind, value) {
  if (value === undefined || value === null) return;

  const trimmed = String(value).trim();
  if (!trimmed) return;

  if (resolveUploadPath(trimmed)) return;

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    url = null;
  }
  if (url && (url.protocol === 'http:' || url.protocol === 'https:')) return;

  const rule = rulesFor(kind);
  throw new ApiError(
    400,
    `${rule.label} manzili noto'g'ri. To'liq havola (https://...) kiriting yoki fayl yuklang.`
  );
}

module.exports = {
  MEDIA_RULES,
  PUBLIC_PREFIX,
  uploadRoot,
  ensureUploadDirs,
  uploadMedia,
  verifyUploadedFile,
  publicUrl,
  resolveUploadPath,
  removeUploadedFile,
  assertMediaValue,
};
