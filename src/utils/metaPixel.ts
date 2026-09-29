// Meta Pixel client-side utility

export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1445369663573502";

export type FbqEventParams = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    fbq?: {
      (...args: unknown[]): void;
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
    };
    _fbq?: unknown;
  }
}

/**
 * Tracks a standard PageView event.
 */
export const pageview = (): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
};

/**
 * Tracks custom or standard Meta Pixel events.
 */
export const event = (name: string, options?: FbqEventParams): void => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (options && Object.keys(options).length > 0) {
      window.fbq("track", name, options);
    } else {
      window.fbq("track", name);
    }
  }
};

/**
 * Tracks a Lead event when a user submits an inquiry or booking lead form.
 * Fired only after backend confirmation of successful submission.
 */
export const trackLead = (params?: {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  [key: string]: string | number | boolean | undefined | null;
}): void => {
  event("Lead", params);
};

/**
 * Tracks a Contact event (e.g. initiating communication).
 */
export const trackContact = (params?: FbqEventParams): void => {
  event("Contact", params);
};
