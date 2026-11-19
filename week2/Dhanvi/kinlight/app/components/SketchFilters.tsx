/*
  Shared "hand-drawn" look for every illustration on the page. Mounted once
  (in page.tsx); any SVG on the page can use these by id.

  - kl-sketch: wobbles edges a little so lines look drawn by hand, then adds a
    soft watercolor/gouache texture: gentle lighter patches and faint brush
    streaks. Low-frequency on purpose, so it reads as paint, not grain.
  - kl-wobble: just the imperfect edges, no texture (for small UI pieces).
  - kl-watercolor: softer, blotchier version for big areas like the sky and clouds.
*/

export default function SketchFilters() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <filter id="kl-sketch" x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="3" xChannelSelector="R" yChannelSelector="G" result="shape" />
          {/* soft lighter patches, like pigment pooling unevenly */}
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="11" result="mottle" />
          <feColorMatrix in="mottle" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.97  0 0 0 -1.1 0.6" result="lights" />
          <feComposite in="lights" in2="shape" operator="in" result="lightsIn" />
          {/* faint horizontal brush streaks */}
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.16" numOctaves="2" seed="2" result="streak" />
          <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.28  0 0 0 0 0.18  0 0 0 -1.8 0.6" result="darks" />
          <feComposite in="darks" in2="shape" operator="in" result="darksIn" />
          <feMerge>
            <feMergeNode in="shape" />
            <feMergeNode in="lightsIn" />
            <feMergeNode in="darksIn" />
          </feMerge>
        </filter>

        {/* paper for the clearings: hand-drawn edge and only the faintest texture,
            so it doesn't compete with the textured houses on top */}
        <filter id="kl-paper" x="-6%" y="-6%" width="112%" height="112%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="3" xChannelSelector="R" yChannelSelector="G" result="shape" />
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="13" result="mottle" />
          <feColorMatrix in="mottle" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.98  0 0 0 -0.5 0.28" result="lights" />
          <feComposite in="lights" in2="shape" operator="in" result="lightsIn" />
          <feMerge>
            <feMergeNode in="shape" />
            <feMergeNode in="lightsIn" />
          </feMerge>
        </filter>

        <filter id="kl-wobble" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="9" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <filter id="kl-watercolor" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="21" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="14" xChannelSelector="R" yChannelSelector="G" result="shape" />
          <feGaussianBlur in="shape" stdDeviation="0.8" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="4" result="mottle" />
          <feColorMatrix in="mottle" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.4 0.78" result="lights" />
          <feComposite in="lights" in2="soft" operator="in" result="lightsIn" />
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="lightsIn" />
          </feMerge>
        </filter>

        {/* the sky: barely-there watercolor blooms that work on light and dark skies */}
        <filter id="kl-sky" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="3" seed="4" result="mottle" />
          <feColorMatrix in="mottle" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -0.4 0.21" result="lights" />
          <feComposite in="lights" in2="SourceGraphic" operator="in" result="lightsIn" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="lightsIn" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
