const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../middleware/errorHandler');
const { requireAdminAuth } = require('../../middleware/auth');

const router = express.Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email va parol majburiy');
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      throw new ApiError(401, 'Email yoki parol noto\'g\'ri');
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Email yoki parol noto\'g\'ri');
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
  })
);

router.get(
  '/me',
  requireAdminAuth,
  asyncHandler(async (req, res) => {
    res.json({ admin: req.admin });
  })
);

module.exports = router;
