import type { ReactNode } from "react";
import { placeLook, seededRandom } from "../lib/places";
import type { HomeStyle, Palette } from "../lib/places";

/*
  One person's neighborhood: a home drawn in the style of where they live,
  colored with that place's palette, on a small hill with seeded trees and
  details so no two neighborhoods come out the same.

  The light concept is shown three ways, so it never relies on color alone:
  - glowing: lit gold windows and a warm halo behind the home
  - dimming: windows go dark, the scene greys out (filter set in CSS/props)
  - dark: a crescent moon and stars appear over the home
*/

type Props = {
  person: { id: string; city?: string; relationship?: string };
  light: number;
};

const INK = "#2c4337";
const PAPER = "#fbf3e5";
const DARK_GLASS = "#56677a";
const GLOW = "#ffd877";

/* Blend a color toward the cream paper so strong palette colors read as gouache. */
function soften(hex: string, amount = 0.1) {
  const from = hex.replace("#", "");
  const to = PAPER.replace("#", "");
  const channel = (value: string, index: number) =>
    Math.round(
      parseInt(value.slice(index, index + 2), 16) * (1 - amount) +
        parseInt(to.slice(index, index + 2), 16) * amount
    )
      .toString(16)
      .padStart(2, "0");
  return `#${channel(from, 0)}${channel(from, 2)}${channel(from, 4)}`;
}

type Ctx = { p: Palette; lit: boolean; glass: string; r: () => number };

/* ---------- small building parts ---------- */

function Win({ x, y, w = 12, h = 14, arch = false, frame, glass, bars = true }: {
  x: number; y: number; w?: number; h?: number; arch?: boolean; frame: string; glass: string; bars?: boolean;
}) {
  const shape = arch
    ? `M${x} ${y + h}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + h}Z`
    : `M${x} ${y}h${w}v${h}h${-w}Z`;
  return (
    <g>
      <path d={shape} fill={glass} stroke={frame} strokeWidth="2.6" strokeLinejoin="round" />
      {bars && (
        <path
          d={`M${x + w / 2} ${y + (arch ? 2 : 0)}V${y + h}M${x} ${y + h * 0.55}h${w}`}
          stroke={frame}
          strokeWidth="1.3"
          fill="none"
        />
      )}
    </g>
  );
}

function Door({ x, w = 14, h = 24, fill, arch = true, knob = "#f6cf71" }: {
  x: number; w?: number; h?: number; fill: string; arch?: boolean; knob?: string;
}) {
  const d = arch
    ? `M${x} 0V${-h + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V0Z`
    : `M${x} 0V${-h}h${w}V0Z`;
  return (
    <g>
      <path d={d} fill={fill} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx={x + w - 3.5} cy={-h * 0.42} r="1.4" fill={knob} />
    </g>
  );
}

function Bunting({ x1, x2, y, colors, sag = 8 }: { x1: number; x2: number; y: number; colors: string[]; sag?: number }) {
  const count = Math.max(4, Math.round((x2 - x1) / 13));
  const flags: ReactNode[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    const fx = x1 + (x2 - x1) * t;
    const fy = y + sag * 4 * t * (1 - t);
    flags.push(<path key={i} d={`M${fx - 4} ${fy}h8l-4 8Z`} fill={colors[i % colors.length]} />);
  }
  return (
    <g>
      <path d={`M${x1} ${y}Q${(x1 + x2) / 2} ${y + sag * 2} ${x2} ${y}`} stroke={INK} strokeWidth="1" fill="none" opacity="0.6" />
      {flags}
    </g>
  );
}

/* ---------- homes (origin = ground under the middle of the home) ---------- */

function Mangaluru({ p, glass }: Ctx) {
  // After the yellow-and-red family home in Mangaluru: two floors, arched
  // upper windows with red surrounds, a recessed balcony, red base band.
  // Wall and trim follow the photo of the house; the door and details
  // still come from the India palette.
  const wall = "#eedc6e";
  const red = "#b8392c";
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-62 0V-100H58V0Z" fill={wall} />
      <path d="M-72 -98 -50 -120H48l20 22Z" fill={red} />
      <path d="M-54 -60V-82c0-8 6-12 20-12s20 4 20 12V-60Z" fill="#cdb94e" />
      <path d="M-34 -94v6" stroke={INK} strokeWidth="1.4" />
      <circle cx="-34" cy="-86" r="2.4" fill={glass} strokeWidth="1.2" />
      <path d="M-54 -72H-14" stroke="#fff8ea" strokeWidth="2" />
      <path d="M-50 -60c-3-4 3-8 0-12m8 12c-3-4 3-8 0-12m8 12c-3-4 3-8 0-12m8 12c-3-4 3-8 0-12m8 12c-3-4 3-8 0-12" fill="none" stroke="#fff8ea" strokeWidth="1.8" />
      <path d="M-58 -60H-10" stroke={red} strokeWidth="3" />
      {[0, 16, 32].map((dx) => (
        <g key={dx}>
          <path d={`M${2 + dx} -62V-84a7 7 0 0 1 14 0V-62Z`} fill={red} />
          <Win x={4.5 + dx} y={-86} w={9} h={22} arch frame={INK} glass={glass} bars={false} />
        </g>
      ))}
      <path d="M-66 -52H62V-46H-66Z" fill={red} />
      <path d="M2 -46H16V0H2Z" fill={red} />
      <path d="M2 -38h14M2 -30h14M2 -22h14M2 -14h14M2 -6h14M9 -46v8m-4 0v8m8 0v8m-8 0v8m8 0v8" stroke="#fff3df" strokeWidth="1" fill="none" />
      <Door x={-44} w={16} h={30} fill={soften(p.door, 0.1)} />
      <Win x={-20} y={-36} w={14} h={16} frame={INK} glass={glass} />
      <Win x={26} y={-36} w={14} h={16} frame={INK} glass={glass} />
      <path d="M-62 -6H58V0H-62Z" fill={red} />
    </g>
  );
}

