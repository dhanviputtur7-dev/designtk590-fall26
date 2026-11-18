"use client";

import { useEffect, useState } from "react";
import { skyState } from "../lib/sky";
import { useMoonPhase, useNow } from "../lib/useSky";
import { CrayonMoon, CrayonSun } from "./CrayonSky";

/*
  The countryside behind the village, in a hand-drawn storybook style:
  overlapping hills in different colors, each filled with its own
  hand-drawn pattern (wavy stripes, crayon dashes), over a watercolor sky.

  - The sky follows the user's clock (see lib/sky.ts): sunrise ~5:30am,
    sunset into night from 8pm, darker through the night.
  - Sun and moon are crayon-stippled and live in their own layer between
    the sky and the land, in the open sky between the title and the clock.
  - Everything uses the shared hand-drawn filters from SketchFilters.
  - Busy details stay at the edges so the middle stays calm.
*/

const INK = "#2c4337";

/* how far the land is lowered, in the 1440 x 900 drawing's units */
const LAND_DROP = 190;

/* fixed star positions so they don't jump around between renders */
const STARS = [
  [120, 70], [260, 150], [380, 60], [520, 120], [640, 40], [720, 190], [860, 90],
  [980, 160], [1060, 50], [1180, 130], [1300, 70], [1380, 180], [90, 210], [600, 230],
];

/* a tree whose leaves are crayon dots, like the dotted tree in the inspiration */
function DotTree({ x, y, s = 1, color = "#5f9c55", dot = "#2f7a46" }: { x: number; y: number; s?: number; color?: string; dot?: string }) {
  const dots: [number, number][] = [];
  for (let r = 4; r <= 26; r += 7) {
    const count = Math.round((2 * Math.PI * r) / 8);
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2 + r;
      dots.push([Math.cos(a) * r, -44 + Math.sin(a) * r]);
    }
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0V-30m0 10 8-9m-8 1-7-8" stroke="#8a5a3a" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="0" cy="-44" r="30" fill={color} opacity="0.55" />
      {dots.map(([dx, dy], index) => (
        <circle key={index} cx={dx} cy={dy} r="3.2" fill={dot} />
      ))}
    </g>
  );
}

/* a pine drawn with crayon hatching, like the tall trees in the inspiration */
function CrayonPine({ x, y, s = 1, color = "#8fc7a0" }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -96C16 -76 22 -40 18 -14c-2 8-34 8-36 0-4-26 2-62 18-82Z" fill={color} />
      <path d="M0 -88V0M0 -70l9-8M0 -56l12-10M0 -42l14-11M0 -28l14-10M0 -70l-9-8M0 -56l-12-10M0 -42l-14-11M0 -28l-14-10" stroke="#8a5a3a" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
}

/* lollipop tree with a squiggle */
function RoundTree({ x, y, s = 1, color = "#f2b36b" }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0V-30" stroke="#8a5a3a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="0" cy="-46" rx="19" ry="21" fill={color} stroke={INK} strokeWidth="2" />
      <path d="M-9 -48c3-5 7 3 10-2s6 3 8-1" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g className="landscape-cloud" transform={`translate(${x} ${y}) scale(${s})`} filter="url(#kl-watercolor)">
      <path d="M-110 18c-14-28 18-46 44-34 10-26 52-32 72-8 22-16 62-8 68 22 26 0 34 30 4 36H-96c-20-2-26-10-14-16Z" fill="#a9c2f2" opacity="0.9" />
      <path d="M-84 16c-6-18 12-30 30-22 8-18 36-20 48-4 16-10 40-4 44 14" fill="#c9d8f8" opacity="0.8" />
    </g>
  );
}

function Flowers({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0v-10m10 8v-8m-20 7v-7" stroke="#4f8a4a" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="0" cy="-12" r="4" fill={color} stroke={INK} strokeWidth="1.2" />
      <circle cx="10" cy="-11" r="3.4" fill="#fff6e3" stroke={INK} strokeWidth="1.2" />
      <circle cx="-10" cy="-9" r="3.4" fill={color} stroke={INK} strokeWidth="1.2" />
    </g>
  );
}

