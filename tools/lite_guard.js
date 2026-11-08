    // ---- modul LITE: wylacznie podglad (karta nie zapisuje niczego do kotla) ----
    await (async () => {
    const C = customElements.get('pelletcan-lite-core');
    if (C.prototype.__lite) return;
    C.prototype.__lite = true;
    // ekrany i akcje dostepne w lite: tylko nawigacja i okna podgladu
    const GO_OK = ['main', 'heat', 'water', 'burn', 'menu', 'info', 'kociol', 'boiler', 'burner_s', 'co_s', 'cwu_s', 'alarm', 'prog'];
    const ACT_OK = ['fuel', 'ok', 'cancel', 'more', 'updskip', 'zq', 'quick', 'bdlg', 'cdlg', 'prog'];
    const sc = C.prototype.setConfig;
    C.prototype.setConfig = function (c) {
      const scr = c && (GO_OK.includes(c.screen) || /^prog_[012]$/.test(c.screen) || ['fuel', 'quick'].includes(c.screen)) ? c.screen : 'main';
      return sc.call(this, Object.assign({}, c, { screen: scr }));
    };
    C.prototype._mirror = function () { return true; };
    C.prototype._lvl = function () { return 0; };
    C.prototype._unl = function () { return false; };
    const og = C.prototype._go;
    C.prototype._go = function (s, b) { if (!GO_OK.includes(s)) return; return og.call(this, s, b); };
    // elementy, ktore w pelnej karcie cos zmieniaja, nie sa klikalne
    const DEAD = '[data-act]:not([data-act="' + ACT_OK.join('"]):not([data-act="') + '"]),[data-go]:not([data-go="' + GO_OK.join('"]):not([data-go="') + '"])';
    const orr = C.prototype._render;
    C.prototype._render = function () {
      const r = orr.apply(this, arguments);
      const scr = this.shadowRoot && this.shadowRoot.getElementById('scr');
      if (scr) scr.querySelectorAll('.fts,.fch').forEach(n => n.remove());
      if (scr) scr.querySelectorAll(DEAD).forEach(n => {
        const a = n.dataset.act, g = n.dataset.go;
        if (g && g !== 'alarm') n.remove();
        else { n.removeAttribute('data-act'); n.removeAttribute('data-go'); n.style.cursor = 'default'; }
      });
      return r;
    };
    const ob = C.prototype._build;
    C.prototype._build = function () {
      ob.apply(this, arguments);
      const R = this.shadowRoot;
      const guard = e => {
        const a = e.target.closest && e.target.closest('[data-go],[data-act]');
        if (!a) return;
        const ok = a.dataset.go ? GO_OK.includes(a.dataset.go) : ACT_OK.includes(a.dataset.act);
        if (!ok) { e.stopPropagation(); e.preventDefault(); }
      };
      R.addEventListener('click', guard, true);
      R.addEventListener('pointerdown', guard, true);
    };
    })();