function Casita({ p, glass }: Ctx) {
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-62 0V-60H62V0Z" fill={soften(p.wall, 0.25)} />
      <path d="M-66 -60V-70H66V-60Z" fill={soften(p.trim, 0)} />
      <path d="M-54 -70v-6h10v6m14 0v-6h10v6m34 0v-6h10v6m14 0v-6h10v6" fill={soften(p.trim, 0)} />
      <Door x={-9} w={18} h={36} fill={soften(p.door, 0.08)} />
      <path d="M-14 0V-29a14 14 0 0 1 28 0V0" fill="none" stroke={soften(p.accent2, 0.05)} strokeWidth="3" />
      <Win x={-46} y={-42} w={16} h={16} frame={soften(p.accent, 0.1)} glass={glass} />
      <Win x={30} y={-42} w={16} h={16} frame={soften(p.accent, 0.1)} glass={glass} />
      <g stroke="none">
        <Bunting x1={-60} x2={60} y={-80} colors={p.extras} sag={4} />
      </g>
      <path d="M-50 0v-8h12v8m60 0v-8h12v8" fill={soften(p.roof, 0.15)} />
      <path d="M-44 -8v-5m-3 2 3-3 3 3m57 3v-5m-3 2 3-3 3 3" stroke={soften(p.accent2)} strokeWidth="2" fill="none" />
    </g>
  );
}

function Machiya({ p, glass }: Ctx) {
  const roof = soften(p.roof, 0.2);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-58 0V-52H58V0Z" fill={soften(p.wall, 0)} />
      <path d="M-40 -84C-20 -86 20 -86 40 -84L50 -66H-50Z" fill={roof} />
      <path d="M-34 -66V-52H34V-66" fill={soften(p.wall, 0)} />
      <Win x={-22} y={-64} w={44} h={9} frame={INK} glass={glass} />
      <path d="M-76 -48C-40 -56 40 -56 76 -48L64 -58C30 -66 -30 -66 -64 -58Z" fill={roof} />
      <path d="M-52 -44H-12V-6H-52Z" fill="#8a6a4a" />
      <path d="M-47 -44V-6M-42 -44V-6M-37 -44V-6M-32 -44V-6M-27 -44V-6M-22 -44V-6M-17 -44V-6" stroke="#5a4636" strokeWidth="1.4" />
      <path d="M2 0V-40H40V0Z" fill="#3a3530" />
      <path d="M2 -40H40V-22H2Z" fill={soften(p.accent, 0.1)} />
      <path d="M14.6 -40V-22M27.3 -40V-22" stroke={PAPER} strokeWidth="1.6" />
      <circle cx="21" cy="-31" r="4" fill={PAPER} stroke="none" />
    </g>
  );
}

function Riad({ p, glass }: Ctx) {
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-50 0V-84H50V0Z" fill={soften(p.wall, 0.12)} />
      <path d="M-54 -84H54V-90H-54Z" fill={soften(p.trim, 0)} />
      <path d="M-50 -90v-7h9v7m13 0v-7h9v7m13 0v-7h9v7m13 0v-7h9v7m13 0v-7h9v7" fill={soften(p.trim, 0)} />
      <path d="M-14 0V-28c0-10 6-17 14-19 8 2 14 9 14 19V0Z" fill={soften(p.accent2, 0.1)} />
      <path d="M-9 0V-26c0-8 4-13 9-15 5 2 9 7 9 15V0Z" fill={soften(p.door, 0.1)} />
      <circle cx="5" cy="-14" r="1.4" fill={p.accent} />
      <Win x={-38} y={-68} w={14} h={20} arch frame={INK} glass={glass} />
      <Win x={24} y={-68} w={14} h={20} arch frame={INK} glass={glass} />
      <path d="M-42 -48h4v-20h-4m66 20h-4v-20h4M38 -48h4v-20h-4" fill={soften(p.extras[0], 0.1)} strokeWidth="1.6" />
      <path d="M32 -38v6m-4 0h8l-1 8h-6Z" fill={soften(p.accent, 0.05)} strokeWidth="1.6" />
    </g>
  );
}

function Colonial({ p, glass }: Ctx) {
  const frame = soften(p.trim, 0.15);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-46 0V-98H46V0Z" fill={soften(p.wall, 0.15)} />
      <path d="M-54 -96-42-114H42l12 18Z" fill={soften(p.roof, 0.1)} />
      <path d="M-50 -52H50V-47H-50Z" fill={PAPER} />
      {[-36, -8, 20].map((x) => (
        <g key={x}>
          <Win x={x} y={-90} w={16} h={28} arch frame={frame} glass={glass} />
          <path d={`M${x - 3} -60h22`} stroke={frame} strokeWidth="2.6" />
          <path d={`M${x - 2} -60v-6m4 6v-6m4 6v-6m4 6v-6m4 6v-6m4 6v-6`} stroke={INK} strokeWidth="1" />
        </g>
      ))}
      <Win x={-36} y={-38} w={16} h={22} arch frame={frame} glass={glass} />
      <Door x={-8} w={16} h={34} fill={soften(p.door, 0.1)} />
      <Win x={20} y={-38} w={16} h={22} arch frame={frame} glass={glass} />
    </g>
  );
}

