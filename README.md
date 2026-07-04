# Bebeio Web

Marketing site and **Bebio Plus checkout** for the mobile app. Tracking happens in the native app; this site handles landing, auth, and Paddle subscriptions.

## Pages

- `/` — landing page
- `/upgrade` — Bebio Plus pricing + Paddle checkout
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy

## Setup

```bash
cd bebeio-web
yarn install
cp .env.example .env
# Fill Firebase + Paddle client token (same Paddle account as code-interview-app)
```

## Run

```bash
yarn dev
```

Open http://localhost:5173

## How subscriptions work

1. User signs in on the website (same Firebase account as the mobile app)
2. User subscribes on `/upgrade` via Paddle
3. Paddle webhook updates `bebeio-api`
4. Mobile app reads `GET /api/subscriptions/status` and unlocks Plus

Create **Bebio Plus monthly/yearly** recurring prices in Paddle and set `PADDLE_PRICE_ID_MONTHLY` / `PADDLE_PRICE_ID_YEARLY` on the API.
