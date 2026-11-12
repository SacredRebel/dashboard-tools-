/**
 * Tailwind v3 preset mapping design-system/tokens.css variables to utilities.
 * Usage (tailwind.config.js):
 *   module.exports = { presets: [require('./design-system/tailwind.preset.js')], content: [...] }
 * For Tailwind v4 use the @theme block in docs/stack/04-tokens-to-tailwind.md instead.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: { DEFAULT: 'var(--surface)', 2: 'var(--surface-2)', sunken: 'var(--surface-sunken)' },
        border: { DEFAULT: 'var(--border)', strong: 'var(--border-strong)' },
        text: { DEFAULT: 'var(--text)', muted: 'var(--text-muted)', subtle: 'var(--text-subtle)' },
        accent: { DEFAULT: 'var(--accent)', hover: 'var(--accent-hover)', fg: 'var(--accent-fg)', soft: 'var(--accent-soft)' },
        success: { DEFAULT: 'var(--success)', soft: 'var(--success-soft)' },
        warning: { DEFAULT: 'var(--warning)', soft: 'var(--warning-soft)' },
        danger: { DEFAULT: 'var(--danger)', soft: 'var(--danger-soft)' },
        info: { DEFAULT: 'var(--info)', soft: 'var(--info-soft)' },
        chart: { 1: 'var(--chart-1)', 2: 'var(--chart-2)', 3: 'var(--chart-3)', 4: 'var(--chart-4)', 5: 'var(--chart-5)' },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        display: 'var(--font-display)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: '1.4' }],
        sm: ['var(--text-sm)', { lineHeight: '1.5' }],
        base: ['var(--text-md)', { lineHeight: '1.55' }],
        lg: ['var(--text-lg)', { lineHeight: '1.4' }],
        xl: ['var(--text-xl)', { lineHeight: '1.25' }],
        '2xl': ['var(--text-2xl)', { lineHeight: '1.15' }],
        '3xl': ['var(--text-3xl)', { lineHeight: '1.1' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        edge: 'var(--edge)',
      },
      transitionDuration: { 100: 'var(--dur-1)', 150: 'var(--dur-2)', 200: 'var(--dur-3)', 300: 'var(--dur-4)' },
      transitionTimingFunction: { out: 'var(--ease-out)', in: 'var(--ease-in)' },
      ringColor: { DEFAULT: 'var(--focus)' },
    },
  },
};