export default function VillageLandscape() {
  const now = useNow(30 * 1000);
  const moonPhase = useMoonPhase(now);
  const sky = now ? skyState(now) : null;
  const mood = sky?.mood ?? "day";

  // Let the rest of the page know whether it's day, dusk or night (for text contrast).
  useEffect(() => {
    document.documentElement.dataset.sky = mood;
  }, [mood]);

  const darkness = sky?.darkness ?? 0;
  const starOpacity = Math.min(1, Math.max(0, (darkness - 0.2) / 0.45));

  // Window size, so the sun and moon can be placed in open sky in screen pixels.
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    const measure = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    const first = window.setTimeout(measure, 0);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener("resize", measure);
    };
  }, []);

  /*
    The sun and moon travel through the open patch of sky between the title
    and the clock (about 60% to 88% across the screen), so no text covers them.
    They rise from and set behind the hills, because their layer sits between
    the sky and the land.
  */
  const scale = viewport ? Math.max(viewport.width / 1440, viewport.height / 900) : 1;
  const bodyPosition = (progress: number) =>
    viewport && {
      x: viewport.width * (0.6 + progress * 0.28),
      y: (318 + LAND_DROP - Math.sin(Math.PI * progress) * 150) * scale,
    };
  const sunAt = sky?.sunProgress !== undefined && sky.sunProgress !== null ? bodyPosition(sky.sunProgress) : null;
  const moonAt = sky?.moonProgress !== undefined && sky.moonProgress !== null ? bodyPosition(sky.moonProgress) : null;

  return (
    <>
      <svg
        className="village-landscape village-sky"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky?.skyTop ?? "#fbf3e5"} />
            <stop offset="45%" stopColor={sky?.skyHorizon ?? "#fbefdc"} />
          </linearGradient>
        </defs>

        {/* watercolor sky, following the time of day */}
        <rect x="-40" y="-40" width="1520" height="980" fill="url(#sky-gradient)" filter="url(#kl-sky)" />
        {starOpacity > 0 && (
          <g fill="#fff3cf" opacity={starOpacity} filter="url(#kl-wobble)">
            {STARS.map(([x, y], index) => (
              <path key={index} d={`M${x} ${y - 6}l2 4.2 4.2 2-4.2 2-2 4.2-2-4.2-4.2-2 4.2-2Z`} />
            ))}
          </g>
        )}
        <g opacity={1 - darkness * 0.65}>
          {/* small clouds placed in the gaps between the jar, logo and clock */}
          <Cloud x={470} y={54} s={0.48} />
          <Cloud x={1010} y={250} s={0.4} />
          <Cloud x={1150} y={58} s={0.45} />
        </g>
      </svg>

      {/* sun and moon, between the sky and the land */}
      <svg className="village-landscape sky-bodies" aria-hidden="true" focusable="false">
        {sunAt && <CrayonSun x={sunAt.x} y={sunAt.y} scale={0.78 * Math.min(scale, 1.4)} />}
        {moonAt && moonPhase !== null && (
          <CrayonMoon x={moonAt.x} y={moonAt.y} phase={moonPhase} scale={0.88 * Math.min(scale, 1.4)} />
        )}
      </svg>

      <svg
        className="village-landscape village-land"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* bigger, softer wobble for the hill edges */}
          <filter id="landscape-brush" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="12" />
          </filter>
          {/* night tint for the land: darker, and bluer than it is dark */}
          <filter id="night-tint" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values={`${1 - darkness * 0.72} 0 0 0 0  0 ${1 - darkness * 0.66} 0 0 0  0 0 ${1 - darkness * 0.42} 0 ${darkness * 0.04}  0 0 0 1 0`}
            />
          </filter>

          {/* hand-drawn fill patterns for the hills */}
          <pattern id="hill-waves-blue" width="64" height="24" patternUnits="userSpaceOnUse">
            <rect width="64" height="24" fill="#aacdf0" />
            <path d="M-4 12q8-8 16 0t16 0 16 0 16 0 16 0" fill="none" stroke="#bfd9f4" strokeWidth="3" strokeLinecap="round" />
          </pattern>
          <pattern id="hill-waves-peach" width="70" height="26" patternUnits="userSpaceOnUse">
            <rect width="70" height="26" fill="#f7bfaa" />
            <path d="M-5 13q9-8 18 0t18 0 18 0 18 0 18 0" fill="none" stroke="#f9cbb9" strokeWidth="3" strokeLinecap="round" />
          </pattern>
          <pattern id="hill-dash-butter" width="34" height="28" patternUnits="userSpaceOnUse">
            <rect width="34" height="28" fill="#f7e09a" />
            <path d="M6 5v7M23 19v7" stroke="#f0d483" strokeWidth="3.4" strokeLinecap="round" />
          </pattern>
          <pattern id="hill-dash-green" width="32" height="26" patternUnits="userSpaceOnUse">
            <rect width="32" height="26" fill="#bcdea2" />
            <path d="M6 4v7M22 17v7" stroke="#abd394" strokeWidth="3.4" strokeLinecap="round" />
          </pattern>
          <pattern id="hill-dash-mint" width="36" height="28" patternUnits="userSpaceOnUse">
            <rect width="36" height="28" fill="#cdebdc" />
            <path d="M7 5v6M25 18v6" stroke="#b6e0c9" strokeWidth="3.4" strokeLinecap="round" />
          </pattern>
          <pattern id="hill-dots-lilac" width="26" height="26" patternUnits="userSpaceOnUse">
            <rect width="26" height="26" fill="#d4c6f1" />
            <circle cx="6" cy="6" r="2.4" fill="#c0b0ea" />
            <circle cx="19" cy="19" r="2.4" fill="#c0b0ea" />
          </pattern>
          <pattern id="pond-waves" width="40" height="16" patternUnits="userSpaceOnUse">
            <rect width="40" height="16" fill="#7fc2dd" />
            <path d="M-4 8q6-6 12 0t12 0 12 0 12 0" fill="none" stroke="#c9ecf6" strokeWidth="3.4" strokeLinecap="round" />
          </pattern>
        </defs>

        {/* everything on the ground gets a night tint after 8pm.
            The land sits a little lower (LAND_DROP) so the header has open sky behind it. */}
        <g filter={darkness > 0 ? "url(#night-tint)" : undefined}>
        <g transform={`translate(0 ${LAND_DROP})`}>
          <g filter="url(#landscape-brush)">
            <g filter="url(#kl-wobble)" stroke={INK} strokeWidth="2.4" strokeLinejoin="round">
              {/* hills from back to front, each one overlapping the last */}
              <path d="M-40 430C300 430 520 304 760 284c240-20 500 16 720 76V940H-40Z" fill="url(#hill-dash-butter)" />
              <path d="M-40 360C120 250 330 238 560 326c90 34 170 84 230 150 50 56 70 200 70 464H-40Z" fill="url(#hill-waves-blue)" />
              <path d="M-40 640C220 610 480 580 700 532c220-50 480-96 780-82V940H-40Z" fill="url(#hill-waves-peach)" />
              <path d="M880 940c70-200 240-330 600-360V940Z" fill="url(#hill-dots-lilac)" />
              <path d="M-40 476C160 394 380 404 600 486c120 44 190 110 230 200 24 56 30 140 30 254H-40Z" fill="url(#hill-dash-green)" />
              {/* front meadow */}
              <path d="M-40 704C260 644 620 672 920 654c230-14 400 0 560 30V940H-40Z" fill="url(#hill-dash-mint)" />
            </g>
          </g>

          {/* the winding path, narrowing as it climbs into the hills */}
          <g filter="url(#kl-sketch)">
            <path d="M898 380c-40 50-150 66-150 118" fill="none" stroke="#fdf3e3" strokeWidth="20" strokeLinecap="round" />
            <path d="M748 496c0 56 120 70 70 140-40 56-200 90-260 290" fill="none" stroke="#fdf3e3" strokeWidth="40" strokeLinecap="round" />
            <path d="M748 496c0 56 120 70 70 140-40 56-200 90-260 290" fill="none" stroke="#e6c79c" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" />
          </g>

          {/* striped pond, lower right */}
          <g transform="translate(1210 750)" filter="url(#kl-sketch)">
            <path d="M-118 4c-6-38 52-58 120-52 70 6 112 30 104 60-8 32-74 46-140 38-50-6-80-22-84-46Z" fill="url(#pond-waves)" stroke={INK} strokeWidth="2.4" />
            <ellipse cx="-34" cy="20" rx="14" ry="6" fill="#86c46e" stroke={INK} strokeWidth="1.6" />
            <path d="M-100 -20v-26m8 24v-18m-18 20v-14" stroke="#4f8a4a" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* trees at the edges, each in its own whimsical color */}
          <g filter="url(#kl-sketch)">
            <CrayonPine x={60} y={560} s={1.05} />
            <DotTree x={128} y={566} s={0.95} />
            <RoundTree x={190} y={548} s={0.8} color="#f4a08d" />
            <CrayonPine x={1330} y={490} s={0.9} color="#b9d98f" />
            <DotTree x={1390} y={498} s={1} color="#f2c26b" dot="#d9822f" />
            <RoundTree x={1270} y={478} s={0.7} color="#a9c2f2" />
            {/* tiny far trees on the ridge */}
            <RoundTree x={1030} y={276} s={0.42} color="#f4a08d" />
            <CrayonPine x={1070} y={270} s={0.4} />
            <DotTree x={250} y={300} s={0.42} />
            <Flowers x={420} y={736} color="#f28aa8" />
            <Flowers x={980} y={716} color="#f6c84a" />
            <Flowers x={160} y={676} color="#b49ce8" />
            <Flowers x={1120} y={664} color="#f28aa8" />
          </g>
        </g>
        </g>
      </svg>
    </>
  );
}
