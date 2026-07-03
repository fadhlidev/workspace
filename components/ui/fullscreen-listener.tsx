"use client";

import { useEffect, useRef } from "react";

export function FullscreenListener() {
  const isFull = useRef(false);

  useEffect(() => {
    function onChange() {
      isFull.current = !!document.fullscreenElement;
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "F11") {
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        return;
      }

      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onChange);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onChange);
    };
  }, []);

  return null;
}
