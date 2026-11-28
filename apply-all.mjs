import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wallpapersScript = path.join(__dirname, 'ascii-wallpapers', 'manage-wallpapers.cjs');
const fontScript = path.join(__dirname, 'patch_font.mjs');

/** Resolve app.asar path across macOS, Windows, and Linux. */
function resolveAsarPath() {
  if (process.env.AGY_ASAR_PATH) return process.env.AGY_ASAR_PATH;
  if (process.platform === 'darwin') return '/Applications/Antigravity.app/Contents/Resources/app.asar';
  if (process.platform === 'win32') {
    const candidates = [
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Antigravity', 'resources', 'app.asar'),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Antigravity', 'resources', 'app.asar'),
      path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Antigravity', 'resources', 'app.asar'),
    ];
    return candidates.find((p) => fs.existsSync(p)) || candidates[0];
  }
  return '/opt/google-antigravity/resources/app.asar';
}

function runNode(scriptPath, args = [], capture = false) {
  return execFileSync(process.execPath, [scriptPath, ...args], {
    stdio: capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
    env: {
      ...process.env,
      ANTIGRAVITY_APP_PATH: process.env.ANTIGRAVITY_APP_PATH || resolveAsarPath(),
    },
  });
}

function getWallpapersStatus() {
  try {
    return { ok: true, out: runNode(wallpapersScript, ['status'], true) };
  } catch (err) {
    const out = `${err.stdout || ''}\n${err.stderr || ''}`;
    return { ok: false, out };
  }
}

function restoreToStock(asarPath, fontBackup, wallpapersBackup) {
  if (fs.existsSync(fontBackup)) {
    runNode(fontScript, ['revert']);
  }
  if (fs.existsSync(wallpapersBackup)) {
    try {
      runNode(wallpapersScript, ['restore']);
    } catch {
      const receiptPath = `${asarPath}.ascii-wallpapers.json`;
      fs.copyFileSync(wallpapersBackup, asarPath);
      if (fs.existsSync(receiptPath)) fs.rmSync(receiptPath, { force: true });
      console.log('Restored stock app.asar from ascii-wallpapers.backup.');
    }
  }
  if (fs.existsSync(fontBackup)) {
    fs.rmSync(fontBackup, { force: true });
  }
}

const mode = process.argv[2] || 'apply';
const asarPath = resolveAsarPath();
const fontBackup = `${asarPath}.font-backup`;
const wallpapersBackup = `${asarPath}.ascii-wallpapers.backup`;

if (mode === 'revert') {
  restoreToStock(asarPath, fontBackup, wallpapersBackup);
  console.log('Reverted Antigravity to stock.');
  process.exit(0);
}

const { out: statusOut } = getWallpapersStatus();
process.stdout.write(statusOut);

if (/already installed|already contains wallpapers/i.test(statusOut)) {
  console.log('Existing mod detected. Restoring stock archive before re-applying...');
  restoreToStock(asarPath, fontBackup, wallpapersBackup);
}

if (fs.existsSync(fontBackup)) {
  fs.rmSync(fontBackup, { force: true });
}

runNode(wallpapersScript, ['install']);
runNode(fontScript, []);
