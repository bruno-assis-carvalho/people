# Skill Specification: Playwright E2E & Accessibility Testing for React + Vite

## Context & Scope
This skill defines standards, patterns, and best practices for creating, structuring, and maintaining end-to-end (E2E) and accessibility tests using **Playwright** in a **React + Vite** ecosystem.

---

## 1. Directory Structure & Organization
Isolate E2E tests into a standalone directory (`e2e/` or an independent app within monorepos `apps/e2e`). Maintain clear separation between fixtures, page objects, and test specs:

```text
e2e/
├── playwright.config.ts
├── package.json
├── src/
│   ├── fixtures/          # Custom fixtures (auth state, axe-core, mocking)
│   ├── pages/             # Page Object Model (POM) classes
│   └── tests/             # Feature-based test specs
│       ├── auth.spec.ts
│       └── accessibility.spec.ts
```

---

## 2. Resilient & Accessible Selectors

### Guidelines
* **DO NOT** rely on CSS classes (`.btn-primary`), HTML tag hierarchies, or fragile IDs (`#submit-btn`).
* **DO** prioritize user-facing accessibility attributes via standard Playwright locators:
  * `page.getByRole()`
  * `page.getByLabel()`
  * `page.getByPlaceholder()`
  * `page.getByText()`
* **DO** fallback to `page.getByTestId()` only when a clear semantic role is absent (e.g., generic container layout, complex graphics).

### Examples
```typescript
// ❌ Avoid: Highly coupled to styling/implementation
await page.locator('.auth-container > div > input.email-input').fill('user@example.com');

// ✅ Recommended: Accessible & implementation-agnostic
await page.getByRole('textbox', { name: /e-mail/i }).fill('user@example.com');
await page.getByRole('button', { name: /entrar/i }).click();
```

---

## 3. Page Object Model (POM) Pattern
Encapsulate selectors, navigations, and page actions into dedicated Page Object classes.

```typescript
// src/pages/login.page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: /e-mail/i });
    this.passwordInput = page.getByRole('textbox', { name: /senha/i });
    this.submitButton = page.getByRole('button', { name: /entrar/i });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}
```

---

## 4. Vite Dev Server Integration (`webServer`)
Configure `playwright.config.ts` to automatically spin up the Vite development server before running test suites.

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

---

## 5. Automated Accessibility Testing (A11y)
Integrate `@axe-core/playwright` to run continuous WCAG compliance checks on critical user flows.

```typescript
// src/tests/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audits', () => {
  test('Dashboard page should comply with WCAG standards', async ({ page }) => {
    await page.goto('/dashboard');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

---

## 6. Execution & Flow Control Rules

* **Auto-waiting:** Never use hardcoded sleeps like `page.waitForTimeout()`. Rely on Playwright's native auto-waiting mechanisms and web-first assertions (`await expect(locator).toBeVisible()`).
* **Session Persistence:** Use `storageState` to preserve authenticated browser context across tests instead of logging in via UI before every spec.
* **Network Mocking:** Intercept and mock third-party external services using `page.route()` to keep tests fast, deterministic, and cost-effective.