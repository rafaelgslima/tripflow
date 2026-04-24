declare module 'klaro' {
  interface KlaroConfig {
    elementID?: string;
    cookieName?: string;
    cookieAttributes?: {
      path?: string;
      domain?: string | undefined;
      sameSite?: string;
    };
    cookieExpiresAfterDays?: number;
    defaultConsentIsExplicit?: boolean;
    noticeAsModal?: boolean;
    consentModal?: {
      acceptAll?: boolean;
      rejectAll?: boolean;
      changeDescription?: boolean;
    };
    privacyPolicy?: {
      url?: string;
      text?: string;
    };
    services?: Array<{
      name: string;
      title?: string;
      description?: string;
      default?: boolean;
      purposes?: string[];
      cookies?: Array<RegExp | string>;
      required?: boolean;
      optOut?: boolean;
      callback?: (consent: boolean) => void;
    }>;
  }

  interface Klaro {
    setup(config: KlaroConfig): void;
    show(): void;
  }

  const klaro: Klaro;
  export default klaro;
}
