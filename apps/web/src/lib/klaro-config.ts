// Klaro consent management configuration
// https://klaro.io/docs/

export const klaroConfig = {
  elementID: 'klaro',
  cookieName: 'klaro',
  cookieAttributes: {
    path: '/',
    domain: undefined, // Will use current domain
    sameSite: 'Lax',
  },
  cookieExpiresAfterDays: 365,
  defaultConsentIsExplicit: false,
  noticeAsModal: true,
  consentModal: {
    acceptAll: true,
    rejectAll: true,
    changeDescription: true,
  },
  privacyPolicy: {
    url: '/privacy-policy',
    text: 'Privacy Policy',
  },
  services: [
    {
      name: 'google-analytics',
      title: 'Google Analytics',
      description: 'Analytics to help us understand how you use TripFlow',
      default: false,
      purposes: ['analytics'],
      cookies: [/_ga/],
      required: false,
      optOut: false,
      callback: (consent: boolean) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            analytics_storage: consent ? 'granted' : 'denied',
          });
        }
      },
    },
    {
      name: 'contact-form',
      title: 'Contact Form Communications',
      description: 'Allows TripFlow to respond to your contact form inquiries via email',
      default: true,
      purposes: ['functional'],
      required: false,
      optOut: false,
    },
  ],
};
