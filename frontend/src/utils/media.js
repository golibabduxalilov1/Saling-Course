/**
 * Mahsulot media fayllari uchun cheklovlar.
 * Backenddagi `src/utils/mediaUpload.js` bilan bir xil qoidalar — bu yerdagi
 * tekshiruv faqat foydalanuvchiga tez javob berish uchun; yakuniy qarorni
 * doim server qabul qiladi.
 */

const MB = 1024 * 1024;

export const MEDIA_RULES = {
  image: {
    label: 'Rasm',
    endpoint: '/uploads/image',
    accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
    maxSize: 15 * MB,
    maxSizeLabel: '15 MB',
    formatLabel: 'JPEG, JPG yoki PNG',
    mimeTypes: ['image/jpeg', 'image/png'],
    extensions: ['.jpg', '.jpeg', '.png'],
    formatError: "Rasm formati noto'g'ri. Faqat JPEG, JPG yoki PNG fayl yuklang.",
    sizeError: "Rasm hajmi 15 MB dan oshmasligi kerak.",
  },
  video: {
    label: 'Video',
    endpoint: '/uploads/video',
    accept: 'video/mp4,.mp4',
    maxSize: 50 * MB,
    maxSizeLabel: '50 MB',
    formatLabel: 'MP4',
    mimeTypes: ['video/mp4'],
    extensions: ['.mp4'],
    formatError: "Video formati noto'g'ri. Faqat MP4 fayl yuklang.",
    sizeError: "Video hajmi 50 MB dan oshmasligi kerak.",
  },
};

function extensionOf(name) {
  const match = String(name || '').match(/\.[A-Za-z0-9]+$/);
  return match ? match[0].toLowerCase() : '';
}

/** Xatolik matnini (o'zbekcha) yoki mos bo'lsa `null` qaytaradi. */
export function validateMediaFile(kind, file) {
  const rule = MEDIA_RULES[kind];
  if (!file) return 'Fayl tanlanmadi.';

  const mime = String(file.type || '').toLowerCase().split(';')[0].trim();
  const extension = extensionOf(file.name);

  // Ba'zi brauzerlar MIME turini bo'sh qoldiradi — u holda kengaytmaga suyanamiz.
  const mimeOk = mime ? rule.mimeTypes.includes(mime) : true;
  if (!mimeOk || !rule.extensions.includes(extension)) return rule.formatError;

  if (file.size > rule.maxSize) {
    return `${rule.sizeError} Tanlangan fayl: ${formatFileSize(file.size)}.`;
  }
  if (file.size === 0) return "Fayl bo'sh. Boshqa fayl tanlang.";

  return null;
}

export function formatFileSize(bytes) {
  const size = Number(bytes) || 0;
  if (size >= MB) return `${(size / MB).toFixed(size >= 10 * MB ? 0 : 1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

/** Manzil serverga yuklangan faylimizmi (havola emas)? */
export function isUploadedMedia(url) {
  return /^\/api\/uploads\/(images|videos)\//.test(String(url || '').trim());
}

/** Video `<video>` teg orqali o'ynatiladimi, yoki tashqi havolami? */
export function isPlayableVideo(url) {
  const value = String(url || '').trim();
  if (!value) return false;
  if (isUploadedMedia(value)) return true;
  return /\.mp4($|[?#])/i.test(value);
}
