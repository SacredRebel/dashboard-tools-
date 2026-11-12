# Tokens → Tailwind & shadcn/ui

`design-system/tokens.css` defines plain CSS variables per theme (`[data-theme="atelier"]` etc.). Tailwind and shadcn read them; switching theme = changing one attribute on `<html>`.

## 1. Copy tokens

Copy `design-system/tokens.css` to `styles/tokens.css` and import it in `app/globals.css` **before** Tailwind:

```css
@import "../styles/tokens.css";
@import "tailwindcss";
```

Set the theme on the root: `<html data-theme="atelier">`.

## 2a. Tailwind v4 (CSS-first)

```css
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-border: var(--border);
  --color-text: var(--text);
  --color-muted: var(--text-muted);
  --color-accent: var(--accent);
  --color-accent-fg: var(--accent-fg);
  --color-accent-soft: var(--accent-soft);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
}
```

Use: `bg-surface border-border text-muted rounded-md font-display`.

## 2b. Tailwind v3 (config)

Use [design-system/tailwind.preset.js](../../design-system/tailwind.preset.js):

```js
// tailwind.config.js
module.exports = { presets: [require('./design-system/tailwind.preset.js')], content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'] };
```

## 3. shadcn/ui variable mapping

shadcn components read their own variable names. Alias them to ours once (in `globals.css`):

```css
:root, [data-theme] {
  --background: var(--bg);
  --foreground: var(--text);
  --card: var(--surface);
  --card-foreground: var(--text);
  --popover: var(--surface-2);
  --popover-foreground: var(--text);
  --primary: var(--accent);
  --primary-foreground: var(--accent-fg);
  --secondary: var(--surface-sunken);
  --secondary-foreground: var(--text);
  --muted: var(--surface-sunken);
  --muted-foreground: var(--text-muted);
  --accent-foreground: var(--text);   /* shadcn "accent" = hover bg */
  --destructive: var(--danger);
  --border: var(--border);
  --input: var(--border-strong);
  --ring: var(--focus);
  --radius: var(--radius-md);
  --chart-1: var(--chart-1); /* already same names */
}
```

> Note: shadcn uses `--accent` for a subtle hover background, while our `--accent` is the brand color. If you adopt shadcn wholesale, rename ours to `--brand` in your copy of tokens.css, or override shadcn's `--accent` with `var(--surface-sunken)` *after* the token import. Pick one and write it in `docs/decisions/`.

## 4. Fonts

```ts
// app/layout.tsx
import { Fraunces, Instrument_Sans } from 'next/font/google';
const display = Fraunces({ subsets: ['latin'], variable: '--font-display-loaded', weight: ['500','600'] });
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans-loaded', weight: ['400','500','600'] });
```

Then in tokens: `--font-display: var(--font-display-loaded), Georgia, serif;`
