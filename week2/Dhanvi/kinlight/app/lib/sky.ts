/*
  The sky over the village follows the user's own clock:
  - sunrise around 5:30am, with a pink-gold dawn
  - golden light from 7pm, sunset around 7:45pm
  - from 8pm the land starts to darken, getting darker through the night
  - darkest from about 11pm to 4am, lifting again before sunrise
*/

type Stop = [minute: number, value: number];
type ColorStop = [minute: number, color: string];

const DAY = 24 * 60;

export const SUNRISE = 5 * 60 + 30; // 5:30am
export const SUNSET = 20 * 60; // the sun slips behind the hills right as night begins
const MOONRISE = 19 * 60 + 30;
const MOONSET = 6 * 60 + 30;

/* how dark the land gets (0 = full day, 0.75 = deepest night) */
const DARKNESS: Stop[] = [
  [0, 0.74],
  [4 * 60, 0.74],
  [SUNRISE, 0.34],
  [6 * 60 + 30, 0.06],
  [7 * 60, 0],
  [20 * 60, 0], // 8pm: the darkening begins
  [21 * 60, 0.38],
  [22 * 60, 0.58],
  [23 * 60, 0.74],
  [DAY, 0.74],
];

/* sky gradient: [top color, horizon color] through the day */
const SKY_TOP: ColorStop[] = [
  [0, "#1b2347"],
  [4 * 60, "#1b2347"],
  [5 * 60, "#3a3c70"],
  [5 * 60 + 45, "#efc3c2"],
  [7 * 60, "#fbf3e5"],
  [18 * 60, "#fbf3e5"],
  [19 * 60, "#f7d8bd"],
  [SUNSET, "#e6a4ab"],
  [20 * 60 + 30, "#56508a"],
  [22 * 60, "#262d56"],
  [DAY, "#1b2347"],
];
const SKY_HORIZON: ColorStop[] = [
  [0, "#383d6c"],
  [4 * 60, "#383d6c"],
  [5 * 60, "#b9809e"],
  [5 * 60 + 45, "#ffd49a"],
  [7 * 60, "#fbefdc"],
  [18 * 60, "#fbefdc"],
  [19 * 60, "#ffc993"],
  [SUNSET, "#ff9d78"],
  [20 * 60 + 30, "#c1768f"],
  [22 * 60, "#464673"],
  [DAY, "#383d6c"],
];

function interpolate(stops: Stop[], minute: number) {
  for (let i = 1; i < stops.length; i += 1) {
    const [m1, v1] = stops[i - 1];
    const [m2, v2] = stops[i];
    if (minute <= m2) return v1 + ((v2 - v1) * (minute - m1)) / (m2 - m1 || 1);
  }
  return stops[stops.length - 1][1];
}

