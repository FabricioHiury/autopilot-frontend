# AutoPilot — Frontend

AutoPilot's web interface, a CRM for vehicle retailers and dealerships. The application brings together sales deals, conversations, customers, team management, reports, and AI assistance. The same frontend serves store users and platform administrators through the backoffice.

Stack: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Radix components, Redux, and Socket.io. User-facing text is in Portuguese; internal contract fields and values remain in English.

## Projects and responsibilities

| Project                                                                           | Responsibility                                   | Local port |
| --------------------------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| [autopilot-frontend](https://github.com/FabricioHiury/autopilot-frontend)         | Navigation, forms, chat, and user experience     | 3001       |
| [autopilot-backend](https://github.com/FabricioHiury/autopilot-backend)           | Authentication, CRM rules, data, and AI analysis | 3003       |
| [autopilot-microservice](https://github.com/FabricioHiury/autopilot-microservice) | External channel integrations                    | 3005       |

The browser connects to the main backend. Provider, Evolution, and microservice tokens stay within the APIs. The backend also requests AI inference, including when the model runs locally through Ollama.

## Application features

- **Deals:** purchase, sale, and consignment pipelines, assignees, stages, tags, lead temperature, tasks, visits, comments, and history.
- **Conversations:** inbox, filters, messages, attachments, predefined replies, and delivery tracking.
- **AutoPilot AI:** contact dossier, next action, and suggested replies for salesperson review.
- **Customers and teams:** contacts, users, roles, and permissions per store.
- **Management:** sales dashboard, reports, deal distribution, and suspensions.
- **Settings:** branding, store information, and WhatsApp, Instagram, Facebook, and OLX integrations.
- **Support:** FAQs and tickets.
- **Backoffice:** dealerships, platform administrators, FAQ content, and support management.

Available screens and actions depend on the profile and permissions returned by the backend.

## Running locally

Node.js 22 and pnpm 10.25.0 are recommended when working with all three projects. The frontend runs on the host and does not need its own container.

For the initial setup:

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Preserve `.env.local` if it is already configured. The public variables are:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_SOCKET_URL=http://localhost:3003
```

`NEXT_PUBLIC_SOCKET_URL` takes the origin without `/chats`; when omitted, the client uses the API origin. `NEXT_PUBLIC_*` variables are public and embedded in the build.

Open `http://localhost:3001/auth/login`. For the integrated environment, follow the [backend local guide](https://github.com/FabricioHiury/autopilot-backend/blob/main/docker/local/README.md), assuming the repositories are sibling directories. It starts PostgreSQL, Redis, Evolution, and Ollama through Colima while keeping the applications on the host. Backend CORS must allow `http://localhost:3001`.

Login requires active users in the CRM database. The application does not provide a demo session or create users automatically.

## Navigation and sessions

| Route                        | Area                                 |
| ---------------------------- | ------------------------------------ |
| `/auth/login`                | Shared store and platform login      |
| `/app/dashboard`             | Store dashboard                      |
| `/app/deals/pipeline`        | Deal pipeline                        |
| `/app/deals/chat`            | Inbox and AutoPilot AI               |
| `/app/customers`             | Customers                            |
| `/app/reports`               | Sales reports                        |
| `/app/settings/access`       | Users, roles, and permissions        |
| `/app/settings/branding`     | Store branding                       |
| `/app/settings/integrations` | Channel configuration                |
| `/app/help-faq`              | FAQs and support                     |
| `/backoffice/app/tenants`    | Dealerships and their administrators |
| `/backoffice/app/access`     | Platform administrators              |
| `/backoffice/app/tickets`    | Backoffice support tickets           |

The `autopilot` profile accesses the backoffice; `storeOwner` and `user` access the store area. Sessions persist until expiration, logout, or an HTTP 401 response. An HTTP 403 preserves the session and reports insufficient permissions. The current contract does not include automatic JWT renewal.

AutoPilot's institutional branding uses the same logo across application areas. Store customization is fetched after login through `GET /store/customization`, applied to the theme, and removed on logout. Stores share the application domain.

## AutoPilot AI experience

In each conversation, the panel starts collapsed in the **AutoPilot IA** bar. Users can open or minimize suggestions; the strategic dossier appears on demand inside the panel, with a limited height and its own scrolling.

Selecting a reply collapses the panel and fills the editor for review. Sending requires the regular send button. Applying data to a deal requires permission, review, and confirmation; concurrent changes are checked before saving.

When analysis finishes, the panel receives the update in real time without opening automatically. Loading, unavailable, and disabled AI states are also accessible by expanding the bar.

The **backend** determines the model and availability through `CHAT_AI_URL`, `CHAT_AI_MODEL`, and `CHAT_AI_API_KEY`. The frontend neither stores the key nor selects the model. The documented local environment uses Ollama with `gemma3:1b`, a lightweight testing model with quality limitations.

## Integration and structure

`src/app/` organizes routes. Components live in `src/components/`; REST contracts in `src/services/`; models in `src/types/`; and state and context in `src/redux/`, `src/hooks/`, and `src/contexts/`. Institutional assets are in `public/`, and tests are in `src/test/`.

`api.client.ts` centralizes JWT handling, timeouts, and the `{ message, statusCode, data }` envelope. Presentation helpers translate roles, channels, known tags, and error messages while preserving API values and custom names.

`RealtimeContext` maintains one Socket.io connection per session in the `/chats` namespace. Events are filtered by store. Reconnection and returning to the tab reconcile history through REST; WhatsApp pairing polls status while waiting for the QR code.

Redirects support legacy login, password recovery, email confirmation, and channel callback links. Callback parameters are preserved.

## Verification and production

```bash
pnpm typecheck
pnpm test:run
pnpm lint
pnpm format:check
pnpm build
pnpm start
```

Vitest and React Testing Library cover sessions, permissions, REST contracts, branding, real-time messages, interface translations, and human review of AI suggestions. `pnpm format` and `pnpm lint:fix` apply automatic formatting and lint fixes.

Project-wide lint still has existing issues that may block `pnpm build`. To diagnose compilation and types alone, use `pnpm exec next build --no-lint`; this command does not replace fixing lint issues.

Real integrations require accounts and credentials configured in the APIs. The frontend does not mock SMTP, Firebase, or Evolution. See [AGENTS.md](AGENTS.md) for contribution conventions.
