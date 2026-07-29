const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../middleware/errorHandler');
const { normalizePhoneOrThrow } = require('../../utils/phone');
const { requireAdminAuth } = require('../../middleware/auth');

const router = express.Router();

const INVALID_CREDENTIALS = 'Telefon raqami yoki parol noto\'g\'ri';

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { phone, password } = req.body;
    if (!password) {
      throw new ApiError(400, 'Telefon raqami va parol majburiy');
    }
    const normalizedPhone = normalizePhoneOrThrow(phone);

    const admin = await prisma.adminUser.findUnique({ where: { phone: normalizedPhone } });
    if (!admin) {
      throw new ApiError(401, INVALID_CREDENTIALS);
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw new ApiError(401, INVALID_CREDENTIALS);
    }

    const token = jwt.sign(
      { id: admin.id, phone: admin.phone, name: admin.name, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, admin: { id: admin.id, phone: admin.phone, name: admin.name, role: admin.role } });
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
