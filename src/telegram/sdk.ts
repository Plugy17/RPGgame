export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: { user?: TelegramUser };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

export const TelegramSDK = {
  get isAvailable() {
    return !!window.Telegram?.WebApp;
  },

  get user(): TelegramUser | null {
    return window.Telegram?.WebApp?.initDataUnsafe?.user ?? null;
  },

  ready() {
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();
  },

  haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  },

  notify(type: 'error' | 'success' | 'warning') {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
  },
};
