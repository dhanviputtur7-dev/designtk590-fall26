import { useId } from "react";

/*
  Village glow tracker: a hand-drawn lantern jar that fills with warm light
  as you keep in touch, with fireflies in the lit part. No box around it.
  It sits straight on the landscape, so:
  - the jar has a cream glass body with a dark ink outline (visible on the
    light day sky and the dark night sky)
  - the text swaps between dark ink (day) and cream with a soft halo (night),
    like the title (see "Village glow tracker" in globals.css)
  The light inside uses the riso inks from the sun: yellow over off-register pink.
*/

type Props = {
  health: number;
  checkInsThisWeek: number;
};

/* Short status lines so they fit on one or two lines next to the jar. */
function healthMessage(health: number) {
  if (health > 0.75) return "Your village is glowing";
  if (health > 0.5) return "Your village is warm";
  if (health > 0.25) return "It's getting quiet";

  return "The lights are dimming";
}

const INK = "#2c4337";
const JAR = "M24 42C12 47 9 58 9 72v76c0 10 8 18 18 18h26c10 0 18-8 18-18V72c0-14-3-25-15-30Z";
const FIREFLIES = [
  [28, 150], [50, 140], [38, 126], [58, 116], [22, 108], [44, 96], [30, 84], [56, 76], [40, 64],
];

export default function VillageHealth({ health, checkInsThisWeek }: Props) {
  const percent = Math.round(health * 100);
  const id = useId().replace(/:/g, "");
  const top = 166 - (166 - 46) * Math.min(1, Math.max(0, health)); // where the light reaches

  return (
    <section className="village-health village-health--lantern" aria-label="Village check-in activity">
      <div
        className="health-lantern"
        role="progressbar"
        aria-label="Village glow"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <svg viewBox="0 0 80 172" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={`jar-${id}`}>
              <path d={JAR} />
            </clipPath>
            <radialGradient id={`halo-${id}`}>
              <stop offset="0%" stopColor="#ffe08a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffe08a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* warm halo, brighter the fuller the jar */}
          <ellipse cx="40" cy="112" rx="46" ry="66" fill={`url(#halo-${id})`} opacity={0.25 + health * 0.75} />

          <g filter="url(#kl-sketch)">
          {/* wire handle and lid */}
          <path d="M22 24C20 6 60 6 58 24" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <rect x="17" y="21" width="46" height="13" rx="3" fill="#c76546" stroke={INK} strokeWidth="2.6" />
          <path d="M22 27.5h36" stroke="#a9503a" strokeWidth="1.6" />
          <rect x="21" y="34" width="38" height="8" rx="2" fill="#e9d8b8" stroke={INK} strokeWidth="2.2" />

          {/* glass */}
          <path d={JAR} fill="#fff8e6" fillOpacity="0.92" />

          {/* the light inside: pink ink a little off-register, yellow on top */}
          <g clipPath={`url(#jar-${id})`}>
            <rect x="0" y={top - 3} width="80" height="180" fill="#ff8fbf" transform="translate(3 0)" />
            <rect x="0" y={top} width="80" height="180" fill="#ffd23f" />
            <path d={`M0 ${top}q10-4 20 0t20 0 20 0 20 0`} fill="none" stroke="#fff3cf" strokeWidth="2" opacity="0.8" />
            {FIREFLIES.filter(([, y]) => y > top + 6).map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="4.2" fill="#fff6d6" opacity="0.7" />
                <circle cx={x} cy={y} r="1.8" fill="#fffdf3" />
              </g>
            ))}
          </g>

          {/* glass outline, shine, and measuring marks */}
          <path d={JAR} fill="none" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M17 76v52" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" opacity="0.8" />
          <path d="M71 76h-6M71 106h-6M71 136h-6" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      <div className="health-words">
        <p className="health-eyebrow">Village glow</p>
        <p className="health-percent">
          {percent}
          <span>%</span>
        </p>
        <h2>{healthMessage(health)}</h2>
        <p className="health-caption">
          {checkInsThisWeek} {checkInsThisWeek === 1 ? "check-in" : "check-ins"} this week
        </p>
      </div>
    </section>
  );
}
