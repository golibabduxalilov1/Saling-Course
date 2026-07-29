/**
 * Reklama havolasini oldindan ko'rsatish uchun yordamchilar.
 * Backenddagi `src/utils/adLink.js` bilan bir xil qoidalar — saqlangan
 * havolani esa doim backend qaytaradi.
 */

const CYRILLIC_MAP = {
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
  и: 'i', й: 'y', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ў: 'o', ф: 'f', х: 'x', ҳ: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/** "Yozgi aksiya" → "yozgi_aksiya" */
export function utmToken(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .toLowerCase()
    .replace(/[ʻʼ'`’]/g, '')
    .replace(/[Ѐ-ӿ]/g, (ch) => CYRILLIC_MAP[ch] ?? '')
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 100)
    .replace(/^_+|_+$/g, '');
}

/** Sayt manzili konfiguratsiyadan yoki joriy origindan olinadi. */
export function siteOrigin() {
  const configured = import.meta.env.VITE_PUBLIC_SITE_URL;
  return String(configured || window.location.origin)
    .trim()
    .replace(/\/+$/, '');
}

/** Manzil noto'g'ri bo'lsa `null` qaytaradi. */
export function buildAdLink({ destination, source, medium, campaign, content }) {
  if (!destination || !source || !medium || !campaign) return null;

  let url;
  try {
    url = new URL(String(destination), `${siteOrigin()}/`);
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

/** Buferga nusxalash — HTTPS bo'lmagan muhitlar uchun zaxira yo'l bilan. */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* zaxira usulga o'tamiz */
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
