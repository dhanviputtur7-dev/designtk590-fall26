"use client";
import { useEffect, useState } from "react";
import { getTimeIn, fallbackTime, isGoodTimeToCall, LocalTimeInfo } from "../lib/time";

export default function LocalTime({ timezone, city }: { timezone: string; city: string }) {
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

  if (loading) return <p>Checking the time in {city}...</p>;
  if (!info) return null;

  return (
    <div>
      <p>It's {info.label} in {city}</p>
      <p>{isGoodTimeToCall(info.hour) ? "Good time to call" : "Send a text, call later"}</p>
      {error && <small>{error}</small>}
    </div>
  );
}