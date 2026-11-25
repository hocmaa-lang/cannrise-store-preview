/* Cannrise Black Friday 2026 layer for the demo (ends Dec 1, 23:59 PT).
   Home: BF hero with clickable tier cards + live countdown + "Shop the deal".
   Product pages: shipping rule under the price; tiers line next to Add to cart (coco + spacers). */
(function () {
  var END = Date.parse('2026-12-02T07:59:00Z');
  var SHIP = 'Free US shipping on 4+ coco packs or any order $99+. Otherwise, a flat $5.99.';
  var R = document.documentElement.dataset.root || '';
  var COCO = R + 'products/coco-coir-grow-bags.html';
  var live = Date.now() < END;
  var body = document.body;

  var css = '' +
    '.bf26{padding:16px 16px 0}' +
    '.bf26 .in{max-width:1280px;margin:0 auto;border-radius:20px;background:#1B4332;color:#F8F3E6;padding:30px 22px 26px;text-align:center}' +
    '.bf26 .eb{margin:0 0 6px;color:#EDC97E;font:600 12px/1.4 Inter,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase}' +
    '.bf26 h2{margin:0 0 8px;color:#F8F3E6;font-family:Fraunces,Georgia,serif;font-size:clamp(30px,6vw,52px);line-height:1.02;font-weight:600}' +
    '.bf26 .sub{margin:0 auto 18px;max-width:560px;font-size:15px;opacity:.9}' +
    '.bf26 .cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;max-width:640px;margin:0 auto 18px}' +
    '.bf26 .card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:14px 6px;border-radius:14px;background:#F8F3E6;color:#1B4332;text-decoration:none;transition:transform .15s}' +
    '.bf26 .card:hover{transform:translateY(-2px)}' +
    '.bf26 .card.best{background:#A5B83C;box-shadow:0 0 0 3px #EDC97E}' +
    '.bf26 .pct{font-family:Fraunces,Georgia,serif;font-size:clamp(28px,7vw,42px);font-weight:600;line-height:1}' +
    '.bf26 .off{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}' +
    '.bf26 .qty{font-size:14px;font-weight:600;margin-top:4px}' +
    '.bf26 .fs{font-size:11px;font-weight:700;margin-top:4px;background:#1B4332;color:#F8F3E6;border-radius:999px;padding:2px 8px;white-space:nowrap}' +
    '.bf26 .cd{display:flex;justify-content:center;gap:8px;margin:0 auto 18px;flex-wrap:nowrap}' +
    '.bf26 .cd span{display:flex;flex-direction:column;align-items:center;min-width:58px;padding:8px 4px;border-radius:12px;background:rgba(248,243,230,.1);border:1px solid rgba(248,243,230,.2)}' +
    '.bf26 .cd b{font-family:Fraunces,Georgia,serif;font-size:26px;line-height:1;font-variant-numeric:tabular-nums}' +
    '.bf26 .cd small{font-size:10px;letter-spacing:.08em;text-transform:uppercase;opacity:.8;margin-top:3px;white-space:nowrap}' +
    '.bf26 .go{display:inline-block;padding:15px 36px;border-radius:999px;background:#EDC97E;color:#1B4332;font-weight:700;font-size:16px;text-decoration:none}' +
    '.bf26 .rule{margin:14px 0 0;font-size:13px;opacity:.85}' +
    '.bf-rule{margin:6px 0 0;font-size:14px;line-height:1.45;color:var(--ink-muted,#5a5348)}' +
    '.bf-tiers{margin:12px 0;padding:12px 14px;border:1.5px solid #1B4332;border-radius:12px;background:#EEF5D6;color:#1B4332;font-size:15px;line-height:1.5}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---- product pages: shipping rule under the price (always) + tiers line (coco / spacers, while live)
  if (body.classList.contains('pg-product')) {
    var pp = document.querySelector('[data-pp]');
    if (pp && !document.querySelector('.bf-rule')) { var r = document.createElement('p'); r.className = 'bf-rule'; r.textContent = SHIP; pp.insertAdjacentElement('afterend', r); }
    var isTier = /coco-coir|plant-riser/.test(location.pathname);
    var atc = document.querySelector('.atc');
    if (live && isTier && atc) { var t = document.createElement('div'); t.className = 'bf-tiers'; t.innerHTML = '<b>Black Friday:</b> 2 packs 10% · 3 packs 20% · 4+ packs 25% off' + (/coco-coir/.test(location.pathname) ? ' + free shipping' : '') + '. Mix sizes and colors.'; atc.insertAdjacentElement('afterend', t); }
  }

  // ---- home: BF hero with countdown
  var isHome = /\/site\/?(index\.html)?$/.test(location.pathname) || (R === '' && /\/(index\.html)?$/.test(location.pathname) && document.querySelector('main#main') && !body.classList.contains('pg-product') && document.title.indexOf('Cannrise') === 0 && !/\/(products|collections|pages|blogs|policies)\//.test(location.pathname));
  var main = document.getElementById('main');
  if (live && isHome && main && !document.querySelector('.bf26')) {
    var s = document.createElement('section'); s.className = 'bf26'; s.setAttribute('aria-label', 'Black Friday offer');
    s.innerHTML = '<div class="in"><p class="eb">Black Friday · ends Dec 1</p><h2>Buy more. Grow more.</h2>' +
      '<p class="sub">Coco coir grow bags. Mix 1 and 2 gallon packs. The discount applies automatically at checkout.</p>' +
      '<div class="cards">' +
        '<a class="card" href="' + COCO + '"><span class="pct">10%</span><span class="off">off</span><span class="qty">2 packs</span></a>' +
        '<a class="card" href="' + COCO + '"><span class="pct">20%</span><span class="off">off</span><span class="qty">3 packs</span></a>' +
        '<a class="card best" href="' + COCO + '"><span class="pct">25%</span><span class="off">off</span><span class="qty">4+ packs</span><span class="fs">+ FREE shipping</span></a>' +
      '</div>' +
      '<div class="cd" aria-label="Time left"><span><b data-d>00</b><small>Days</small></span><span><b data-h>00</b><small>Hrs</small></span><span><b data-m>00</b><small>Min</small></span><span><b data-s>00</b><small>Sec</small></span></div>' +
      '<a class="go" href="' + COCO + '">Shop the deal</a><p class="rule">' + SHIP + '</p></div>';
    main.insertBefore(s, main.firstChild);
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tick = function () {
      var d = END - Date.now(); if (d <= 0) { s.parentNode && s.parentNode.removeChild(s); clearInterval(iv); return; }
      s.querySelector('[data-d]').textContent = pad(Math.floor(d / 864e5));
      s.querySelector('[data-h]').textContent = pad(Math.floor(d / 36e5) % 24);
      s.querySelector('[data-m]').textContent = pad(Math.floor(d / 6e4) % 60);
      s.querySelector('[data-s]').textContent = pad(Math.floor(d / 1e3) % 60);
    };
    var iv = setInterval(tick, 1000); tick();
  }
})();
