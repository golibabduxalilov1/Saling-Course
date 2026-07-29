const express = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../middleware/errorHandler');
const {
  MEDIA_RULES,
  uploadMedia,
  verifyUploadedFile,
  publicUrl,
  removeUploadedFile,
} = require('../../utils/mediaUpload');

const router = express.Router();

/** `POST /image` va `POST /video` — bir xil oqim, faqat qoidalari boshqacha. */
function uploadHandlers(kind) {
  return [
    uploadMedia(kind),
    asyncHandler(async (req, res) => {
      if (!req.file) throw new ApiError(400, 'Fayl tanlanmadi');

      await verifyUploadedFile(kind, req.file);

      res.status(201).json({
        kind,
        url: publicUrl(kind, req.file.filename),
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
    }),
  ];
}

router.get('/limits', (req, res) => {
  res.json(
    Object.fromEntries(
      Object.entries(MEDIA_RULES).map(([kind, rule]) => [
        kind,
        {
          maxSize: rule.maxSize,
          maxSizeLabel: rule.maxSizeLabel,
          formatLabel: rule.formatLabel,
          mimeTypes: rule.mimeTypes,
          extensions: rule.extensions,
        },
      ])
    )
  );
});

router.post('/image', ...uploadHandlers('image'));
router.post('/video', ...uploadHandlers('video'));

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    const url = req.body?.url || req.query.url;
    const removed = await removeUploadedFile(url);
    if (!removed) throw new ApiError(400, "Faylni o'chirib bo'lmadi: manzil noto'g'ri");
    res.status(204).end();
  })
);

module.exports = router;