function mixColor(a: string, b: string, t: number) {
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2]
    .map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t).toString(16).padStart(2, "0"))
    .join("")}`;
}

/* WCAG relative luminance of a hex color (0 = black, 1 = white). */
function luminance(hex: string) {
  const [r, g, b] = [0, 1, 2].map((i) => {
    const value = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function interpolateColor(stops: ColorStop[], minute: number) {
  for (let i = 1; i < stops.length; i += 1) {
    const [m1, c1] = stops[i - 1];
    const [m2, c2] = stops[i];
    if (minute <= m2) return mixColor(c1, c2, (minute - m1) / (m2 - m1 || 1));
  }
  return stops[stops.length - 1][1];
}

export type SkyState = {
  minute: number;
  darkness: number;
  skyTop: string;
  skyHorizon: string;
  /** position on a 1440 x 900 canvas, or null when below the horizon */
  sun: { x: number; y: number } | null;
  moon: { x: number; y: number } | null;
  /** 0 at sunrise/moonrise to 1 at sunset/moonset, or null while it's down */
  sunProgress: number | null;
  moonProgress: number | null;
  mood: "day" | "dusk" | "night";
};

/* Sun and moon travel left to right on a low arc that dips behind the far hills.
   The arc stays below the header so they never sit behind the title text. */
function arcPosition(progress: number) {
  return { x: 150 + progress * 1140, y: 302 - Math.sin(Math.PI * progress) * 92 };
}

export function skyState(now: Date): SkyState {
  const minute = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const darkness = interpolate(DARKNESS, minute);

  const sunProgress = (minute - SUNRISE) / (SUNSET - SUNRISE);
  const sun = sunProgress > -0.03 && sunProgress < 1.03 ? arcPosition(sunProgress) : null;

  const moonSpan = MOONSET + DAY - MOONRISE;
  const moonProgress = (((minute - MOONRISE + DAY) % DAY) / moonSpan);
  const moon = moonProgress < 1.03 ? arcPosition(moonProgress) : null;

  const skyTop = interpolateColor(SKY_TOP, minute);
  const skyHorizon = interpolateColor(SKY_HORIZON, minute);
  // Text that sits on the sky switches to light as soon as the sky itself is
  // too dark for dark text, not just when the land has darkened.
  const skyIsDark = luminance(skyTop) < 0.28;
  const isGolden = (minute >= 18 * 60 + 45 && minute < 20 * 60 + 15) || (minute >= 5 * 60 && minute < 6 * 60 + 30);

  return {
    minute,
    darkness,
    skyTop,
    skyHorizon,
    sun,
    moon,
    sunProgress: sun ? sunProgress : null,
    moonProgress: moon ? moonProgress : null,
    mood: skyIsDark || darkness > 0.3 ? "night" : isGolden ? "dusk" : "day",
  };
}

/* ---------------- Moon phase ---------------- */

const SYNODIC_DAYS = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // a well-documented new moon

/** 0 = new moon, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter. */
export function calculatedPhase(date: Date) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  return (((days / SYNODIC_DAYS) % 1) + 1) % 1;
}

export function phaseName(phase: number) {
  const names = [
    "New moon",
    "Waxing crescent",
    "First quarter",
    "Waxing gibbous",
    "Full moon",
    "Waning gibbous",
    "Last quarter",
    "Waning crescent",
  ];
  return names[Math.round(phase * 8) % 8];
}

/**
 * SVG path for the lit part of the moon, centered on (0, 0) with radius r.
 * The lit side grows from the right while waxing and shrinks to the left while waning.
 */
export function litMoonPath(phase: number, r: number) {
  const waxing = phase <= 0.5;
  const illuminated = (1 - Math.cos(phase * 2 * Math.PI)) / 2; // 0..1
  const terminator = Math.abs(1 - 2 * illuminated) * r; // horizontal radius of the shadow edge
  const gibbous = illuminated > 0.5;
  const side = waxing ? 1 : 0; // which half is lit
  // outer edge: half circle on the lit side
  const outer = `M0 ${-r}A${r} ${r} 0 0 ${side} 0 ${r}`;
  // inner edge: the terminator, bulging toward or away from the lit side
  const sweep = waxing ? (gibbous ? 1 : 0) : gibbous ? 0 : 1;
  const inner = `A${terminator.toFixed(2)} ${r} 0 0 ${sweep} 0 ${-r}Z`;
  return `${outer}${inner}`;
}

/* USNO's free moon phase service (no key). Returns the new moons around now. */
type UsnoPhase = { phase: string; year: number; month: number; day: number; time: string };

export async function fetchNewMoonsAround(date: Date) {
  const start = new Date(date.getTime() - 40 * 86400000);
  const query = `${start.getUTCFullYear()}-${start.getUTCMonth() + 1}-${start.getUTCDate()}`;
  const response = await fetch(`https://aa.usno.navy.mil/api/moon/phases/date?date=${query}&nump=12`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: { phasedata?: UsnoPhase[] } = await response.json();
  const newMoons = (data.phasedata ?? [])
    .filter((entry) => entry.phase === "New Moon")
    .map((entry) => {
      const [hour, minute] = entry.time.split(":").map(Number);
      return Date.UTC(entry.year, entry.month - 1, entry.day, hour, minute);
    })
    .sort((a, b) => a - b);
  const now = date.getTime();
  const previous = [...newMoons].reverse().find((time) => time <= now);
  const next = newMoons.find((time) => time > now);
  return previous && next ? { previous, next } : null;
}
