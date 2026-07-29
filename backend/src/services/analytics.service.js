const prisma = require('../config/prisma');

const HOUR_MS = 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Every range is snapped to whole buckets so the trend chart and the totals
 * describe exactly the same window — the bars always sum to the headline figure.
 *   today / yesterday → 24 hourly buckets of that calendar day
 *   7d / 30d          → N daily buckets, today inclusive
 */
function rangeBounds(range) {
  const now = new Date();
  switch (range) {
    case 'today': {
      const since = startOfDay(now);
      return { since, until: addDays(since, 1), unit: 'hour', count: 24 };
    }
    case 'yesterday': {
      const since = addDays(startOfDay(now), -1);
      return { since, until: addDays(since, 1), unit: 'hour', count: 24 };
    }
    case '7d': {
      const since = addDays(startOfDay(now), -6);
      return { since, until: addDays(startOfDay(now), 1), unit: 'day', count: 7 };
    }
    case '30d':
    default: {
      const since = addDays(startOfDay(now), -29);
      return { since, until: addDays(startOfDay(now), 1), unit: 'day', count: 30 };
    }
  }
}

function startOfRange(range) {
  return rangeBounds(range).since;
}

/** Empty buckets, pre-built so gaps in the data render as zeros rather than disappear. */
function buildBuckets({ since, unit, count }) {
  return Array.from({ length: count }, (_, i) => {
    const start = unit === 'hour' ? new Date(since.getTime() + i * HOUR_MS) : addDays(since, i);
    return {
      date: start.toISOString(),
      label:
        unit === 'hour'
          ? `${String(start.getHours()).padStart(2, '0')}:00`
          : `${String(start.getDate()).padStart(2, '0')}.${String(start.getMonth() + 1).padStart(2, '0')}`,
      orders: 0,
      paidOrders: 0,
      revenue: 0,
      pageViews: 0,
    };
  });
}

function bucketIndex(date, { since, unit, count }) {
  const i =
    unit === 'hour'
      ? Math.floor((date.getTime() - since.getTime()) / HOUR_MS)
      : Math.floor((startOfDay(date).getTime() - since.getTime()) / (24 * HOUR_MS));
  return i >= 0 && i < count ? i : -1;
}

async function getDashboardStats(range = '30d') {
  const bounds = rangeBounds(range);
  const { since, until } = bounds;

  // Previous window for the stat-tile deltas. The current window may still be
  // running (today, or the last day of a 7d/30d span), so the comparison covers
  // the same *elapsed* time one window back — never a full period against a
  // partial one, which would make every morning look like a collapse.
  const span = until.getTime() - since.getTime();
  const elapsed = Math.min(Date.now(), until.getTime()) - since.getTime();
  const prevSince = new Date(since.getTime() - span);
  const prevUntil = new Date(prevSince.getTime() + elapsed);

  const [
    orders,
    paidOrders,
    pendingPayment,
    abandoned,
    revenueAgg,
    funnel,
    topProducts,
    sourceBreakdown,
    campaignBreakdown,
    newLeads,
    mostViewedProducts,
    orderRows,
    viewRows,
    prevOrders,
    prevPaidOrders,
    prevRevenueAgg,
    prevLeads,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: since, lt: until } } }),
    prisma.order.count({ where: { createdAt: { gte: since, lt: until }, paymentStatus: 'PAID' } }),
    prisma.order.count({ where: { createdAt: { gte: since, lt: until }, paymentStatus: 'PENDING' } }),
    prisma.abandonedCheckout.count({ where: { createdAt: { gte: since, lt: until } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: since, lt: until }, paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ['type'],
      where: { createdAt: { gte: since, lt: until } },
      _count: { _all: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { createdAt: { gte: since, lt: until } } },
      _count: { _all: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ['utmSource'],
      where: { createdAt: { gte: since, lt: until } },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
    prisma.order.groupBy({
      by: ['utmCampaign'],
      where: { createdAt: { gte: since, lt: until }, utmCampaign: { not: null } },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
    prisma.lead.count({ where: { createdAt: { gte: since, lt: until } } }),
    prisma.analyticsEvent.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: since, lt: until }, type: 'PRODUCT_VIEW', productId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5,
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: since, lt: until } },
      select: { createdAt: true, totalAmount: true, paymentStatus: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since, lt: until }, type: 'PAGE_VIEW' },
      select: { createdAt: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: prevSince, lt: prevUntil } } }),
    prisma.order.count({ where: { createdAt: { gte: prevSince, lt: prevUntil }, paymentStatus: 'PAID' } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: prevSince, lt: prevUntil }, paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.lead.count({ where: { createdAt: { gte: prevSince, lt: prevUntil } } }),
  ]);

  const productIds = [...new Set([...topProducts.map((p) => p.productId), ...mostViewedProducts.map((p) => p.productId)])];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productNameMap = new Map(products.map((p) => [p.id, p.name]));

  const funnelMap = Object.fromEntries(funnel.map((f) => [f.type, f._count._all]));

  const buckets = buildBuckets(bounds);
  for (const order of orderRows) {
    const i = bucketIndex(order.createdAt, bounds);
    if (i === -1) continue;
    buckets[i].orders += 1;
    if (order.paymentStatus === 'PAID') {
      buckets[i].paidOrders += 1;
      buckets[i].revenue += Number(order.totalAmount || 0);
    }
  }
  for (const view of viewRows) {
    const i = bucketIndex(view.createdAt, bounds);
    if (i !== -1) buckets[i].pageViews += 1;
  }

  const revenue = Number(revenueAgg._sum.totalAmount || 0);
  const prevRevenue = Number(prevRevenueAgg._sum.totalAmount || 0);

  return {
    range,
    since: since.toISOString(),
    until: until.toISOString(),
    interval: bounds.unit,
    totalOrders: orders,
    paidOrders,
    pendingPayment,
    abandonedCheckouts: abandoned,
    revenue,
    averageOrderValue: paidOrders > 0 ? revenue / paidOrders : 0,
    newLeads,
    previous: {
      totalOrders: prevOrders,
      paidOrders: prevPaidOrders,
      revenue: prevRevenue,
      averageOrderValue: prevPaidOrders > 0 ? prevRevenue / prevPaidOrders : 0,
      newLeads: prevLeads,
    },
    timeseries: buckets,
    funnel: {
      pageViews: funnelMap.PAGE_VIEW || 0,
      productViews: funnelMap.PRODUCT_VIEW || 0,
      addToCart: funnelMap.ADD_TO_CART || 0,
      checkoutStart: funnelMap.CHECKOUT_START || 0,
      purchases: funnelMap.PURCHASE || 0,
    },
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      name: productNameMap.get(p.productId) || 'Noma\'lum',
      orders: p._count._all,
    })),
    mostViewedProducts: mostViewedProducts.map((p) => ({
      productId: p.productId,
      name: productNameMap.get(p.productId) || 'Noma\'lum',
      views: p._count._all,
    })),
    sourceBreakdown: sourceBreakdown.map((s) => ({
      source: s.utmSource || 'to\'g\'ridan-to\'g\'ri',
      orders: s._count._all,
      revenue: Number(s._sum.totalAmount || 0),
    })),
    campaignBreakdown: campaignBreakdown.map((c) => ({
      campaign: c.utmCampaign,
      orders: c._count._all,
      revenue: Number(c._sum.totalAmount || 0),
    })),
  };
}

module.exports = { getDashboardStats, startOfRange, rangeBounds };
