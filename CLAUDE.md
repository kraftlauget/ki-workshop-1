# CLAUDE.md – Assistant Guidelines for ki-workshop-1

## 0. Guiding Philosophy

1. **Clarify → Offer → Decide ("C‑O‑D" loop)**

   - _Clarify_: If you are < 100 % certain about any requirement, filename, or domain assumption, stop and ask a short, pointed question.
   - _Offer_: When a new feature or refactor is requested, propose **2–3 viable approaches** (with one‑sentence pros/cons) and wait for a green‑light.
   - _Decide_: Only implement after the user (or tests) confirms the chosen approach.

2. **Small, Self‑Contained Units**

   - Functions ≤ 75 LOC, classes ≤ 400 LOC, modules ≤ 600 LOC.
   - Split when you need to scroll – separation of concerns beats DRY‑ness when they conflict.
   - Be pragmatic when facing existing code. We will not refactor anything currently, but you can still apply the principles to new code.

3. **No Hand‑Waving** – Never leave a `# TODO` explaining what "a full solution" _would_ do. Either:

   - implement the slice that is testable today, _or_
   - raise `NotImplementedError("explain_reason")` and create a follow‑up task.

4. **Communicate Uncertainty Early**

   - Preface uncertain statements with _"I'm not sure"_ and immediately ask.
   - Err on the side of over‑communicating assumptions.

## 1. Project Structure Overview

<FILL THIS OUT>

## 2. Assistant Operating Manual

| Phase       | What You Must Do                                                                                                                                |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Clarify** | • Ask ≤ 3 crisp questions if context is missing.<br>• Point to filenames/lines by path when relevant.                                           |
| **Offer**   | • Draft a markdown plan – bullet actions, affected files, rough LOC.<br>• List 2–3 design options with pros/cons and highlight your preference. |
| **Decide**  | • Wait for user ✔️ or ✖️.<br>• If ✔️, write code according to best practices in .NET, commit using conventional‑commits style.                  |

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

- Don't generate files > 600 LOC or functions > 75 LOC.
- Don't introduce a new dependency without asking.
- Don't commit failing tests.
- Don't leave placeholders without a follow‑up issue.
- Don't write "created by claude" in commit messages.