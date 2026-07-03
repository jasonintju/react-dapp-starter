# AI Coding Guide (AGENTS.md)

This file is the guide for AI writing code in this template and projects derived from it. The goal is human-AI unity: code written by humans is readable to AI, and code written by AI is easy for engineers to debug. Every rule below targets a readability problem that has actually occurred — follow them strictly.

## Tech Stack

React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + zustand + @tanstack/react-query + wagmi/viem + Reown AppKit + react-router + sonner.

Use the package manager indicated by the repo's lockfile (yarn for this template).

## Directory Structure & Responsibilities

```
src/
  api/        # Backend endpoint definitions & wrappers (web3 projects mainly talk to contracts; use as needed)
  hooks/      # Global custom hooks, one hook per file (useXxx.ts)
  store/      # zustand stores, useXxxStore.ts
  components/ # Shared components: folder + index.tsx (e.g. Header/index.tsx)
  components/ui/  # shadcn-generated atomic components, lowercase single files (button.tsx) — the only place lowercase component files are allowed
  pages/      # One PascalCase folder per page, index.tsx as the entry
  lib/        # Low-level libraries & pure logic (cn, adapters, domain calculations, constants)
  config/     # common.ts + development.ts + production.ts, merged and exported per environment by index.ts
  types/      # Cross-module domain types
  abis/ assets/ locales/  # as needed
```

- Before creating a file, decide where it belongs: environment-dependent → `config/`; pure functions → `lib/`; data fetching → `hooks/` + react-query.
- Page-private hooks/stores/subcomponents go **next to the page** (`pages/Xxx/hooks/`, `pages/Xxx/store/`, `pages/Xxx/Section.tsx`) — do not pollute the global directories.
- Always use the `@/` alias for `src`; never write relative-path climbing (`../../..`).

## Components (the section AI violates most often)

- **One exported component per file** (small private subcomponents are fine). Never pile multiple sibling components into one file.
- A file exceeding **~300 lines must be split**. If you can foresee it will exceed that, design it as subcomponents/sub-files from the start.
- A page's `index.tsx` does **layout assembly only**: fetch data, compose subcomponents; large JSX detail belongs in subcomponent files.
- File naming: components/pages **PascalCase** (`TradePanel.tsx`); hooks/utilities **camelCase**. No lowercase component files (e.g. `markets.tsx`).
- Business components use default export (`export default Foo;` at the end of the file); shadcn ui keeps named exports.
- Props: inline types for simple ones, a dedicated `interface XxxProps` for complex ones.
- **No ternaries nested more than 2 levels.** Extract complex label/branch logic into named functions, or use if/else with early returns.
- **Complex boolean conditions must be split into named intermediate variables.** `const canBuy = a && b && ... && j` with 10 conditions on one line is undebuggable; split into `hasBalance`, `isMarketOpen`, etc. so each variable can be logged individually.
- No inline IIFEs building data inside JSX; lift them to the top of the component body or a separate function.

## Hooks

- One hook per file, single responsibility, typically <100 lines; compose hooks instead of writing a giant one.
- All data fetching (contract reads, third-party/backend APIs) is wrapped in react-query `useXxx` hooks; poll with `refetchInterval`, never hand-written setInterval.
- If there is a backend API: define the response type and the frontend-facing type **separately** and map between them in `queryFn`; keep both types at the top of the hook file. Endpoint URLs go in `api/` or `config/`, never hardcoded inside hooks.
- Never `eslint-disable react-hooks/exhaustive-deps`; fix dependency issues by design (split effects, useRef, useCallback).

## State Management

- Server state belongs to react-query, client state belongs to zustand — don't mix them.
- Split stores at fine business granularity, `create<State>(set => ({...}))`, state and setters in the same interface.
- In performance-sensitive spots, subscribe per-field with selectors (`useXxxStore(s => s.field)`) and add a comment explaining why.

## Types

- **No `any`, no `@ts-ignore`** (the only exceptions: `catch (error: any)` and variadic log arguments).
- String fields with a finite set of values must use a **union type**: write `status: 'upcoming' | 'closed' | 'settled'`, never `status?: string` plus a comment listing the values.
- Domain types used by multiple components go in `types/` or a module-level `types.ts`; **never define a type inside a component file and have other files import it back**.
- On-chain addresses use `` `0x${string}` ``; config objects get `as const`.
- Use `interface` for object shapes, `type` for unions/functions/utility types.

## Constants & Config

- Environment-dependent values (contract addresses, chainId, API base, fee rates) go in `config/`, referenced as `config.XXX` — no scattered hardcoding.
- **Each constant is defined exactly once project-wide**: token decimals, polling intervals, responsive breakpoints, etc. live in `config/common.ts` or `lib/constants.ts`. Search for an existing one before adding a new constant.
- Magic numbers must be named constants with a comment on their origin; no fudge-factor arithmetic like `- 4 + 5 + 12 + 10`.

## Styling

- One system only: Tailwind utility classes + `cn()` (clsx + tailwind-merge), component variants via `cva`. `src/index.css` is Tailwind v4's configuration entry (`@import 'tailwindcss'`, `@theme` theme variables, `:root`/`.dark` design tokens, a small amount of global base styles) — it is part of this system, and all style-related global definitions live there.
- **Never** build a second semantic global-class system alongside it (e.g. hand-written `.trade-panel`, `.match-card` CSS files that business components reference) — component styles are written as Tailwind utilities, and theme values are consumed through `@theme` variables.
- Expose a `className` prop on shared components and merge with `cn('...base', className)`.
- Leave className ordering to `prettier-plugin-tailwindcss`; don't sort by hand.

## Code Duplication

- The **second time** the same logic appears, extract it to `lib/` (typical: amount/unit conversion, label formatting, isMobile checks, image onError fallbacks). Search for an existing helper before writing a new one.
- Extract the shared "loading / error / empty / wallet-not-connected" state rendering used across tabs/branches into a shared component — don't copy the JSX into every branch.

## Comments & Dead Code

- Comments explain **why** (business reasons, gotchas, optimization rationale), not what the code does. Write comments in English.
- **Never keep dead code as comments** — delete unused code outright; git keeps the history. Never commit commented-out components, mock data, or imports.
- Use comment blocks to section large constant files like `api/index.ts` and `config/`.

## Engineering Constraints

- ESLint with zero warnings (`--max-warnings 0` semantics); imports grouped and sorted per `import/order`.
- Prettier: 2 spaces, single quotes, semicolons, `arrowParens: avoid`.
- Route pages are lazy-loaded with `lazy` + `Suspense`.
- Multilingual projects: copy goes in `locales/*.json`, consumed via `useTranslation()` in components — no hardcoded UI strings.

## Common Commands

```bash
yarn dev      # development
yarn build    # tsc -b && vite build
yarn lint     # eslint .
```
