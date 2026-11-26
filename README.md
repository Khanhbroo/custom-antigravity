# Custom Antigravity 2.0

A lightweight customization pack for **Antigravity 2.0** (Desktop App + IDE):
- **Typography:** Applies `JetBrains Mono` (`14px`) across the UI using natural CSS inheritance (no universal `*` selector, keeping long chat threads fast).
- **Smooth Caret Animation:** GPU-accelerated caret gliding (`translate3d`), `expand` blinking (`scaleY`), dynamic `caret-color` matching, and proper handling for long pastes and scrolling.
- **Safe & Reversible:** Preserves existing mods (e.g. `ascii-wallpapers`) and automatically creates an `app.asar.font-backup` before patching.

---

## Quick Start

### Prerequisites
- **JetBrains Mono** font installed on your OS (`~/Library/Fonts` on macOS, or Windows Fonts).
- **Node.js** (v18+).

### Apply to Antigravity 2.0 App
> **Important (Windows):** Close Antigravity completely before running `npm run apply` (Windows locks `app.asar` while the app is running). If Antigravity is installed in `Program Files`, run your terminal as **Administrator**.

```bash
git clone https://github.com/Khanhbroo/custom-antigravity.git
cd custom-antigravity
npm install
npm run apply
```

Restart Antigravity (`Cmd + Q` on macOS, or close and reopen on Windows) to apply the changes.

If your `app.asar` is in a custom location, set `AGY_ASAR_PATH`:
```bash
# macOS / Linux
AGY_ASAR_PATH="/path/to/app.asar" npm run apply

# Windows (PowerShell)
$env:AGY_ASAR_PATH="C:\path\to\app.asar"; npm run apply
```

### Revert Changes
```bash
npm run revert
```

### Customize Font & CSS
Edit `~/.antigravity-custom-font.css` (created automatically from [custom-font.css](./custom-font.css) on first run), then re-run:
```bash
npm run apply
```

---

## Antigravity IDE Settings (`settings.json`)
[ide-settings.json](./ide-settings.json) contains the matching IDE configuration (`JetBrains Mono`, `editor.cursorSmoothCaretAnimation: "on"`, `editor.cursorBlinking: "expand"`, `animations.UseCursorColorForCursorAnimation: true`, and smooth scrolling). Copy its contents into your Antigravity IDE `User/settings.json`.