function Nubian({ p, glass }: Ctx) {
  const tri = [];
  for (let x = -54; x < 54; x += 9) tri.push(`M${x} -48l4.5 -7 4.5 7`);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-24 -60a22 22 0 0 1 44 0Z" fill={soften(p.roof, 0)} />
      <path d="M18 -60a16 16 0 0 1 32 0Z" fill={soften(p.roof, 0)} />
      <path d="M-58 0V-60H58V0Z" fill={soften(p.wall, 0.1)} />
      <path d="M-58 -56H58V-46H-58Z" fill={soften(p.trim, 0.1)} />
      <path d={tri.join("")} fill={soften(p.accent, 0.05)} strokeWidth="1" />
      <Door x={-9} w={18} h={32} fill={soften(p.door, 0.1)} />
      <Win x={-44} y={-38} w={14} h={18} arch frame={INK} glass={glass} />
      <Win x={30} y={-38} w={14} h={18} arch frame={INK} glass={glass} />
      <path d="M-58 -8H58" stroke={soften(p.accent2, 0.1)} strokeWidth="3" />
    </g>
  );
}

function Courtyard({ p, glass }: Ctx) {
  const roof = soften(p.roof, 0.45);
  const red = soften(p.trim, 0.08);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-58 0V-56H58V0Z" fill={soften(p.wall, 0.3)} />
      <path d="M-82 -52C-70 -54 -62 -60 -56 -78H56C62 -60 70 -54 82 -52L74 -48H-74Z" fill={roof} />
      <path d="M-62 -60H62" stroke="#8a8f8a" strokeWidth="1.4" />
      {[-50, 42].map((x) => (
        <path key={x} d={`M${x} 0V-48h8V0Z`} fill={red} />
      ))}
      <circle cx="0" cy="-22" r="20" fill={red} />
      <circle cx="0" cy="-22" r="14" fill={glass} />
      <path d="M-14 0V-22h28V0" fill={soften(p.door, 0.15)} />
      <Win x={-36} y={-38} w={14} h={16} frame={red} glass={glass} />
      <Win x={22} y={-38} w={14} h={16} frame={red} glass={glass} />
      {[-30, 30].map((x) => (
        <g key={x}>
          <path d={`M${x} -48v6`} strokeWidth="1.2" />
          <ellipse cx={x} cy={-36} rx="5" ry="6" fill={red} strokeWidth="1.6" />
          <path d={`M${x - 3} -30h6`} stroke={p.accent} strokeWidth="2" />
        </g>
      ))}
    </g>
  );
}

function Hanok({ p, glass }: Ctx) {
  const roof = soften(p.roof, 0.45);
  const wood = "#7a5a3e";
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-62 0V-8H62V0Z" fill="#c9c3b5" />
      <path d="M-54 -8V-50H54V-8Z" fill={soften(p.wall, 0)} />
      {[-54, -18, 18, 50].map((x) => (
        <path key={x} d={`M${x} -8V-50h4V-8Z`} fill={wood} strokeWidth="1.4" />
      ))}
      {[-44, -8, 26].map((x) => (
        <g key={x}>
          <path d={`M${x} -12V-42h18v30Z`} fill={glass} strokeWidth="1.8" />
          <path d={`M${x + 6} -42v30m6-30v30M${x} -32h18m-18 10h18`} stroke={wood} strokeWidth="1" fill="none" />
        </g>
      ))}
      <g stroke="none">
        {p.extras.map((color, index) => (
          <path key={color} d={`M${-56 + index * 22.4} -54h22.4v4h-22.4Z`} fill={soften(color, 0.1)} />
        ))}
      </g>
      <path d="M-88 -64C-74 -56 -66 -58 -58 -72C-36 -82 36 -82 58 -72C66 -58 74 -56 88 -64L80 -54H-80Z" fill={roof} />
      <path d="M-48 -78C-20 -84 20 -84 48 -78" stroke="#8a8f8a" strokeWidth="1.4" fill="none" />
    </g>
  );
}

function Shophouse({ p, glass }: Ctx) {
  const shutter = soften(p.trim, 0.1);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-42 0V-100H42V0Z" fill={soften(p.wall, 0.1)} />
      <path d="M-52 -98 -38-116H38l14 18Z" fill={soften(p.roof, 0.1)} />
      <path d="M-50 -54H50L44 -46H-44Z" fill={soften(p.roof, 0.1)} />
      <path d="M-26 -60V-90h52v30" fill={glass} />
      <path d="M-26 -90h10v30h-10Zm42 0h10v30h-10Z" fill={shutter} />
      <path d="M-30 -60H30M-30 -60v-6m10 6v-6m10 6v-6m10 6v-6m10 6v-6m10 6v-6m10 6v-6" stroke={INK} strokeWidth="1.2" fill="none" />
      <path d="M-30 0V-40h18V0Zm42 0V-40h18V0Z" fill={shutter} />
      <path d="M-12 0V-40h24V0Z" fill={soften(p.door, 0.15)} />
      {[-34, 0, 34].map((x, index) => (
        <g key={x}>
          <path d={`M${x} -46v4`} strokeWidth="1.2" />
          <ellipse cx={x} cy={-36} rx="6" ry="7" fill={soften(index === 1 ? p.extras[1] : p.accent, 0.05)} strokeWidth="1.6" />
        </g>
      ))}
    </g>
  );
}

