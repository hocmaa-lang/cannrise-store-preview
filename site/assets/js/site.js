/* CANNRISE "First Light" demo — vanilla JS. No tracking, no network calls, nothing is submitted anywhere. */
(() => {
'use strict';
const D = document, R = D.documentElement.dataset.root || '', CR = window.CR || {products: []};
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer:fine)').matches;
const $ = (s, el = D) => el.querySelector(s), $$ = (s, el = D) => [...el.querySelectorAll(s)];
const money = n => '$' + (Math.round(n * 100) / 100).toFixed(2);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const IM = CR.img || {};
/* ---------- real-footage cards: autoplay muted only while in view, pause off-screen, sound toggle, reduced-motion = poster + play ---------- */
const RF_STILL = RM || !!(navigator.connection && navigator.connection.saveData);
const rfCards = $$('[data-rf]');
const rfVid = c => c.querySelector('video');
const rfActive = c => c.isConnected && !c.closest('.frame:not(.on), [inert], [hidden]');
const rfLoad = c => { const v = rfVid(c); if (!v.getAttribute('poster')) v.poster = v.dataset.poster; };
const rfSrc = c => { const v = rfVid(c); rfLoad(c); if (v.dataset.ok) return; if (!v.dataset.snd) { v.querySelectorAll('source').forEach(s => s.src = s.dataset.src); v.load(); } v.dataset.ok = 1; };
const rfPlay = c => { rfSrc(c); const p = rfVid(c).play(); p && p.catch(() => c.classList.add('paused')); };
function rfSync() { rfCards.forEach(c => { const v = rfVid(c); if (c._near) rfLoad(c); const want = c._vis && rfActive(c) && !c._user && (!RF_STILL || c._go); if (want && v.paused) rfPlay(c); else if (!want && !v.paused) v.pause(); }); }
const rfNear = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target._near = 1; rfLoad(e.target); } }), {rootMargin: '600px 0px'});
const rfSeen = new IntersectionObserver(es => { es.forEach(e => { e.target._vis = e.isIntersecting; }); rfSync(); }, {threshold: .35});
rfCards.forEach(c => {
  const v = rfVid(c), pb = c.querySelector('.rf-play'), sb = c.querySelector('.rf-snd'), lbl = pb.getAttribute('aria-label').replace(/^Play video: /, '');
  const state = () => { const pa = v.paused; c.classList.toggle('paused', pa && !!(RF_STILL || c._user || v.dataset.ok)); pb.setAttribute('aria-label', (pa ? 'Play video: ' : 'Pause video: ') + lbl); };
  v.addEventListener('play', state); v.addEventListener('pause', state); state();
  const toggle = () => { if (v.paused) { c._user = 0; c._go = 1; rfPlay(c); } else { c._user = 1; v.pause(); } };
  pb.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  v.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  sb.addEventListener('click', e => {
    e.stopPropagation(); const on = v.muted;
    if (on) {
      rfCards.forEach(o => { if (o !== c) { rfVid(o).muted = true; const b = o.querySelector('.rf-snd'); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Turn sound on'); } });
      if (!v.dataset.snd) { const t = v.currentTime; v.dataset.snd = 1; v.dataset.ok = 1; v.poster = v.dataset.poster; v.src = v.dataset.sound; v.addEventListener('loadedmetadata', () => { try { v.currentTime = t; } catch (_) {} }, {once: true}); }
      v.muted = false; c._user = 0; c._go = 1; rfPlay(c);
    } else v.muted = true;
    sb.setAttribute('aria-pressed', String(on)); sb.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
  });
  rfNear.observe(c); rfSeen.observe(c);
});
const src = (id, want = 960) => { const m = IM[id]; if (!m) return ''; const w = m.w.find(x => x >= want) || m.w[m.w.length - 1]; return `${R}assets/img/${id}-${w}.webp`; };
const srcset = id => { const m = IM[id]; return m ? m.w.map(w => `${R}assets/img/${id}-${w}.webp ${w}w`).join(', ') : ''; };
const VAR = {}; const PROD = {};
CR.products.forEach(p => { PROD[p.handle] = p; p.variants.forEach(v => { VAR[v.id] = {...v, p}; }); });
const GIFT = CR.gift; // real automatic offer on the live store (3 coco packs -> free 70-pack ties), ends GIFT.ends
const giftLive = () => GIFT && Date.now() < Date.parse(GIFT.ends);
if (!giftLive()) $$('[data-gift]').forEach(e => { e.hidden = true; });

/* ---------- toast ---------- */
let tt; const toast = (html) => { let t = $('.toast'); if (!t) { t = D.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); D.body.append(t); } t.innerHTML = html; requestAnimationFrame(() => t.classList.add('on')); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 3600); };

/* ---------- overlays ---------- */
const scrim = $('.scrim');
let openLayer = null, lastFocus = null;
const open = (el) => { closeAll(); lastFocus = D.activeElement; el.classList.add('on'); el.setAttribute('aria-hidden', 'false'); scrim && scrim.classList.add('on'); openLayer = el; D.body.style.overflow = 'hidden'; const f = el.querySelector('input,button,a,select'); f && setTimeout(() => f.focus(), 60); };
const closeAll = () => { $$('.drawer.on,.modal.on,.filters.on,.soverlay.on').forEach(e => { e.classList.remove('on'); e.setAttribute('aria-hidden', 'true'); }); scrim && scrim.classList.remove('on'); D.body.style.overflow = ''; if (openLayer && lastFocus) lastFocus.focus?.(); openLayer = null; };
scrim && scrim.addEventListener('click', closeAll);
D.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAll(); closeMenu(); } });
D.addEventListener('click', e => { const c = e.target.closest('[data-close]'); if (c) { e.preventDefault(); closeAll(); } });
// focus trap
D.addEventListener('keydown', e => { if (e.key !== 'Tab' || !openLayer) return; const f = $$('a[href],button:not([disabled]),input,select,textarea', openLayer).filter(x => x.offsetParent); if (!f.length) return; if (e.shiftKey && D.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && D.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } });

