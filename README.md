<div align="center">

# ✨ Custom Antigravity 2.0

**All-in-one visual & performance customization pack for Antigravity 2.0 (Desktop App + IDE)**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Platforms](https://img.shields.io/badge/OS-Windows%20%7C%20macOS%20%7C%20Linux-0078D4?style=for-the-badge)](https://github.com/Khanhbroo/custom-antigravity)
[![Themes](https://img.shields.io/badge/ASCII%20Themes-50%20Live%20Scenes-8B5CF6?style=for-the-badge)](#features)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](./ascii-wallpapers/LICENSE)

</div>

---

## 🌟 Features

| Module | What You Get |
| :--- | :--- |
| **🎨 50 Live ASCII Wallpapers** | 22 light & 28 dark animated text-art scenes (*Aurora, Koi Pond, Night Rain, Starry Catnap, Digital Rain, Retro Sunset...*) with whole-app recoloring, agent reactivity, and a titlebar model quota monitor. |
| **🔤 Typography (`JetBrains Mono`)** | Clean `JetBrains Mono` (`14px`) across the entire UI using natural CSS inheritance (no `*` selector, keeping long conversations fast). |
| **⚡ Smooth Caret Animation** | GPU-accelerated caret gliding (`translate3d`), `expand` blink (`scaleY`), dynamic `caret-color` matching, and scoped scroll listeners. |
| **🛠️ Custom UI Fixes** | Fixed sticky sidebar headers (`Projects`) so scrolled items never bleed through, and smart titlebar anchoring so `Themes` / `Quota` never cover `Restart to Update`. |
| **🚀 Performance Tuned** | Optimized 20 FPS / `1.25x` DPR canvas, reduced GPU `backdrop-filter` blur passes, single-layer `text-shadow`, and zero-reflow `WeakSet` DOM observers (0% overhead during chat streaming). |
| **🛡️ Safe & Reversible** | Verifies archive integrity hashes before patching and maintains clean backups (`app.asar.ascii-wallpapers.backup` & `app.asar.font-backup`). |

---

## 📋 Prerequisites

- **Node.js** `v18` or newer
- **JetBrains Mono** font installed on your OS:
  - **Windows:** Install from [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (right-click `.ttf` → *Install*)
  - **macOS:** `brew install --cask font-jetbrains-mono`
  - **Linux:** `sudo apt install fonts-jetbrains-mono` (or your distro's package manager)

---

## 🚀 Installation by OS

> [!IMPORTANT]
> Always **close Antigravity completely** (including background/tray processes) before patching `app.asar`.

### 🪟 Windows (PowerShell)

Open an **external PowerShell** window (outside Antigravity) and run:

```powershell
# 1. Clone and install dependencies (first time only)
git clone https://github.com/Khanhbroo/custom-antigravity.git
cd custom-antigravity
npm install

# 2. Close background Antigravity processes and apply all mods
Stop-Process -Name "Antigravity" -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2; npm run apply
```

<details>
<summary>Custom <code>app.asar</code> path on Windows</summary>

```powershell
Stop-Process -Name "Antigravity" -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2; $env:AGY_ASAR_PATH="C:\path\to\app.asar"; npm run apply
```
*(Run PowerShell as **Administrator** if Antigravity is installed inside `C:\Program Files`.)*

</details>

---

### 🍎 macOS (Terminal)

Open **Terminal** and run:

```bash
# 1. Clone and install dependencies (first time only)
git clone https://github.com/Khanhbroo/custom-antigravity.git
cd custom-antigravity
npm install

# 2. Quit Antigravity completely and apply all mods
osascript -e 'quit app "Antigravity"' 2>/dev/null || pkill -x "Antigravity" 2>/dev/null || true
sleep 2
npm run apply
```

<details>
<summary>Custom <code>app.asar</code> path or permission denied on macOS</summary>

```bash
# If /Applications requires administrator privileges:
sudo npm run apply

# If Antigravity is in a custom location:
AGY_ASAR_PATH="/path/to/Antigravity.app/Contents/Resources/app.asar" npm run apply
```

</details>

---

### 🐧 Linux (Bash / Zsh)

Open your terminal and run:

```bash
# 1. Clone and install dependencies (first time only)
git clone https://github.com/Khanhbroo/custom-antigravity.git
cd custom-antigravity
npm install

# 2. Quit Antigravity completely and apply all mods
pkill -f "antigravity" 2>/dev/null || true
sleep 2
sudo npm run apply
```

<details>
<summary>Custom <code>app.asar</code> path on Linux</summary>

```bash
sudo AGY_ASAR_PATH="/opt/google-antigravity/resources/app.asar" npm run apply
```

</details>

---

## 🎮 Usage & Shortcuts

Reopen Antigravity after running `npm run apply`:

- **Open Theme Picker:** Click **Themes** in the titlebar, press **`Ctrl + Alt + W`** (Windows/Linux) or **`Cmd + Option + W`** (macOS)
- **Quick Slash Commands in Chat Composer:**
  - `/theme` — Open the theme picker
  - `/theme catnap` — Switch directly to a theme by name
  - `/theme random` — Pick a random theme
  - `/theme off` — Temporarily disable wallpapers

---

## 🧰 Available Commands

| Command | Description |
| :--- | :--- |
| `npm run apply` | Full install/re-apply (**ASCII Wallpapers + JetBrains Mono + Smooth Caret**) |
| `npm run apply:font` | Apply **only** `JetBrains Mono` font & smooth caret (without wallpapers) |
| `npm run revert` | Restore Antigravity back to its clean stock `app.asar` |
| `npm run status` | Check detected Antigravity version and current patch status |
| `npm run verify` | Dry-run archive rebuild & integrity hash check (modifies no files) |

---

## 🔄 After an Antigravity Update

App updates replace `app.asar` with a fresh build (removing the UI patches while keeping your saved preferences in `ascii-wallpapers-preferences.json`, `~/.antigravity-custom-font.css`, and `User/settings.json`).

Re-apply everything in one command:

**Windows (PowerShell):**
```powershell
Stop-Process -Name "Antigravity" -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2; cd path\to\custom-antigravity; npm run apply
```

**macOS:**
```bash
osascript -e 'quit app "Antigravity"' 2>/dev/null; sleep 2; cd path/to/custom-antigravity && npm run apply
```

**Linux:**
```bash
pkill -f "antigravity" 2>/dev/null || true; sleep 2; cd path/to/custom-antigravity && sudo npm run apply
```

---

## 🎨 Customization

### Custom Font & CSS
Edit `~/.antigravity-custom-font.css` (created automatically from [custom-font.css](./custom-font.css) on first run), then close Antigravity and re-run `npm run apply`.

### Antigravity IDE Settings (`settings.json`)
[ide-settings.json](./ide-settings.json) includes the matching editor & terminal config (`JetBrains Mono`, `fontLigatures`, `editor.cursorSmoothCaretAnimation: "on"`, `editor.cursorBlinking: "expand"`, smooth scrolling, and `animations.*`). Merge it into your IDE `User/settings.json`:
- **Windows:** `%APPDATA%\Antigravity\User\settings.json`
- **macOS:** `~/Library/Application Support/Antigravity/User/settings.json`
- **Linux:** `~/.config/Antigravity/User/settings.json`

---

## 🙏 Credits & License

- ASCII Wallpapers core engine & 50 procedural scenes based on [`Mix4o445/antigravity-ascii-wallpapers`](https://github.com/Mix4o445/antigravity-ascii-wallpapers) ([MIT License](./ascii-wallpapers/LICENSE)).
- Font patcher, GPU smooth caret, sticky header & titlebar overlap fixes, and performance optimizations maintained in this repository.