function Cycladic({ p, glass }: Ctx) {
  const blue = soften(p.trim, 0.1);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-40 -64a24 24 0 0 1 48 0Z" fill={blue} />
      <path d="M-16 -88v-8m-4 4h8" stroke={INK} strokeWidth="1.8" />
      <path d="M-50 0V-64H24V0Z" fill={soften(p.wall, 0)} />
      <path d="M24 0V-42H60V0Z" fill={soften(p.wall, 0)} />
      <Door x={-24} w={16} h={30} fill={blue} />
      <Win x={-44} y={-50} w={12} h={14} frame={blue} glass={glass} />
      <Win x={2} y={-50} w={12} h={14} frame={blue} glass={glass} />
      <Win x={36} y={-30} w={12} h={14} arch frame={blue} glass={glass} />
      <path d="M-50 -64h74M24 -42h36" stroke={PAPER} strokeWidth="3" />
      <g stroke="none" fill={soften(p.accent, 0.08)}>
        <circle cx="58" cy="-44" r="7" /><circle cx="64" cy="-38" r="6" /><circle cx="52" cy="-36" r="5" />
        <circle cx="62" cy="-28" r="5" /><circle cx="-50" cy="-30" r="5" /><circle cx="-54" cy="-22" r="6" />
      </g>
    </g>
  );
}

function Villa({ p, glass }: Ctx) {
  const shutter = soften(p.accent2, 0.15);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-56 0V-88H56V0Z" fill={soften(p.wall, 0.15)} />
      <path d="M-66 -86-40-104H40l26 18Z" fill={soften(p.roof, 0.1)} />
      <path d="M-56 -46H56" stroke={soften(p.trim, 0)} strokeWidth="3" />
      {[-40, -8, 24].map((x) => (
        <g key={x}>
          <path d={`M${x - 6} -78h5v22h-5Zm${23} 0h5v22h-5Z`} fill={shutter} strokeWidth="1.6" />
          <Win x={x} y={-78} w={16} h={22} frame={soften(p.trim, 0)} glass={glass} />
        </g>
      ))}
      <Win x={-40} y={-36} w={16} h={20} frame={soften(p.trim, 0)} glass={glass} />
      <Door x={-8} w={16} h={32} fill={soften(p.door, 0.12)} />
      <Win x={24} y={-36} w={16} h={20} frame={soften(p.trim, 0)} glass={glass} />
      <path d="M38 0v-7h12v7" fill="#b86a4a" />
      <circle cx="44" cy="-14" r="5" fill={soften(p.accent, 0)} strokeWidth="1.4" />
      <circle cx="44" cy="-14" r="2" fill="#6b4a2e" stroke="none" />
    </g>
  );
}

function Timber({ p, glass }: Ctx) {
  const white = soften(p.trim, 0);
  const lines = [];
  for (let x = -38; x < 46; x += 8) lines.push(`M${x} -6V-52`);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-46 0V-58L0 -100 46 -58V0Z" fill={soften(p.wall, 0.15)} />
      <path d={lines.join("")} stroke={INK} strokeWidth="0.8" opacity="0.35" />
      <path d="M-56 -54 0 -108 56 -54 48 -50 0 -96-48 -50Z" fill={soften(p.roof, 0.1)} />
      <path d="M-46 -2V-56M46 -2V-56" stroke={white} strokeWidth="4" />
      <Win x={-6} y={-78} w={12} h={14} frame={white} glass={glass} />
      <Win x={-34} y={-44} w={14} h={16} frame={white} glass={glass} />
      <Door x={-6} w={16} h={30} arch={false} fill={soften(p.door, 0.1)} />
      <Win x={22} y={-44} w={14} h={16} frame={white} glass={glass} />
    </g>
  );
}

function Turf({ p, glass }: Ctx) {
  const wood = soften(p.trim, 0.55);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-70 0C-70 -30 -50 -52 -20 -54 0 -56 30 -56 54 -48 70 -40 72 -20 72 0Z" fill={soften(p.roof, 0.05)} />
      <path d="M-56 -30c4-4 8-4 12 0m40-14c4-4 8-4 12 0m30 20c4-4 8-4 12 0" stroke="#7d8a56" strokeWidth="1.6" fill="none" />
      {[-40, -6, 28].map((x, index) => (
        <g key={x}>
          <path d={`M${x} 0V-28L${x + 15} -46 ${x + 30} -28V0Z`} fill={index === 1 ? soften(p.wall, 0) : wood} />
          {index === 1 ? (
            <Door x={x + 8} w={14} h={24} arch={false} fill={soften(p.door, 0.15)} />
          ) : (
            <Win x={x + 9} y={-30} w={12} h={12} frame={INK} glass={glass} />
          )}
        </g>
      ))}
    </g>
  );
}

function Haussmann({ p, glass }: Ctx) {
  const iron = soften(p.trim, 0.2);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-48 0V-120H48V0Z" fill={soften(p.wall, 0)} />
      <path d="M-52 -118-42-140H42l10 22Z" fill={soften(p.roof, 0.15)} />
      {[-24, 12].map((x) => (
        <g key={x}>
          <path d={`M${x} -124v-10l6-5 6 5v10Z`} fill={soften(p.wall, 0)} strokeWidth="1.6" />
          <Win x={x + 2} y={-133} w={8} h={8} frame={INK} glass={glass} bars={false} />
        </g>
      ))}
      {[-104, -76].map((y) =>
        [-38, -10, 18].map((x) => (
          <g key={`${x}${y}`}>
            <Win x={x} y={y} w={18} h={20} frame={PAPER} glass={glass} />
            <path d={`M${x - 3} ${y + 20}h24m-24 0v-5m6 5v-5m6 5v-5m6 5v-5m6 5v-5`} stroke={iron} strokeWidth="1.4" fill="none" />
          </g>
        ))
      )}
      <path d="M-48 -48H48" stroke="#cfc6ae" strokeWidth="2" />
      <path d="M-46 -42H8L4 -32H-42Z" fill={soften(p.accent, 0.1)} />
      <path d="M-42 -32c3 3 6 3 9 0s6 3 9 0 6 3 9 0 6 3 9 0 6 3 9 0" fill="none" stroke={INK} strokeWidth="1.2" />
      <Win x={-38} y={-26} w={36} h={18} frame={INK} glass={glass} />
      <Door x={18} w={18} h={36} fill={soften(p.door, 0.1)} />
    </g>
  );
}