/* ---------- cart ---------- */
const KEY = 'cannrise_demo_cart';
const Cart = {
  get() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } },
  set(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} render(); },
  add(vid, q = 1) { const c = this.get(); const l = c.find(x => x.v === vid); if (l) l.q = Math.min(99, l.q + q); else c.push({v: vid, q}); this.set(c); },
  qty(vid, q) { let c = this.get(); if (q <= 0) c = c.filter(x => x.v !== vid); else { const l = c.find(x => x.v === vid); if (l) l.q = Math.min(99, q); } this.set(c); },
  lines() { return this.get().filter(l => VAR[l.v]).map(l => ({...l, V: VAR[l.v]})); },
  totals() {
    const ls = this.lines(); const sub = ls.reduce((s, l) => s + l.V.price * l.q, 0);
    const was = ls.reduce((s, l) => s + (l.V.compare || l.V.price) * l.q, 0);
    const n = ls.reduce((s, l) => s + l.q, 0);
    const coco = ls.filter(l => l.V.p.line === 'coco').reduce((s, l) => s + l.q, 0);
    const gift = giftLive() && coco >= 3;
    // Black Friday tiers (2/3/4+ packs -> 10/20/25%), coco and spacers counted separately; free shipping on 4+ coco packs or $99+ after discounts
    const grp = {coco: 0, risers: 0}, gsub = {coco: 0, risers: 0}; ls.forEach(l => { const k = l.V.p.line; if (k in grp) { grp[k] += l.q; gsub[k] += l.V.price * l.q; } });
    const disc = tiersLive() ? Object.keys(grp).reduce((s, k) => s + Math.round(gsub[k] * tierPct(grp[k])) / 100, 0) : 0;
    const net = sub - disc; const free = sub > 0 && (net >= CR.ship.free || coco >= (CR.ship.cocoPacks || 4)); const ship = sub === 0 ? 0 : free ? 0 : CR.ship.flat;
    return {ls, sub, was, n, coco, gift, ship, free, disc, net, grp, total: net + ship};
  }
};
const tierPct = n => n >= 4 ? 25 : n >= 3 ? 20 : n >= 2 ? 10 : 0;
const tiersLive = () => CR.tiers && Date.now() < Date.parse(CR.tiers.ends);
const giftHTML = (t) => {
  if (!giftLive()) return '';
  if (t.gift) return `<div class="gift ok" role="status"><span aria-hidden="true">✓</span><span><b>Free gift unlocked.</b> A 70-pack of Anchor Plant Ties (8 cm) is added free with your 3 packs of coco grow bags. Offer ends ${GIFT.label}.</span></div>`;
  const left = 3 - t.coco;
  return `<div class="gift"><span aria-hidden="true">+</span><span>${t.coco ? `Add <b>${left} more pack${left > 1 ? 's' : ''}</b> of coco grow bags` : 'Buy <b>3 packs</b> of coco grow bags'} and get a 70-pack of plant ties free. Through ${GIFT.label}.</span></div>`;
};
const lineHTML = (l, big) => { const V = l.V; return `<div class="line" data-v="${V.id}"><a href="${R}${V.p.url}?v=${V.id}"><img src="${src(V.img, 240)}" alt="" width="84" height="84" loading="lazy"></a><div><h4><a href="${R}${V.p.url}?v=${V.id}" style="text-decoration:none">${esc(V.p.short)}</a></h4><div class="v">${esc(V.title)}</div><div class="qty" role="group" aria-label="Quantity for ${esc(V.p.short)}"><button type="button" data-q="-1" aria-label="Decrease">−</button><input type="number" inputmode="numeric" min="0" max="99" value="${l.q}" aria-label="Quantity"><button type="button" data-q="1" aria-label="Increase">+</button></div><div><button class="rm" type="button" data-rm>Remove</button></div></div><div class="lp">${money(V.price * l.q)}${V.compare ? `<s>${money(V.compare * l.q)}</s>` : ''}</div></div>`; };
const giftLine = () => { const g = VAR[GIFT.variant]; return g ? `<div class="line"><img src="${src(g.img, 240)}" alt="" width="84" height="84" loading="lazy"><div><h4>${esc(g.p.short)}</h4><div class="v">${esc(g.title)} · free gift</div></div><div class="lp">$0.00<s>${money(g.price)}</s></div></div>` : ''; };
function render() {
  const t = Cart.totals();
  $$('.cart-count').forEach(c => { c.textContent = t.n; c.classList.toggle('has', t.n > 0); c.classList.remove('bump'); void c.offsetWidth; t.n && c.classList.add('bump'); });
  $$('[data-cart-lines]').forEach(box => {
    box.innerHTML = t.ls.length ? t.ls.map(l => lineHTML(l)).join('') + (t.gift ? giftLine() : '') :
      `<div class="empty"><p class="h" style="font-family:var(--f-d)">Your cart is empty.</p><p class="muted">Lift, hold, grow. Start with the piece your garden needs most.</p><a class="btn mt1" href="${R}collections/all.html">Shop all gear</a></div>`;
  });
  $$('[data-cart-gift]').forEach(b => b.innerHTML = t.ls.length ? giftHTML(t) : '');
  const need = Math.max(0, CR.ship.free - t.net), left = Math.max(0, (CR.ship.cocoPacks || 4) - t.coco);
  const shipMsg = t.free ? '✓ This order ships <b>FREE</b>' : t.coco ? `Add <b>${left} more coco pack${left > 1 ? 's' : ''}</b>: 25% off + free shipping <span class="muted">(or spend ${money(need)} more)</span>` : `You're <b>${money(need)}</b> away from free shipping.`;
  const shipPct = t.free ? 100 : Math.min(100, Math.max(t.net / CR.ship.free * 100, t.coco / (CR.ship.cocoPacks || 4) * 100));
  $$('[data-cart-ship]').forEach(b => b.innerHTML = t.ls.length ? `<div class="ship">${shipMsg}<div class="bar"><i style="width:${shipPct}%"></i></div></div>` : '');
  $$('[data-cart-totals]').forEach(b => b.innerHTML = `<div><span>Subtotal (${t.n} item${t.n === 1 ? '' : 's'})</span><span>${money(t.sub)}</span></div>${t.was > t.sub ? `<div class="muted"><span>You save vs. list price</span><span>−${money(t.was - t.sub)}</span></div>` : ''}${t.disc ? `<div><span>Black Friday tiers</span><span>−${money(t.disc)}</span></div>` : ''}<div><span>Shipping</span><span>${t.sub ? (t.ship ? money(t.ship) : 'Free') : '—'}</span></div>${t.gift ? '<div><span>Gift: 70-pack plant ties</span><span>$0.00</span></div>' : ''}<div class="grand"><span>Total (USD)</span><span>${money(t.total)}</span></div>${t.sub && !t.free ? `<p class="small" style="margin:6px 0 0;padding:8px 10px;border:1.5px solid var(--canopy);border-radius:10px;background:#FFF8E6">Free US shipping on 4+ coco packs or any order $99+. Otherwise, a flat $5.99.</p>` : ''}<p class="small muted" style="margin:4px 0 0">Taxes calculated at checkout.</p>`);
  $$('[data-checkout]').forEach(b => b.disabled = !t.ls.length);
}
D.addEventListener('click', e => {
  const q = e.target.closest('.line [data-q]'); if (q) { const l = q.closest('.line'); const inp = $('input', l); Cart.qty(l.dataset.v, (+inp.value || 0) + (+q.dataset.q)); return; }
  const rm = e.target.closest('.line [data-rm]'); if (rm) { Cart.qty(rm.closest('.line').dataset.v, 0); return; }
  const oc = e.target.closest('[data-open-cart]'); if (oc) { e.preventDefault(); const d = $('#cart'); d && open(d); return; }
  const co = e.target.closest('[data-checkout]'); if (co) { e.preventDefault(); const m = $('#demo-modal'); m && open(m); return; }
  const add = e.target.closest('[data-add]'); if (add) { e.preventDefault(); addFx(add, add.dataset.add, +(add.dataset.qty || 1)); }
});
D.addEventListener('change', e => { const i = e.target.closest('.line input'); if (i) Cart.qty(i.closest('.line').dataset.v, Math.max(0, Math.min(99, parseInt(i.value) || 0))); });
function addFx(btn, vid, q) {
  if (!VAR[vid]) return; Cart.add(vid, q);
  const lbl = btn.innerHTML; btn.innerHTML = 'Added ✓'; setTimeout(() => btn.innerHTML = lbl, 1400);
  const V = VAR[vid];
  if (!$('#cart')) return;
  if (D.body.dataset.page === 'cart') { toast(`Added ${esc(V.p.short)}`); return; }
  closeAll(); setTimeout(() => open($('#cart')), 120);
}
window.addEventListener('storage', e => e.key === KEY && render());
render();

