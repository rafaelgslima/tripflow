import { useEffect } from 'react';
import { klaroConfig } from '@/lib/klaro-config';

declare global {
  interface Window {
    klaro?: {
      show(): void;
    };
  }
}

export function useKlaroConsent(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initKlaro = async () => {
      try {
        const klaroModule = await import('klaro');
        const Klaro = klaroModule.default || klaroModule;

        if (!Klaro || !Klaro.setup) {
          return;
        }

        Klaro.setup(klaroConfig);
      } catch (error) {
        console.error('Failed to initialize Klaro:', error);
      }
    };

    // Delay slightly to ensure DOM is ready
    const timer = setTimeout(initKlaro, 100);
    return () => clearTimeout(timer);
  }, []);
}

export async function showKlaroManager(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const klaroModule = await import('klaro');
    const Klaro = klaroModule.default || klaroModule;

    if (Klaro?.show) {
      Klaro.show();
    }
  } catch (error) {
    console.error('Failed to show Klaro manager:', error);
  }
}
