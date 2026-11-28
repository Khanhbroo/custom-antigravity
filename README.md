# Custom Antigravity 2.0

An all-in-one customization pack for **Antigravity 2.0** (Desktop App + IDE):

- **50 Live ASCII Wallpaper Themes** (based on [`Mix4o445/antigravity-ascii-wallpapers`](https://github.com/Mix4o445/antigravity-ascii-wallpapers)):
  - 22 light & 28 dark animated text-art scenes (*Aurora, Koi Pond, Night Rain, Starry Catnap, Digital Rain, Retro Sunset...*) with whole-app recoloring, agent reactivity, and a model quota bar.
  - **Custom Fixes Included:**
    - **Sticky Sidebar Header Fix:** Automatically detects `position: sticky` headers and the `Projects` section header (`markStickyHeaders()`) and gives them a frosted opaque backdrop (`95%` panel color + `blur(14px)`), preventing scrolled rows from bleeding through behind `Projects`.
    - **Non-Overlapping Titlebar Controls:** `positionTrigger()` scans all visible right-side titlebar pills (including `Restart to Update`) so the `Themes` button and `Quota` bar always shift cleanly to the left and never block update buttons.
- **Typography:** Applies `JetBrains Mono` (`14px`) across the UI using natural CSS inheritance (no universal `*` selector, keeping long chat threads fast).
- **Smooth Caret Animation:** GPU-accelerated caret gliding (`translate3d`), `expand` blinking (`scaleY`), dynamic `caret-color` matching, and proper handling for long pastes and scrolling.
- **Safe & Reversible:** Verifies archive hashes before patching and maintains clean backups (`app.asar.ascii-wallpapers.backup` & `app.asar.font-backup`).

---

## Quick Start

### Prerequisites
- **JetBrains Mono** font installed on your OS (`~/Library/Fonts` on macOS, or Windows Fonts).
- **Node.js** (v18+).

### Apply Everything (ASCII Themes + Font & Smooth Caret)
> **Important (Windows):** Close Antigravity completely (including background `Antigravity.exe` processes) before running `npm run apply` because Windows locks `app.asar` while the app is running.

```bash
git clone https://github.com/Khanhbroo/custom-antigravity.git
cd custom-antigravity
npm install
npm run apply
```

**Windows (PowerShell one-liner to close background processes and apply):**
```powershell
Stop-Process -Name "Antigravity" -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2; cd D:\Work\Code\custom-antigravity; npm run apply
```

Restart Antigravity to apply changes. Press **`Ctrl+Alt+W`** (or **`Cmd+Option+W`** on macOS), click **Themes**, or type `/theme` in the composer.

### Useful Commands
```bash
npm run status      # Check Antigravity version & patch status
npm run verify      # Dry-run archive rebuild verification (no files changed)
npm run apply:font  # Apply only JetBrains Mono font + smooth caret
npm run revert      # Restore original stock app.asar
```

### After an Antigravity Update
Updates replace `app.asar`, removing the UI patches while keeping your preferences (`ascii-wallpapers-preferences.json`, `~/.antigravity-custom-font.css`, `User/settings.json`). Simply close Antigravity and re-run:
```powershell
Stop-Process -Name "Antigravity" -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2; cd D:\Work\Code\custom-antigravity; npm run apply
```

### Customize Font & CSS
Edit `~/.antigravity-custom-font.css` (created automatically from [custom-font.css](./custom-font.css) on first run), then re-run `npm run apply`.

---

## Antigravity IDE Settings (`settings.json`)
[ide-settings.json](./ide-settings.json) contains the matching IDE configuration (`JetBrains Mono`, `editor.cursorSmoothCaretAnimation: "on"`, `editor.cursorBlinking: "expand"`, `animations.UseCursorColorForCursorAnimation: true`, and smooth scrolling). Merge its contents into your Antigravity IDE `User/settings.json`.
