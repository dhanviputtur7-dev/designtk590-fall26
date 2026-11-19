/*
  Birthday reminders on a neighborhood, worked out from today's date:
  - 2 days before and the day before: a little cake in the top corner with a
    tag saying "in 2 days" / "tomorrow"
  - on the birthday: the cake's candles are lit and glowing, and strings of
    lights hang across the top of the neighborhood
*/

const INK = "#2c4337";
const BULBS = ["#ffd23f", "#ff8fbf", "#7fd3d0", "#ffb36b", "#b9a6ff"];

function Cake({ lit }: { lit: boolean }) {
  return (
    <svg className="birthday-cake" viewBox="0 -6 80 90" aria-hidden="true" focusable="false">
      {lit && (
        <g className="birthday-flames">
          {[24, 40, 56].map((x) => (
            <g key={x}>
              <circle cx={x} cy="8" r="12" fill="#ffd23f" opacity="0.5" />
              <path d={`M${x} -2c6 7 6 13 0 18-6-5-6-11 0-18Z`} fill="#ff9a3c" stroke={INK} strokeWidth="1.4" />
              <path d={`M${x} 5c2.4 3 2.4 6 0 8.4-2.4-2.4-2.4-5.4 0-8.4Z`} fill="#fff3cf" />
            </g>
          ))}
        </g>
      )}
      {[24, 40, 56].map((x, index) => (
        <g key={x}>
          <path d={`M${x - 2.4} 18h4.8v14h-4.8Z`} fill={["#7fd3d0", "#ff8fbf", "#b9a6ff"][index]} stroke={INK} strokeWidth="1.4" />
          <path d={`M${x} 18v-2`} stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ))}
      {/* top tier with pink icing drips */}
      <path d="M14 32h52v18H14Z" fill="#fff3df" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 32h52v6c-4 0-4 6-8 6s-4-6-8-6-4 8-9 8-4-8-9-8-4 6-8 6-4-6-8-6Z" fill="#ff9fc4" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      {/* bottom tier */}
      <path d="M6 50h68v22H6Z" fill="#f6cf71" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 58c6 4 10 4 14 0s9-4 14 0 9 4 14 0 9-4 14 0 6 3 12 0" fill="none" stroke="#fff7e6" strokeWidth="2.2" strokeLinecap="round" />
      {[16, 30, 44, 58].map((x) => (
        <circle key={x} cx={x} cy="66" r="2" fill="#e05a6b" />
      ))}
      <path d="M2 72h76" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M4 72c2 6 70 6 72 0" fill="#e9d8b8" stroke={INK} strokeWidth="1.8" />
    </svg>
  );
}

function StringLights() {
  // two strands draped across the top of the neighborhood
  const strands = [
    { d: "M0 6C90 52 210 52 300 6", count: 11, offset: 0 },
    { d: "M0 20C70 58 230 58 300 20", count: 9, offset: 2 },
  ];
  return (
    <svg className="birthday-lights" viewBox="0 0 300 64" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {strands.map((strand, strandIndex) => {
        // place bulbs along a quadratic-ish curve approximation of the strand
        const [, y0] = strand.d.match(/M0 (\d+)/)!.map(Number);
        const sag = strandIndex === 0 ? 34 : 29;
        return (
          <g key={strandIndex}>
            <path d={strand.d} fill="none" stroke={INK} strokeWidth="1.4" opacity="0.7" />
            {Array.from({ length: strand.count }, (_, index) => {
              const t = (index + 0.5) / strand.count;
              const x = t * 300;
              const y = y0 + sag * 4 * t * (1 - t) * 1.02;
              const color = BULBS[(index + strand.offset) % BULBS.length];
              return (
                <g key={index} className="birthday-bulb" style={{ animationDelay: `${(index % 4) * 0.45}s` }}>
                  <circle cx={x} cy={y + 6} r="7" fill={color} opacity="0.35" />
                  <path d={`M${x - 2} ${y}h4v2h-4Z`} fill={INK} />
                  <ellipse cx={x} cy={y + 6} rx="3.4" ry="4.4" fill={color} stroke={INK} strokeWidth="1" />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export default function BirthdayDecor({ daysUntil, name }: { daysUntil: number; name: string }) {
  if (daysUntil > 2) return null;
  const isToday = daysUntil === 0;
  const label = isToday ? "Birthday today!" : daysUntil === 1 ? "Tomorrow" : "In 2 days";

  return (
    <>
      {isToday && <StringLights />}
      <div className={`birthday-corner${isToday ? " birthday-corner--today" : ""}`}>
        <Cake lit={isToday} />
        <span className="birthday-tag">
          {label}
          <span className="sr-only">
            {isToday ? ` It's ${name}'s birthday.` : ` until ${name}'s birthday.`}
          </span>
        </span>
      </div>
    </>
  );
}
