const express = require('express');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../middleware/errorHandler');
const { utmToken, buildAdLink } = require('../../utils/adLink');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const adLinks = await prisma.adLink.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(adLinks);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { campaignName, platform, medium, content, destinationUrl } = req.body;

    const name = String(campaignName || '').trim();
    if (!name) throw new ApiError(400, 'Kampaniya nomi majburiy');

    const source = utmToken(platform);
    if (!source) throw new ApiError(400, 'Platformani tanlang');

    const mediumToken = utmToken(medium);
    if (!mediumToken) throw new ApiError(400, 'Trafik turini tanlang');

    const campaign = utmToken(name);
    if (!campaign) {
      throw new ApiError(400, "Kampaniya nomida kamida bitta harf yoki raqam bo'lishi kerak");
    }

    const contentToken = utmToken(content) || null;
    const destination = String(destinationUrl || '/').trim() || '/';

    const generatedUrl = buildAdLink({
      destination,
      source,
      medium: mediumToken,
      campaign,
      content: contentToken,
    });
    if (!generatedUrl) throw new ApiError(400, "Yo'naltiriladigan sahifa manzili noto'g'ri");

    const adLink = await prisma.adLink.create({
      data: {
        campaignName: name,
        platform: source,
        medium: mediumToken,
        content: contentToken,
        destinationUrl: destination,
        generatedUrl,
      },
    });

    res.status(201).json(adLink);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.adLink.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

module.exports = router;
