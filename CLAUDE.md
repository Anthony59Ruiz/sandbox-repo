# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Two things live in this repo

1. **An Expo / React Native starter** (`App.tsx`, `index.ts`, `app.json`) — a fork-to-begin template for A1 Intelligence client mobile builds.
2. **A content publishing pipeline** (`content/`, `scripts/`, `.github/workflows/`) — markdown posts that are validated on pull request and published on merge to `main`.

Most active work is in the content pipeline; the app is a near-untouched Expo scaffold.

## Commands

```bash
npm install            # install dependencies
npx expo start         # start Metro / dev server (also: npm run ios | android | web)

node scripts/validate-content.js       # validate front matter of every content/*.md (CI runs this on PRs)
node scripts/publish.js --dry-run      # print the publish payload for approved posts
```

There is no test runner or linter configured. `scripts/publish.js` without `--dry-run` intentionally errors out — live publishing is not implemented.

## Content pipeline architecture

Posts are markdown files in `content/` with YAML-style front matter:

```
---
platform: instagram
scheduled: 2026-08-01
status: approved
---
Post body goes here.
```

- **`scripts/validate-content.js`** — runs on every PR (`.github/workflows/validate-content.yml`). Fails if any `content/*.md` lacks front matter or is missing a required field (`platform`, `scheduled`, `status`). This is the merge gate.
- **`scripts/publish.js`** — runs on push to `main` (`.github/workflows/publish.yml`), currently `--dry-run` only. It collects posts whose `status` is exactly `approved` (drafts are skipped) and emits a publish payload per post.
- **`.github/CODEOWNERS`** — `/content/` requires review from `@Anthony59Ruiz`.

Front-matter parsing in both scripts is deliberately regex-based (match the leading `---` block, then per-key regexes) with **no YAML dependency**. Keep that approach when editing — the two scripts share it. The parser matches simple `key: value` lines, so keep front matter flat.

The `status: approved` value is the switch that moves a post from validated to published; changing it is the meaningful review action.
