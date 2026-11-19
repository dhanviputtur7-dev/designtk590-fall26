/*
  The Kinlight wordmark: "Ki" + a little house standing in for the n + "light".
  From Dhanvi's sketch: the chimney (with a curl of smoke) is the n's left
  stroke, the roof is its arch, and there's a big arched door.

  Legibility: the house always has a dark ink outline. Its fills come from
  CSS classes (see "Wordmark house colors" in globals.css) and swap with the sky:
  - day: brick chimney, deep green roof, sage walls (outline carries the contrast)
  - night: glowing gold walls and windows, lighter brick roof and chimney,
    which stand out brightly against the dark sky
  Only the curl of smoke follows the letter color, so it stays visible at night.
  Drawn with the shared hand-drawn texture (kl-sketch) like the rest of the page.

  The SVG is measured in hundredths of an em and its bottom edge is the text
  baseline, so it scales with the title's font size.
*/

export default function KinlightWordmark() {
  return (
    <span className="wordmark">
      Ki
      <svg
        className="wordmark-house wordmark-house--n"
        viewBox="0 16 64 84"
        aria-hidden="true"
        focusable="false"
      >
        <g filter="url(#kl-sketch)">
        {/* the smoke hook from the sketch */}
        <path
          className="wm-smoke"
          d="M10.5 35c3.5-6 2.5-12-3-12.5C2.5 22 1 27.5 5 29"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        {/* chimney = the left stroke of the n */}
        <path className="wm-chimney" d="M5 37.5 15 37l.5 63H5.5Z" stroke="#2c4337" strokeWidth="3.2" strokeLinejoin="round" />
        <path className="wm-chimney-shade" d="M6.8 39.5h2.4v59H7Z" />
        <path className="wm-glass" d="M8.2 50h4.6v5.4H8.2Z" stroke="#2c4337" strokeWidth="1.4" />
        {/* house = the arch of the n */}
        <path
          className="wm-wall"
          d="M15.4 67 37.5 48.5 59.6 67l-.5 33H15.6Z"
          stroke="#2c4337"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        <path
          className="wm-roof"
          d="M11.5 68.5 37.5 44.5l26 24-5.6 2.2-20.4-18.6-20.3 18.6Z"
          stroke="#2c4337"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* little window in the gable */}
        <path className="wm-glass" d="M34.2 66v-3.4a3.3 3.3 0 0 1 6.6 0V66Z" stroke="#2c4337" strokeWidth="1.5" />
        {/* the big arched door */}
        <path className="wm-door" d="M27 100V83a10.5 10.5 0 0 1 21 0v17Z" stroke="#2c4337" strokeWidth="2.2" />
        <circle className="wm-knob" cx="43.4" cy="90" r="1.7" />
        </g>
      </svg>
      light
    </span>
  );
}
