/**
 * Reklama havolalari generatori uchun yordamchilar.
 * Frontenddagi `src/utils/adLink.js` shu qoidalarni takrorlaydi (faqat
 * oldindan ko'rish uchun) — saqlanadigan havola doim shu yerda quriladi.
 */

const DEFAULT_SITE_URL = 'http://localhost:5173';

// Kirill harflari lotinchaga o'giriladi, aks holda utm qiymati bo'sh qolardi.
const CYRILLIC_MAP = {
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
  и: 'i', й: 'y', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ў: 'o', ф: 'f', х: 'x', ҳ: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/**
 * Ixtiyoriy matnni UTM uchun xavfsiz tokenga aylantiradi:
 * "Yozgi aksiya" → "yozgi_aksiya", "Видео 1" → "video_1".
 */
function utmToken(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .toLowerCase()
    .replace(/[ʻʼ'`’]/g, '')
    .replace(/[Ѐ-ӿ]/g, (ch) => CYRILLIC_MAP[ch] ?? '')
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 100)
    .replace(/^_+|_+$/g, '');
}

/** Havola qurilishi uchun public sayt manzili — hech qachon kodga yozilmaydi. */
function siteUrl() {
  const raw = process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL || DEFAULT_SITE_URL;
  return raw.trim().replace(/\/+$/, '');
}

/**
 * Yo'naltiriladigan sahifa (yo'l yoki to'liq manzil) ustiga utm parametrlarini
 * qo'yadi. Manzil noto'g'ri bo'lsa `null` qaytaradi.
 */
function buildAdLink({ destination, source, medium, campaign, content }) {
  let url;
  try {
    url = new URL(String(destination || '/'), `${siteUrl()}/`);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const params = new URLSearchParams(url.search);
  params.set('utm_source', source);
  params.set('utm_medium', medium);
  params.set('utm_campaign', campaign);
  if (content) {
    params.set('utm_content', content);
  } else {
    params.delete('utm_content');
  }
  url.search = params.toString();

  return url.toString();
}

module.exports = { utmToken, siteUrl, buildAdLink };
