"use client";
import { useEffect, useState } from "react";
import { getTimeIn, fallbackTime, isGoodTimeToCall, LocalTimeInfo } from "../lib/time";

export default function LocalTime({
  timezone,
  city,
  detailed = false,
}: {
  timezone: string;
  city: string;
  detailed?: boolean;
}) {
  const [info, setInfo] = useState<LocalTimeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        setInfo(await getTimeIn(timezone));
      } catch {
        setError("Couldn't load live time, showing an estimate.");
        setInfo(fallbackTime(timezone));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timezone]);

  if (loading) return <p className="local-time-line">Checking local time…</p>;
  if (!info) return null;

  const shortCity = city.split(",")[0].trim();

  return detailed ? (
    <div className="local-time-detail" title={error ?? undefined}>
      <p className="local-time-place">{city}</p>
      <p className="local-time-line"><time>{info.label}</time></p>
      <p className="contact-timing">{isGoodTimeToCall(info.hour) ? "Good time to call" : "Send a text, call later"}</p>
    </div>
  ) : (
    <div className="local-time-line" title={error ?? undefined}>
      <span>{shortCity}</span>
      <span aria-hidden="true">·</span>
      <time>{info.label}</time>
    </div>
  );
}
