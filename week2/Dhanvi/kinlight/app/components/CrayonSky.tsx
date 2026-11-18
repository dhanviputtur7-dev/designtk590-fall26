import { useId } from "react";
import { litMoonPath } from "../lib/sky";

/*
  Sun and moon drawn like crayon/pastel stippling: hundreds of tiny dabs
  laid in rings over a soft color wash, after the inspiration with the
  dotted orange sun. Each color's dabs are a single path, so it stays light.
*/

/* deterministic little random generator so the dabs never jump around */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* rings of short dabs, each tilted along the ring, from r0 to r1 */
function dabs(r0: number, r1: number, spacing: number, length: number, seed: number) {
  const random = rng(seed);
  let d = "";
  for (let r = r0; r <= r1; r += spacing) {
    const count = Math.max(1, Math.round((2 * Math.PI * r) / (spacing * 1.25)));
    const offset = random() * Math.PI * 2;
    for (let i = 0; i < count; i += 1) {
      const a = offset + (i / count) * Math.PI * 2 + (random() - 0.5) * 0.12;
      const rr = r + (random() - 0.5) * spacing * 0.6;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      const tilt = a + Math.PI / 2 + (random() - 0.5) * 0.8;
      const len = length * (0.7 + random() * 0.6);
      d += `M${(x - (Math.cos(tilt) * len) / 2).toFixed(1)} ${(y - (Math.sin(tilt) * len) / 2).toFixed(1)}l${(Math.cos(tilt) * len).toFixed(1)} ${(Math.sin(tilt) * len).toFixed(1)}`;
    }
  }
  return d;
}

/* evenly scattered dabs inside a circle (for the moon) */
function scatter(radius: number, spacing: number, length: number, seed: number) {
  const random = rng(seed);
  let d = "";
  for (let y = -radius; y <= radius; y += spacing) {
    for (let x = -radius; x <= radius; x += spacing) {
      const jx = x + (random() - 0.5) * spacing * 0.8;
      const jy = y + (random() - 0.5) * spacing * 0.8;
      if (jx * jx + jy * jy > (radius - 1.5) * (radius - 1.5)) continue;
      const tilt = -0.6 + (random() - 0.5) * 0.9;
      const len = length * (0.7 + random() * 0.6);
      d += `M${jx.toFixed(1)} ${jy.toFixed(1)}l${(Math.cos(tilt) * len).toFixed(1)} ${(Math.sin(tilt) * len).toFixed(1)}`;
    }
  }
  return d;
}

const SUN_OUTER = dabs(31, 47, 4.2, 5.2, 7);
const SUN_INNER = dabs(3, 30, 4.2, 5, 13);
const SUN_SPECKS = dabs(8, 44, 9, 3.6, 29);
const MOON_LIT = scatter(40, 5.2, 4.6, 3);
const MOON_LIT_2 = scatter(40, 7.5, 3.6, 17);
const MOON_DARK = scatter(40, 6.5, 4, 41);

export function CrayonSun({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g className="crayon-sun" transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r="52" fill="#ffd98a" opacity="0.35" />
      <circle r="47" fill="#fbb24a" opacity="0.7" />
      <g fill="none" strokeLinecap="round">
        <path d={SUN_OUTER} stroke="#f59a35" strokeWidth="3.2" />
        <path d={SUN_INNER} stroke="#ec5b35" strokeWidth="3.2" />
        <path d={SUN_SPECKS} stroke="#ffd36b" strokeWidth="2.2" opacity="0.9" />
      </g>
      {/* a sleepy little face, drawn in crayon */}
      <g fill="none" stroke="#9e3324" strokeWidth="2.6" strokeLinecap="round">
        <path d="M-17 -5q5 4 10 0M7 -5q5 4 10 0" />
        <path d="M-8 10q8 6 16 0" />
      </g>
      <circle cx="-20" cy="5" r="4.5" fill="#ff8fa0" opacity="0.7" />
      <circle cx="20" cy="5" r="4.5" fill="#ff8fa0" opacity="0.7" />
    </g>
  );
}

export function CrayonMoon({ x, y, phase, scale = 1 }: { x: number; y: number; phase: number; scale?: number }) {
  const radius = 40;
  const lit = litMoonPath(phase, radius);
  const illuminated = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  const clipId = `crayon-moon-${useId().replace(/:/g, "")}`;

  return (
    <g className="crayon-moon" transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <clipPath id={clipId}>
          <path d={lit} />
        </clipPath>
        <radialGradient id={`${clipId}-glow`}>
          <stop offset="55%" stopColor="#fff3c4" stopOpacity={0.12 + illuminated * 0.2} />
          <stop offset="100%" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* soft glow, then the shadowed part of the moon, faintly visible */}
      <circle r="66" fill={`url(#${clipId}-glow)`} />
      <circle r={radius} fill="#7c84bd" opacity="0.4" />
      <path d={MOON_DARK} stroke="#a3a9d8" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55" />
      {/* the lit part, stippled in creamy yellows */}
      <g clipPath={`url(#${clipId})`}>
        <circle r={radius} fill="#fff1c4" />
        <path d={MOON_LIT} stroke="#f4d98c" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d={MOON_LIT_2} stroke="#fffaf0" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="-13" cy="-14" r="6" fill="#ecd08a" opacity="0.55" />
        <circle cx="15" cy="16" r="8" fill="#ecd08a" opacity="0.45" />
        {illuminated > 0.6 && (
          <g fill="none" stroke="#6b74b8" strokeWidth="2.6" strokeLinecap="round">
            <path d="M-15 -2q5 4 10 0M5 -2q5 4 10 0" />
            <path d="M-6 11q6 5 12 0" />
          </g>
        )}
      </g>
    </g>
  );
}
