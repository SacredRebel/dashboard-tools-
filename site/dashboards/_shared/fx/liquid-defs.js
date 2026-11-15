/** Inject SVG feTurbulence displacement defs for mat-glass-liquid once. */
(function () {
  if (document.getElementById('mat-liquid-refract')) return;
  const wrap = document.createElement('div');
  wrap.className = 'mat-glass-svg-defs';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">
    <filter id="mat-liquid-refract" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </svg>`;
  document.documentElement.appendChild(wrap);
})();