/* ---------- header / nav ---------- */
const hdr = $('.hdr'); let lastY = scrollY;
const onScrollHdr = () => { if (!hdr) return; const y = scrollY; hdr.classList.toggle('scrolled', y > 8); const menuOpen = $('.mm.open'); hdr.classList.toggle('hide', y > 420 && y > lastY + 4 && !menuOpen && !openLayer); if (y < lastY - 4) hdr.classList.remove('hide'); lastY = y; };
addEventListener('scroll', onScrollHdr, {passive: true});
$$('.mm').forEach(mm => {
  const b = $('button', mm); let tm;
  const set = o => { mm.classList.toggle('open', o); b.setAttribute('aria-expanded', o); };
  b.addEventListener('click', () => set(!mm.classList.contains('open')));
  if (FINE) { mm.addEventListener('mouseenter', () => { clearTimeout(tm); set(true); }); mm.addEventListener('mouseleave', () => { tm = setTimeout(() => set(false), 160); }); }
  mm.addEventListener('focusout', e => { if (!mm.contains(e.relatedTarget)) set(false); });
});
const mnav = $('.mnav');
function closeMenu() { if (mnav && mnav.classList.contains('open')) { mnav.classList.remove('open'); mnav.setAttribute('aria-hidden', 'true'); $('.burger')?.setAttribute('aria-expanded', 'false'); D.body.style.overflow = ''; } }
$('.burger')?.addEventListener('click', () => { mnav.classList.add('open'); mnav.setAttribute('aria-hidden', 'false'); $('.burger').setAttribute('aria-expanded', 'true'); D.body.style.overflow = 'hidden'; $$('a', mnav).forEach((a, i) => a.style.transitionDelay = (0.18 + i * 0.04) + 's'); setTimeout(() => $('.mclose', mnav)?.focus(), 80); });
$('.mclose')?.addEventListener('click', closeMenu);
// announcement rotator
$$('.ann .rot').forEach(r => { const s = $$('span', r); if (s.length < 2) return; let i = 0; s[0].classList.add('on'); if (!RM) setInterval(() => { s[i].classList.remove('on'); i = (i + 1) % s.length; s[i].classList.add('on'); }, 4500); });