function Terrace({ p, glass }: Ctx) {
  const white = soften(p.trim, 0);
  const bricks = [];
  for (let y = -88; y < -4; y += 8) bricks.push(`M-44 ${y}h88`);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M26 -100v-20h12v20m-58 0v-16h10v16" fill={soften(p.wall, 0.1)} />
      <path d="M-46 0V-96H46V0Z" fill={soften(p.wall, 0.12)} />
      <path d={bricks.join("")} stroke="#7a3a30" strokeWidth="0.8" opacity="0.45" />
      <path d="M-54 -94-40-112H40l14 18Z" fill={soften(p.roof, 0.45)} />
      <Win x={-34} y={-82} w={18} h={22} frame={white} glass={glass} />
      <Win x={14} y={-82} w={18} h={22} frame={white} glass={glass} />
      <path d="M-44 0V-40L-38 -46H-6L0 -40V0Z" fill={white} />
      <Win x={-38} y={-38} w={32} h={22} frame={white} glass={glass} />
      <path d="M14 -34a10 10 0 0 1 20 0Z" fill={glass} />
      <Door x={14} w={20} h={34} arch={false} fill={soften(p.door, 0.08)} />
    </g>
  );
}

function Thatch({ p, glass }: Ctx) {
  const straw = "#c79a52";
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M30 -58V-80h12v18" fill={soften(p.wall, 0)} />
      <path d="M-64 0V-44H64V0Z" fill={soften(p.wall, 0)} />
      <path d="M-74 -38C-74 -70 -60 -84 -36 -86H36C60 -84 74 -70 74 -38C60 -46 -60 -46 -74 -38Z" fill={straw} />
      <path d="M-60 -50c10-24 30-28 40-28m40 0c14 0 32 6 42 28M-20 -70c10-4 30-4 40 0" stroke="#9e7638" strokeWidth="1.4" fill="none" />
      <Door x={-8} w={16} h={30} arch={false} fill={soften(p.door, 0.1)} />
      <Win x={-46} y={-32} w={14} h={14} frame={soften(p.trim, 0.1)} glass={glass} />
      <Win x={30} y={-32} w={14} h={14} frame={soften(p.trim, 0.1)} glass={glass} />
    </g>
  );
}

function Konak({ p, glass }: Ctx) {
  const wood = soften(p.accent2, 0.1);
  const blue = soften(p.trim, 0.1);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-40 0V-48H40V0Z" fill={soften(p.wall, 0)} />
      <path d="M-40 -48 -52 -54H52L40 -48" fill={wood} />
      <path d="M-52 -54V-98H52V-54Z" fill={wood} />
      <path d="M-62 -96-44-114H44l18 18Z" fill={soften(p.roof, 0.35)} />
      {[-44, -22, 0, 22].map((x) => (
        <Win key={x} x={x + 2} y={-90} w={14} h={26} frame={blue} glass={glass} />
      ))}
      <Door x={-9} w={18} h={32} fill={soften(p.door, 0.08)} />
      <Win x={-32} y={-34} w={14} h={16} arch frame={blue} glass={glass} />
      <Win x={18} y={-34} w={14} h={16} arch frame={blue} glass={glass} />
      <path d="M-50 -56H50" stroke={soften(p.accent, 0)} strokeWidth="2" />
    </g>
  );
}

function Queenslander({ p, glass }: Ctx) {
  const rail = soften(p.trim, 0.15);
  const ribs = [];
  for (let x = -58; x <= 58; x += 8) ribs.push(`M${x} -84L${x * 0.82} -104`);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      {[-50, -20, 20, 50].map((x) => (
        <path key={x} d={`M${x} 0V-26`} strokeWidth="3" />
      ))}
      <path d="M-30 0 -10 -26" strokeWidth="3" />
      <path d="M-34 0-14 -26M-38 -6h6m-3-6h6m-3-6h6" strokeWidth="1.4" />
      <path d="M-56 -26V-84H56V-26Z" fill={soften(p.wall, 0)} />
      <path d="M-66 -82-48-106H48l18 24Z" fill={soften(p.roof, 0.1)} />
      <path d={ribs.join("")} stroke={INK} strokeWidth="0.8" opacity="0.4" />
      <Door x={-8} w={16} h={30} arch={false} fill={soften(p.door, 0.1)} />
      <path d="M-8 -26v0" />
      <g transform="translate(0 -26)">
        <Win x={-46} y={-44} w={16} h={20} frame={rail} glass={glass} />
        <Win x={30} y={-44} w={16} h={20} frame={rail} glass={glass} />
      </g>
      <path d="M-60 -26H60M-60 -38H60" stroke={rail} strokeWidth="2.4" />
      <path d="M-56 -26v-12m8 12v-12m8 12v-12m8 12v-12m40 12v-12m8 12v-12m8 12v-12m8 12v-12" stroke={rail} strokeWidth="1.4" />
    </g>
  );
}

function Cottage({ p, glass }: Ctx) {
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M26 -62V-86h12v32" fill={soften(p.trim, 0.1)} />
      <path d="M-46 0V-56L0 -90 46 -56V0Z" fill={soften(p.wall, 0)} />
      <path d="M-56 -52 0 -98 56 -52 48 -48 0 -86-48 -48Z" fill={soften(p.roof, 0.05)} />
      <Win x={-6} y={-72} w={12} h={12} frame={INK} glass={glass} />
      <path d="M-26 -40H26L30 -32H-30Z" fill={soften(p.roof, 0.05)} />
      <path d="M-26 0V-32m52 32V-32" strokeWidth="2" />
      <Win x={-40} y={-28} w={12} h={14} frame={INK} glass={glass} />
      <Door x={-8} w={16} h={28} fill={soften(p.door, 0)} />
      <Win x={28} y={-28} w={12} h={14} frame={INK} glass={glass} />
    </g>
  );
}

