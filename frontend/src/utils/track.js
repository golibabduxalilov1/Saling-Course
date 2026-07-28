import { api } from '../api/client';
import { getTrackingPayload } from './utm';

export function track(type, productId) {
  const payload = getTrackingPayload();
  api
    .post('/analytics/track', {
      type,
      productId: productId || null,
      sessionId: payload.sessionId,
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      utmCampaign: payload.utmCampaign,
      utmContent: payload.utmContent,
    })
    .catch(() => {});
}
