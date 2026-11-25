/* Cannrise welcome popup — 10% off (GROW10).
   Collects an email and subscribes it to Klaviyo list WmrCPn ("Website popup · 10% off (GROW10)")
   through Klaviyo's public client endpoint (company VEA67m, no private key in the browser).
   The live Klaviyo flow SPMn3D then emails the code GROW10.
   Opens after 15 s (or on exit intent on desktop), once per 7 days, never on the cart.
   Demo review: add ?popup=1 to any URL to open it immediately. */
(function () {
  var LIST = 'WmrCPn', COMPANY = 'VEA67m', KEY = 'cr_pop10', DELAY = 15000;
  var force = /[?&]popup=1/.test(location.search);
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  if (!force) {
    if (/\/cart(\.html)?$/.test(location.pathname)) return;
    var last = +get(KEY) || 0;
    if (get(KEY + '_done') || Date.now() - last < 7 * 864e5) return;
  }

  var css = '' +
    '.crp-ov{position:fixed;inset:0;z-index:2147483647;background:rgba(15,45,33,.55);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .25s}' +
    '.crp-ov.on{opacity:1}' +
    '.crp{position:relative;width:100%;max-width:440px;background:#F8F3E6;border-radius:20px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.3);transform:translateY(14px);transition:transform .3s;font-family:Inter,Arial,sans-serif;color:#26291F}' +
    '.crp-ov.on .crp{transform:none}' +
    '.crp-top{background:#1B4332;color:#F8F3E6;padding:26px 24px 22px;text-align:center}' +
    '.crp-eye{margin:0 0 6px;color:#EDC97E;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:600}' +
    '.crp-h{margin:0;font-family:Fraunces,Georgia,serif;font-size:40px;line-height:1.02;font-weight:600}' +
    '.crp-h b{color:#A5B83C!important}.crp-top .crp-h{color:#F8F3E6!important}.crp-top .crp-eye{color:#EDC97E!important}.crp-body .crp-p{color:#3b3b33!important}.crp-ok h3{color:#1B4332!important}' +
    '.crp-body{padding:20px 24px 22px;text-align:center}' +
    '.crp-p{margin:0 0 16px;font-size:15px;line-height:1.5;color:#3b3b33}' +
    '.crp-f{display:flex;flex-direction:column;gap:10px}' +
    '.crp-in{width:100%;box-sizing:border-box;padding:14px 16px;border:1.5px solid #c9d2be;border-radius:12px;font-size:16px;background:#fff;color:#26291F}' +
    '.crp-in:focus{outline:none;border-color:#1B4332}' +
    '.crp-btn{border:0;border-radius:999px;background:#1B4332;color:#F8F3E6;font-weight:700;font-size:16px;padding:15px 20px;cursor:pointer}' +
    '.crp-btn[disabled]{opacity:.6;cursor:wait}' +
    '.crp-fine{margin:12px 0 0;font-size:11.5px;line-height:1.5;color:#7a7568}' +
    '.crp-no{margin-top:8px;background:none;border:0;color:#5a5348;font-size:13px;text-decoration:underline;cursor:pointer}' +
    '.crp-x{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(248,243,230,.16);color:#F8F3E6;font-size:20px;line-height:34px;cursor:pointer}' +
    '.crp-err{margin:8px 0 0;color:#a23b1e;font-size:13px;display:none}' +
    '.crp-ok{display:none}.crp.done .crp-form{display:none}.crp.done .crp-ok{display:block}' +
    '.crp-ok h3{margin:0 0 8px;font-family:Fraunces,Georgia,serif;font-size:26px;color:#1B4332}' +
    '@media(max-width:480px){.crp-h{font-size:34px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var ov = document.createElement('div');
  ov.className = 'crp-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', '10% off your first order');
  ov.innerHTML =
    '<div class="crp">' +
      '<button class="crp-x" type="button" aria-label="Close">×</button>' +
      '<div class="crp-top"><p class="crp-eye">Welcome to Cannrise</p><p class="crp-h">Take <b>10% off</b><br>your first order</p></div>' +
      '<div class="crp-body">' +
        '<div class="crp-form">' +
          '<p class="crp-p">Join our garden notes and we\'ll email you a 10% code right away. Grow tips, new products, no spam.</p>' +
          '<form class="crp-f" novalidate><input class="crp-in" type="email" name="email" placeholder="Your email" autocomplete="email" required>' +
          '<button class="crp-btn" type="submit">Email me my 10% code</button></form>' +
          '<p class="crp-err">Please enter a valid email.</p>' +
          '<button class="crp-no" type="button">No thanks</button>' +
          '<p class="crp-fine">One use per customer. Can\'t be combined with other discounts. You can unsubscribe at any time.</p>' +
        '</div>' +
        '<div class="crp-ok"><h3>Check your inbox</h3><p class="crp-p">Your 10% code is on its way. If you don\'t see it in a few minutes, check the Promotions or Spam folder.</p><button class="crp-btn crp-close2" type="button">Keep shopping</button></div>' +
      '</div>' +
    '</div>';

  var shown = false;
  function open() {
    if (shown) return; shown = true; set(KEY, String(Date.now()));
    document.body.appendChild(ov); requestAnimationFrame(function () { ov.classList.add('on'); });
    setTimeout(function () { var i = ov.querySelector('.crp-in'); if (i && window.innerWidth > 700) i.focus(); }, 300);
  }
  function close() { ov.classList.remove('on'); setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 260); }
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  ov.querySelector('.crp-x').addEventListener('click', close);
  ov.querySelector('.crp-no').addEventListener('click', close);
  ov.querySelector('.crp-close2').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && shown) close(); });

  ov.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var inp = ov.querySelector('.crp-in'), btn = ov.querySelector('.crp-btn'), err = ov.querySelector('.crp-err');
    var email = (inp.value || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = 'Please enter a valid email.'; err.style.display = 'block'; inp.focus(); return; }
    err.style.display = 'none'; btn.disabled = true; btn.textContent = 'Sending…';
    fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + COMPANY, {
      method: 'POST',
      headers: { 'content-type': 'application/json', revision: '2024-10-15' },
      body: JSON.stringify({ data: { type: 'subscription', attributes: {
        custom_source: 'Website popup 10% (GROW10)',
        profile: { data: { type: 'profile', attributes: { email: email } } }
      }, relationships: { list: { data: { type: 'list', id: LIST } } } } })
    }).then(function (r) {
      if (r.status >= 200 && r.status < 300) { set(KEY + '_done', '1'); ov.querySelector('.crp').classList.add('done'); }
      else { throw new Error('status ' + r.status); }
    }).catch(function () {
      err.textContent = 'Something went wrong. Please try again.'; err.style.display = 'block';
      btn.disabled = false; btn.textContent = 'Email me my 10% code';
    });
  });

  if (force) { open(); return; }
  setTimeout(open, DELAY);
  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0 && Date.now() - start > 5000) open(); });
  }
  var start = Date.now();
})();
