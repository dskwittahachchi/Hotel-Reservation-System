# Nivara Hotel Reservation System

Nivara is a full-stack hotel reservation experience for a fictional coastal retreat in Tangalle, Sri Lanka. It combines a polished guest booking journey with a practical hotel operations workspace, persistent inventory, date-range availability checks, reservation status controls, and payment records.

## Product tour

- `/` - editorial hotel home, featured stays, service highlights, and an AI-inspired itinerary planner
- `/search` - live availability search, room comparison, guest details, payment, and confirmation
- `/bookings` - guest booking history, upcoming-trip details, and guarded cancellation
- `/admin` - operations overview, reservation desk, rooms, guest directory, and payments

Demo guest details are prefilled with `maya@demo.com`. Payment fields are demonstrative and never charge a real card.

## Features

### Guest experience

- Search by check-in, check-out, and guest count
- Date-overlap availability rules that exclude conflicting active reservations
- Responsive room catalogue with rates, capacity, amenities, and availability
- Complete booking workflow with server-side validation and availability recheck
- Payment confirmation and human-readable booking reference
- Personal booking history and safe cancellation confirmation
- Loading, empty, success, and error states

### Reception and administration

- Live occupancy, arrivals, booking, and revenue metrics
- Weekly occupancy visualization
- Reservation register with search and status transitions
- Room-type inventory and availability counts
- Guest directory and payment/receipt records
- Responsive sidebar workspace for desktop and mobile use

## Technology

- React 19 and TypeScript
- Vinext/Next.js App Router conventions
- Cloudflare Workers-compatible server runtime
- Cloudflare D1 (SQLite) persistence
- Drizzle schema and migrations
- REST-style route handlers for availability, reservations, payments, and administration
- Lucide React icons and custom responsive CSS

## Architecture

```text
app/
  api/                 availability, reservations, payments, dashboard
  admin/               hotel operations route
  bookings/            guest trip history route
  search/              availability and booking route
components/            reusable guest and admin experiences
db/                    Drizzle schema
drizzle/               generated SQL migrations
lib/                   catalogue, types, database initialization, seeds
worker/                Cloudflare Worker entry point
tests/                 rendered output checks
```

The D1 tables are initialized defensively at runtime for local development and seeded once with representative room, guest, reservation, and payment records. The generated migration remains the source-controlled production schema.

## Local setup

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server (normally `http://localhost:3000`). No `.env` values are required for the included demo. Hosted D1 resources are provisioned from `.openai/hosting.json`.

## Validation

```bash
npm run db:generate
npm run lint
npm test
```

`npm test` creates the production build and checks the rendered hotel home page.

## API summary

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/availability` | Search non-overlapping rooms by dates and guests |
| `GET` | `/api/room-types` | List room types and current inventory |
| `GET/POST` | `/api/reservations` | Read guest/admin reservations or create a held booking |
| `PATCH` | `/api/reservations/:id` | Change reservation status or cancel a stay |
| `POST` | `/api/payments` | Record payment and confirm a held reservation |
| `GET` | `/api/admin/dashboard` | Aggregate operational metrics and records |

Responses use a consistent `{ success, message, data }` shape, with `{ success, message, errors }` for failures.

## Security and production notes

- No secrets or real payment credentials are stored in this repository.
- All write endpoints validate request data and reservation availability server-side.
- D1 queries use prepared statements.
- The current portfolio demo uses a prefilled guest identity and an operations role switch. Production use should connect the supplied platform sign-in headers or an approved external identity provider, and a PCI-compliant payment provider.

## Future improvements

- Seasonal rates and promotional codes
- Housekeeping and maintenance workflows
- Real payment-provider webhooks and refunds
- Automated PDF invoices
- Guest preference learning and a connected itinerary recommendation model

## Image credits

Room and resort photography is sourced from Unsplash and used under the Unsplash License.
