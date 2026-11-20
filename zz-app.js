/* ZyeemZia app layer: install as an app, and smart updates.  Copyright © ZyeemZia
 *
 * One self-contained file shared by ai.zyeemzia.com and academy.zyeemzia.com.
 * Load it with:  <script src="/zz-app.js" data-sw="/sw.js" data-name="ZyeemZia AI" defer></script>
 *
 *  - INSTALL: Android, Windows, ChromeOS and macOS Chrome/Edge get the browser's
 *    real install prompt behind our own button. iOS has no such prompt in any
 *    browser, so there the button opens the exact Add to Home Screen steps for
 *    the browser in use. Hidden once installed.
 *  - UPDATES: a new release installs quietly in the background. When it is
 *    ready, a small bar offers "Update now"; nothing reloads under the user's
 *    hands. Checks again whenever the app comes back to the foreground.
 *  - RECOVERY: opening any page with ?nosw=1 removes the worker and its caches.
 *
 * Everything is wrapped so that a browser without these features simply shows
 * nothing extra. It never throws into the page. */
(() => {
  'use strict';
  if (window.__zzApp) return; window.__zzApp = true;
  const me = document.currentScript;
  const SW = (me && me.dataset.sw) || '/sw.js';
  const NAME = (me && me.dataset.name) || document.title.split(/[·|—-]/)[0].trim();
  /* The app icon's version. A phone copies the icon when the app is installed
     and never fetches it again, whatever the site changes, so when an installed
     copy is older than this the app says so, once, and shows how to refresh it. */
  const ICONV = (me && me.dataset.icon) || '';

  const css = `
.zz-btn{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(212,175,85,.55);background:linear-gradient(135deg,rgba(212,175,85,.18),rgba(96,165,250,.14));color:inherit;font-family:inherit;font-size:.9rem;font-weight:600;line-height:1;padding:9px 14px;border-radius:999px;cursor:pointer;white-space:nowrap;transition:transform .15s,box-shadow .2s}
.zz-btn:hover{box-shadow:0 0 0 3px rgba(212,175,85,.18),0 0 22px rgba(212,175,85,.25);transform:translateY(-1px)}
.zz-btn:focus-visible{outline:2px solid #d4af55;outline-offset:2px}
.zz-btn svg{width:17px;height:17px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.zz-btn[hidden]{display:none!important}
.zz-float{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:900;background:#0d1024;color:#f3e7c4;box-shadow:0 10px 30px -8px rgba(0,0,0,.55)}
.zz-bar{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translate(-50%,150%);z-index:1000;display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 32px);padding:10px 12px 10px 16px;border-radius:16px;background:#0d1024;color:#eef1ff;border:1px solid rgba(212,175,85,.45);box-shadow:0 16px 44px -10px rgba(0,0,0,.6),0 0 30px -8px rgba(212,175,85,.35);font:500 .92rem/1.35 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;transition:transform .35s cubic-bezier(.2,.9,.3,1.2)}
.zz-bar.on{transform:translate(-50%,0)}
.zz-bar b{color:#f0d68a}
.zz-bar .zz-go{background:linear-gradient(135deg,#e2b95c,#b8862f);color:#1a1205;border:0;font-weight:700;padding:9px 16px;border-radius:999px;cursor:pointer;font-family:inherit}
.zz-bar .zz-x{background:none;border:0;color:#9aa3c7;font-size:1.3rem;line-height:1;cursor:pointer;padding:4px 6px}
.zz-dot{width:9px;height:9px;border-radius:50%;background:#56e0ff;box-shadow:0 0 10px #56e0ff;animation:zzp 1.6s infinite}
@keyframes zzp{50%{opacity:.35}}
.zz-dlg{border:0;padding:0;background:transparent;max-width:min(440px,calc(100vw - 32px));width:100%}
.zz-dlg::backdrop{background:rgba(3,4,12,.62);backdrop-filter:blur(4px)}
.zz-card{position:relative;padding:26px 24px 22px;border-radius:22px;background:radial-gradient(120% 90% at 50% 0,#1b2150,#0b0d20 70%);color:#eef1ff;border:1px solid rgba(212,175,85,.4);box-shadow:0 30px 80px -20px rgba(0,0,0,.7);font:400 .96rem/1.55 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}
.zz-card img{display:block;width:76px;height:76px;margin:0 auto 12px;border-radius:50%;box-shadow:0 0 32px rgba(212,175,85,.45)}
.zz-card h2{margin:0 0 4px;text-align:center;font-size:1.25rem;color:#f3e7c4}
.zz-card .zz-sub{margin:0 0 16px;text-align:center;color:#aab2d8;font-size:.9rem}
.zz-card ol{margin:0 0 16px;padding-left:1.3em}.zz-card li{margin:6px 0}
.zz-card ul{list-style:none;margin:0 0 18px;padding:0;display:grid;gap:6px;color:#cfd5f2;font-size:.9rem}
.zz-card ul li::before{content:'✦ ';color:#e2b95c}
.zz-card .zz-ok{display:block;width:100%;background:linear-gradient(135deg,#e2b95c,#b8862f);color:#1a1205;border:0;font-weight:700;padding:12px;border-radius:12px;cursor:pointer;font-family:inherit;font-size:1rem}
.zz-card .zz-close{position:absolute;top:10px;right:12px;background:none;border:0;color:#9aa3c7;font-size:1.5rem;cursor:pointer}
@media (prefers-reduced-motion:reduce){.zz-bar,.zz-btn{transition:none}.zz-dot{animation:none}}`;

  const ICON = {
    phone: '<svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10.5 18.5h3"/></svg>',
    desktop: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 15V3M8.5 6.5L12 3l3.5 3.5"/><path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>'
  };
  const store = {
    get(k) { try { return localStorage.getItem('zz-app-' + k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem('zz-app-' + k, v); } catch { /* not available */ } }
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  function standalone() {
    try { return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: window-controls-overlay)').matches || navigator.standalone === true; }
    catch { return false; }
  }
  function ios() {
    const ua = navigator.userAgent || '';
    const is = /iP(hone|od|ad)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const m = ua.match(/OS (\d+)[._](\d+)/);
    const ver = m ? +m[1] + +m[2] / 100 : 0;
    const app = /CriOS/.test(ua) ? 'chrome' : /FxiOS/.test(ua) ? 'firefox' : /EdgiOS/.test(ua) ? 'edge' : /OPiOS|OPT\//.test(ua) ? 'opera' : 'safari';
    return { is, ver, app, ok: is && (app === 'safari' || ver >= 16.04) };
  }
  function kind() {
    if (ios().is) return 'ios';
    const ua = navigator.userAgent || '';
    if (/Android/.test(ua)) return 'android';
    if (/Windows NT/.test(ua)) return 'windows';
    if (/Macintosh/.test(ua)) return 'mac';
    return 'desktop';
  }
  const FACE = {
    ios: ['Add to Home Screen', 'share'], android: ['Install app', 'phone'],
    windows: ['Install on Windows', 'desktop'], mac: ['Install on Mac', 'desktop'], desktop: ['Install app', 'desktop']
  };
  function iosSteps(app) {
    if (app === 'chrome') return ['Tap the <b>⋯</b> button at the bottom right (or top right).', 'Choose <b>Share…</b>.', 'Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.'];
    if (app === 'edge') return ['Tap the <b>⋯</b> button in the bottom bar.', 'Choose <b>Share</b>.', 'Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.'];
    if (app === 'firefox') return ['Tap the <b>⋯</b> button at the bottom right.', 'Tap <b>Share</b>.', 'Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.'];
    if (app === 'opera') return ['Open the browser menu.', 'Choose <b>Share</b>.', 'Tap <b>Add to Home Screen</b>, then <b>Add</b>.'];
    return ['Tap the <b>Share</b> button: the square with an arrow pointing up, in Safari’s toolbar.', 'Scroll down and tap <b>Add to Home Screen</b>.', 'Tap <b>Add</b>. ' + esc(NAME) + ' appears on your Home Screen.'];
  }
  function iconUrl() {
    const l = document.querySelector('link[rel="apple-touch-icon"]') || document.querySelector('link[rel~="icon"][sizes="192x192"]');
    return l ? l.href : '';
  }

  let prompt = null, btn = null, dlg = null, bar = null;

  function paint() {
    if (!btn) return;
    const f = FACE[kind()] || FACE.desktop;
    btn.innerHTML = ICON[f[1]] + '<span>' + f[0] + '</span>';
    btn.setAttribute('aria-label', f[0] + ': ' + NAME);
    btn.hidden = standalone() || (!prompt && !ios().ok);
  }

  function dialog(html) {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'zz-dlg';
      dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('.zz-close,.zz-ok')) dlg.close(); });
      document.body.appendChild(dlg);
    }
    dlg.innerHTML = '<div class="zz-card"><button class="zz-close" aria-label="Close">&times;</button>' + html + '</div>';
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }

  async function install() {
    if (prompt) {
      const p = prompt; prompt = null;
      try { await p.prompt(); await p.userChoice; } catch { /* dismissed */ }
      paint(); return;
    }
    const i = ios();
    if (i.ok) {
      const img = iconUrl();
      dialog((img ? '<img src="' + esc(img) + '" alt="">' : '') +
        '<h2>Install ' + esc(NAME) + '</h2><p class="zz-sub">Free, no sign-up, about the size of a photo.</p>' +
        '<ol>' + iosSteps(i.app).map(s => '<li>' + s + '</li>').join('') + '</ol>' +
        '<ul><li>Opens full screen, like any app</li><li>Pages open even without signal</li><li>Updates itself, nothing to download</li></ul>' +
        '<button class="zz-ok">Got it</button>');
      if (ICONV) store.set('icon', ICONV);
      return;
    }
    paint();
  }

  /* ---------- the update bar ---------- */
  function offerUpdate(reg) {
    if (!reg || !reg.waiting || !navigator.serviceWorker.controller) return;
    showBar(() => {
      const w = reg.waiting;
      if (w) { store.set('updating', '1'); w.postMessage({ type: 'skip-waiting' }); } else location.reload();
      setTimeout(() => location.reload(), 4000);   // belt and braces if controllerchange never fires
    });
  }
  function showBar(go, text, label) {
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'zz-bar'; bar.setAttribute('role', 'status'); bar.setAttribute('aria-live', 'polite');
      document.body.appendChild(bar);
    }
    bar.innerHTML = '<span class="zz-dot" aria-hidden="true"></span><span>' + (text || 'A new version of <b>' + esc(NAME) + '</b> is ready.') + '</span>' +
      '<button class="zz-go" type="button">' + (label || 'Update now') + '</button><button class="zz-x" type="button" aria-label="Later">&times;</button>';
    bar.querySelector('.zz-go').onclick = () => {
      if (!label) bar.querySelector('.zz-go').textContent = 'Updating…';
      go();
    };
    bar.querySelector('.zz-x').onclick = () => bar.classList.remove('on');
    /* Not requestAnimationFrame: a tab in the background never runs it, and the
       bar must be there when the user comes back. A forced layout gives the
       slide-in its starting point. */
    void bar.offsetWidth;
    bar.classList.add('on');
  }

  /* ---------- a new app icon ---------- */
  function iconSteps() {
    const k = kind();
    if (k === 'ios') return ['Press and hold the ' + esc(NAME) + ' icon on your Home Screen, then choose <b>Remove App</b>.', 'Open this site in Safari.', 'Tap <b>Share</b>, then <b>Add to Home Screen</b>.'];
    if (k === 'android') return ['Press and hold the ' + esc(NAME) + ' icon, then choose <b>Uninstall</b> or drag it to <b>Uninstall</b>.', 'Open this site in Chrome.', 'Tap <b>Install app</b> at the top of the page.'];
    return ['In the app window, open the <b>⋯</b> menu and choose <b>Uninstall</b>.', 'Open this site in your browser.', 'Click <b>Install</b> at the top of the page.'];
  }
  function checkIcon() {
    if (!ICONV || !standalone()) return;
    const had = store.get('icon');
    if (had === ICONV || store.get('icon-told') === ICONV) return;
    showBar(() => {
      const img = iconUrl();
      dialog((img ? '<img src="' + esc(img) + '" alt="">' : '') +
        '<h2>Get the new icon</h2><p class="zz-sub">' + esc(NAME) + ' has a fresh app icon. Phones keep the icon from the day an app was installed, so reinstall once to see it. Nothing is lost: your progress stays in this browser.</p>' +
        '<ol>' + iconSteps().map(s => '<li>' + s + '</li>').join('') + '</ol>' +
        '<button class="zz-ok">Got it</button>');
      store.set('icon-told', ICONV); bar.classList.remove('on');
    }, '<b>' + esc(NAME) + '</b> has a new app icon.', 'How to get it');
    bar.querySelector('.zz-x').onclick = () => { store.set('icon-told', ICONV); bar.classList.remove('on'); };
  }

  async function nuke() {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      if (window.caches) await Promise.all((await caches.keys()).map(n => caches.delete(n)));
    } catch { /* nothing to remove */ }
  }

  function start() {
    try {
      const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
      const host = document.querySelector('[data-zz-install]');
      btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'zz-btn' + (host ? '' : ' zz-float'); btn.hidden = true;
      btn.addEventListener('click', install);
      (host || document.body).appendChild(btn);
      document.querySelectorAll('[data-zz-install-link]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); install(); }));
      paint();
      setTimeout(checkIcon, 2500);
    } catch { /* page still works */ }

    if (!('serviceWorker' in navigator) || !/^https:$/.test(location.protocol) && location.hostname !== 'localhost') return;
    let off = false;
    try { off = new URLSearchParams(location.search).get('nosw') === '1'; } catch { /* old browser */ }
    if (off) { nuke(); return; }

    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading || !store.get('updating')) return;
      reloading = true; store.set('updating', ''); location.reload();
    });
    navigator.serviceWorker.register(SW).then(reg => {
      const watch = w => w && w.addEventListener('statechange', () => { if (w.state === 'installed') offerUpdate(reg); });
      offerUpdate(reg);
      watch(reg.installing);
      reg.addEventListener('updatefound', () => watch(reg.installing));
      const check = () => { if (document.visibilityState === 'visible' && navigator.onLine !== false) reg.update().catch(() => {}); };
      document.addEventListener('visibilitychange', check);
      setInterval(check, 30 * 60 * 1000);
    }).catch(() => { /* online-only, which is fine */ });
    /* A worker that keeps its own file unchanged across releases (a site with no
       build step) instead compares each fresh page with its cached copy and says
       so; the fresh copy is already cached, so a reload is the whole update. */
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data && e.data.type === 'sw-update') showBar(() => location.reload());
    });
  }

  addEventListener('beforeinstallprompt', e => { e.preventDefault(); prompt = e; paint(); });
  addEventListener('appinstalled', () => { prompt = null; paint(); if (ICONV) store.set('icon', ICONV); if (dlg && dlg.open) dlg.close(); });
  try { matchMedia('(display-mode: standalone)').addEventListener('change', paint); } catch { /* old browser */ }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