/* ---------- reveal / motion ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin: '0px 0px -8% 0px', threshold: 0.08});
$$('.rv,.mask-img,.split,.sg,.horizon.rv').forEach(el => RM ? el.classList.add('in') : io.observe(el));
// count-up
const cio = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; cio.unobserve(e.target); const el = e.target, to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length; if (RM) { el.textContent = to.toFixed(dec); return; } const t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / 1400), ee = 1 - Math.pow(1 - k, 3); el.textContent = (to * ee).toFixed(dec); k < 1 && requestAnimationFrame(f); }; requestAnimationFrame(f); }), {threshold: .6});
$$('[data-count]').forEach(el => cio.observe(el));
// rays: reveal one by one (the logo's own eleven rays)
$$('.sun').forEach(s => { const rays = $$('.ray', s); if (RM) return; rays.forEach(r => { r.style.transform = 'scaleY(0)'; r.style.opacity = '0'; }); const o = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; o.disconnect(); rays.forEach((r, i) => setTimeout(() => { r.style.transform = ''; r.style.opacity = ''; }, 250 + i * 90)); }, {threshold: .15}); o.observe(s); });
// scroll-linked: hero sunrise, parallax, progress
const hero = $('.hero'), pars = $$('[data-speed]'), prog = $('.progress');
let ticking = false;
const frame = () => {
  ticking = false; const y = scrollY, vh = innerHeight;
  if (hero && !RM) { const k = Math.min(1, y / (hero.offsetHeight || 1)); hero.style.setProperty('--rise', (k * 160).toFixed(1)); hero.style.setProperty('--hs', (1.06 + k * .08).toFixed(3)); }
  if (!RM) pars.forEach(p => { const r = p.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; const c = (r.top + r.height / 2 - vh / 2); p.style.transform = `translate3d(0,${(c * -parseFloat(p.dataset.speed)).toFixed(1)}px,0)`; });
  if (prog) { const a = $('.article') || D.body; const r = a.getBoundingClientRect(); prog.style.setProperty('--p', Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh))).toFixed(3)); }
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, {passive: true}); frame();
// magnetic buttons
if (FINE && !RM) $$('.mag').forEach(b => { b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; }); b.addEventListener('mouseleave', () => { b.style.transition = 'transform .6s cubic-bezier(.2,.7,.1,1)'; b.style.transform = ''; setTimeout(() => b.style.transition = '', 600); }); });
// cursor
if (FINE && !RM) {
  const c = D.createElement('div'); c.className = 'cdot'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<span></span>'; D.body.append(c);
  let x = -100, y = -100, cx = x, cy = y;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; c.classList.add('on'); }, {passive: true});
  D.addEventListener('mouseleave', () => c.classList.remove('on'));
  const loop = () => { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); }; loop();
  D.addEventListener('mouseover', e => { const t = e.target.closest('[data-cursor]'); const l = e.target.closest('a,button,input,select,label,summary'); c.classList.toggle('big', !!t); c.classList.toggle('link', !t && !!l); $('span', c).textContent = t ? t.dataset.cursor : ''; });
}
// lazy background videos (start after load, never on reduced motion / save-data)
const saveData = navigator.connection && navigator.connection.saveData;
const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.dataset.ok) { $$('source', v).forEach(s => s.src = s.dataset.src); v.load(); v.dataset.ok = 1; } v.play().catch(() => {}); } else v.pause(); }), {rootMargin: '200px'});
addEventListener('load', () => { if (RM || saveData || innerWidth < 900) return; const go = () => $$('video[data-lazy]').forEach(v => vio.observe(v)); 'requestIdleCallback' in window ? requestIdleCallback(go, {timeout: 3000}) : setTimeout(go, 1500); });

/* ---------- chapters (sticky story) ---------- */
const story = $('.story');
if (story) {
  const frames = $$('.story-media .frame', story), chs = $$('.chapter', story), bg = story.closest('.ch-bg');
  const so = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const i = chs.indexOf(e.target); frames.forEach((f, j) => { f.classList.toggle('on', i === j); f.inert = i !== j; }); rfSync(); if (bg) bg.style.backgroundColor = e.target.dataset.bg; }), {rootMargin: '-45% 0px -45% 0px'});
  chs.forEach(c => so.observe(c));
}
/* ---------- tabs: problem explorer ---------- */
$$('[role=tablist]').forEach(tl => {
  const tabs = $$('[role=tab]', tl);
  const sel = t => { tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; const p = D.getElementById(x.getAttribute('aria-controls')); p && p.classList.toggle('on', on); p && (p.hidden = !on); }); };
  tabs.forEach((t, i) => { t.addEventListener('click', () => sel(t)); t.addEventListener('keydown', e => { const k = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1}[e.key]; if (k) { e.preventDefault(); const n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); sel(n); } }); });
});
/* ---------- before/after ---------- */
$$('.ba').forEach(b => { const i = $('input', b); const set = v => b.style.setProperty('--p', v + '%'); i.addEventListener('input', () => set(i.value)); set(i.value);
  if (!RM) { const o = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; o.disconnect(); let t0; const f = t => { t0 ??= t; const k = Math.min(1, (t - t0) / 1600); const v = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k); i.value = v; set(v); k < 1 && requestAnimationFrame(f); }; requestAnimationFrame(f); }, {threshold: .5}); o.observe(b); } });
