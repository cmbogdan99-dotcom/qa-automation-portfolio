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
  ui/           # Playwright UI tests (saucedemo.com)
  api/          # API tests (restful-booker)
  portfolio/    # E2E smoke suite for my live portfolio site
  fitness-ai/   # E2E smoke suite for my live Fitness AI PWA
  fintech/      # Fintech-domain suite against ParaBank (parasoft.com demo bank)
pages/          # Page Object Model classes
fixtures/       # Reusable test setup
.github/
  workflows/    # CI pipeline definitions
```

## Running locally
```bash
npm install
npx playwright test
```

## Fintech coverage (ParaBank)

`tests/fintech/parabank-ui.spec.ts` targets [ParaBank](https://parabank.parasoft.com), a public demo bank, covering scenarios that matter for financial-domain QA: exact decimal precision on fund transfers, boundary values ($0.01, exact full balance), and overdraft handling. One finding worth calling out: ParaBank's demo transfer service does not enforce overdraft limits — it accepts transfers far beyond the available balance and drives the account negative, unlike a real banking system.

Being a shared public demo (used by QA courses worldwide), it occasionally rejects all new registrations regardless of input — an infrastructure/availability issue on their end, not a bug in this suite. Rerun `npx playwright test tests/fintech` if registration is failing.

## Status
🚧 Work in progress.
