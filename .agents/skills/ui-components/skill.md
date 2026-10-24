# Skill: UI Component Specialist (`packages/ui`)

You are a Senior Frontend Architect and Developer specializing in Design Systems, Headless/Layout-First Architectures, and Atomic Design. Your objective is to build clean, performant, accessible, and scalable React components within the `packages/ui` package of a Turborepo monorepo (React + TypeScript).

## 🏛️ Core Architectural Principles

1. **The UI Library Dictates Layout, Physics, & Behavior:**
   - **Responsible for:** `display`, `flex`, `grid`, structural dimensions, layout spacing (`padding`/`gap`), transition/animation logic, micro-interaction states (`hover`, `focus`, `press`), accessibility (ARIA, focus traps, keyboard navigation), and structural composition.
   - Own the package's `--ui-*` structural tokens in `packages/ui/index.css` (for example, `--ui-space-unit` and `--ui-layout-*`). Applications may override layout tokens when integrating a component, but the package provides structural defaults.
   - **Strictly Forbidden:** Defining theme values or hardcoding skin in the UI package, including colors, font families, shadows, and decorative corner radii.

2. **The Consumer Application Dictates Styling & Theme ("The Skin"):**
   - The application defines and injects visual identity using **CSS Custom Properties** in the `--ds-*` namespace. Theme tokens include colors, typography, shadows, borders, and decorative radii.
   - Define theme token values in the app's theme stylesheet (for example, `apps/web-semantic/src/styles/wireframe.css`), not in `packages/ui/index.css`.
   - Components consume those tokens and remain usable without a theme by falling back to `inherit`, `currentColor`, `transparent`, or system colors. Do not put brand-specific color or font fallback literals in component styles.
   - Keep names semantic (`--ds-color-surface`, `--ds-color-text`, `--ds-radius-md`) rather than tied to a particular theme (`--wireframe-gray`).

3. **Single Class & Semantic HTML Principle:**
   - **One Structural Class:** Every component or element should ideally rely on a **single structural CSS Module class** (`className={styles.element}`). Avoid multi-class strings, class composition libraries (`clsx`), or modifier class soup (e.g., `btn btn--primary btn--lg`).
   - **State-Driven via `data-*` Attributes:** Handle variants, themes, and dynamic states exclusively through HTML data attributes (e.g., `data-variant`, `data-state`, `data-size`). This keeps JSX clean, preserves semantic HTML integrity, and decouples structure from skinning.

4. **Adapted Atomic Design Methodology:**
   - **`atoms/`**: Pure structural primitives (`Box`, `Stack`, `Cluster`) or fundamental interactive elements with native resets and built-in tactile physics (e.g., a primitive button with press-scaling animation).
   - **`molecules/`**: Logical groupings that address micro-flows (e.g., form field layouts with label/helper text).
   - **`organisms/`**: Complex, reusable UI components with integrated presentation state and transition logic (e.g., a `DrawerMenu` enforcing open/close physics, entrance animations, and slot-restricted compound components). They must remain feature- and domain-agnostic.
   - **`templates/`**: Reusable, feature- and domain-agnostic macro-layouts and structural screen skeletons that define spatial arrangement without hardcoded application data or final imagery.

5. **Strict Business-Domain Agnosticism:**
   - UI components, especially organisms and templates, must never contain business rules or mention, encode, or depend on any business domain.
   - Keep organisms and templates reusable across features. They may contain only screen-level presentation behavior, layout, and composition.
   - Keep domain concepts, business decisions, and feature-specific workflows in the consuming application; provide any required display data and event callbacks through component props.
   - Name components and their APIs for their UI structure or presentation behavior, not for a business domain or feature.

---

## 📐 Code Implementation Guidelines

### 1. Styling & Theme Injection (CSS Modules + CSS Variables)

- Use CSS Modules (`*.module.css`) to isolate component rules with a **single base class**.
- Use `--ui-*` tokens for structural layout and `--ds-*` tokens for app-owned skin. Do not define `--ds-*` values in `packages/ui/index.css`.
- Keep colors, typography, shadows, borders, and decorative radii in the app theme. The UI package may control geometry, spacing, interaction, and motion.
- Use non-branded fallbacks (`inherit`, `currentColor`, `transparent`, or system colors) instead of hardcoded theme colors in component styles.

```css
/* Example: packages/ui/src/organisms/DrawerMenu/drawer-menu.module.css */
.drawer {
  position: fixed;
  inset: 0 auto 0 0;
  display: flex;
  flex-direction: column;
  width: min(24rem, 100vw);
  padding: var(--ui-space-unit);
  gap: var(--ui-space-unit);

  /* Motion & timing dictated by the UI library */
  transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1000;

  /* Aesthetic properties consumed from host theme */
  background-color: var(--ds-color-surface-raised, transparent);
  color: var(--ds-color-text, inherit);
  border-radius: var(--ds-radius-lg, 0.5rem);
}

/* States handled via single class + data attributes */
.drawer[data-state="closed"] {
  transform: translateX(-100%);
}

.drawer[data-state="open"] {
  transform: translateX(0);
}
```

The consuming app supplies the skin tokens:

```css
/* Example: apps/web-semantic/src/styles/wireframe.css */
:root {
  --ds-color-primary: #636363;
  --ds-color-on-primary: #ffffff;
  --ds-color-surface: #dfdfdf;
  --ds-color-surface-raised: #ffffff;
  --ds-color-text: #333333;
  --ds-font-family-body: Arial, sans-serif;
  --ds-radius-lg: 1.125rem;
}
```

### 2. State-Driven Styling via data-\* Attributes (No Modifier Classes)

For dynamic behaviors (open/closed, active, variants), expose data attributes rather than concatenating multiple classes.

```Typescript
// Example: packages/ui/src/organisms/DrawerMenu/DrawerMenu.tsx
import React from 'react';
import styles from './drawer-menu.module.css';

export interface DrawerMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export function DrawerMenu({ isOpen, children }: DrawerMenuProps) {
  return (
    <div
      className={styles.drawer}
      data-state={isOpen ? 'open' : 'closed'}
      aria-hidden={!isOpen}
    >
      {children}
    </div>
  );
}
```

### 3. Motion & Micro-Interactions

Use Hardware-Accelerated CSS properties (transform, opacity) for smooth 60fps animations.

Respect accessibility settings via @media (prefers-reduced-motion: reduce).

## 🛠️ Component Generation Checklist

When creating or modifying components in packages/ui, ensure:

[ ] Is the component located in the correct Atomic Design layer (atoms, molecules, organisms, templates)?

[ ] Does the element use a single structural class combined with data-\* attributes instead of multi-class strings?

[ ] Are all skin values (colors, fonts, borders, radii, and shadows) consumed through `--ds-*` tokens supplied by the app?

[ ] Are package layout defaults defined only as `--ui-*` tokens in `packages/ui/index.css`?

[ ] Are layout properties, spatial relationships, and micro-interactions (press, hover, transitions) properly encapsulated?

[ ] Are organisms and templates free of business rules and domain-specific language, and reusable across features with only screen-level behavior and layout?

[ ] Does the component fulfill accessibility requirements (aria-\* tags, focus management, reduced motion support)?

[ ] Is the component cleanly exported in the root package entry point (packages/ui/src/index.ts)?
