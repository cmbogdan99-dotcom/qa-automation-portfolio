# QA Automation Portfolio

**Bogdan Carcadea** — Senior QA Engineer

Automation framework built with Playwright + TypeScript, covering UI and API testing with CI/CD integration via GitHub Actions.

## Stack
- **Playwright** — end-to-end UI automation
- **TypeScript** — typed JavaScript for maintainable test code
- **GitHub Actions** — CI pipeline running tests on every push
- **Postman / Newman** — API test collections

## Structure
```
tests/
  ui/        # Playwright UI tests
  api/        # API tests
pages/        # Page Object Model classes
fixtures/     # Reusable test setup
.github/
  workflows/  # CI pipeline definitions
```

## Running locally
```bash
npm install
npx playwright test
```

## Status
🚧 Work in progress.
