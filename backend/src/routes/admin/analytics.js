const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { getDashboardStats } = require('../../services/analytics.service');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const stats = await getDashboardStats(req.query.range || '30d');
    res.json(stats);
  })
);

module.exports = router;
