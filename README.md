# QA Automation Portfolio

[![CI](https://github.com/cmbogdan99-dotcom/qa-automation-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/cmbogdan99-dotcom/qa-automation-portfolio/actions/workflows/ci.yml)

A maintainable, multi-target test automation framework built by **Bogdan Carcadea**, Senior QA Engineer. It demonstrates one framework covering four testing surfaces: UI end-to-end, REST API in two independent stacks (Playwright and Pytest), financial-domain business scenarios, and smoke coverage of two live production apps. The problem it solves is the one every growing QA function hits: how to keep a broad, mixed test estate (different targets, different languages, different risk profiles) organized, readable and runnable by anyone, in CI and in a container, without copy-paste drift.

## By the numbers

| Metric | Count |
|---|---|
| Automated test cases | 55 |
| Test / spec files | 10 |
| Test suites | 6 |
| Booking API operations covered | 7 |
| Browsers (Playwright) | 3 (Chromium, Firefox, WebKit) |
| Test stacks | 2 (Playwright + TypeScript, Pytest + Python) |

The 55 cases are 41 Playwright tests (TypeScript) plus 14 Pytest tests (Python). Playwright cases run across all 3 browser engines in CI.

## Tech stack

| Area | Tooling |
|---|---|
| UI + API automation | Playwright |
| Language (TS stack) | TypeScript |
| API automation | Pytest + requests |
| Language (Python stack) | Python 3.12 |
| Schema validation | jsonschema |
| Design pattern | Page Object Model |
| Test setup | Playwright fixtures, Pytest fixtures |
| CI/CD | GitHub Actions |
| Containerization | Docker + docker compose |
| Reporting | Playwright HTML report, pytest-html |

## Architecture

```
qa-automation-portfolio/
├── pages/                    POM: one class per screen, actions and locators
│   ├── Login.ts, CartPage.ts, CheckoutPage.ts, inventoryPage.ts
│   ├── PortfolioPage.ts, FitnessAiPage.ts
│   └── parabank/             Login, Register, Transfer, Account pages
├── fixtures/                 reusable authenticated-page fixture (TS)
├── tests/                    Playwright specs (TypeScript)
│   ├── ui/                   saucedemo: login, cart, checkout, network
│   ├── api/                  restful-booker CRUD (TS)
│   ├── fintech/              ParaBank financial-domain scenarios
│   ├── portfolio/            live portfolio site E2E
│   └── fitness-ai/           live Fitness AI PWA E2E
├── api-tests/                Pytest side (Python), fully separate
│   ├── conftest.py           session auth-token + base_url fixtures
│   ├── test_booking_crud.py  auth, CRUD, filters, schema validation
│   └── test_booking_negative.py  auth failures, 403, 404, bad payloads
├── Dockerfile / Dockerfile.api / docker-compose.yml
└── .github/workflows/ci.yml  Playwright job + Pytest job, both upload reports
```

The same restful-booker API is deliberately covered in **both** stacks, so the repo shows the same target validated through a TypeScript E2E lens and a Python request/response lens.

## Suites

- **`tests/ui/` (saucedemo)** login (data-driven positive and negative cases), cart, checkout and network interception (resource blocking, request spying). Uses the Page Object Model and a shared authenticated-page fixture.
- **`tests/api/` (restful-booker, TS)** booking CRUD flow with the auth token, dynamic booking IDs and response-structure assertions.
- **`api-tests/` (restful-booker, Pytest)** the Python counterpart: session-scoped auth fixture, full CRUD (create, get, list with filters, PUT, PATCH, delete), JSON schema validation, and negative cases (rejected credentials, 403 on unauthorized writes, 404 on missing records, malformed payloads). Every test creates its own data so it survives the public demo's periodic resets.
- **`tests/fintech/` (ParaBank)** targets [ParaBank](https://parabank.parasoft.com), a public demo bank, covering scenarios that matter for financial-domain QA: exact decimal precision on fund transfers, boundary values ($0.01, exact full balance), and overdraft handling. One finding worth calling out: ParaBank's demo transfer service does not enforce overdraft limits. It accepts transfers far beyond the available balance and drives the account negative, unlike a real banking system. Being a shared public demo used by QA courses worldwide, it occasionally rejects all new registrations regardless of input, an infrastructure/availability issue on their end, not a bug in this suite. Rerun `npm run test:fintech` if registration is failing.
- **`tests/portfolio/` (live site)** E2E smoke of my live portfolio: navigation, theme toggle persistence, gallery interactions, CV download link, social links, and a no-console-errors check.
- **`tests/fitness-ai/` (live PWA)** E2E smoke of my live Fitness AI app: onboarding, theme, navigation, quick-log, plus precision checks on the hydration and macro ledgers in the same spirit as the fintech suite.

## How to run

### Playwright (TypeScript)

```bash
npm install
npx playwright install --with-deps
npm test                 # all Playwright suites, all browsers
npm run test:ui          # saucedemo UI suite
npm run test:api         # restful-booker API (TS)
npm run test:fintech     # ParaBank fintech suite
npm run test:live        # portfolio + fitness-ai live suites
npm run report           # open the last Playwright HTML report
```

The Playwright HTML report is written to `playwright-report/`.

### Pytest (Python)

```bash
cd api-tests
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # Windows; use bin/ on Linux/macOS
.venv/Scripts/python -m pytest
```

The pytest-html report is written to `api-tests/report.html`.

### Docker

```bash
docker compose up --build      # runs both stacks
```

`ui-tests` mounts `playwright-report/` and `test-results/` back to the host; `api-tests` mounts `api-tests/` so `report.html` lands on the host.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request to `main`/`master`, in two jobs:

- **Playwright** installs dependencies and browsers, runs all TypeScript suites, and uploads the `playwright-report` artifact.
- **Pytest** sets up Python 3.12, installs requirements, runs the API suite, and uploads the `pytest-report` (`report.html`) artifact.

Both reports are retained for 30 days and downloadable from each run.

## Roadmap

- Visual regression coverage (Playwright screenshot comparisons) on the live suites.
- Load and performance testing with k6 against the restful-booker API.
- Contract testing to pin the booking API's response schema over time.
- Accessibility assertions (axe-core) layered into the portfolio smoke suite.
