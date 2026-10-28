// Lightweight hash-based router helpers to persist and restore views without external libs
// This keeps the URL stable on refresh and supports deep-linking to sections

export type Role = 'admin' | 'educator' | 'guest';

const STORAGE_KEYS = {
  educatorView: 'router.educator.view',
  educatorCtx: 'router.educator.ctx',
  adminView: 'router.admin.view',
  adminCtx: 'router.admin.ctx',
  lastRoute: 'router.last',
};

export interface RouteState {
  role: Role;
  view?: string;
  ctx?: any;
}

function scrollKey(role: Role, view?: string) {
  return `router.scroll.${role}.${view || 'root'}`;
}

function saveScroll(role: Role, view?: string) {
  try {
    const key = scrollKey(role, view);
    const pos = { x: window.scrollX, y: window.scrollY };
    sessionStorage.setItem(key, JSON.stringify(pos));
  } catch {}
}

function restoreScroll(role: Role, view?: string) {
  try {
    const key = scrollKey(role, view);
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    const pos = JSON.parse(raw);
    if (typeof pos?.y === 'number' && typeof pos?.x === 'number') {
      window.scrollTo(pos.x, pos.y);
    }
  } catch {}
}

function setHash(path: string, preserveSearch: boolean = true) {
  const clean = path.startsWith('/') ? path : `/${path.replace(/^#/, '')}`;
  const search = preserveSearch ? window.location.search : '';
  const fullUrl = clean + search;
  if ((window.location.pathname + window.location.search) !== fullUrl) {
    window.history.replaceState({}, '', fullUrl);
    window.dispatchEvent(new Event('locationchange'));
  }
  try { sessionStorage.setItem(STORAGE_KEYS.lastRoute, fullUrl); } catch {}
}

function parseHash(): RouteState {
  const path = (window.location.pathname || '/').split('?')[0];
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { role: 'guest' };
  const role = (parts[0] === 'admin' ? 'admin' : parts[0] === 'educator' ? 'educator' : 'guest') as Role;
  const view = parts[1];
  let ctx: any = undefined;
  try {
    const ctxRaw = sessionStorage.getItem(role === 'admin' ? STORAGE_KEYS.adminCtx : STORAGE_KEYS.educatorCtx);
    if (ctxRaw) ctx = JSON.parse(ctxRaw);
  } catch {}
  return { role, view, ctx };
}

export function saveEducatorRoute(view: string, ctx?: any) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.educatorView, view);
    if (ctx !== undefined) sessionStorage.setItem(STORAGE_KEYS.educatorCtx, JSON.stringify(ctx));
  } catch {}
  setHash(`/educator/${view}`);
}

export function loadEducatorRoute(): { view: string; ctx: any } {
  let view = 'dashboard';
  let ctx: any = undefined;
  const { role, view: hv, ctx: hctx } = parseHash();
  if (role === 'educator') {
    view = hv || (sessionStorage.getItem(STORAGE_KEYS.educatorView) || 'dashboard');
    ctx = hctx;
  } else {
    const stored = sessionStorage.getItem(STORAGE_KEYS.educatorView);
    if (stored) view = stored;
    try { const raw = sessionStorage.getItem(STORAGE_KEYS.educatorCtx); if (raw) ctx = JSON.parse(raw); } catch {}
  }
  return { view, ctx };
}

export function saveAdminRoute(view: string, ctx?: any) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.adminView, view);
    if (ctx !== undefined) sessionStorage.setItem(STORAGE_KEYS.adminCtx, JSON.stringify(ctx));
  } catch {}
  setHash(`/admin/${view}`);
}

export function loadAdminRoute(): { view: string; ctx: any } {
  let view = 'dashboard';
  let ctx: any = undefined;
  const { role, view: hv, ctx: hctx } = parseHash();
  if (role === 'admin') {
    view = hv || (sessionStorage.getItem(STORAGE_KEYS.adminView) || 'dashboard');
    ctx = hctx;
  } else {
    const stored = sessionStorage.getItem(STORAGE_KEYS.adminView);
    if (stored) view = stored;
    try { const raw = sessionStorage.getItem(STORAGE_KEYS.adminCtx); if (raw) ctx = JSON.parse(raw); } catch {}
  }
  // A logged-out admin is kept on /admin/login; once authenticated, that stale
  // auth view must resolve to the dashboard instead of a "view not found".
  if (view === 'login') view = 'dashboard';
  return { view, ctx };
}

export function goToLanding() {
  setHash('/');
}

export function goToAdminLogin() {
  setHash('/admin/login');
}

export function goToEducatorLogin() {
  setHash('/educator/login');
}

export function goToEducatorRegister() {
  setHash('/educator/register');
}

export function restoreLastRoute() {
  try {
    const last = sessionStorage.getItem(STORAGE_KEYS.lastRoute);
    if (last) setHash(last);
  } catch {}
}

export function onHashChange(cb: (state: RouteState) => void) {
  const handler = () => cb(parseHash());
  window.addEventListener('popstate', handler);
  window.addEventListener('locationchange', handler);
  return () => {
    window.removeEventListener('popstate', handler);
    window.removeEventListener('locationchange', handler);
  };
}

export function initNavigationPersistence() {
  const onChange = () => {
    const { role, view } = parseHash();
    saveScroll(role, view);
  };
  window.addEventListener('popstate', onChange);
  window.addEventListener('locationchange', onChange);
  window.addEventListener('beforeunload', onChange);
  const { role, view } = parseHash();
  restoreScroll(role, view);
}
