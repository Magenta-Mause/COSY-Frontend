# React / TypeScript Conventions

How this document works:

- **Unmarked rules describe how this codebase works today.** They are the current
  practice and must be followed.
- **Rules marked `Target` are agreed direction.** New code and any code you touch must
  follow them, but do **not** mass-refactor existing code to satisfy them — migrate
  opportunistically as you pass through.

---

## Component Structure

Components live under `src/components/` in three buckets:

- `ui/` — shadcn-style primitives (`button.tsx`, `field.tsx`, `dialog.tsx`, `Icon.tsx`, …).
- `display/` — feature components. Each is a PascalCase folder containing a same-named
  `.tsx` (e.g. `display/Footer/Footer.tsx`), often with nested sub-folders.
- `technical/` — providers, websockets, and other non-visual wiring
  (`Providers`, `WebsocketCollection`, `LoadingScreen`).

Shared logic lives in the central `src/hooks/` directory — one folder per hook,
`useXxx/useXxx.tsx`. The data hooks (the `use*DataInteractions` family and
`useDataLoading`) live here. Co-located component hooks exist but are the exception —
e.g. `display/GameServer/CreateGameServer/useCreationFormState.ts`.

**DO:**
- Put reusable primitives in `ui/`, features in `display/`, and infrastructure in `technical/`.
- Keep one same-named `.tsx` per PascalCase `display/` folder.
- Import files directly by path — barrel `index.ts` re-exports are **not** a convention here.

**DON'T:**
- Add a barrel `index.ts` just to re-export a folder's public API.

**Target:** treat ~200 lines as a soft ceiling for a component file. When a component
grows past it, extract a co-located logic hook (`useXxx.ts`) or named sub-components
rather than letting it sprawl. Several existing components are 300–600+ lines — that is
legacy, not a pattern to copy.

---

## Imports & Exports

`verbatimModuleSyntax` is enabled in `tsconfig.app.json`, so type-only imports must use
`import type`. Explicit `.ts` / `.tsx` extensions in relative and aliased imports are the
norm (`allowImportingTsExtensions` is on).

```tsx
import type { RootState } from "@/stores";
import useDataLoading from "@/hooks/useDataLoading/useDataLoading.tsx";
```

**DO:**
- Use `import type` for anything imported only as a type.
- Include the file extension in import specifiers.
- Use the `@/` alias for all cross-directory imports — it is the only path alias.
  (The former `@components/*`, `@types/*`, and `@config` aliases are removed.)

---

## State Management

Global state uses Redux Toolkit. Slices live in `src/stores/slices/` (one file per
slice, e.g. `gameServerSlice.ts`, `userSlice.ts`, `templateSlice.ts`), combined in
`src/stores/rootReducer.ts`, which also defines the `RESET_STORE` action. The store
itself is configured in `src/stores/index.ts`, which exports `RootState`, `AppDispatch`,
and the shared `SliceState<T>` shape:

```ts
export interface SliceState<T> {
  data: T[];
  state: "idle" | "loading" | "failed";
}
```

Server data reaches the store through two established patterns — use them, don't invent
a third:

- **`src/hooks/use*DataInteractions/*`** wrap the Orval-generated react-query mutation
  hooks. `onSuccess` dispatches into the matching slice, `onError` surfaces via
  `notificationModal` (`src/lib/notificationModal.ts`), and `onSettled` invalidates the
  affected query key. See `useGameServerDataInteractions`.
- **`src/hooks/useDataLoading/`** imperatively calls generated client functions and
  dispatches `SliceState` transitions (`loading` → `idle` / `failed`) for list data.

**DO:**
- Route every new server interaction through one of these hooks.
- Use the typed `useAppDispatch` / `useAppSelector` hooks from `src/stores/hooks.ts`.

**DON'T:**
- Call a generated client function directly from a component.
- Duplicate fetch-and-dispatch logic inline instead of extending the data hooks.
- Import raw `useDispatch` / `useSelector` from `react-redux` — always the typed pair.

---

## Loading States & Buttons

Every control that triggers an async request gives clear pending feedback, and every
lazily-fetched panel shows a visible loading state.

**DO:**
- Pass `loading={isPending}` to the shared `<Button>` (`ui/button.tsx`) for any
  async-triggering button. It disables the button and swaps its label for a translated
  loading label (`loadingLabel` prop to customize, defaults to `common.loading`), and
  sets `data-loading="true"` (which also drives the loading cursor from `src/index.css`).
  Derive the flag from the mutation's `isPending` where one exists — don't hand-roll
  `useState` booleans next to a mutation.
