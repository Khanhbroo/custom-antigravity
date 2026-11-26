import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import asar from '@electron/asar';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Resolve app.asar path across macOS, Windows (user & system installs), and Linux. */
function resolveDefaultAsarPath() {
  if (process.env.AGY_ASAR_PATH) return process.env.AGY_ASAR_PATH;

  if (process.platform === 'darwin') {
    return '/Applications/Antigravity.app/Contents/Resources/app.asar';
  }

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

const ASAR_PATH = resolveDefaultAsarPath();
const BACKUP_PATH = `${ASAR_PATH}.font-backup`;
const HOME_CSS_PATH = path.join(os.homedir(), '.antigravity-custom-font.css');
const REPO_CSS_PATH = path.join(__dirname, 'custom-font.css');

const START_MARKER = '/* AGY-CUSTOM-FONT-START */';
const END_MARKER = '/* AGY-CUSTOM-FONT-END */';

/** Strip existing font/cursor injection block from preload.js if present. */
function stripExistingPatch(content) {
  const startIdx = content.indexOf(START_MARKER);
  const endIdx = content.indexOf(END_MARKER);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = content.slice(0, startIdx).replace(/\n+$/, '');
    const after = content.slice(endIdx + END_MARKER.length).replace(/^\n+/, '');
    return after ? `${before}\n${after}` : `${before}\n`;
  }
  return content;
}

