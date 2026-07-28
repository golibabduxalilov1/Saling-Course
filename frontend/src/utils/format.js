export function formatMoney(value) {
  const number = Number(value) || 0;
  return `${number.toLocaleString('ru-RU')} so'm`;
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
