"use client";

import { litMoonPath, phaseName } from "../lib/sky";
import { useMoonPhase, useNow } from "../lib/useSky";

/*
  A little hand-drawn wall clock showing the user's own time, read straight
  from their device (no location permission needed). It has all twelve
  numbers, a scalloped rim like the inspiration clocks, and a tiny sun or
  moon so "is it day or night for me" reads at a glance. The time is also
  written out underneath for anyone who can't easily read clock hands.
*/

const INK = "#2c4337";
const CENTER = 60;

/* Scalloped rim: alternating points on two circles joined with curves. */
function scallopPath(bumps: number, inner: number, outer: number) {
  let d = "";
  for (let i = 0; i < bumps; i += 1) {
    const a1 = (i / bumps) * Math.PI * 2;
    const a2 = ((i + 0.5) / bumps) * Math.PI * 2;
    const a3 = ((i + 1) / bumps) * Math.PI * 2;
    const p = (angle: number, radius: number) =>
      `${(CENTER + Math.cos(angle) * radius).toFixed(1)} ${(CENTER + Math.sin(angle) * radius).toFixed(1)}`;
    if (i === 0) d += `M${p(a1, inner)}`;
    d += `Q${p(a2, outer)} ${p(a3, inner)}`;
  }
  return `${d}Z`;
}

const RIM = scallopPath(22, 50, 57);

/*
  Short time zone name for the device, e.g. "EST" (or "EDT" in summer) in New York.
  Browsers only have short names for some zones; elsewhere this shows an
  offset like "GMT+5:30", which still tells you exactly where you stand.
*/
function zoneAbbreviation(date: Date) {
  const part = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
    .formatToParts(date)
    .find((piece) => piece.type === "timeZoneName");
  return part?.value ?? "";
}

export default function YourClock() {
  const now = useNow(15 * 1000);
  const moonPhase = useMoonPhase(now);

  const hours = now?.getHours() ?? 0;
  const minutes = now?.getMinutes() ?? 0;
  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = minutes * 6;
  const isDay = hours >= 6 && hours < 18;
  const label = now
    ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(now)
    : "";
  const dateLabel = now
    ? new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(now)
    : "";
  const zone = now ? zoneAbbreviation(now) : "";

  return (
    <div className="your-clock">
      <svg className="your-clock-face" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <g filter="url(#kl-sketch)">
          <path d={RIM} transform="translate(2 4)" fill="#d9b9a6" opacity="0.6" />
          <path d={RIM} fill="#f2a58e" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx={CENTER} cy={CENTER} r="44" fill="#fffaf0" stroke={INK} strokeWidth="2" />
          <circle cx={CENTER} cy={CENTER} r="40" fill="none" stroke="#f7c9b8" strokeWidth="1.5" strokeDasharray="1 4" strokeLinecap="round" />
        </g>

        {Array.from({ length: 12 }, (_, index) => {
          const number = index + 1;
          const angle = (number / 12) * Math.PI * 2 - Math.PI / 2;
          return (
            <text
              key={number}
              x={CENTER + Math.cos(angle) * 33}
              y={CENTER + Math.sin(angle) * 33}
              className="your-clock-number"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {number}
            </text>
          );
        })}

        {now && (
          <>
            {isDay ? (
              <g transform="translate(60 77)">
                <circle r="4" fill="#f6cf71" stroke={INK} strokeWidth="1.2" />
                <path d="M0-7v-2M0 7v2M-7 0h-2M7 0h2M-5-5l-1.4-1.4M5 5l1.4 1.4M5-5l1.4-1.4M-5 5l-1.4 1.4" stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
              </g>
            ) : (
              <g transform="translate(60 78)">
                <circle r="6" fill="#56608f" stroke={INK} strokeWidth="1.1" />
                {moonPhase !== null && <path d={litMoonPath(moonPhase, 6)} fill="#fff3cf" />}
                <circle r="6" fill="none" stroke={INK} strokeWidth="1.1" />
              </g>
            )}
            <path
              d="M60 65c-2.6 0-3.2-7-2.1-25 .3-3.4 3.9-3.4 4.2 0 1.1 18 .5 25-2.1 25Z"
              fill={INK}
              transform={`rotate(${hourAngle} 60 60)`}
            />
            <path
              d="M60 67c-1.7 0-2.3-9-1.5-36 .2-2.6 2.8-2.6 3 0 .8 27 .2 36-1.5 36Z"
              fill="#c76546"
              stroke={INK}
              strokeWidth="0.8"
              transform={`rotate(${minuteAngle} 60 60)`}
            />
            <circle cx={CENTER} cy={CENTER} r="3.2" fill="#f6cf71" stroke={INK} strokeWidth="1.4" />
          </>
        )}
      </svg>
      <p className="your-clock-time">
        {now ? (
          <>
            <span className="your-clock-hour">
              <time dateTime={now.toISOString()}>{label}</time>
              {zone && <abbr className="your-clock-zone">{zone}</abbr>}
            </span>
            <span className="your-clock-date">{dateLabel}</span>
            {!isDay && moonPhase !== null && <span className="your-clock-moon">{phaseName(moonPhase)}</span>}
          </>
        ) : (
          <span className="your-clock-date">Your time</span>
        )}
      </p>
    </div>
  );
}