function Farmhouse({ p, glass }: Ctx) {
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-64 0V-60H64V0Z" fill={soften(p.wall, 0)} />
      <path d="M-72 -58-52-90H52l20 32Z" fill={soften(p.roof, 0.05)} />
      <path d="M-58 -82h116" stroke={INK} strokeWidth="1" opacity="0.4" />
      <Win x={-46} y={-52} w={14} h={14} frame={INK} glass={glass} />
      <Win x={-7} y={-52} w={14} h={14} frame={INK} glass={glass} />
      <Win x={32} y={-52} w={14} h={14} frame={INK} glass={glass} />
      <path d="M-70 -30H70L64 -24H-64Z" fill={soften(p.trim, 0.05)} />
      <path d="M-60 0V-24M-30 0V-24M30 0V-24M60 0V-24" strokeWidth="2.4" />
      <Win x={-48} y={-20} w={14} h={14} frame={INK} glass={glass} />
      <Door x={-8} w={16} h={24} arch={false} fill={soften(p.door, 0)} />
      <Win x={34} y={-20} w={14} h={14} frame={INK} glass={glass} />
    </g>
  );
}

function AFrame({ p, glass }: Ctx) {
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-58 0 0 -104 58 0Z" fill={soften(p.roof, 0.05)} />
      <path d="M-40 0 0 -72 40 0Z" fill={soften(p.wall, 0)} />
      <path d="M-20 -36H20M-30 -18H30" stroke={INK} strokeWidth="1.4" />
      <path d="M0 -72V0" stroke={INK} strokeWidth="1.4" />
      <path d="M-14 -40 0 -64 14 -40Z" fill={glass} />
      <Door x={-8} w={16} h={22} arch={false} fill={soften(p.door, 0)} />
    </g>
  );
}

function Apartment({ p, glass }: Ctx) {
  const rows = [-118, -92, -66, -40];
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M-44 0V-128H44V0Z" fill={soften(p.wall, 0)} />
      <path d="M-48 -128H48V-136H-48Z" fill={soften(p.roof, 0.05)} />
      <path d="M22 -136v-10h10v10" fill={soften(p.trim, 0.1)} />
      {rows.map((y) =>
        [-34, -9, 16].map((x) => <Win key={`${x}${y}`} x={x} y={y} w={14} h={16} frame={INK} glass={glass} />)
      )}
      <path d="M-14 -28H14L18 -22H-18Z" fill={soften(p.trim, 0.05)} />
      <Door x={-9} w={18} h={22} arch={false} fill={soften(p.door, 0)} />
    </g>
  );
}

function Tent({ p }: Ctx) {
  // From the sketch: a tent instead of a house, for friends.
  const canvas = soften(p.accent2 ?? p.wall, 0.25);
  const stripe = soften(p.accent, 0.15);
  return (
    <g stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
      <path d="M0 -92V-112" strokeWidth="2" />
      <path d="M0 -112h16l-5 5 5 5H0" fill={stripe} strokeWidth="1.6" />
      <path d="M-62 0 0 -94 62 0Z" fill={canvas} />
      <path d="M-40 0 0 -94M40 0 0 -94" stroke={stripe} strokeWidth="5" />
      <path d="M-62 0 0 -94 62 0Z" fill="none" />
      <path d="M-20 0C-14 -26 -6 -46 0 -54 6 -46 14 -26 20 0Z" fill="#3a4a42" />
      <path d="M-62 0-74 6M62 0l12 6" strokeWidth="1.6" />
      <g stroke="none">
        <Bunting x1={-34} x2={34} y={-46} colors={p.extras} sag={3} />
      </g>
    </g>
  );
}

const HOMES: Record<HomeStyle, (ctx: Ctx) => ReactNode> = {
  mangaluru: Mangaluru, casita: Casita, machiya: Machiya, riad: Riad, colonial: Colonial,
  nubian: Nubian, courtyard: Courtyard, hanok: Hanok, shophouse: Shophouse, cycladic: Cycladic,
  villa: Villa, timber: Timber, turf: Turf, haussmann: Haussmann, terrace: Terrace,
  thatch: Thatch, konak: Konak, queenslander: Queenslander, cottage: Cottage,
  farmhouse: Farmhouse, aframe: AFrame, apartment: Apartment, tent: Tent,
};

/* ---------- trees and little details ---------- */

type TreeKind = "round" | "tall" | "palm" | "cactus" | "cherry" | "pine" | "olive" | "cypress" | "eucalyptus" | "rock";

const TREES_FOR: Partial<Record<HomeStyle, TreeKind[]>> = {
  mangaluru: ["palm", "round"], casita: ["cactus", "round"], machiya: ["cherry", "pine"],
  riad: ["palm", "olive"], colonial: ["palm", "round"], nubian: ["palm", "round"],
  courtyard: ["round", "pine"], hanok: ["pine", "cherry"], shophouse: ["palm", "round"],
  cycladic: ["olive", "cypress"], villa: ["cypress", "olive"], timber: ["pine", "tall"],
  turf: ["rock", "rock"], haussmann: ["round", "tall"], terrace: ["round", "tall"],
  thatch: ["round", "tall"], konak: ["round", "cypress"], queenslander: ["eucalyptus", "palm"],
};

