export function formatMoney(value) {
  const number = Number(value) || 0;
  return `${number.toLocaleString('ru-RU')} so'm`;
}

/** Short numeric form for axis ticks and tooltips, where full money strings won't fit. */
export function formatCompact(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(abs >= 10_000_000_000 ? 0 : 1)} mlrd`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)} mln`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)} ming`;
  return String(Math.round(n));
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
