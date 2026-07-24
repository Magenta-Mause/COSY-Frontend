# Cosy-Frontend

> The web frontend for **Cosy** — a self-hostable platform for hosting and managing game servers.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Lint](https://github.com/magenta-mause/Cosy-Frontend/actions/workflows/lint.yml/badge.svg)](https://github.com/magenta-mause/Cosy-Frontend/actions/workflows/lint.yml)
[![Type Check](https://github.com/magenta-mause/Cosy-Frontend/actions/workflows/type-check.yml/badge.svg)](https://github.com/magenta-mause/Cosy-Frontend/actions/workflows/type-check.yml)
[![Build and Push Docker Image](https://github.com/magenta-mause/Cosy-Frontend/actions/workflows/build-and-push.yml/badge.svg)](https://github.com/magenta-mause/Cosy-Frontend/actions/workflows/build-and-push.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.x-000000.svg?logo=bun&logoColor=white)](https://bun.sh/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev/)

---

## Overview

**Cosy** (Cost Optimized Server Yard) is a self-hostable platform that makes it easy to deploy,
run, and manage game servers. **Cosy-Frontend** is the single-page web application that users
interact with: it provides the dashboard for creating game servers from templates, configuring
them, browsing files, watching live metrics and logs, and managing users and access groups.

The frontend is a TypeScript + React application built with Vite and served by the
[Cosy-Backend](https://github.com/magenta-mause/Cosy-Backend) API. The typed API client and
React Query hooks are generated from the backend's OpenAPI specification using
[Orval](https://orval.dev/), and realtime updates (metrics, logs, server state) are delivered
over a STOMP WebSocket connection.

### Key features

- Create and manage game servers from reusable templates
- Live game-server metrics, logs and status via realtime WebSocket (STOMP) updates
- In-browser file browser for server files
- User, permission and access-group management
- Internationalization (English and German) out of the box
- Type-safe API layer generated from the backend OpenAPI schema

### Related repositories

| Repository | Description |
| --- | --- |
| [Cosy](https://github.com/magenta-mause/Cosy) | Main project / download & deployment repo |
| [Cosy-Backend](https://github.com/magenta-mause/Cosy-Backend) | Backend API this frontend talks to |
| [Cosy-Docs](https://github.com/magenta-mause/Cosy-Docs) | Official documentation ([cosy-hosting.net](https://cosy-hosting.net)) |

---

## Getting Started

### Prerequisites

- **[Bun](https://bun.sh/) 1.x** — used as the package manager, runtime and dev tooling.
  Node.js is **not** required to develop the frontend.
- A running **[Cosy-Backend](https://github.com/magenta-mause/Cosy-Backend)** instance
  (defaults assume it is reachable at `http://localhost:8080`) to log in and load data.
- Optional: [Docker](https://www.docker.com/) 24+ if you want to build/run the production container image.

Install Bun (see the [official docs](https://bun.sh/docs/installation) for details):

```sh
# macOS / Linux
curl -fsSL https://bun.com/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# or via npm
npm install -g bun
```

### Installation

```sh
git clone https://github.com/magenta-mause/Cosy-Frontend.git
cd Cosy-Frontend
bun install
```

### Configuration

The app runs with sensible local-development defaults and needs **no configuration** to start
against a backend on `http://localhost:8080`. To override the backend endpoints, copy the
provided example file and edit it:

```sh
cp .env.example .env.local
```

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_BACKEND_BROKER_URL` | `ws://localhost:8080/api/v1/ws` | STOMP broker URL for the realtime WebSocket connection |
| `VITE_BACKEND_WEBSOCKET_FACTORY` | `http://localhost:8080/api/v1/ws` | HTTP endpoint used as the SockJS WebSocket factory |

Only variables prefixed with `VITE_` are exposed to the browser bundle, so do not store secrets
here. During development, REST calls to `/api` are proxied to `http://127.0.0.1:8080` (see
`vite.config.ts`), so the REST base URL does not need to be configured separately.

### Quick Start

Start the dev server with hot module reloading:

```sh
bun run dev
```

Vite prints the local URL it is serving on (by default <http://localhost:5173>). Open it in your
browser; you should see the Cosy login screen. Make sure a Cosy-Backend instance is running so
the app can authenticate and load data.

---

## Development

### Project structure

```
Cosy-Frontend/
├─ public/                 # Static assets served as-is (favicon, …)
├─ src/
│  ├─ api/                 # Axios instance + Orval-generated API client
│  │  └─ generated/        # Auto-generated types & React Query hooks (do not edit)
│  ├─ assets/              # Images, icons, fonts, gifs
│  ├─ components/          # React components (ui = ShadCN, display, technical)
│  ├─ hooks/               # Reusable React hooks (data interactions, etc.)
│  ├─ i18n/                # Internationalization (en-US, de-DE)
│  ├─ lib/                 # Shared utilities and validators
│  ├─ routes/              # TanStack Router file-based routes
│  ├─ stores/              # Redux Toolkit store and slices
│  ├─ types/               # Shared TypeScript types
│  ├─ utils/               # Helper functions
│  ├─ app.tsx              # Application entry point
│  ├─ config.ts            # Runtime config (reads VITE_ env vars)
│  └─ routeTree.gen.ts     # Auto-generated route tree (do not edit)
├─ openapi-backend.json    # Backend OpenAPI spec (input for Orval codegen)
├─ orval.config.js         # Orval API-client generation config
├─ vite.config.ts          # Vite build & dev-server config
├─ biome.json              # Biome lint/format config
└─ Dockerfile              # Production image (Vite build served by nginx)
```

### Available commands

All scripts are defined in `package.json` and run with Bun:

| Command | Description |
| --- | --- |
| `bun run dev` | Start the Vite dev server with hot reloading |
| `bun run build` | Create a production build in `dist/` |
| `bun run typecheck` | Type-check the app with `tsc` (no emit) |
| `bun run lint` | Run Biome lint plus a TypeScript type check |
| `bun run lint:fix` | Apply Biome's safe lint autofixes |
| `bun run lint:fix:unsafe` | Apply Biome fixes including unsafe ones |
| `bun run tsr:gen` | Regenerate the TanStack Router route tree |
| `bun run gen:api` | Fetch the backend OpenAPI spec and regenerate the API client (see below) |

### Development workflow

1. Create a feature branch and make your changes.
2. Run `bun run lint` and `bun run typecheck` before opening a pull request; both are also
   enforced in CI (see the badges above).
3. Open a pull request against `main`.

**Code style** is enforced by [Biome](https://biomejs.dev/) (linting + formatting) and
`.editorconfig`: 2-space indentation, double quotes, semicolons, and a 100-character line width.
Recommended editor extensions: Biome, Tailwind CSS IntelliSense.

#### Regenerating the API client (Orval)

The typed API client and React Query hooks under `src/api/generated/` are generated from the
backend's OpenAPI spec. When the backend API changes, sync it locally (requires the backend
running at `http://localhost:8080`):

```sh
bun run gen:api
```

This fetches `http://localhost:8080/api/v3/api-docs` into `openapi-backend.json` and runs Orval.
You can also run the steps separately with `bunx orval` after updating `openapi-backend.json`.

#### Adding ShadCN/ui components

UI primitives live in `src/components/ui/` and are added via the ShadCN CLI, e.g.:

```sh
bunx --bun shadcn@latest add button
```

### Major dependencies

- **[React 19](https://react.dev/)** with the React Compiler, bundled by **[Vite 7](https://vite.dev/)**
- **[TanStack Router](https://tanstack.com/router)** for file-based routing and **[TanStack Query](https://tanstack.com/query)** for server state
- **[Redux Toolkit](https://redux-toolkit.js.org/)** for client state
- **[Tailwind CSS 4](https://tailwindcss.com/)** + **[ShadCN/ui](https://ui.shadcn.com/)** (Radix primitives) for styling
- **[Orval](https://orval.dev/)** + **[Axios](https://axios-http.com/)** for the generated, typed API layer
- **[react-i18next](https://react.i18next.com/)** for internationalization
- **[react-stomp-hooks](https://www.npmjs.com/package/react-stomp-hooks)** for realtime STOMP/WebSocket updates

---

## Deployment

The repository ships a multi-stage `Dockerfile` that builds the app with Vite and serves the
static output with nginx (with SPA fallback routing). Build and run it with:

```sh
docker build -t cosy-frontend .
docker run -p 8081:80 cosy-frontend
```

The container serves the app on port `80`; the example maps it to host port `8081`. Pick a host
port that is not already in use — in particular, avoid `8080`, which the frontend expects
Cosy-Backend to occupy when both run locally.

The `Build and Push Docker Image` GitHub Actions workflow builds and publishes this image on
pushes. For full deployment guidance see the main [Cosy](https://github.com/magenta-mause/Cosy)
repository and [Cosy-Docs](https://github.com/magenta-mause/Cosy-Docs).

---

## Documentation

Full project documentation is available at **[cosy-hosting.net](https://cosy-hosting.net)** and in
the [Cosy-Docs](https://github.com/magenta-mause/Cosy-Docs) repository.

---

## Contributing

Contributions are welcome! Organization-wide contribution guidelines live in the
[magenta-mause/.github](https://github.com/magenta-mause/.github) repository.

- **Report a bug or request a feature:** Issues for the whole Cosy project are collected in the
  main [Cosy](https://github.com/Magenta-Mause/cosy/issues) repository. (Issues opened directly on
  this repository are automatically redirected there.)
- **Development setup:** see [Getting Started](#getting-started) above.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

## Support

For help and questions, open an issue in the main
[Cosy](https://github.com/Magenta-Mause/cosy/issues) repository or consult the documentation at
[cosy-hosting.net](https://cosy-hosting.net).
