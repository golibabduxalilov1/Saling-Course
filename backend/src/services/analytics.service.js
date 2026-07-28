const prisma = require('../config/prisma');

function startOfRange(range) {
  const now = new Date();
  const start = new Date(now);
  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      return start;
    case 'yesterday': {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case '7d':
      start.setDate(start.getDate() - 7);
      return start;
    case '30d':
      start.setDate(start.getDate() - 30);
      return start;
    default:
      start.setDate(start.getDate() - 30);
      return start;
  }
}

async function getDashboardStats(range = '30d') {
  const since = startOfRange(range);

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
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.order.count({ where: { createdAt: { gte: since }, paymentStatus: 'PAID' } }),
    prisma.order.count({ where: { createdAt: { gte: since }, paymentStatus: 'PENDING' } }),
    prisma.abandonedCheckout.count({ where: { createdAt: { gte: since } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: since }, paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ['type'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { createdAt: { gte: since } } },
      _count: { _all: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ['utmSource'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
    prisma.order.groupBy({
      by: ['utmCampaign'],
      where: { createdAt: { gte: since }, utmCampaign: { not: null } },
      _count: { _all: true },
      _sum: { totalAmount: true },
    }),
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.analyticsEvent.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: since }, type: 'PRODUCT_VIEW', productId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5,
    }),
  ]);

  const productIds = [...new Set([...topProducts.map((p) => p.productId), ...mostViewedProducts.map((p) => p.productId)])];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productNameMap = new Map(products.map((p) => [p.id, p.name]));

  const funnelMap = Object.fromEntries(funnel.map((f) => [f.type, f._count._all]));

  return {
    range,
    totalOrders: orders,
    paidOrders,
    pendingPayment,
    abandonedCheckouts: abandoned,
    revenue: Number(revenueAgg._sum.totalAmount || 0),
    averageOrderValue: paidOrders > 0 ? Number(revenueAgg._sum.totalAmount || 0) / paidOrders : 0,
    newLeads,
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

module.exports = { getDashboardStats, startOfRange };
