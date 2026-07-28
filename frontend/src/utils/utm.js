const FIRST_TOUCH_KEY = 'sotuv_first_touch';
const LAST_TOUCH_KEY = 'sotuv_last_touch';
const SESSION_ID_KEY = 'sotuv_session_id';

function detectDeviceType() {
  if (typeof navigator === 'undefined') return 'unknown';
  return /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

function readUtmFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    utmSource: params.get('utm_source') || null,
    utmMedium: params.get('utm_medium') || null,
    utmCampaign: params.get('utm_campaign') || null,
    utmContent: params.get('utm_content') || null,
  };
  const hasAny = Object.values(utm).some(Boolean);
  return { utm, hasAny };
}

/**
 * Captures UTM params from the current URL (if any) into persistent storage:
 * first-touch never overwrites once set, last-touch always reflects the most
 * recent landing. Call once on app load.
 */
export function captureUtm() {
  const { utm, hasAny } = readUtmFromUrl();
  const landingPage = window.location.pathname;
  const deviceType = detectDeviceType();

  if (!localStorage.getItem(FIRST_TOUCH_KEY) && hasAny) {
    localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify({ ...utm, landingPage, deviceType }));
  }

  if (hasAny) {
    localStorage.setItem(LAST_TOUCH_KEY, JSON.stringify({ ...utm, landingPage, deviceType }));
  } else if (!localStorage.getItem(LAST_TOUCH_KEY)) {
    localStorage.setItem(
      LAST_TOUCH_KEY,
      JSON.stringify({ utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, landingPage, deviceType })
    );
  }

  if (!sessionStorage.getItem(SESSION_ID_KEY)) {
    sessionStorage.setItem(SESSION_ID_KEY, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  }
}

export function getLastTouch() {
  try {
    return JSON.parse(localStorage.getItem(LAST_TOUCH_KEY)) || {};
  } catch {
    return {};
  }
}

export function getSessionId() {
  return sessionStorage.getItem(SESSION_ID_KEY) || null;
}

export function getTrackingPayload() {
  const lastTouch = getLastTouch();
  return {
    utmSource: lastTouch.utmSource || null,
    utmMedium: lastTouch.utmMedium || null,
    utmCampaign: lastTouch.utmCampaign || null,
    utmContent: lastTouch.utmContent || null,
    landingPage: lastTouch.landingPage || null,
    deviceType: lastTouch.deviceType || detectDeviceType(),
    sessionId: getSessionId(),
    source: lastTouch.utmSource || 'to\'g\'ridan-to\'g\'ri',
  };
}
