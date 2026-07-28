function toCsv(rows, columns) {
  const escape = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escape(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escape(c.value(row))).join(','));
  return [header, ...lines].join('\n');
}

function ordersToCsv(orders) {
  const columns = [
    { label: 'Buyurtma raqami', value: (o) => o.orderNumber },
    { label: 'Mijoz', value: (o) => `${o.customerName} ${o.customerLastName || ''}`.trim() },
    { label: 'Telefon', value: (o) => o.phone },
    { label: 'Mahsulotlar', value: (o) => o.items.map((i) => i.product.name).join('; ') },
    { label: 'Summa', value: (o) => o.totalAmount },
    { label: "To'langan", value: (o) => o.paidAmount },
    { label: "To'lov holati", value: (o) => o.paymentStatus },
    { label: 'Buyurtma holati', value: (o) => o.orderStatus },
    { label: 'Manba', value: (o) => o.utmSource || o.source || '' },
    { label: 'Sana', value: (o) => o.createdAt.toISOString() },
  ];
  return toCsv(orders, columns);
}

module.exports = { toCsv, ordersToCsv };
