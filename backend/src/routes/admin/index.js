const express = require('express');
const { requireAdminAuth } = require('../../middleware/auth');

const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const promoCodeRoutes = require('./promoCodes');
const orderRoutes = require('./orders');
const customerRoutes = require('./customers');
const leadRoutes = require('./leads');
const abandonedCheckoutRoutes = require('./abandonedCheckouts');
const reviewRoutes = require('./reviews');
const analyticsRoutes = require('./analytics');
const adLinkRoutes = require('./adLinks');
const uploadRoutes = require('./uploads');

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/dashboard', requireAdminAuth, dashboardRoutes);
router.use('/products', requireAdminAuth, productRoutes);
router.use('/categories', requireAdminAuth, categoryRoutes);
router.use('/promo-codes', requireAdminAuth, promoCodeRoutes);
router.use('/orders', requireAdminAuth, orderRoutes);
router.use('/customers', requireAdminAuth, customerRoutes);
router.use('/leads', requireAdminAuth, leadRoutes);
router.use('/abandoned-checkouts', requireAdminAuth, abandonedCheckoutRoutes);
router.use('/reviews', requireAdminAuth, reviewRoutes);
router.use('/analytics', requireAdminAuth, analyticsRoutes);
router.use('/ad-links', requireAdminAuth, adLinkRoutes);
router.use('/uploads', requireAdminAuth, uploadRoutes);

module.exports = router;
