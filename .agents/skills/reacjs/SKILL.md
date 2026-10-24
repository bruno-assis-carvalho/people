# ReactJS Skill

## 1. Principles

### 1.1 Design

- **Mobile-first, responsive, and adaptive layouts.** Design for the smallest screen first, then scale up. Use CSS media queries and flexible layouts (Grid/Flexbox) so the app both adapts to different screen sizes and fills available space — avoid fixed sizes and dead/blank space.
- **Navigate via cards, not menus.** Prefer card grids and deep/drill-down navigation over traditional menu systems.
- **No native alerts.** Use modals or toast notifications for user feedback instead of `alert()`, for a more consistent, customizable UX.
- **Accessibility is not optional.** Manage focus when opening/closing modals; give toast notifications appropriate ARIA roles (e.g. `role="status"` / `role="alert"`) so they're announced by screen readers; ensure card-grid navigation is fully keyboard-operable; define color tokens that meet WCAG AA contrast in both themes.

### 1.2 Usability

- **Real routing, not state-driven views.** Use `react-router` with semantic routes; don't fake navigation by toggling state.
- **AI-first, surfaced contextually.** Weave AI assistance through the app as inline suggestions and contextual actions within features, rather than isolating it in a separate chatbot screen.

## 2. Architecture: Two Layers

### 2.1 Feature Layer (`features/`)

- **Organize by feature, not by type.** Use vertical slices — each folder under `features/` contains its own components, services, and state — instead of horizontal layers (all components together, all services together, etc.).
- **No global state library.** Avoid Redux/MobX. Manage state locally with React's built-in state and Context API; use `useReducer` for more complex feature-level logic.
- **No CSS or class-based styling here.** Feature components import presentational components from `ui/` but never define their own styles — all styling belongs in the UX layer.

### 2.2 UX Layer (`ui/`)

- **Atomic design.** Break UI into small, reusable components (atoms → molecules → organisms) that compose into larger views.
- **All styling lives here.** Keep CSS and class definitions out of the feature layer entirely.
- **Design tokens for consistency.** Define tokens (colors, typography, spacing) once and reuse them everywhere, so themes can change without touching component code.
- **Keep tokens DRY.** Store tokens in a separate file from component CSS/class files to avoid duplication and simplify updates.
- **No inline styles or hardcoded values.** Always reference design tokens / CSS variables instead.
- **Support dark/light mode.** Implement via CSS variables that swap based on the active theme.

### 2.3 Feature Routes

- **Use nested React Router routes for feature flows.** Keep the transaction shell at the parent level and group the feature grid, detail, create, and edit screens under a feature path.
- **Render an `<Outlet />` in the `Transaction` layout** so its nested route elements appear in the transaction area.
- **Attach breadcrumb and return-navigation metadata to route `handle` values.**

```tsx
{
  path: "/in",
  element: <Transaction />,
  handle: { breadcrumb: "Home" },
  children: [
    {
      path: "feature",
      handle: { breadcrumb: "Feature" },
      children: [
        { index: true, element: <FeatureGrid /> },
        {
          path: ":id",
          element: <FeatureView />,
          handle: { breadcrumb: "Person", backTo: "/in/feature" },
        },
        {
          path: "create",
          element: <FeatureEditCreate />,
          handle: { breadcrumb: "Create person", backTo: "/in/feature" },
        },
        {
          path: ":id/edit",
          element: <FeatureEditCreate />,
          handle: { breadcrumb: "Edit person", backTo: "/in/feature" },
        },
      ],
    },
  ],
}
```

- **`Transaction`** is the shell with the header, menu, and transaction content area.
- **`FeatureGrid`** displays the feature's searchable or browsable resources as a card grid.
- **`FeatureView`** displays the details of one feature resource.
- **`FeatureEditCreate`** provides the create and edit screens for a feature resource.

## 3. Testing

### 3.1 Unit & Component Tests (colocated)

- **Keep unit tests inside their feature.** Place them alongside the code they test within `features/<feature-name>/`, e.g. `useCart.ts` + `useCart.test.ts`.
- **Test the feature's public behavior**, not internal implementation details, so refactors inside a feature don't break its tests unnecessarily.

### 3.2 End-to-End Tests (`test/`)

- **Use Playwright for e2e tests.** Keep all e2e specs under a top-level `test/` folder, since a single flow typically spans multiple features and doesn't belong to one slice.
- **Organize by user journey, not by feature.** Name specs after the flow they cover (e.g. `test/checkout-flow.spec.ts`), since that's the natural unit of an e2e test.
- **Favor role/label-based locators** over CSS selectors or test IDs tied to internal structure, keeping tests resilient to UI-layer refactors.
- **Centralize shared setup** (auth, fixtures, `playwright.config.ts`) in `test/` so journeys don't duplicate boilerplate.
  ReactJS Skill.md
  Exibindo ReactJS Skill.md.
