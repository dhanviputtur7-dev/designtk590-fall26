"use client";

import { useEffect, useState } from "react";
import { calculatedPhase, fetchNewMoonsAround } from "./sky";

/*
  The current time on the user's device, refreshed regularly.

  Preview any time of day by adding ?time=HH:MM to the address,
  e.g. localhost:3000/?time=20:30 for the start of nightfall.
*/
function previewTime() {
  try {
    const value = new URLSearchParams(window.location.search).get("time");
    const match = value?.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const preview = new Date();
    preview.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return preview;
  } catch {
    return null;
  }
}

export function useNow(intervalMs = 15 * 1000) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(previewTime() ?? new Date());
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, intervalMs);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return now;
}

/* Remember the USNO answer for this page visit so every component shares one request. */
let newMoonRequest: Promise<{ previous: number; next: number } | null> | null = null;

/**
 * Moon phase from 0 to 1 (0 new, 0.5 full). Uses the US Naval Observatory's
 * free moon phase data when it's reachable, and falls back to calculating
 * the phase from the average lunar cycle (accurate to within about a day).
 */
export function useMoonPhase(now: Date | null) {
  const [anchors, setAnchors] = useState<{ previous: number; next: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    newMoonRequest ??= fetchNewMoonsAround(new Date()).catch(() => null);
    newMoonRequest.then((result) => {
      if (!cancelled) setAnchors(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!now) return null;
  const time = now.getTime();
  if (anchors && time >= anchors.previous && time < anchors.next) {
    return (time - anchors.previous) / (anchors.next - anchors.previous);
  }
  return calculatedPhase(now);
}