/** Build the self-contained font + GPU-accelerated smooth-caret injector. */
function buildSnippet(cssText) {
  const serializedCss = JSON.stringify(cssText);
  return `
${START_MARKER}
;(function(){
  const CSS_TEXT = ${serializedCss};
  const CARET_CSS = \`
    .agy-caret-hidden {
      caret-color: transparent !important;
    }
    #agy-smooth-caret {
      position: fixed;
      top: 0;
      left: 0;
      width: 2px;
      pointer-events: none;
      z-index: 2147483647;
      opacity: 0;
      will-change: transform, opacity;
      transition:
        transform 80ms cubic-bezier(0.22, 1, 0.36, 1),
        height 80ms ease,
        opacity 100ms ease;
    }
    #agy-smooth-caret-bar {
      width: 100%;
      height: 100%;
      border-radius: 1.5px;
      transform-origin: center center;
    }
    #agy-smooth-caret.blinking #agy-smooth-caret-bar {
      animation: agy-caret-expand 1.05s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    @keyframes agy-caret-expand {
      0%, 38% { transform: scaleY(1); opacity: 1; }
      50%, 88% { transform: scaleY(0.15); opacity: 0.35; }
      100% { transform: scaleY(1); opacity: 1; }
    }
  \`;

  function injectStyles() {
    const target = document.head || document.documentElement;
    if (!target) return;
    let fontEl = document.getElementById('agy-custom-font-style');
    if (!fontEl) {
      fontEl = document.createElement('style');
      fontEl.id = 'agy-custom-font-style';
      target.appendChild(fontEl);
    }
    if (fontEl.textContent !== CSS_TEXT) fontEl.textContent = CSS_TEXT;

    let caretStyle = document.getElementById('agy-smooth-caret-style');
    if (!caretStyle) {
      caretStyle = document.createElement('style');
      caretStyle.id = 'agy-smooth-caret-style';
      caretStyle.textContent = CARET_CSS;
      target.appendChild(caretStyle);
    }
  }

  function installSmoothCaret() {
    let caretEl = null;
    let barEl = null;
    let isVisible = false;
    let activeEl = null;
    let cachedStyleKey = '';
    let cachedColor = '#a78bfa';
    let cachedLineH = 18;
    let blinkTimer = null;
    let mirror = null;
    let rafId = 0;
    let pendingTyping = false;

    function ensureCaretEl() {
      if (!caretEl || !caretEl.isConnected) {
        caretEl = document.createElement('div');
        caretEl.id = 'agy-smooth-caret';
        barEl = document.createElement('div');
        barEl.id = 'agy-smooth-caret-bar';
        caretEl.appendChild(barEl);
        (document.body || document.documentElement).appendChild(caretEl);
        isVisible = false;
      }
      return caretEl;
    }

    function hideCaret() {
      if (activeEl) {
        activeEl.classList.remove('agy-caret-hidden');
      }
      if (caretEl) {
        caretEl.style.opacity = '0';
        caretEl.classList.remove('blinking');
      }
      isVisible = false;
    }

    function syncMirrorStyles(el) {
      const key = el.tagName + ':' + el.clientWidth + ':' + el.clientHeight + ':' + el.className;
      if (key === cachedStyleKey && mirror) return;
      cachedStyleKey = key;

      el.classList.remove('agy-caret-hidden');
      const cs = getComputedStyle(el);
      let color = cs.caretColor;
      if (!color || color === 'auto' || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
        color = cs.color || '#a78bfa';
      }
      cachedColor = color;
      cachedLineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.35 || 18;

      if (!mirror) {
        mirror = document.createElement('div');
        mirror.style.position = 'fixed';
        mirror.style.visibility = 'hidden';
        mirror.style.pointerEvents = 'none';
        mirror.style.top = '-9999px';
        mirror.style.left = '-9999px';
        document.body.appendChild(mirror);
      }

      const props = [
        'boxSizing', 'width', 'overflowX', 'overflowY',
        'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
        'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent',
        'letterSpacing', 'wordSpacing', 'tabSize', 'whiteSpace', 'wordWrap', 'overflowWrap'
      ];
      for (const p of props) mirror.style[p] = cs[p];
      mirror.style.height = 'auto';
      if (el.tagName === 'INPUT') {
        mirror.style.whiteSpace = 'pre';
        mirror.style.overflowWrap = 'normal';
      }
    }

    function getInputCaretRect(el) {
      if (el.selectionStart !== el.selectionEnd) return null;
      syncMirrorStyles(el);

      const pos = typeof el.selectionEnd === 'number' ? el.selectionEnd : 0;
      const value = el.value || '';
      mirror.textContent = value.slice(0, pos);
      const marker = document.createElement('span');
      marker.textContent = value.slice(pos) || '.';
      mirror.appendChild(marker);

      const elRect = el.getBoundingClientRect();
      const markerTop = marker.offsetTop - el.scrollTop;
      const markerLeft = marker.offsetLeft - el.scrollLeft;
      const h = Math.min(Math.max(marker.offsetHeight || cachedLineH, 14), cachedLineH * 1.25);

      return {
        left: elRect.left + markerLeft,
        top: elRect.top + markerTop,
        height: h
      };
    }

    function getContentEditableCaretRect(el) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;
      syncMirrorStyles(el);
      const range = sel.getRangeAt(0).cloneRange();
      range.collapse(true);
      const rects = range.getClientRects();
      if (rects.length > 0 && rects[0].height > 0) {
        return { left: rects[0].left, top: rects[0].top, height: rects[0].height };
      }
      const bRect = range.getBoundingClientRect();
      if (bRect && bRect.height > 0) {
        return { left: bRect.left, top: bRect.top, height: bRect.height };
      }
      const span = document.createElement('span');
      span.textContent = '\\u200b';
      range.insertNode(span);
      const r = span.getBoundingClientRect();
      const parent = span.parentNode;
      span.remove();
      if (parent) parent.normalize();
      if (r && r.height > 0) {
        return { left: r.left, top: r.top, height: r.height };
      }
      return null;
    }

    function isEditable(el) {
      if (!el || el.nodeType !== 1) return false;
      if (el.tagName === 'TEXTAREA') return !el.readOnly && !el.disabled;
      if (el.tagName === 'INPUT') {
        const t = (el.type || 'text').toLowerCase();
        return ['text', 'search', 'url', 'email', 'password', 'tel'].includes(t) && !el.readOnly && !el.disabled;
      }
      return el.isContentEditable;
    }

    function updateCaret(isTyping) {
      const el = document.activeElement;
      if (!isEditable(el)) {
        hideCaret();
        activeEl = null;
        return;
      }

      if (activeEl !== el) {
        if (activeEl) activeEl.classList.remove('agy-caret-hidden');
        activeEl = el;
        cachedStyleKey = '';
      }

      const rect = el.isContentEditable ? getContentEditableCaretRect(el) : getInputCaretRect(el);
      if (!rect || !Number.isFinite(rect.left) || !Number.isFinite(rect.top) || rect.height <= 0) {
        hideCaret();
        return;
      }

      el.classList.add('agy-caret-hidden');

      const c = ensureCaretEl();
      const x = Math.round(rect.left);
      const y = Math.round(rect.top);
      if (!isVisible) {
        c.style.transition = 'none';
        c.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        c.style.height = Math.round(rect.height) + 'px';
        void c.offsetWidth;
        c.style.transition = '';
        isVisible = true;
      } else {
        c.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        c.style.height = Math.round(rect.height) + 'px';
      }
      if (barEl) {
        barEl.style.backgroundColor = cachedColor;
        barEl.style.boxShadow = '0 0 6px ' + cachedColor;
      }
      c.style.opacity = '1';

      if (isTyping) {
        c.classList.remove('blinking');
        clearTimeout(blinkTimer);
        blinkTimer = setTimeout(() => {
          if (caretEl && activeEl === document.activeElement) {
            caretEl.classList.add('blinking');
          }
        }, 420);
      } else if (!blinkTimer) {
        c.classList.add('blinking');
      }
    }

    function scheduleUpdate(isTyping) {
      if (isTyping) pendingTyping = true;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const typing = pendingTyping;
        pendingTyping = false;
        updateCaret(typing);
      });
    }

    document.addEventListener('focusin', () => scheduleUpdate(false), true);
    document.addEventListener('focusout', () => setTimeout(() => {
      if (!isEditable(document.activeElement)) hideCaret();
    }, 30), true);
    document.addEventListener('input', () => scheduleUpdate(true), true);
    document.addEventListener('paste', () => {
      setTimeout(() => {
        cachedStyleKey = '';
        scheduleUpdate(true);
      }, 30);
    }, true);
    document.addEventListener('keydown', () => scheduleUpdate(true), true);
    document.addEventListener('keyup', () => scheduleUpdate(true), true);
    document.addEventListener('mouseup', () => {
      if (isEditable(document.activeElement)) scheduleUpdate(false);
    }, true);
    document.addEventListener('selectionchange', () => {
      if (isEditable(document.activeElement)) scheduleUpdate(false);
    }, true);
    document.addEventListener('scroll', () => {
      if (isEditable(document.activeElement)) scheduleUpdate(false);
    }, { capture: true, passive: true });
    window.addEventListener('resize', () => {
      cachedStyleKey = '';
      if (isEditable(document.activeElement)) scheduleUpdate(false);
    }, { passive: true });
  }

  function boot() {
    injectStyles();
    installSmoothCaret();
    setTimeout(injectStyles, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
${END_MARKER}
`;
}

