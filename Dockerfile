# Playwright UI/API (TypeScript) suite.
# Base image ships the browsers and OS deps matching @playwright/test 1.61.1.
FROM mcr.microsoft.com/playwright:v1.61.1-jammy

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the project.
COPY . .

# Reports are written to /app/playwright-report (mount a host volume to collect them).
CMD ["npx", "playwright", "test"]