/* ---------- rails ---------- */
$$('[data-rail]').forEach(w => { const r = $('.rail', w); if (!r) return; const step = () => r.clientWidth * .7;
  $('[data-prev]', w)?.addEventListener('click', () => r.scrollBy({left: -step(), behavior: RM ? 'auto' : 'smooth'}));
  $('[data-next]', w)?.addEventListener('click', () => r.scrollBy({left: step(), behavior: RM ? 'auto' : 'smooth'}));
  let down = false, sx, sl, moved = false;
  r.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = r.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; r.classList.add('drag'); } r.scrollLeft = sl - dx; });
  addEventListener('pointerup', () => { down = false; r.classList.remove('drag'); });
  r.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
});

/* ---------- product card helpers ---------- */
const cardOpts = (p, v) => { const o = [];
  if (p.options.length > 1) { p.options[0].values.forEach(c => { const t = p.variants.find(x => x.opts[0] === c && x.opts[1] === v.opts[1]) || p.variants.find(x => x.opts[0] === c); o.push({vid: t.id, color: p.swatch[c], label: c}); });
    p.variants.filter(x => x.opts[0] === v.opts[0]).forEach(x => o.push({vid: x.id, short: x.opts[1].replace(' pack', ''), label: x.title})); }
  else p.variants.forEach(x => o.push({vid: x.id, short: x.short, label: x.title}));
  return o; };
const cardHTML = (p, v) => {
  const save = v.compare ? Math.round((1 - v.price / v.compare) * 100) : 0;
  const sw = p.variants.length > 1 ? `<div class="sw" role="group" aria-label="Options">${cardOpts(p, v).map(o => `<button type="button" aria-pressed="${o.color ? VAR[o.vid].opts[0] === v.opts[0] : o.vid === v.id}" data-swap="${o.vid}" ${o.color ? `class="dot" style="background:${o.color}" aria-label="${esc(o.label)}"` : ''} title="${esc(o.label)}">${o.color ? '' : esc(o.short)}</button>`).join('')}</div>` : '';
  return `<article class="pcard" data-p="${p.handle}" data-v="${v.id}">
   <a class="ph" href="${R}${p.url}?v=${v.id}" tabindex="-1" aria-hidden="true" data-cursor="View">${save ? `<span class="badge sale">Save ${save}%</span>` : ''}<img src="${src(v.img, 640)}" srcset="${srcset(v.img)}" sizes="(max-width:640px) 50vw, 25vw" alt="" loading="lazy" width="600" height="600"><img class="alt" src="${src(p.altImg, 640)}" alt="" loading="lazy" width="600" height="600"></a>
   <button class="btn accent qv" type="button" data-qv="${p.handle}" data-qvv="${v.id}">Quick view</button>
   <span class="eyebrow">${esc(p.lineName)}</span>
   <h3><a href="${R}${p.url}?v=${v.id}">${esc(p.short)}</a></h3>
   <div class="sizetag" style="--sc:${v.size.scale}%"><span>${esc(v.size.label)}</span><span class="rule"><i></i></span></div>
   ${sw}
   <div class="meta"><span class="price">${money(v.price)}${v.compare ? `<s>${money(v.compare)}</s>` : ''}</span><span class="small muted">${esc(v.per || '')}</span></div>
  </article>`;
};
D.addEventListener('click', e => { const s = e.target.closest('[data-swap]'); if (!s) return; e.preventDefault(); const card = s.closest('.pcard'); const p = PROD[card.dataset.p]; const v = VAR[s.dataset.swap]; const n = D.createElement('div'); n.innerHTML = cardHTML(p, v); const nc = n.firstElementChild; nc.style.animation = 'none'; card.replaceWith(nc); $(`[data-swap="${v.id}"]`, nc)?.focus(); });
$$('[data-cards]').forEach(g => { g.innerHTML = g.dataset.cards.split(',').map(h => { const [handle, vid] = h.split(':'); const p = PROD[handle]; return p ? cardHTML(p, VAR[vid] || p.variants[0]) : ''; }).join(''); });

/* ---------- variant picker (shared by PDP + quick view) ---------- */
function picker(root, p, v0, onChange) {
  let cur = v0; const sel = cur.opts.slice();
  const find = () => p.variants.find(v => v.opts.every((o, i) => o === sel[i]));
  const draw = () => {
    root.innerHTML = p.options.map((o, oi) => `<div class="opt"><h2 id="opt-${oi}-${p.handle}"><span>${esc(o.name)}: <span style="text-transform:none;letter-spacing:0;font-weight:500">${esc(sel[oi])}</span></span>${oi === p.options.length - 1 && p.sizeGuide ? '<button type="button" data-sg>Size guide</button>' : ''}</h2><div class="vals" role="radiogroup" aria-labelledby="opt-${oi}-${p.handle}">${o.values.map(val => { const test = sel.slice(); test[oi] = val; const ok = p.variants.some(v => v.opts.every((x, i) => x === test[i])); const sw = p.swatch && p.swatch[val]; const meta = (p.optMeta && p.optMeta[val]) || ''; return `<button type="button" class="val" role="radio" aria-checked="${sel[oi] === val}" data-oi="${oi}" data-val="${esc(val)}" ${ok ? '' : 'disabled style="opacity:.4"'}>${sw ? `<span class="sq" style="background:${sw}"></span>` : ''}${esc(p.optLabel ? (p.optLabel[val] || val) : val)}${meta ? `<small>${esc(meta)}</small>` : ''}</button>`; }).join('')}</div></div>`).join('');
  };
  root.addEventListener('click', e => { const b = e.target.closest('.val'); if (!b || b.disabled) return; sel[+b.dataset.oi] = b.dataset.val; let v = find(); if (!v) { v = p.variants.find(x => x.opts[+b.dataset.oi] === b.dataset.val); v.opts.forEach((o, i) => sel[i] = o); } cur = v; draw(); root.querySelector(`.val[data-oi="${b.dataset.oi}"][aria-checked=true]`)?.focus(); onChange(v); });
  root.addEventListener('keydown', e => { const b = e.target.closest('.val'); if (!b) return; const k = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[e.key]; if (!k) return; e.preventDefault(); const g = $$('.val:not([disabled])', b.parentElement); const n = g[(g.indexOf(b) + k + g.length) % g.length]; n.click(); });
  draw(); return {get: () => cur};
}
const priceHTML = v => `<span class="now">${money(v.price)}</span>${v.compare ? `<s>${money(v.compare)}</s><span class="save">Save ${Math.round((1 - v.price / v.compare) * 100)}%</span>` : ''}`;

