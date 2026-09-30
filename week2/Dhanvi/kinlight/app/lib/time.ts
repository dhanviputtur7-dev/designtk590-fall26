export type LocalTimeInfo = { label: string; hour: number };

type GeoResult = {
  name: string;
  admin1?: string; // state or region
  country?: string;
  timezone: string;
};

function formatClock(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

// City (optionally "City, Country") -> place + timezone
// Uses Open-Meteo geocoding, no key needed
export async function geocodeCity(input: string) {
  const [cityPart, countryPart] = input.split(",").map((s) => s.trim());

  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityPart)}&count=10`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const results: GeoResult[] = data.results ?? [];
  if (!results.length) return null; // empty state: city not found

  let match = results[0];
  if (countryPart) {
    const found = results.find((r) =>
      r.country?.toLowerCase().includes(countryPart.toLowerCase())
    );
    if (!found) return null; // that city doesn't exist in that country
    match = found;
  }

  return {
    name: [match.name, match.admin1, match.country].filter(Boolean).join(", "),
    timezone: match.timezone,
  };
}

// Timezone -> live local time
// Uses the Time.Now API, no key needed
export async function getTimeIn(timezone: string): Promise<LocalTimeInfo> {
  const res = await fetch(`https://time.now/developer/api/timezone/${timezone}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const iso: string = data.datetime;
  const hour = parseInt(iso.slice(11, 13), 10);
  const minute = parseInt(iso.slice(14, 16), 10);
  return { label: formatClock(hour, minute), hour };
}

// Backup if the API is down: the browser works out the time itself
export function fallbackTime(timezone: string): LocalTimeInfo {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")!.value);
  const minute = Number(parts.find((p) => p.type === "minute")!.value);
  return { label: formatClock(hour, minute), hour };
}

export const isGoodTimeToCall = (hour: number) => hour >= 9 && hour < 21;