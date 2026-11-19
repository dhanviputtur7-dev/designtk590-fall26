import { placeLook, seededRandom } from "../lib/places";

/*
  The clearing each neighborhood sits in: a warm paper-cream patch (so it
  stands out from the green countryside) with a hand-drawn edge in that
  place's accent color.

  The shape is a wobbly "squircle" rather than an oval, so the bottom stays
  wide and the Check in / remove buttons always sit inside the edge.
*/

type Props = {
  person: { id: string; city?: string; relationship?: string };
  light: number;
};

type Point = { x: number; y: number };

const CENTER = { x: 200, y: 233 };

function blobPath(points: Point[], scale: number) {
  const scaled = points.map((point) => ({
    x: CENTER.x + (point.x - CENTER.x) * scale,
    y: CENTER.y + (point.y - CENTER.y) * scale,
  }));
  const count = scaled.length;
  let path = `M ${scaled[0].x.toFixed(1)} ${scaled[0].y.toFixed(1)}`;

  for (let index = 0; index < count; index += 1) {
    const before = scaled[(index - 1 + count) % count];
    const start = scaled[index];
    const end = scaled[(index + 1) % count];
    const after = scaled[(index + 2) % count];
    const control1 = { x: start.x + (end.x - before.x) / 6, y: start.y + (end.y - before.y) / 6 };
    const control2 = { x: end.x - (after.x - start.x) / 6, y: end.y - (after.y - start.y) / 6 };
    path += ` C ${control1.x.toFixed(1)} ${control1.y.toFixed(1)}, ${control2.x.toFixed(1)} ${control2.y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  }

  return `${path} Z`;
}

/* Mix two hex colors. */
function mix(a: string, b: string, amount: number) {
  const channel = (hex: string, index: number) => parseInt(hex.replace("#", "").slice(index, index + 2), 16);
  return `#${[0, 2, 4]
    .map((index) => Math.round(channel(a, index) * (1 - amount) + channel(b, index) * amount).toString(16).padStart(2, "0"))
    .join("")}`;
}

export default function IslandShell({ person, light }: Props) {
  const { palette, ground } = placeLook(person);
  const random = seededRandom(`${person.id}:shell`);
  const count = 28;
  const points = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // superellipse: a rounded rectangle that still feels organic
    const exponent = 2 / 3.2;
    const wobble = 1 + (random() - 0.5) * 0.045;
    return {
      x: CENTER.x + Math.sign(cos) * Math.pow(Math.abs(cos), exponent) * 186 * wobble,
      y: CENTER.y + Math.sign(sin) * Math.pow(Math.abs(sin), exponent) * 222 * wobble,
    };
  });

  const paper = mix("#fbf4e4", ground.light, 0.18);
  const edgeColor = mix(palette.accent, "#fbf4e4", 0.35);

  return (
    <svg
      className="island-shell"
      viewBox="0 0 400 456"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ filter: `brightness(${0.7 + light * 0.3}) saturate(${0.5 + light * 0.6})` }}
    >
      <g filter="url(#kl-paper)">
        {/* soft shadow in the color of the land, so the clearing sits on the page */}
        <path d={blobPath(points, 1)} transform="translate(4 9)" fill={ground.hill} opacity="0.55" />
        <path d={blobPath(points, 1)} fill={paper} stroke="#2c4337" strokeWidth="2.4" />
        <path d={blobPath(points, 0.94)} fill="none" stroke={edgeColor} strokeWidth="3" strokeDasharray="1 11" strokeLinecap="round" />
      </g>
    </svg>
  );
}