/* ---------- quick view ---------- */
D.addEventListener('click', e => { const b = e.target.closest('[data-qv]'); if (!b) return; e.preventDefault(); const p = PROD[b.dataset.qv]; const v = VAR[b.dataset.qvv] || p.variants[0]; const m = $('#qv'); if (!m) return;
  $('.box .ct', m).innerHTML = `<div class="qvgrid"><div class="img"><img src="${src(v.img, 960)}" alt="${esc(p.short)}" width="800" height="800"></div><div class="info"><span class="eyebrow">${esc(p.lineName)}</span><h2 class="h" id="qv-t">${esc(p.short)}</h2><p class="muted" style="margin:0">${esc(p.message)}</p><div class="pp" data-pp>${priceHTML(v)}</div><div data-pick></div><button class="btn block mag" type="button" data-add="${v.id}">Add to cart <span class="arr">→</span></button><a class="link" href="${R}${p.url}?v=${v.id}" style="align-self:flex-start">See full details</a></div></div>`;
  const img = $('.img img', m), pp = $('[data-pp]', m), add = $('[data-add]', m), full = $('.link', m);
  picker($('[data-pick]', m), p, v, nv => { img.src = src(nv.img, 960); pp.innerHTML = priceHTML(nv); add.dataset.add = nv.id; full.href = `${R}${p.url}?v=${nv.id}`; });
  open(m); });

/* ---------- PDP ---------- */
const pdp = $('[data-pdp]');
if (pdp) {
  const p = PROD[pdp.dataset.pdp]; const qv = new URLSearchParams(location.search).get('v');
  let v = VAR[qv] && VAR[qv].p === p ? VAR[qv] : p.variants[0];
  const stage = $('.stage', pdp), thumbs = $$('.thumbs button', pdp), imgs = $$('.stage > img, .stage > .rf-wrap', pdp);
  let gi = 0;
  const show = i => { gi = (i + imgs.length) % imgs.length; const t = imgs[gi]; if (t.dataset.src) { t.srcset = t.dataset.srcset; t.src = t.dataset.src; t.removeAttribute('data-src'); } imgs.forEach((im, j) => { im.classList.toggle('cur', j === gi); im.style.opacity = j === gi ? 1 : 0; im.setAttribute('aria-hidden', j !== gi); im.inert = j !== gi; }); stage.classList.toggle('on-vid', imgs[gi].classList.contains('rf-wrap')); rfSync(); thumbs.forEach((t, j) => t.setAttribute('aria-current', j === gi)); stage.classList.remove('zoom'); };
  thumbs.forEach((t, j) => t.addEventListener('click', () => show(j)));
  $('.nav-a.p', pdp)?.addEventListener('click', e => { e.stopPropagation(); show(gi - 1); });
  $('.nav-a.n', pdp)?.addEventListener('click', e => { e.stopPropagation(); show(gi + 1); });
  stage.addEventListener('click', e => { if (e.target.closest('.nav-a, .rf-wrap')) return; stage.classList.toggle('zoom'); move(e); });
  const move = e => { const r = stage.getBoundingClientRect(); stage.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%'); stage.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%'); };
  stage.addEventListener('mousemove', e => { if (!stage.classList.contains('on-vid')) move(e); }); stage.addEventListener('mouseleave', () => stage.classList.remove('zoom'));
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(gi + 1); if (e.key === 'ArrowLeft') show(gi - 1); });
  let tx = null; stage.addEventListener('touchstart', e => tx = e.touches[0].clientX, {passive: true}); stage.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) show(gi + (dx < 0 ? 1 : -1)); tx = null; });
  const pp = $('[data-pp]', pdp), atcs = $$('[data-add-main]'), per = $('[data-per]', pdp), sa = $('.sticky-atc'), qin = $('.atc .qty input', pdp);
  const apply = nv => { v = nv; pp.innerHTML = priceHTML(v); atcs.forEach(a => a.dataset.add = v.id); if (per) per.textContent = v.per || ''; const k = imgs.findIndex(im => im.dataset.id === v.img); if (k >= 0) show(k); history.replaceState(null, '', '?v=' + v.id);
    if (sa) { $('.t small', sa).textContent = v.title + ' · ' + money(v.price); $('img', sa).src = src(v.img, 240); }
    $$('[data-sg-hl]').forEach(r => r.toggleAttribute('data-on', r.dataset.sgHl === v.sizeKey)); };
  picker($('[data-pick]', pdp), p, v, apply); apply(v);
  $('.atc .qty', pdp)?.addEventListener('click', e => { const b = e.target.closest('[data-qq]'); if (!b) return; qin.value = Math.max(1, Math.min(99, (+qin.value || 1) + (+b.dataset.qq))); atcs.forEach(a => a.dataset.qty = qin.value); });
  qin?.addEventListener('change', () => { qin.value = Math.max(1, Math.min(99, parseInt(qin.value) || 1)); atcs.forEach(a => a.dataset.qty = qin.value); });
  const mainBtn = $('.atc [data-add-main]', pdp);
  if (sa && mainBtn) new IntersectionObserver(es => { const r = es[0]; sa.classList.toggle('on', !r.isIntersecting && (r.boundingClientRect.top < 0 || innerWidth < 750)); }).observe(mainBtn);
  D.addEventListener('click', e => { if (e.target.closest('[data-sg]')) { e.preventDefault(); const d = $('#sizeguide'); d && open(d); } });
  // bundle
  const bun = $('[data-bundle]');
  if (bun) { const calc = () => { let s = 0, w = 0, n = 0; $$('.bitem', bun).forEach(it => { const on = $('input', it).checked; it.classList.toggle('off', !on); const vv = VAR[$('select', it)?.value || it.dataset.v]; if (on && vv) { s += vv.price; w += vv.compare || vv.price; n++; } }); $('[data-btot]', bun).textContent = money(s); $('[data-bwas]', bun).textContent = w > s ? money(w) : ''; $('[data-badd]', bun).disabled = !n; $('[data-badd]', bun).textContent = n ? `Add ${n} to cart` : 'Choose items'; };
    bun.addEventListener('change', calc); calc();
    $('[data-badd]', bun).addEventListener('click', () => { const ids = $$('.bitem', bun).filter(it => $('input', it).checked).map(it => $('select', it)?.value || it.dataset.v); ids.forEach(id => Cart.add(id, 1)); closeAll(); setTimeout(() => open($('#cart')), 100); }); }
}

