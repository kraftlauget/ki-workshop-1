# CLAUDE.md – Assistant Guidelines for ki-workshop-1

## 0. Guiding Philosophy

1. **Clarify → Offer → Decide ("C‑O‑D" loop)**

   - _Clarify_: If uncertain about requirements, ask a short, pointed question.
   - _Offer_: Propose 2–3 design options when it makes sense to discuss the approach (complex features, architectural decisions).
   - _Decide_: Implement after confirmation, or proceed directly for obvious tasks.

2. **Small, Self‑Contained Units**

   - Functions ≤ 75 LOC, classes ≤ 400 LOC, modules ≤ 600 LOC.
   - Split when you need to scroll – separation of concerns beats DRY‑ness when they conflict.
   - Be pragmatic when facing existing code. We will not refactor anything currently, but you can still apply the principles to new code.

3. **No Hand‑Waving** – Never leave a `# TODO` explaining what "a full solution" _would_ do. Either:

   - implement the slice that is testable today, _or_
   - raise `NotImplementedError("explain_reason")` and create a follow‑up task.

4. **Communicate Uncertainty Early**

   - Preface uncertain statements with _"I'm not sure"_ and immediately ask.
   - Err on the side of over‑communicating assumptions.

## 1. Project Structure Overview

**Tech Stack**: Next.js 15 + TypeScript + Tailwind CSS + Supabase + shadcn/ui

### Core Directories

- **`src/app/`** – Next.js App Router pages, layouts, and route handlers

  - `layout.tsx` – Root layout with global styles
  - `page.tsx` – Homepage component
  - `globals.css` – Global Tailwind styles

- **`src/components/`** – Reusable React components

  - `ui/` – shadcn/ui component library (button.tsx, etc.)

- **`src/lib/`** – Utility functions and external integrations

  - `supabase.ts` – Supabase client configuration
  - `utils.ts` – General utility functions (cn, etc.)

- **`public/`** – Static assets (SVGs, images)

### Key Config Files

- `components.json` – shadcn/ui configuration (New York style, RSC enabled)
- `next.config.ts` – Next.js configuration
- `tsconfig.json` – TypeScript config with `@/*` path aliases
- `tailwind.config.*` – Tailwind CSS configuration
- `env.example` – Environment variable template for Supabase

### Development

- **Dev Server**: `npm run dev` (uses Turbopack)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (ESLint + Next.js rules)

## 2. Assistant Operating Manual

| Phase       | What You Must Do                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Clarify** | • Ask ≤ 3 crisp questions if context is missing Point to filenames/lines by path when relevant.                                        |
| **Offer**   | • For complex tasks: draft plan with affected files.Propose design options when approach isn't obvious.                                |
| **Decide**  | • Wait for user ✔️ or ✖️.< If ✔️, write code according to best practices in TypeScript/React, commit using conventional‑commits style. |

## 3. When You're Unsure – Checklist 🟡

1. State the uncertainty explicitly.
2. Ask a clarifying question.
3. Propose fallback options.
4. Pause until you receive feedback.

## 4. When Presenting Options

```
### Option A – <name>
Pros: …
Cons: …

### Option B – <name>
Pros: …
Cons: …
```

Choose the leanest option that satisfies current requirements; defer gold‑plating.

## 5. Absolute "Don'ts"

- Don't generate files > 600 LOC or functions > 75 LOC.
- Don't introduce a new dependency without asking.
- Don't commit failing tests.
- Don't leave placeholders without a follow‑up issue.

