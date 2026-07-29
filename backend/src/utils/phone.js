const { ApiError } = require('../middleware/errorHandler');

// Telefon raqami platformadagi mijoz/adminning asosiy identifikatori. Foydalanuvchi
// uni `+998 (90) 123-45-67`, `998901234567` yoki `90 123 45 67` ko'rinishida yozishi
// mumkin — bazaga esa doim bitta E.164 formatda tushishi kerak, aks holda buyurtma,
// lead va admin login bir xil raqamni turlicha ko'radi.
const DEFAULT_COUNTRY_CODE = '998';
const NATIONAL_LENGTH = 9; // O'zbekiston: operator kodi + 7 raqam
const MIN_LENGTH = 11; // mamlakat kodi bilan eng qisqa raqam
const MAX_LENGTH = 15; // E.164 chegarasi

const ALLOWED_CHARS = /^\+?[\d\s().-]+$/;

/**
 * Raqamni E.164 (`+998901234567`) ko'rinishiga keltiradi.
 * Yaroqsiz yoki bo'sh qiymat uchun `null` qaytaradi.
 */
function normalizePhone(value) {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw || !ALLOWED_CHARS.test(raw)) return null;

  let digits = raw.replace(/\D/g, '');
  // Xalqaro `00` prefiksi `+` bilan bir xil ma'noni bildiradi.
  if (digits.startsWith('00')) digits = digits.slice(2);
  // Mamlakat kodisiz yozilgan mahalliy raqamga standart kodni qo'shamiz.
  if (digits.length === NATIONAL_LENGTH) digits = DEFAULT_COUNTRY_CODE + digits;

  if (digits.length < MIN_LENGTH || digits.length > MAX_LENGTH) return null;

  return `+${digits}`;
}

/**
 * `normalizePhone` bilan bir xil, lekin yaroqsiz raqamda 400 xato tashlaydi.
 */
function normalizePhoneOrThrow(value, label = 'Telefon raqami') {
  const raw = value === null || value === undefined ? '' : String(value).trim();
  if (!raw) {
    throw new ApiError(400, `${label} majburiy`);
  }

  const phone = normalizePhone(raw);
  if (!phone) {
    throw new ApiError(400, `${label} noto'g'ri formatda. Masalan: +998 90 123 45 67`);
  }
  return phone;
}

module.exports = { normalizePhone, normalizePhoneOrThrow };
