    // ---- modul lite: menu i ekrany nastaw poziomu podstawowego (tylko odczyt) ----
    await (async () => {
    const C = customElements.get('pelletcan-lite-core');
    if (C.prototype.__v80) return;
    C.prototype.__v80 = true;
    const W = window.__pcLite80 = window.__pcLite80 || {};
    // rola -> koncowka entity_id (nazwy z firmware lite)
    const NEW = {
      burn_kw: 'palnik_moc', burn_kgh: 'palnik_spalanie', burn_bright: 'palnik_jasnosc_plomienia', feeder: 'palnik_czas_podawania_paliwa',
      legion: 'cwu_antylegionella', fw_ver: 'wersja_firmware',
    };
    // wiersze nastaw: t = nazwa, r = rola encji, dc = miejsca po przecinku, opts = nazwy wartosci 0/1
    const PR = {
      0: { t: 'Moc min [%]', r: 'power_min', dc: 0 }, 1: { t: 'Moc max [%]', r: 'power_max', dc: 0 }, 2: { t: 'Wartość opałowa [kWh/kg]', r: 'fuel_heat', dc: 1 },
      3: { t: 'Korekta powietrza [%]', r: 'air_corr', dc: 0 }, 4: { t: 'Ilość paliwa test [kg/h]', r: 'fuel_test', dc: 1 },
      5: { t: 'Histereza załączenia [°C]', r: 'boiler_hyst_on', dc: 0 }, 6: { t: 'Histereza wyłączenia [°C]', r: 'boiler_hyst_off', dc: 0 },
      7: { t: 'Histereza [°C]', r: 'co_hyst', dc: 1 }, 8: { t: 'Kalibracja czujnika pok. [°C]', r: 'co_calib', dc: 1 },
      9: { t: 'Tryb pracy', r: 'co_mode_s', opts: ['Ręczny', 'Pogodowy'] }, 10: { t: 'Temperatura CO zadana ręcznie [°C]', r: 'co_manual', dc: 0 },
      11: { t: 'Temperatura CO dla -20°C [°C]', r: 'co_cur_m20', dc: 0 }, 12: { t: 'Temperatura CO dla  0°C [°C]', r: 'co_cur_0', dc: 0 }, 13: { t: 'Temperatura CO dla 10°C [°C]', r: 'co_cur_10', dc: 0 },
      14: { t: 'Zagrzej teraz', r: 'cwu_boost', opts: ['Wyłączone', 'Włączone'], tog: true }, 15: { t: 'Histereza [°C]', r: 'cwu_hyst', dc: 0 },
      16: { t: 'Priorytet CWU', r: 'cwu_prio', opts: ['Wyłączony', 'Włączony'], tog: true },
      17: { t: 'Antylegionella', r: 'legion', opts: ['Wyłączona', 'Włączona'], tog: true },
    };
    W.NEW = NEW; W.PR = Object.keys(PR).map(k => PR[k]); W.PR2 = [];

    // rozpoznawanie encji nowych rol
    C.prototype._res = function (h) {
      if (!h) return;
      const ids = Object.keys(h.states);
      if (ids.length === this._idn) return;
      this._idn = ids.length;
      for (const r in NEW) {
        if (this.E[r]) continue;
        const re = new RegExp('_' + NEW[r] + '(_\\d+)?$');
        const c = ids.filter(id => id.startsWith('sensor.') && id.includes('tekla') && re.test(id)).sort((a, b) => a.length - b.length);
        if (c.length) this.E[r] = c[0];
      }
    };
    const hd = Object.getOwnPropertyDescriptor(C.prototype, 'hass');
    Object.defineProperty(C.prototype, 'hass', { configurable: true, get: hd.get, set(h) { this._res(h); hd.set.call(this, h); } });
    const ot = C.prototype._t;
    C.prototype._t = function (k, d) { const r = ot.call(this, k, d); if (k === 'feeder' && r !== d && r !== '') { const x = parseFloat(String(r).replace(',', '.')); return (isNaN(x) ? r : String(Math.round(x * 10) / 10).replace('.', ',')) + ' s'; } return r; };

    // wartosc wiersza (tylko podglad)
    C.prototype._po = function (k) {
      const c = PR[k], v = this._v(c.r);
      if (isNaN(v)) return '-';
      if (c.tog) return '<span class="tgq' + (v >= 1 ? ' on' : '') + '"><i></i></span>';
      return c.opts ? (c.opts[Math.round(v)] != null ? c.opts[Math.round(v)] : '-') : v.toFixed(c.dc);
    };
    C.prototype._prow = function (label, val) { return `<div class="row"><span class="l">${label}</span><span class="v">${val}</span></div>`; };
    const mrow = (k, n, ic) => `<div class="row go mi" data-go="${k}" data-back="menu"><span class="l"><ha-icon icon="${ic}"></ha-icon>${n}</span><span class="v ch2">&rsaquo;</span></div>`;
    C.prototype._menu = function () {
      return this._page('MENU', 'main', [mrow('kociol', 'Kocioł', 'mdi:water-boiler'), mrow('burner_s', 'Palnik', 'mdi:fire'), mrow('co_s', 'Ogrzewanie obwód 1', 'mdi:radiator'),
        mrow('cwu_s', 'Ciepła woda użytkowa', 'mdi:faucet'), mrow('alarm', 'Historia alarmów', 'mdi:clipboard-alert-outline'), mrow('info', 'Informacje o programie', 'mdi:information')].join(''));
    };
    C.prototype._body = (function (o) {
      return function (s) {
        const e = (a, b) => this._row(a, b), P = (list) => list.map(i => this._prow(PR[i].t, this._po(i))).join('');
        if (s === 'burner_s') return this._page('NASTAWY', this._backTo, P([3, 0, 1, 2, 4]));
        if (s === 'boiler') {
          const sp = this._v('boiler_manual'), sv = isNaN(sp) ? this._v('boiler_set') : sp;
          return this._page('NASTAWY', this._backTo, e('Temperatura zadana [°C]', this._p(sv, 0)) + P([5, 6]));
        }
        if (s === 'co_s') return this._page('NASTAWY', this._backTo, e('Temperatura komfortowa [°C]', this._p(this._v('co_comfort'), 1)) + e('Temperatura ekonomiczna [°C]', this._p(this._v('co_eco'), 1)) + P([7, 8, 9, 10, 11, 12, 13]));
        if (s === 'cwu_s') return this._page('NASTAWY', this._backTo, e('Temperatura komfortowa [°C]', this._p(this._v('cwu_comfort'), 0)) + e('Temperatura ekonomiczna [°C]', this._p(this._v('cwu_eco'), 0)) + P([14, 15, 17, 16]));
        return o.call(this, s);
      };
    })(C.prototype._body);
    })();

