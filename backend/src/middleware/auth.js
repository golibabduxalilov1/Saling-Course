const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');

function requireAdminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Avtorizatsiya talab qilinadi'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    next(new ApiError(401, 'Token yaroqsiz yoki muddati tugagan'));
  }
}

module.exports = { requireAdminAuth };
