<!-- AUTO-SYNCED from agents KB: projects/cosy.md @ 3ab4e0b.
     Do NOT edit here — edit the source in ~/projects/agents and re-run scripts/sync-conventions.sh. -->

# Cosy — Cost Optimized Server Yard

A self-hosted game-server management platform: a modern web UI to deploy, manage, and monitor game servers on your own hardware, running each server as a Docker container from a curated template library. This is the flagship polyglot project — Java, Go, Rust, and TypeScript services working together.

- **Live:** https://cosy-hosting.net (landing), https://cosy.jannekeipert.de (app), https://cosy-game-api.jannekeipert.de, https://cosy-templates.jannekeipert.de, https://cosy-docs.jannekeipert.de
- **Repos:** github.com/magenta-mause/{Cosy, Cosy-Backend, Cosy-Frontend, Cosy-Game-Service, Cosy-Template-Service, Cosy-Templates, Cosy-Internal-Deployment, Cosy-Minecraft-Integration-Mod, Cosy-Docs}
- **Local:** clone the repo(s) listed above into `~/projects/cosy/` — single-repo → directly into `~/projects/cosy/`, multi-repo → one subfolder per repo (`~/projects/cosy/<repo-name>/`). Always `git pull` before reading. See [repo conventions](README.md#local-repos--clone-on-demand-pull-before-reading).
- **Cluster:** namespace `cosy`

## Idea
Make hosting game servers on your own hardware simple and beautiful. Users pick a game from a curated template library, Cosy spins it up as a Docker container, and the web UI gives full container lifecycle management with real-time metrics/logs, file browsing, user + quota management, RCON command sending, and event-driven webhooks. "Cost optimized" = run it yourself instead of paying a hosting provider. Deploys via Docker Compose or Kubernetes.

## Architecture & Stack
- **Frontend:** React 19 + TypeScript on Bun + Vite. TanStack Router + TanStack Query, Redux Toolkit, Tailwind CSS v4, Radix UI / shadcn/ui, Recharts, dnd-kit, lucide, i18next. API client is generated from the backend OpenAPI spec via Orval (react-query hooks + axios wrapper). Biome for lint/format.
- **Backend (Java):** The "Town Hall" / core orchestration engine. Spring Boot 3.x on Java 21, Maven. Talks directly to the Docker socket for container lifecycle, does host file I/O, JWT auth, WebSocket streams (real-time status/logs), and RCON integration. Spring Data JPA over PostgreSQL. Ships an OpenAPI spec that the frontend consumes. Package root `com.magentamause.cosybackend` (controllers/services/entities/websockets/security/...).
- **Game service (Go):** `cosy-game-api` — currently a thin wrapper around the SteamGridDB API to search games and fetch hero/logo artwork for the UI. Actually written in **Rust** (see below) despite the "game service (Go)" label; the Go service on disk under this name is the template service. Verify per repo before assuming.
- **Template service (Go):** `cosy-template-service` — Go 1.25, Gin HTTP server, Viper config, google/go-github. Serves the game/template catalog by reading the `Cosy-Templates` GitHub repo (owner `Magenta-Mause`, repo `Cosy-Templates`, path `templates`/`games`) via the GitHub API. Listens on :8080.
- **Rust component:** `Cosy-Game-Service` (`cosy-gameapi`) is Rust — actix-web + reqwest + tokio, using the `steamgriddb_api` crate. Exposes `/games` search returning game metadata + artwork URLs. This is the game-artwork/metadata API, chosen in Rust for a small, fast, self-contained service.
- **Minecraft mod:** `Cosy-Minecraft-Integration-Mod` — a Minecraft Fabric mod (Gradle, Lombok) that collects in-game metrics (TPS, player count) and pushes them to the platform's custom metrics API. Not checked out under projects/cosy/ (separate repo).
- **Templates:** `Cosy-Templates` — the curated content repo (games: minecraft, cs2, ark-survival-evolved, palworld, terraria, ...), with a JSON schema for template definitions.
- **Data / infra:** PostgreSQL (app data), InfluxDB (metrics), Grafana Loki (logs). Deployed on Kubernetes via ArgoCD (`Cosy-Internal-Deployment`: namespace + backend/frontend/gameapi/template-service/influxdb/loki/postgres/landing-page manifests), nginx ingress, GitHub Actions CI, Ansible. Docs site built with Fumadocs; some documents authored in Typst. There is also an `install_cosy.sh` script in the meta repo for single-host Docker install.

## Notable (stands out vs other projects)
- Only genuinely **polyglot** project in the portfolio: Java (backend), Rust (game-artwork API), Go (template catalog service), TypeScript (frontend), plus a Java/Fabric Minecraft mod.
- Multi-repo / multi-service microservice architecture with its own docs site, template content repo, and dedicated GitOps deployment repo.
- Real infrastructure surface: talks to the Docker socket (root-equivalent on host), streams over WebSockets, integrates RCON, and runs a full observability stack (Influx + Loki + Grafana-style dashboards).
- Self-hosted game hosting is a distinctive domain vs the other web/app projects.

## Notes for agents
- **Canonical location is `~/projects/cosy/<repo-name>/`** (one subfolder per repo). If stale copies of these repos exist elsewhere on a machine (e.g. under `uni/` or `private/`), ignore them — clone fresh / pull the ones under `~/projects/cosy/`.
- **Build tools differ per service:** Frontend = Bun + Vite (not npm/node by default); Backend = Maven (`./mvnw`) on Java 21; Rust game service = Cargo; Go template service = `go`/`go build`. Match the toolchain to the repo.
- **Frontend API types are generated** by Orval from `openapi-backend.json`; don't hand-edit files under `src/api/generated/` — regenerate from the backend OpenAPI spec instead.
- **Language-vs-name caution:** the project-manager metadata lists a "Go game service" and "Rust component" separately, but on disk `Cosy-Game-Service` (the game/SteamGridDB API) is **Rust** and `Cosy-Template-Service` is **Go**. Check the repo's Cargo.toml / go.mod before trusting a label.
- **Backend has broad host access** (Docker socket = root-equivalent per its README security note) — be careful with anything touching container/file operations.
- **Namespace confusion:** cluster namespace is `cosy`. The `cosy-prod` / `cosy-staging` namespaces belong to a *different* project (Cosy Domain Provider) — do not conflate them.
- The `Cosy` meta repo holds docs, install/uninstall scripts, and planning docs (`PLAN.md`, `PLAN-filesystem-features.md` at the projects/cosy/ root).