function Tree({ kind, x, s, flip, p }: { kind: TreeKind; x: number; s: number; flip: boolean; p: Palette }) {
  const t = `translate(${x} 170) scale(${flip ? -s : s} ${s})`;
  const dark = "#4d7a3c";
  const mid = "#6f9a48";
  switch (kind) {
    case "palm":
      return (
        <g transform={t} stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 0C2-20 6-40 4-62" fill="none" stroke="#8a6a46" strokeWidth="5" />
          <path d="M4-62c-12-6-26-2-32 8 10-4 20-4 30-2M4-62c10-10 26-10 34 0-10-2-22 0-32 4M4-62c-4-12-16-18-26-16 10 4 18 10 24 18M4-62c6-12 18-16 26-12-10 2-18 8-24 14" fill={mid} />
          <circle cx="2" cy="-58" r="2.6" fill="#8a6a46" stroke="none" />
        </g>
      );
    case "cactus":
      return (
        <g transform={t} stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M-6 0V-48a6 6 0 0 1 12 0V0Z" fill={mid} />
          <path d="M-6-24h-8a4 4 0 0 1-4-4v-10a3 3 0 0 1 6 0v8h6m12 6h6a4 4 0 0 0 4-4v-12a3 3 0 0 0-6 0v10h-4" fill={mid} />
          <circle cx="0" cy="-54" r="3" fill={soften(p.accent, 0.05)} stroke="none" />
        </g>
      );
    case "cherry":
      return (
        <g transform={t} stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M0 0V-30M0-22l-10-10M0-26l10-8" fill="none" stroke="#6b4a3a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M-28-40c-6-16 10-26 20-18 4-14 26-14 30 0 14-2 18 16 6 22-6 8-22 8-28 2-10 6-26 4-28-6Z" fill="#f6c4cf" />
        </g>
      );
    case "pine":
      return (
        <g transform={t} stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M0 0V-10" stroke="#6b4a3a" strokeWidth="3" />
          <path d="M0-74-18-42h8L-22-22h10L-26-8h52L12-22h10L10-42h8Z" fill={dark} />
        </g>
      );
    case "olive":
      return (
        <g transform={t} stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M0 0c-2-10 2-16-2-26M0-14c4-4 8-6 8-12" fill="none" stroke="#7a6a52" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M-24-30c-4-12 8-20 16-14 2-10 20-10 22 0 10 0 14 12 4 16-4 6-16 6-20 2-8 4-20 2-22-4Z" fill="#9ca38f" />
        </g>
      );
    case "cypress":
      return (
        <g transform={t} stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M0-88C10-74 12-36 8-12c-2 6-14 6-16 0-4-24-2-62 8-76Z" fill="#3f5e47" />
          <path d="M0 0v-8" stroke="#6b4a3a" strokeWidth="3" />
        </g>
      );
    case "eucalyptus":
      return (
        <g transform={t} stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M0 0C-2-20 2-34-2-52M0-30l12-12" fill="none" stroke="#d8d0c0" strokeWidth="4" strokeLinecap="round" />
          <path d="M-26-56c-2-12 12-18 20-12 4-10 22-8 24 2 10 2 10 16 0 18-6 6-18 4-20-2-10 4-22 2-24-6Z" fill="#7ea08c" />
        </g>
      );
    case "rock":
      return (
        <g transform={t} stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M-16 0c-2-10 4-18 14-18 8 0 16 6 16 18Z" fill="#a8aaa5" />
          <path d="M8 0c0-6 4-10 9-10s8 4 8 10Z" fill="#c4c5bf" />
        </g>
      );
    case "tall":
      return (
        <g transform={t} stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M0 0V-16" stroke="#6b4a3a" strokeWidth="3" />
          <path d="M0-70C12-58 13-34 10-20c-2 6-18 6-20 0-3-14-2-38 10-50Z" fill={dark} />
        </g>
      );
    default:
      return (
        <g transform={t} stroke={INK} strokeWidth="2" strokeLinejoin="round">
          <path d="M0 0V-24" stroke="#6b4a3a" strokeWidth="3" />
          <ellipse cx="0" cy="-38" rx="17" ry="19" fill={mid} />
          <path d="M-6-32c4 3 9 3 12 0" stroke={dark} strokeWidth="1.8" fill="none" />
        </g>
      );
  }
}

type Detail = "flowers" | "bench" | "mailbox" | "lantern" | "washing" | "cat" | "pots" | "bike";
const DETAILS: Detail[] = ["flowers", "bench", "mailbox", "lantern", "washing", "cat", "pots", "bike"];

function SmallDetail({ kind, x, p, lit }: { kind: Detail; x: number; p: Palette; lit: boolean }) {
  const c = p.extras.map((color) => soften(color, 0.12));
  const g = (children: ReactNode) => (
    <g transform={`translate(${x} 172)`} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
      {children}
    </g>
  );
  switch (kind) {
    case "flowers":
      return g(<>
        <path d="M-12 0v-8M0 0v-10M12 0v-8" stroke="#5e8a3e" />
        <circle cx="-12" cy="-10" r="3.4" fill={c[0]} /><circle cx="0" cy="-12" r="3.4" fill={c[1 % c.length]} /><circle cx="12" cy="-10" r="3.4" fill={c[2 % c.length]} />
      </>);
    case "bench":
      return g(<><path d="M-14-10h28v4h-28Z" fill="#a8774e" /><path d="M-12-6V0m24-6V0M-14-16h28" /></>);
    case "mailbox":
      return g(<><path d="M0 0v-14" /><path d="M-7-14v-6a5 5 0 0 1 14 0v6Z" fill={c[0]} /><path d="M7-20v-6h4" stroke={c[1 % c.length]} /></>);
    case "lantern":
      return g(<><path d="M0 0v-26m0 0h6" /><path d="M3-26h6v9h-6Z" fill={lit ? GLOW : DARK_GLASS} /></>);
    case "washing":
      return g(<>
        <path d="M-18 0v-24M18 0v-24M-18-22q18 6 36 0" fill="none" />
        <path d="M-12-20h8v9h-8Zm12 1h8v10h-8Z" fill={c[0]} /><path d="M-12-20h8v9h-8Z" fill={c[1 % c.length]} />
      </>);
    case "cat":
      return g(<><path d="M-6 0c0-8 2-12 6-12s6 4 6 12Zm1-12-1-5 4 3m4 2 1-5-4 3" fill="#3f4a46" /><path d="M6-2c6 0 8-4 6-8" fill="none" /></>);
    case "pots":
      return g(<>
        <path d="M-10 0-12-8h8L-6 0Zm12 0-2-10h10L8 0Z" fill="#c4704f" />
        <path d="M-8-8c-2-6 2-8 0-12m10 10c0-6 4-8 2-12" stroke="#5e8a3e" fill="none" />
      </>);
    default:
      return g(<><circle cx="-9" cy="-6" r="6" fill="none" /><circle cx="9" cy="-6" r="6" fill="none" /><path d="M-9-6l6-10h10l2 10M-3-16h-3m13 0 2-3" stroke={c[0]} strokeWidth="2.2" fill="none" /></>);
  }
}

