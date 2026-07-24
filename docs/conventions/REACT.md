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

**Target:** use the `@/` alias for all cross-directory imports. The extra aliases
(`@components/*`, `@types/*`, `@config`) are being retired — don't introduce them in new
code, and prefer `@/` when you touch an existing import.

---

## State Management

Global state uses Redux Toolkit. Slices live in `src/stores/slices/` (one file per
slice, e.g. `gameServerSlice.ts`, `userSlice.ts`, `templateSlice.ts`), combined in
`src/stores/rootReducer.ts`. `rootReducer.ts` also defines the `RESET_STORE` action and
the typed `useTypedSelector`. The store itself is configured in `src/stores/index.ts`,
which exports `RootState` and the shared `SliceState<T>` shape:

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

**DON'T:**
- Call a generated client function directly from a component.
- Duplicate fetch-and-dispatch logic inline instead of extending the data hooks.

**Target:** add typed `useAppDispatch` / `useAppSelector` hooks (typed against
`RootState` / `AppDispatch`) and use them in new code instead of the raw `useDispatch`
from `react-redux` and the current `useTypedSelector`.

---

## Loading States & Buttons

**Target** — this whole section is the agreed fix. Current behavior is inconsistent, and
the rules below are where we're heading; the "meanwhile" note records what to keep doing
until the shared primitive lands.

**Target:**
- Give the shared `ui/button.tsx` a `loading` prop that disables the button and shows an
  inline pending indicator. Async-triggering buttons then pass the mutation's `isPending`
  instead of hand-rolling `useState` booleans.
- For per-row actions, gate on the acted-on id (via the mutation's `variables`) so only
  the clicked control shows pending, not every row.
- Every fetched list or panel renders a visible **loading** branch and an **error**
  branch — never an empty list while a fetch is in flight.
- Completeness-gated submits: primary-action buttons stay disabled until every required
  input is filled. Gate on *completeness*, not on format validity — format errors surface
  as validation messages on submit.

*Meanwhile (current practice to keep):* disable buttons while a request is in flight and
set the `data-loading="true"` attribute, which drives the loading cursor defined in
`src/index.css`.

A good existing model for the completeness gate is `EditFooterModal.tsx`, whose submit is
`disabled={!isFormValid || isPending}`.

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

**Target:** put field/schema validators in `src/lib/validators/` — one file per
validator, with named constants for limits. `cpuLimitValidator.ts` and
`memoryLimitValidator.ts` are the pattern. New inline zod schemas written in a component
should move there instead.

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
routes never render at all. New routes should prefer `beforeLoad` over render-time
checks.

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

**DO:**
- Add a new key to `i18nLanguage` first, then to **both** language files in the same
  commit.
- Use i18next interpolation (`{{var}}`) for dynamic values, and type such keys with
  `ContainsVariable<"var">`.
- Route every UI string through `t()`.

**DON'T:**
- Ship a bare string literal as user-facing text.

**Target:**
- Use the `useTranslationPrefix` hook (`src/hooks/useTranslationPrefix/`) with a
  component-scoped key prefix in new components, instead of raw `useTranslation`.
- Add an `i18next.d.ts` module augmentation (`CustomTypeOptions` over the existing
  `i18nLanguage` type) so `t("bad.key")` also fails typecheck at call sites.

---

## Testing

**Target** — the repo currently has **no unit tests**, which is a known gap, not a
convention. The direction below is where we want to go; start applying it to new pure
logic.

**Target:**
- Test with **vitest** + **@testing-library/react**, wired to a `bun test` script and a
  CI job.
- Co-locate tests as `<name>.test.ts(x)` next to the code they cover.
- Start with pure logic: validators, redux slice reducers, and form-state hooks.

*Current practice that does exist:* `data-testid` attributes on interactive elements,
consumed by the external E2E system tests. Use kebab-case, descriptive ids
(e.g. `login-username-input`, `create-server-next-btn`, `login-submit-btn`).

**DO:**
- Keep adding `data-testid` to new interactive elements.

**DON'T:**
- Use `data-testid` as a substitute for semantic HTML.

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
