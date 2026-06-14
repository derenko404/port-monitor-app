# Port Monitor — TODO

- [x] **Add sentry monitoring** - For errors and warnings

Feature ideas, grouped by value.

## High value (core utility)

- [x] **Force-kill fallback** — if SIGTERM ignored and process still listening, offer SIGKILL ("still running… force?")
- [x] **Open in browser** — click an http-ish port row → open `http://localhost:<port>`

## Discoverability

- [ ] **Group by app** — collapse rows sharing a pid/command (e.g. Code Helper)
- [x] **Favorite / pin ports** — pin dev ports (3000, 5432) to top
- [x] **Highlight "mine"** — flag dev ports (3000–9999) vs system ports

## Awareness

- [ ] **New-port notification** — native notify when a port opens/closes (dev server boot)
- [ ] **Diff since last refresh** — subtle "new" tag on freshly-opened ports

## Polish

- [ ] **Keyboard nav** — ↑↓ select row, ⌘K focus search, Enter → info, ⌘⌫ → kill
- [ ] **Empty / error states** — lsof fails / no permissions messaging
- [ ] **Localization** - move all UI text to localization files and json text files for app text
- [x] **Global hotkey** — toggle popup from anywhere (launch-at-login already done)

## Settings depth

- [ ] Port range filter
- [ ] Refresh-on-open toggle
- [x] Kill signal choice (SIGTERM / SIGKILL default)

## Suggested next (best utility-per-effort)

1. Open in browser
2. Force-kill fallback
3. Tray count badge
4. Keyboard nav