/* ---------- the scene ---------- */

export default function NeighborhoodArt({ person, light }: Props) {
  const { style, palette, ground } = placeLook(person);
  const r = seededRandom(`${person.id}:scene`);
  const lit = light > 0.4;
  const glass = lit ? GLOW : DARK_GLASS;
  const glowStrength = Math.max(0, (light - 0.5) / 0.5);
  const isNight = light <= 0.25;

  const trees = TREES_FOR[style] ?? (["round", "tall"] as TreeKind[]);
  const leftTree = trees[Math.floor(r() * trees.length)];
  const rightTree = trees[Math.floor(r() * trees.length)];
  const leftDetail = DETAILS[Math.floor(r() * DETAILS.length)];
  const rightDetail = DETAILS[(DETAILS.indexOf(leftDetail) + 1 + Math.floor(r() * (DETAILS.length - 1))) % DETAILS.length];
  const pondSide = r() < 0.5 ? -1 : 1;
  const hasPond = r() < 0.55 && ground.water;
  const flip = r() < 0.5 && style !== "mangaluru";
  const pathBend = 18 + r() * 26;
  const haloId = `halo-${person.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg
      className="neighborhood-art"
      viewBox="0 0 380 224"
      aria-hidden="true"
      focusable="false"
      style={{ filter: `brightness(${0.62 + light * 0.38}) saturate(${0.35 + light * 0.85})` }}
    >
      <defs>
        <radialGradient id={haloId}>
          <stop offset="0%" stopColor="#ffe9a3" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#ffe08a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffe08a" stopOpacity="0" />
        </radialGradient>
        {/* crayon dashes in the ground, like the hills in the background */}
        <pattern id={`${haloId}-ground`} width="22" height="16" patternUnits="userSpaceOnUse">
          <rect width="22" height="16" fill={ground.hill} />
          <path d="M4 3v5M15 10v5" stroke={ground.light} strokeWidth="2.6" strokeLinecap="round" />
        </pattern>
      </defs>

      {glowStrength > 0 && (
        <ellipse className="neighborhood-halo" cx="190" cy="110" rx="150" ry="96" fill={`url(#${haloId})`} opacity={glowStrength} />
      )}

      {isNight && (
        <g className="neighborhood-night">
          <path d="M318 26a16 16 0 1 0 14 24 13 13 0 1 1-14-24Z" fill="#f4eccc" stroke={INK} strokeWidth="1.8" />
          <path d="M282 22l2 4 4 1-4 2-2 4-2-4-4-2 4-1Zm-34 22 1.5 3 3 1-3 1.5-1.5 3-1.5-3-3-1.5 3-1Z" fill="#f4eccc" />
        </g>
      )}

      {/* everything below is drawn with the shared hand-drawn texture */}
      <g filter="url(#kl-sketch)">
      {/* the hill everything sits on */}
      <path d="M22 182c10-26 40-34 70-30 26-22 70-30 98-28 34-2 76 6 102 28 30-4 60 4 68 30 4 14-8 24-26 24H48c-20 0-32-10-26-24Z" fill={`url(#${haloId}-ground)`} stroke={INK} strokeWidth="2" strokeLinejoin="round" />

      {hasPond && (
        <g transform={`translate(${pondSide < 0 ? 60 : 320} 192)`}>
          <ellipse cx="0" cy="0" rx="24" ry="9" fill="#7fc2dd" stroke={INK} strokeWidth="1.8" />
          <path d="M-14-1q3.5-3 7 0t7 0 7 0M-8 4q3-2.5 6 0t6 0" stroke="#c9ecf6" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </g>
      )}

      {/* path from the door down the hill */}
      <path
        d={`M190 170c0 10 ${-pathBend} 14 ${-pathBend * 0.6} 26s${pathBend * 0.4} 10 ${pathBend * 0.2} 22`}
        fill="none"
        stroke={ground.path}
        strokeWidth="11"
        strokeLinecap="round"
      />

      <Tree kind={leftTree} x={70 + r() * 16} s={0.85 + r() * 0.3} flip={r() < 0.5} p={palette} />
      <Tree kind={rightTree} x={296 + r() * 16} s={0.85 + r() * 0.3} flip={r() < 0.5} p={palette} />

      <g transform={`translate(190 170) scale(${flip ? -1 : 1} 1)`}>
        {HOMES[style]({ p: palette, lit, glass, r })}
      </g>

      <SmallDetail kind={leftDetail} x={118} p={palette} lit={lit} />
      <SmallDetail kind={rightDetail} x={262} p={palette} lit={lit} />
      </g>
    </svg>
  );
}
