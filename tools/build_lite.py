#!/usr/bin/env python3
"""Buduje karte PelletCAN_lite z kodu pelnej karty PelletCAN.

Uzycie:  python3 tools/build_lite.py [sciezka_do_repo_PelletCAN]   (domyslnie ../tekla-igneo-ha)
Wynik:   dist/pelletcan-lite-card.js (loader + poprawki + modul lite)
         dist/pelletcan-lite-core.js (rdzen z przemianowanymi elementami)
Lite = poziom podstawowy (0) pelnej karty, tylko podglad: ekran glowny, paliwo, CO, CWU, palnik, menu bez "Poziom menu", nastawy poziomu 0,
harmonogram, historia alarmow i INFO; zero zapisow do kotla.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'tekla-igneo-ha'
VER = json.loads((ROOT / 'version.json').read_text(encoding='utf-8'))['card']['version']

core = (SRC / 'dist' / 'tekla-panel-card.js').read_text(encoding='utf-8')
card = (SRC / 'dist' / 'pelletcan-card.js').read_text(encoding='utf-8')


def cut(text, start_marker, end_marker):
    a = text.index(start_marker)
    b = text.index(end_marker, a)
    return text[:a] + text[b:]


# 1. wyrzucamy moduly zbedne w lite: Test wyjsc i tlumaczenia
card = cut(card, '    // ---- modul v1.1: Test wyjsc', '    // ---- modul v9.3: aktualizacje')
card = cut(card, '    // ---- modul v1.4: tlumaczenia', '  } catch (e) { console.error')

# 2. alias "tekla-panel-card_lite" (stary tryb lite) nie jest potrzebny
card = re.sub(r"    if \(!customElements\.get\('tekla-panel-card_lite'\)\) \{.*?\n    \}\n", '', card, flags=re.S)

# 3. aktualizacje: wersja karty i manifest z repo lite
card, n = re.subn(r"const CARD_VER = '[^']*';", "const CARD_VER = '%s';" % VER, card)
assert n == 1, 'CARD_VER'
core_ver = re.search(r"const CARD_VER = '([^']*)'", (SRC / 'dist' / 'pelletcan-card.js').read_text(encoding='utf-8')).group(1)
card = card.replace('https://raw.githubusercontent.com/GieOeRZet/PelletCAN/main/version.json',
                    'https://raw.githubusercontent.com/GieOeRZet/PelletCAN_lite/main/version.json')
card = card.replace("'igneo_upd_skip'", "'pelletcan_lite_upd_skip'").replace('window.__igneoUpd', 'window.__pcLiteUpd')

# 4. nazwy elementow i plikow (lite moze dzialac obok pelnej karty)
def rename(t):
    t = t.replace('tekla-panel-card', 'pelletcan-lite-core')
    t = t.replace('pelletcan-card', 'pelletcan-lite-card')
    t = t.replace("'tekla-img'", "'pcl-img'").replace("'tekla-font'", "'pcl-font'").replace("'tekla_lvl'", "'pcl_lvl'")
    return t

core = rename(core)
card = rename(card)
card = card.replace('window.__igneoCard', 'window.__pcLiteCard')
for t in ('__igneoFind', '__igneoImg', '__tekla80', '__teklaDefs', '__teklaLvl', '__teklaDemo', '__pcLang', '__pcLocale'):
    card = card.replace('window.' + t, 'window.' + t.replace('__igneo', '__pcLite').replace('__tekla', '__pcLite').replace('__pcLang', '__pcLiteLang').replace('__pcLocale', '__pcLiteLocale'))
    core = core.replace('window.' + t, 'window.' + t.replace('__igneo', '__pcLite').replace('__tekla', '__pcLite').replace('__pcLang', '__pcLiteLang').replace('__pcLocale', '__pcLiteLocale'))
card = card.replace('(HACS: /hacsfiles/PelletCAN/, recznie: /local/community/igneo-ha/)', '(HACS: /hacsfiles/PelletCAN_lite/)')
card = card.replace("DIR + 'pelletcan-lite-core.js?v=62&_='", "DIR + 'pelletcan-lite-core.js?v=' + %s + '&_='" % json.dumps(VER))
card = card.replace("'pelletcan-lite-card', name: 'PelletCAN-card'", "'pelletcan-lite-card', name: 'PelletCAN lite'")
card = card.replace("description: 'Panel kotła pelletowego (replika panelu Igneo Touch) dla PelletCAN'", "description: 'PelletCAN lite: podgląd kotła pelletowego (tylko odczyt)'")

LITE = r"""
    // ---- modul LITE: poziom podstawowy, wylacznie podglad (zadnych zapisow do kotla) ----
    await (async () => {
    const C = customElements.get('pelletcan-lite-core');
    if (C.prototype.__lite) return;
    C.prototype.__lite = true;
    // ekrany dostepne w lite: glowny, menu poziomu 0 (bez "Poziom menu"), nastawy tylko do odczytu, harmonogram i historia alarmow (podglad), INFO
    const GO_OK = ['main', 'heat', 'water', 'burn', 'menu', 'info', 'kociol', 'boiler', 'burner_s', 'co_s', 'cwu_s', 'alarm', 'prog'];
    // akcje: tylko otwieranie/zamykanie okien i podglad; wszystko co zmienia wartosc jest odciete
    const ACT_OK = ['fuel', 'ok', 'cancel', 'more', 'updskip', 'zq', 'quick', 'bdlg', 'cdlg', 'prog'];
    const sc = C.prototype.setConfig;
    C.prototype.setConfig = function (c) {
      const scr = c && GO_OK.includes(c.screen) ? c.screen : 'main';
      return sc.call(this, Object.assign({}, c, { mirror: true, lite: true, screen: scr }));
    };
    C.prototype._mirror = function () { return true; };
    C.prototype._svc = function () { /* lite: brak uslug zapisu */ };
    C.prototype._lvl = function () { return 0; };
    C.prototype._unl = function () { return false; };
    // okna trybu/temperatur: OK tylko zamyka, nic nie zapisuje
    C.prototype._commit = function () { this._modal = false; this._render(true); };
    C.prototype._fcGo = function () {};
    C.prototype._fuelStep = function () {};
    // twarda blokada: zadna usluga HA nie jest wywolywana przez te karte
    const hd = Object.getOwnPropertyDescriptor(C.prototype, 'hass');
    if (hd && hd.set) Object.defineProperty(C.prototype, 'hass', {
      configurable: true, get: hd.get,
      set(v) { hd.set.call(this, v && typeof v === 'object' ? Object.assign(Object.create(v), { callService: () => Promise.resolve() }) : v); }
    });
    const og = C.prototype._go;
    C.prototype._go = function (s, b) { if (!GO_OK.includes(s)) return; return og.call(this, s, b); };
    // menu poziomu 0 jak na panelu; "Poziom menu (PIN)" i pozycje serwisowe znikaja same (lite: true w pelnej karcie)
    // wiersze nastaw i przelaczniki zostaja jako sam podglad: bez data-act/data-go zapisu, kursor zwykly
    const DEAD = '[data-act]:not([data-act="' + ACT_OK.join('"]):not([data-act="') + '"]),[data-go]:not([data-go="' + GO_OK.join('"]):not([data-go="') + '"])';
    const orr = C.prototype._render;
    C.prototype._render = function () {
      const r = orr.apply(this, arguments);
      const scr = this.shadowRoot && this.shadowRoot.getElementById('scr');
      if (scr) scr.querySelectorAll('.fts,.fch').forEach(n => n.remove());
      if (scr) scr.querySelectorAll(DEAD).forEach(n => {
        const a = n.dataset.act, g = n.dataset.go;
        if (a === 'fuelpm' || a === 'feedgo' || a === 'confirm' || a === 'toggle' || (g && g !== 'alarm')) n.remove();
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
"""
marker = '  } catch (e) { console.error'
i = card.index(marker)
card = card[:i] + LITE + card[i:]
card = card.replace("console.error('pelletcan-lite-card', e)", "console.error('pelletcan-lite-card', e)")

header = '''/* PelletCAN lite v%s - karta tylko do odczytu, poziom podstawowy (ekran glowny, paliwo, CO, CWU, palnik, nastawy poziomu 0, harmonogram, alarmy, INFO).
   Typ karty: custom:pelletcan-lite-card. Plik generowany: tools/build_lite.py (zrodlo: repo PelletCAN). Nie edytuj recznie.
   Dziala tak: pobiera rdzen pelletcan-lite-core.js (ten sam katalog), nakłada poprawki i modul lite (bez zapisow do kotla). */
''' % VER
card = header + card
(ROOT / 'dist' / 'pelletcan-lite-card.js').write_text(card, encoding='utf-8')
(ROOT / 'dist' / 'pelletcan-lite-core.js').write_text(core, encoding='utf-8')
print('OK', VER, len(card), len(core))
