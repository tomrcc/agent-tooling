import React, { useEffect, useState } from "react";

export interface AnnouncementProps {
  enable: boolean;
  text: string;
  link_text: string;
  link_url: string;
  expire_days: number;
}

const Cookies = {
  set: (name: string, value: string, options: any = {}) => {
    if (typeof document === "undefined") return;

    const defaults = { path: "/" };
    const opts = { ...defaults, ...options };

    if (typeof opts.expires === "number") {
      opts.expires = new Date(Date.now() + opts.expires * 864e5);
    }
    if (opts.expires instanceof Date) {
      opts.expires = opts.expires.toUTCString();
    }

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    for (let key in opts) {
      if (!opts[key]) continue;
      cookieString += `; ${key}`;
      if (opts[key] !== true) {
        cookieString += `=${opts[key]}`;
      }
    }

    document.cookie = cookieString;
  },

  get: (name: string): string | null => {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (decodeURIComponent(key) === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },

  remove: (name: string, options: any = {}) => {
    Cookies.set(name, "", { ...options, expires: -1 });
  },
};

/**
 * Pure display component (no hooks) for CloudCannon's registerReactComponent
 * renderer. flushSync renders synchronously so useEffect never fires —
 * this version always produces visible output.
 */
export const AnnouncementDisplay: React.FC<AnnouncementProps> = ({
  enable,
  text,
  link_text,
  link_url,
}) => {
  if (!enable || !text) return null;

  return (
    <div className="relative z-999 bg-body dark:bg-darkmode-body shadow-[1px_0_10px_7px_rgba(154,154,154,0.11)] px-4 py-4 pr-12 md:text-lg transition-all duration-300">
      <p className="text-center">
        {text}{" "}
        {link_text && link_url && (
          <a className="underline" href={link_url} target="_blank" rel="noopener">
            {link_text}
          </a>
        )}
      </p>
      <button
        className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer flex items-center justify-center w-7 h-7 border border-border dark:border-darkmode-border rounded-full text-xl transition-colors duration-200"
        aria-label="Close announcement"
      >
        &times;
      </button>
    </div>
  );
};

/**
 * Interactive version with cookie-based dismiss logic for the live site.
 * Rendered via client:load in Base.astro.
 */
const Announcement: React.FC<AnnouncementProps> = ({
  enable,
  text,
  link_text,
  link_url,
  expire_days,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (enable && text && !Cookies.get("announcement-close")) {
      setIsVisible(true);
    }
  }, [enable, text]);

  const handleClose = () => {
    Cookies.set("announcement-close", "true", {
      expires: expire_days,
    });
    setIsVisible(false);
  };

  if (!enable || !text || !isVisible) {
    return null;
  }

  return (
    <div className="relative z-999 bg-body dark:bg-darkmode-body shadow-[1px_0_10px_7px_rgba(154,154,154,0.11)] px-4 py-4 pr-12 md:text-lg transition-all duration-300">
      <p className="text-center">
        {text}{" "}
        {link_text && link_url && (
          <a className="underline" href={link_url} target="_blank" rel="noopener">
            {link_text}
          </a>
        )}
      </p>
      <button
        onClick={handleClose}
        className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer flex items-center justify-center w-7 h-7 border border-border dark:border-darkmode-border rounded-full text-xl transition-colors duration-200"
        aria-label="Close announcement"
      >
        &times;
      </button>
    </div>
  );
};

export default Announcement;
