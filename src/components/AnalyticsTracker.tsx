"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Generate UUID client-side
function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("ky_session_id");
  if (!id) {
    id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem("ky_session_id", id);
  }
  return id;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  // Send request helper
  const sendTrackingData = async (type: "visit" | "heartbeat", path: string) => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId || !path) return;

    try {
      await fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          pagePath: path,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          referrer: typeof document !== "undefined" ? document.referrer : null,
          type,
        }),
      });
    } catch (err) {
      console.warn("Analytics logging failed:", err);
    }
  };

  // Track page visits on route change
  useEffect(() => {
    if (!pathname) return;
    // Skip logging admin operations
    if (pathname.startsWith("/admin")) return;

    // Capture UTM parameters from URL and save to sessionStorage
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const utmSource = searchParams.get("utm_source");
      const utmCampaign = searchParams.get("utm_campaign");
      if (utmSource) {
        sessionStorage.setItem("ky_utm_source", utmSource);
      }
      if (utmCampaign) {
        sessionStorage.setItem("ky_utm_campaign", utmCampaign);
      }
    }

    // Avoid logging same path multiple times concurrently
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    sendTrackingData("visit", pathname);
  }, [pathname]);

  // Set up heartbeat timer (lightweight interval every 30s)
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const sendHeartbeat = () => {
      if (document.visibilityState === "visible") {
        sendTrackingData("heartbeat", pathname);
      }
    };

    // Heartbeat every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    // Initial heartbeat after 10 seconds just to confirm engagement
    const timeout = setTimeout(sendHeartbeat, 10000);

    // Also send heartbeat when tab visibility changes back to visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  // Global interceptor for direct WhatsApp clicks
  useEffect(() => {
    const handleGlobalClick = async (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      while (target && target !== document.body) {
        if (target.tagName === "A" && (target as HTMLAnchorElement).href.includes("wa.me")) {
          // Found a WhatsApp link!
          const href = (target as HTMLAnchorElement).href;
          // Extract text/package query if present
          let packageTitle = "Direct WhatsApp Chat";
          try {
            const urlObj = new URL(href);
            const textParam = urlObj.searchParams.get("text");
            if (textParam) {
              packageTitle = textParam.slice(0, 150); // Limit length
            }
          } catch (err) {
            // Ignore URL parse issues
          }
          
          // Log click lead to Supabase
          const { recordWhatsAppClick } = await import("@/utils/leads");
          await recordWhatsAppClick(packageTitle);
          break;
        }
        target = target.parentElement;
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  return null; // This is a tracker component, doesn't render any visible UI
}
