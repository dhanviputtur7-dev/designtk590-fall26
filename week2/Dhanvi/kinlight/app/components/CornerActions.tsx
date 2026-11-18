/*
  Add person + Message ideas buttons, in a row right under the logo, drawn in the
  same hand-drawn storybook style as the illustrations: a wobbly painted
  circle with an ink outline and offset shadow, crayon-colored icons, and a
  paper tag for the label. Uses the shared kl-sketch texture.
*/

import type { ReactNode } from "react";

type Props = {
  onAddPerson: () => void;
  onMessageIdeas: () => void;
  isAddOpen: boolean;
};

const INK = "#2c4337";

/* a slightly lumpy circle, like it was drawn freehand */
function blob(seed: number) {
  const points = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r = 41 + Math.sin(i * 2.3 + seed) * 1.8 + Math.cos(i * 1.7 + seed * 2) * 1.2;
    return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r];
  });
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length; i += 1) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

const BLOB_ADD = blob(1.2);
const BLOB_IDEAS = blob(3.7);

function ButtonDisc({ shape, children }: { shape: string; children: ReactNode }) {
  return (
    <svg className="sketch-button-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <g filter="url(#kl-sketch)">
        <path d={shape} transform="translate(4 5)" fill={INK} />
        <path d={shape} fill="#f9cf5f" stroke={INK} strokeWidth="3" />
        <path d="M26 30c6-8 14-12 22-13" fill="none" stroke="#fff3c4" strokeWidth="4" strokeLinecap="round" />
        {children}
      </g>
    </svg>
  );
}

export default function CornerActions({ onAddPerson, onMessageIdeas, isAddOpen }: Props) {
  return (
    <div className="village-actions">
      <button
        type="button"
        className="sketch-button"
        onClick={onAddPerson}
        aria-label="Add person"
        title="Add person"
        aria-haspopup="dialog"
        aria-expanded={isAddOpen}
      >
        <ButtonDisc shape={BLOB_ADD}>
          {/* a little house with a + */}
          <path d="M27 48 46 32l19 16v24H27Z" fill="#fff4dc" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M22 50 46 29l24 21" fill="none" stroke="#e2574c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 50 46 29l24 21" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M40 72V58h12v14" fill="#7fc2dd" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
          <circle cx="66" cy="30" r="11" fill="#f7b9c8" stroke={INK} strokeWidth="2.4" />
          <path d="M66 24v12m-6-6h12" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </ButtonDisc>
        <span className="sketch-tag" aria-hidden="true">Add person</span>
      </button>

      <button type="button" className="sketch-button sketch-button--labelled" onClick={onMessageIdeas} aria-label="Open message ideas">
        <ButtonDisc shape={BLOB_IDEAS}>
          {/* a speech bubble with three colored dots */}
          <path d="M24 30c0-4 3-6 7-6h38c4 0 7 2 7 6v24c0 4-3 6-7 6H46l-12 10v-10h-3c-4 0-7-2-7-6Z" fill="#fff4dc" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="38" cy="42" r="3.6" fill="#f28aa8" stroke={INK} strokeWidth="1.4" />
          <circle cx="50" cy="42" r="3.6" fill="#7fc2dd" stroke={INK} strokeWidth="1.4" />
          <circle cx="62" cy="42" r="3.6" fill="#9dcc84" stroke={INK} strokeWidth="1.4" />
        </ButtonDisc>
        <span className="sketch-tag" aria-hidden="true">Message ideas</span>
      </button>
    </div>
  );
}
