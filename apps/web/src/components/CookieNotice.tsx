"use client";

import { useEffect, useState } from "react";
import "./cookie-notice.css";

const STORAGE_KEY = "career-club-cookie-notice-v1";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadCookiePreference = async () => {
      let shouldShow = true;

      try {
        shouldShow =
          localStorage.getItem(STORAGE_KEY) !== "acknowledged";
      } catch {
        shouldShow = true;
      }

      setVisible(shouldShow);
      setReady(true);
    };

    void loadCookiePreference();
  }, []);

  function acknowledge() {
    try {
      localStorage.setItem(STORAGE_KEY, "acknowledged");
    } catch {
      // Storage may be unavailable in private browsing.
    }
    setVisible(false);
  }

  if (!ready) return null;

  return (
    <>
      {visible && (
        <section
          className="cookie-notice"
          aria-label="Cookie information"
        >
          <div className="cookie-notice-content">
            <div className="cookie-notice-icon" aria-hidden="true">
              🍪
            </div>

            <div className="cookie-notice-text">
              <h2>Cookies and your privacy</h2>
              <p>
                Career Club Connect uses essential cookies to
                keep you signed in and protect your account.
                We do not currently use optional analytics
                or advertising cookies.
              </p>
            </div>

            <button
              type="button"
              onClick={acknowledge}
              className="cookie-notice-button"
            >
              OK, understood
            </button>
          </div>
        </section>
      )}

    </>
  );
}
