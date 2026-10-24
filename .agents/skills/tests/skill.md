# Skill: React Vite + Playwright E2E & Accessibility Testing

This skill provides guidelines, patterns, and configurations for building accessible ReactJS (Vite) applications and testing them end-to-end (E2E) using Playwright and `@axe-core/playwright` within a **Turborepo** monorepo structure.

---

## 🏗️ Architecture & Directory Structure

In a Turborepo environment, E2E tests and accessibility audits live in a dedicated application workspace (`apps/e2e`).

```text
my-turborepo/
├── apps/
│   ├── web/                     # React + Vite application
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── e2e/                     # Playwright & A11y test suite
│       ├── tests/
│       │   ├── accessibility.spec.ts
│       │   └── navigation.spec.ts
│       ├── fixtures/
│       │   └── axe-fixture.ts
│       ├── playwright.config.ts
│       └── package.json
├── turbo.json
└── package.json
```

---

## 🛠️ Configuration Steps

### 1. Configure `apps/e2e/playwright.config.ts`

Set up Playwright to automatically start the Vite application built or served by `apps/web`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev --prefix ../web',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 2. Set Up `turbo.json` Integration

Ensure E2E tests depend on the web app's build step when running in CI environments:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test:e2e": {
      "dependsOn": ["^build"],
      "cache": false
    }
  }
}
```

---

## ♿ Synergy: Accessibility-First Test Automation

The key philosophy of this skill is that **accessible components are naturally easy to test**, and **good tests enforce accessibility**.

### 1. Prefer Accessible Locators

Always use Playwright's role-based and semantic locators. If a component cannot be found with `getByRole` or `getByLabel`, it is likely an accessibility bug in the React app.

```typescript
// ❌ BAD: Relies on DOM implementation details or CSS classes
await page.locator('.btn-primary.submit-box').click();
await page.locator('div > span:nth-child(2)').click();

// ✅ GOOD: Enforces ARIA roles, labels, and accessible HTML semantics
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email Address').fill('user@example.com');
await page.getByRole('dialog', { name: 'Settings' }).should('be.visible');
```

---

## 🧪 Automated Accessibility Auditing (`@axe-core/playwright`)

### 1. Reusable Axe Fixture (`apps/e2e/fixtures/axe-fixture.ts`)

Create a custom fixture to integrate `AxeBuilder` cleanly across test suites:

```typescript
import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(['color-contrast']); // Disable rules if necessary or configure as needed

    await use(makeAxeBuilder);
  },
});

export { expect } from '@playwright/test';
```

### 2. Writing E2E + A11y Tests (`apps/e2e/tests/accessibility.spec.ts`)

```typescript
import { test, expect } from '../fixtures/axe-fixture';

test.describe('Accessibility & Core Flow', () => {
  test('landing page should have no detectable accessibility violations', async ({ page, makeAxeBuilder }) => {
    await page.goto('/');

    // Perform accessibility audit on initial render
    const accessibilityScanResults = await makeAxeBuilder().analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('navigation menu supports keyboard navigation and remains accessible when open', async ({ page, makeAxeBuilder }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /open menu/i });
    
    // Test focusability and keyboard interaction
    await menuButton.focus();
    await page.keyboard.press('Enter');

    const navMenu = page.getByRole('navigation');
    await expect(navMenu).toBeVisible();

    // Audit accessibility of the open modal/navigation state
    const modalA11yResults = await makeAxeBuilder()
      .include('nav')
      .analyze();

    expect(modalA11yResults.violations).toEqual([]);
  });
});
```

---

## 🎨 Best Practices for React Components (Vite App)

To ensure smooth testing and high accessibility scores in Playwright:

1. **Semantic HTML:** Use `<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`, `<article>`, and `<section>`.
2. **Interactive Elements:** Use actual `<button>` for actions and `<a>` for navigation. Avoid `<div onClick={...}>`.
3. **Form Labels:** Always associate input fields with labels using `htmlFor` matching the input `id`.
4. **Focus Management:** Ensure modals, dialogs, and dynamic UI panels trap or return focus appropriately using libraries like `@radix-ui` or headless UI components.
5. **ARIA Attributes:** Use `aria-expanded`, `aria-controls`, and `aria-live` for dynamic UI states.

---

## 🚀 Useful Commands

Run these from the root of your Turborepo workspace:

```bash
# Run all E2E tests
turbo run test:e2e

# Run Playwright tests directly in interactive UI mode
npm run test:e2e --prefix apps/e2e -- --ui
```