- For per-row actions, gate on the acted-on id (via the mutation's `variables`) so only
  the clicked control shows pending, not every row.
- Give every fetched list or panel a visible **loading** branch and an **error** branch —
  never an empty panel while a fetch is in flight. Use the shared `<Spinner>`
  (`src/components/ui/Spinner.tsx`); `LogDisplay` and `MetricDisplay`/`MetricGraph`
  (driven by the hooks' `DataLoadState`) are the reference implementations.
- Completeness-gated submits: keep primary-action buttons disabled until every required
  input is filled, composing with the pending state —
  `disabled={!isFormValid} loading={isPending}` (`EditFooterModal.tsx` is the model).
  Gate on *completeness*, not on format validity — format errors surface as validation
  messages on submit.

**DON'T:**
- Leave a button firing an async handler with no pending feedback.
- Show a bare empty panel while its data is loading — render the loading branch.
- Flash the loading branch again for streaming appends/refreshes once initial data is
  shown.

---

## Forms & Validation

Forms are native `<form>` elements built from the shared field primitives in
`src/components/ui/field.tsx` (plus `RequiredMark.tsx`) and hand-rolled domain input
wrappers — e.g. `CpuLimitInputField`, the `AutoCompleteInputField` and
`TemplateVariableForm` components under `CreateGameServer/`. Form state lives in
co-located hooks such as `useCreationFormState` and `useWebhookForm`. Validation uses
**zod**.

**DO:**
- Build forms from the `ui/field.tsx` primitives and existing domain input wrappers.
- Keep form state in a co-located hook, not scattered through the JSX.
- Validate with zod.
- Put field/schema validators in `src/lib/validators/` — one file per validator, with
  named constants for limits (`portValidator.ts` with `PORT_MIN`/`PORT_MAX`,
  `requiredStringValidator.ts`, `webhookUrlValidator.ts`, `cpuLimitValidator.ts`,
  `memoryLimitValidator.ts`). Don't define domain zod schemas inline in a component.

---

## Styling

Styling is Tailwind v4 with CSS-first config. Design tokens are defined in an
`@theme inline` block in `src/globals.css` (e.g. `--color-background`, `--color-foreground`,
`--color-border`, and the `--color-button-*` family). Compose conditional or merged class
lists with the `cn()` helper from `src/lib/utils.ts` (clsx + tailwind-merge).

```tsx
import { cn } from "@/lib/utils.ts";

<button className={cn("bg-button-primary-default text-foreground", isActive && "bg-button-primary-hover")} />
```

**DO:**
- Use named token utilities: `bg-background`, `text-foreground`, `border-border`,
  `bg-button-primary-default`, etc.
- Use `cn()` for conditional and merged class names.

**DON'T:**
- Reach for `[var(--x)]` arbitrary-value syntax when a named token utility exists.
- Use inline `style={{}}` except for values Tailwind can't express — dynamic runtime
  values, or the CSS mask in `Icon.tsx`.

---

## Icons

All UI icons render through the shared `Icon` component
(`src/components/ui/Icon.tsx`, default export). It masks a `.webp` asset from
`src/assets/` with the current text color (`bg-current` + a CSS `mask-image`, with
`imageRendering: "pixelated"`), maps the `variant` prop to `text-icon-*` tokens, and
supports an optional `bold` drop-shadow. This is a deliberate pixel-art icon system.

**DON'T:**
- Import icon libraries (no `lucide-react` or similar), inline raw SVG icons, or use
  ASCII/unicode glyphs as icons — they break the aesthetic and the recoloring model.
- Put icon glyphs inside i18n strings.

---

## TypeScript

`tsconfig.app.json` runs strict. The enabled flags are: `strict`, `noUnusedLocals`,
`noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`,
`noUncheckedSideEffectImports`, and `erasableSyntaxOnly`.

**DO:**
- Prefer `unknown` and narrow it, rather than `any`.
- If you must suppress an error, document *why* — no bare `@ts-ignore`.

**DON'T:**
- Introduce `any`.
- Leave unused locals, parameters, or fall-through switch cases (they fail the build).

**Target:** declare new component props as `interface XxxProps` with `readonly` fields.
(Existing components mix styles — migrate opportunistically when you touch one.)

---

## Routing

Routing is TanStack Router with file-based routes under `src/routes/` — one file per
route, with nested layouts (e.g. `server/$serverId.tsx` wraps its
`server/$serverId/*.tsx` children). `src/routeTree.gen.ts` is generated (see Code
Generation below) — never hand-edit it.

Access control today happens at render time via `AuthContext` and the helpers in
`src/utils/routeGuards.ts` (`requireAuth`, `requireRoles`, `useRequireRoles`), with a
`NoAccess` fallback (`src/components/display/NoAccess/NoAccess.tsx`).

**Target:** move access control into route-level `beforeLoad` guards so unauthorized
routes never render at all. **Prerequisite:** auth currently lives only in React state,
populated by an async `fetchToken()` — there is no source of truth `beforeLoad` can read,
so guards added today would mis-redirect on deep links and hard refreshes while auth is
still resolving. Adopting this requires first extracting an awaitable out-of-React auth
singleton (consumed by both `AuthProvider` and router context) — that is its own task.
Until then, render-time checks are the correct pattern.

---

## Internationalisation (i18n)

Structure under `src/i18n/`:

- `i18n.ts` — i18next setup.
- `i18nKeys.ts` — the hand-written `i18nLanguage` type, the single source of truth for
  the key shape. It also defines the `ContainsVariable<T>` helper
  (`` `${string}{{${T}}}${string}` ``) used to require an interpolation variable in a key.
- `en-US/translation.ts` and `de-DE/translation.ts` — both annotated
  `const translation: i18nLanguage`, so a missing, extra, or mistyped key in either
  language **fails typecheck**.
- `i18next.d.ts` — `CustomTypeOptions` augmentation over `i18nLanguage`, so `t("bad.key")`
  **also fails typecheck at every call site**, including prefix-scoped keys.

**DO:**
- Add a new key to `i18nLanguage` first, then to **both** language files in the same
  commit.
- Use i18next interpolation (`{{var}}`) for dynamic values, and type such keys with
  `ContainsVariable<"var">`.
- Route every UI string through `t()`.

- Use the `useTranslationPrefix` hook (`src/hooks/useTranslationPrefix/`) with a
  component-scoped key prefix — it is generically typed, so the returned `t` is checked
  against that prefix's keys. Raw `useTranslation` is reserved for components whose keys
  genuinely span multiple top-level namespaces (some of those keep a second root
  translator named `tRoot` alongside a prefixed one — follow that pattern).
- For dynamic/computed keys, cast narrowly at the call site with
  `ParseKeys<"translation">` (or the prefixed form) — never weaken the global typing.

**DON'T:**
- Ship a bare string literal as user-facing text.
- Hand a component an untyped `(key: string) => string` translator prop — type it as
  `TFunction<"translation", "<prefix>">`.

---

## Testing

Unit tests run on **vitest** + **@testing-library/react** (`vitest.config.ts` — a
standalone config, deliberately without the router codegen plugin). Run them with
`bun run test` (`bun test` alone would invoke bun's own runner instead) or
`bun run test:watch`; CI runs them via `.github/workflows/test.yml`. Existing coverage:
every validator in `src/lib/validators/`, the substantial redux slice reducers, and
`useCreationFormState` via `renderHook`.

**DO:**
- Co-locate tests as `<name>.test.ts(x)` next to the code they cover.
- Import `describe`/`it`/`expect` explicitly from `vitest` — globals are off.
- Cover new pure logic (validators, slice reducers, form-state hooks) with tests in the
  same PR; test observable behavior, not implementation details.
- Keep adding kebab-case `data-testid` attributes to new interactive elements
  (e.g. `login-username-input`, `create-server-next-btn`) — the external E2E system
  tests select on them.

**DON'T:**
- Use `data-testid` as a substitute for semantic HTML.
- Ship a new validator, slice, or logic hook without a test.

---

## API Generation with Orval

The typed API client is generated by Orval into `src/api/generated/` from the backend
OpenAPI spec (config in `orval.config.js`). Regenerate with `bun gen:api` while the
backend runs on `localhost:8080`. The output is **committed**, so CI never needs a live
backend.

Every request goes through the shared axios `customInstance`
(`src/api/axiosInstance.ts`), which applies the base URL, attaches the bearer token, and
unwraps the response envelope.

**DO:**
- Consume the generated client through the data hooks (see State Management).
- Regenerate and commit the client when the backend contract changes.

**DON'T:**
- Edit anything under `src/api/generated/` by hand.
- Call the generated client directly from a component.

---

## Code Generation (Routes)

`src/routeTree.gen.ts` is generated from the files in `src/routes/`. It regenerates
automatically while the dev server runs, or on demand with `bun tsr:gen`. Never edit it
by hand.