async function run() {
  const mode = process.argv[2] || 'apply';

  if (!fs.existsSync(ASAR_PATH)) {
    console.error(`Could not find app.asar at: ${ASAR_PATH}`);
    console.error('Set AGY_ASAR_PATH to specify a custom location.');
    process.exit(1);
  }

  if (mode === 'revert') {
    if (!fs.existsSync(BACKUP_PATH)) {
      console.error(`Backup file not found: ${BACKUP_PATH}`);
      process.exit(1);
    }
    fs.copyFileSync(BACKUP_PATH, ASAR_PATH);
    console.log('Successfully restored app.asar from app.asar.font-backup.');
    return;
  }

  if (!fs.existsSync(HOME_CSS_PATH) && fs.existsSync(REPO_CSS_PATH)) {
    fs.copyFileSync(REPO_CSS_PATH, HOME_CSS_PATH);
    console.log(`Created default CSS config at: ${HOME_CSS_PATH}`);
  }

  const cssSource = fs.existsSync(HOME_CSS_PATH) ? HOME_CSS_PATH : REPO_CSS_PATH;
  if (!fs.existsSync(cssSource)) {
    console.error('CSS configuration file not found.');
    process.exit(1);
  }

  if (!fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(ASAR_PATH, BACKUP_PATH);
    console.log(`Created backup at: ${BACKUP_PATH}`);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-asar-'));
  try {
    asar.extractAll(ASAR_PATH, tmpDir);
    const preloadPath = path.join(tmpDir, 'dist', 'preload.js');
    if (!fs.existsSync(preloadPath)) {
      throw new Error('dist/preload.js not found inside app.asar');
    }

    const cssText = fs.readFileSync(cssSource, 'utf8');
    const rawPreload = fs.readFileSync(preloadPath, 'utf8');
    const cleanedPreload = stripExistingPatch(rawPreload);
    const nextPreload = cleanedPreload + buildSnippet(cssText);

    fs.writeFileSync(preloadPath, nextPreload, 'utf8');

    const tmpAsar = `${ASAR_PATH}.tmp`;
    await asar.createPackage(tmpDir, tmpAsar);
    fs.renameSync(tmpAsar, ASAR_PATH);
    console.log('Successfully patched font & smooth cursor animation into Antigravity!');
  } catch (err) {
    if (err && (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES')) {
      console.error('Permission denied or file is locked. Close Antigravity completely (and run as Administrator on Windows if needed), then try again.');
    }
    throw err;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error('Patch failed:', err);
  process.exit(1);
});