/* ---------- collection filters ---------- */
const shop = $('[data-shop]');
if (shop) {
  const rfTile = $('[data-rf-tile-src] > *', shop), grid = $('.pgrid', shop), cnt = $('[data-count-out]'), sortSel = $('[data-sort]'), pmax = $('[data-pmax]'), pmaxOut = $('[data-pmax-out]');
  const base = shop.dataset.shop === 'all' ? CR.products : CR.products.filter(p => p.collections.includes(shop.dataset.shop));
  const items = []; base.forEach(p => { const seen = new Set(); p.variants.forEach(v => { items.push({p, v}); }); });
  const st = {line: new Set(), need: new Set(), space: new Set(), pack: new Set(), max: +(pmax?.max || 999), view: 'grid'};
  const fromURL = new URLSearchParams(location.search); ['line', 'need', 'space'].forEach(k => fromURL.getAll(k).forEach(x => st[k].add(x)));
  $$('[data-f]', shop).forEach(cb => { if (st[cb.dataset.f].has(cb.value)) cb.checked = true; cb.addEventListener('change', () => { cb.checked ? st[cb.dataset.f].add(cb.value) : st[cb.dataset.f].delete(cb.value); run(); }); });
  pmax?.addEventListener('input', () => { st.max = +pmax.value; pmaxOut.textContent = money(st.max); run(); });
  sortSel?.addEventListener('change', run);
  $$('[data-fclear]').forEach(b => b.addEventListener('click', () => { ['line', 'need', 'space', 'pack'].forEach(k => st[k].clear()); $$('[data-f]', shop).forEach(c => c.checked = false); if (pmax) { pmax.value = pmax.max; st.max = +pmax.max; pmaxOut.textContent = money(st.max); } run(); }));
  $$('[data-quick]').forEach(b => b.addEventListener('click', () => { const [k, val] = b.dataset.quick.split(':'); const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); on ? st[k].add(val) : st[k].delete(val); const cb = $(`[data-f="${k}"][value="${val}"]`, shop); if (cb) cb.checked = on; run(); }));
  $('[data-open-filters]')?.addEventListener('click', () => open($('.filters', shop)));
  function run() {
    let r = items.filter(({p, v}) => (!st.line.size || st.line.has(p.line)) && (!st.need.size || p.needs.some(n => st.need.has(n))) && (!st.space.size || p.spaces.some(n => st.space.has(n))) && (!st.pack.size || st.pack.has(v.packKey)) && v.price <= st.max);
    const s = sortSel?.value || 'featured';
    if (s === 'price-asc') r.sort((a, b) => a.v.price - b.v.price); else if (s === 'price-desc') r.sort((a, b) => b.v.price - a.v.price); else if (s === 'name') r.sort((a, b) => (a.p.short + a.v.title).localeCompare(b.p.short + b.v.title)); else if (s === 'save') r.sort((a, b) => ((b.v.compare || b.v.price) - b.v.price) / (b.v.compare || 1) - ((a.v.compare || a.v.price) - a.v.price) / (a.v.compare || 1));
    grid.innerHTML = r.length ? r.map(({p, v}, i) => cardHTML(p, v).replace('<article class="pcard"', `<article style="animation-delay:${Math.min(i, 12) * 40}ms" class="pcard"`)).join('') : `<div class="empty" style="grid-column:1/-1"><p class="h" style="font-family:var(--f-d)">Nothing matches those filters.</p><button class="btn quiet mt1" type="button" data-fclear-in>Clear filters</button></div>`;
    if (rfTile && r.length) { grid.appendChild(rfTile); rfSync(); }
    $('[data-fclear-in]', grid)?.addEventListener('click', () => $('[data-fclear]').click());
    cnt && (cnt.textContent = `${r.length} item${r.length === 1 ? '' : 's'}`);
    $$('[data-fc]', shop).forEach(el => { const [k, val] = el.dataset.fc.split(':'); el.textContent = items.filter(({p, v}) => k === 'line' ? p.line === val : k === 'need' ? p.needs.includes(val) : k === 'space' ? p.spaces.includes(val) : v.packKey === val).length; });
  }
  run();
}

/* ---------- search ---------- */
const IDX = [];
CR.products.forEach(p => IDX.push({t: p.short, s: p.lineName + ' · from ' + money(Math.min(...p.variants.map(v => v.price))), u: p.url, img: p.cardImg, k: (p.short + ' ' + p.title + ' ' + p.lineName + ' ' + p.keywords + ' ' + p.variants.map(v => v.title).join(' ')).toLowerCase(), w: 3}));
(CR.articles || []).forEach(a => IDX.push({t: a.title, s: 'Journal', u: a.url, img: a.img, k: (a.title + ' ' + a.text).toLowerCase(), w: 1}));
(CR.pages || []).forEach(a => IDX.push({t: a.title, s: 'Page', u: a.url, img: a.img, k: (a.title + ' ' + a.text).toLowerCase(), w: 1}));
const searchRun = (q) => { q = q.trim().toLowerCase(); if (!q) return []; const terms = q.split(/\s+/); return IDX.map(it => { let sc = 0; for (const t of terms) { if (!it.k.includes(t)) return null; sc += (it.t.toLowerCase().includes(t) ? 5 : 1) * it.w; } return {...it, sc}; }).filter(Boolean).sort((a, b) => b.sc - a.sc); };
const hl = (s, q) => { let o = esc(s); q.trim().split(/\s+/).filter(x => x.length > 1).forEach(t => { o = o.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return o; };
const resHTML = (r, q) => r.length ? r.slice(0, 12).map(x => `<a href="${R}${x.u}"><img src="${src(x.img, 240)}" alt="" width="64" height="64" loading="lazy"><span><b>${hl(x.t, q)}</b><small>${esc(x.s)}</small></span><span aria-hidden="true">→</span></a>`).join('') : `<p class="muted">No results for “${esc(q)}”. Try “ties”, “riser”, “coco” or “drainage”.</p>`;
$$('[data-search]').forEach(box => { const inp = $('input', box), out = $('[data-sres]', box.closest('[data-search-scope]') || D); let ai = -1;
  const go = () => { const q = inp.value; out.innerHTML = q.trim() ? resHTML(searchRun(q), q) : ''; ai = -1; const live = $('[data-slive]'); live && (live.textContent = q.trim() ? `${searchRun(q).length} results` : ''); };
  inp.addEventListener('input', go);
  inp.addEventListener('keydown', e => { const a = $$('a', out); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); ai = (ai + (e.key === 'ArrowDown' ? 1 : -1) + a.length) % a.length; a.forEach((x, i) => x.classList.toggle('act', i === ai)); } if (e.key === 'Enter') { e.preventDefault(); if (ai >= 0 && a[ai]) location.href = a[ai].href; else if (box.dataset.search === 'overlay') location.href = `${R}search.html?q=${encodeURIComponent(inp.value)}`; } });
  box.addEventListener('submit', e => e.preventDefault());
  if (box.dataset.search === 'page') { const q = new URLSearchParams(location.search).get('q'); if (q) { inp.value = q; go(); } }
  $$('[data-sugg]', box.closest('[data-search-scope]') || D).forEach(b => b.addEventListener('click', () => { inp.value = b.dataset.sugg; go(); inp.focus(); }));
});
$$('[data-open-search]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); const o = $('#search'); o && open(o); }));

/* ---------- demo forms: never submit anywhere ---------- */
$$('form[data-demo]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const note = $('.formnote', f.parentElement) || $('.formnote', f); let ok = true;
  $$('[required]', f).forEach(i => { const bad = !i.value.trim() || (i.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)); i.setAttribute('aria-invalid', bad); if (bad) ok = false; });
  if (note) note.textContent = ok ? 'Demo only — nothing was sent. On the live store this would ' + (f.dataset.demo === 'news' ? 'subscribe you to From the Shed.' : 'reach support@cannrise.com.') : 'Please fill in the highlighted fields.';
  if (ok) f.reset(); }));
/* ---------- FAQ filter ---------- */
const fq = $('[data-faq-q]');
if (fq) { const items = $$('[data-faq] details'); const cats = $$('[data-faq-cat]'); let cat = 'all';
  const f = () => { const q = fq.value.trim().toLowerCase(); let n = 0; items.forEach(d => { const show = (cat === 'all' || d.dataset.cat === cat) && (!q || d.textContent.toLowerCase().includes(q)); d.hidden = !show; if (show) n++; if (q && show) d.open = true; }); $('[data-faq-n]').textContent = n + ' answer' + (n === 1 ? '' : 's'); };
  fq.addEventListener('input', f); cats.forEach(c => c.addEventListener('click', () => { cat = c.dataset.faqCat; cats.forEach(x => x.setAttribute('aria-pressed', x === c)); f(); })); f(); }
// smooth details animation
if (!RM) $$('.acc details').forEach(d => { const s = $('summary', d), a = $('.ans', d); if (!a) return; s.addEventListener('click', e => { e.preventDefault(); if (d.open) { const h = a.scrollHeight; a.animate([{height: h + 'px', opacity: 1}, {height: '0px', opacity: 0}], {duration: 320, easing: 'cubic-bezier(.7,0,.2,1)'}).onfinish = () => d.open = false; } else { d.open = true; const h = a.scrollHeight; a.animate([{height: '0px', opacity: 0}, {height: h + 'px', opacity: 1}], {duration: 420, easing: 'cubic-bezier(.2,.7,.1,1)'}); } }); });
})();
