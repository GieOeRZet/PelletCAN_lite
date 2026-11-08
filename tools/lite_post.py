#!/usr/bin/env python3
"""Etap 2 budowy lite: z zlozonego pliku (assemble.js) wycina wszystko ponad poziom podstawowy i zapisy do kotla.
Wejscie: flat.js, wyjscie: flat2.js (przed przycinaniem AST prune.js)."""
import re, sys
from pathlib import Path
T = Path(__file__).resolve().parent
s = Path(sys.argv[1]).read_text(encoding='utf-8')

def cut(text, a, b, repl=''):
    i = text.index(a); j = text.index(b, i)
    return text[:i] + repl + text[j:]

def sub1(text, pat, repl, flags=re.S):
    out, n = re.subn(pat, lambda m: repl, text, count=1, flags=flags)
    assert n == 1, 'brak wzorca: ' + pat[:70]
    return out

# a. moduly poziomow (v80/v81/v82) -> nowy modul nastaw tylko do odczytu
s = cut(s, '    // ---- modul: poziomy dostepu, menu wg poziomu', '    // ---- modul: czas podawania ----', (T / 'lite_nastawy.js').read_text(encoding='utf-8'))
# b. tabela parametrow PR (z kluczami zapisu) -> pusta (nowa tabela w module nastaw)
s = sub1(s, r'    const PR = \[\n.*?\n    \];\n', '    const PR = [];\n')
# c. v92: wezel ESP, tryb lite w YAML, nadpisania poziomu/uslugi w demo
s = cut(s, '    // usluga ESP: wezel wykrywany', '    // brak encji = "-"')
s = cut(s, '    // ---- tryb lite (tylko w YAML: lite: true)', '    // ---- pakiet oryginalnych grafik panela')
s = sub1(s, r"    const ol2 = C\.prototype\._lvl;\n.*?\n    const osv = C\.prototype\._svc;\n.*?\n", '')
# kotwice wykrywania urzadzenia: encje obecne w firmware lite
s = sub1(s, r"const ANCH = \[[^\]]*\];", "const ANCH = ['wersja_firmware', 'can_ok', 'alarm_aktywny'];")
# DEMO: tylko dane poziomu podstawowego
DEMO = """const DEMO = {
      burner: 'Praca', burner_code: 5, power: 62, burn_kw: 14.8, burn_kgh: 3.1, burn_bright: 74, burn_temp: 412, boiler_temp: 72.4, boiler_set: 70, boiler_manual: 70, outside: 3.5, ret_temp: 58.3,
      air_corr: 0, power_min: 30, power_max: 100, fuel_heat: 4.8, fuel_test: 21.5, fan_pct: 48, blower_run: 'on', feeder_run: 'on', burn_ign: 60, mix_co1: 1, feeder: 'Stop',
      boiler_hyst_on: 5, boiler_hyst_off: 3, co_hyst: 0.5, co_calib: 0, co_mode_s: 0, co_manual: 45, co_cur_m20: 60, co_cur_0: 50, co_cur_10: 40,
      fuel: 183, fuel_cap: 250, fuel_pct: 73, mode: 'Automatyczny', on: 'on',
      co_temp: 41.5, co_set: 45, co_pump: 'on', co_comfort: 45, co_eco: 38, co_mode: 3,
      cwu_temp: 47.2, cwu_set: 50, cwu_comfort: 50, cwu_eco: 40, cwu_pump: 'off', cwu_mode: 3, cwu_hyst: 5, cwu_boost: 0, cwu_prio: 1, legion: 1,
      alarm: 'off', last_alarm: '-', can_ok: 'on',
      sch_boil: '000000 000000 000000 000000 000000 000000 000000', sch_co: '03FC3C 03FC3C 03FC3C 03FC3C 03FC3C 03FC3C 03FC3C', sch_cwu: 'FFFFFF FFFFFF FFFFFF FFFFFF FFFFFF FFFFFF FFFFFF'
    };"""
s = sub1(s, r"const DEMO = \{.*?\n    \};", DEMO)
# edytor: grupy encji tylko poziom podstawowy, bez trybu lite/mirror/wezla
GR = """const GR = [
      ['Ekran główny i ekran Kocioł', ['boiler_temp', 'boiler_set', 'boiler_manual', 'mode', 'sch_boil', 'on', 'outside', 'ret_temp', 'mix_co1', 'mix_ret'], 0],
      ['Ekran główny – Palnik i zbiornik paliwa', ['burner', 'burner_code', 'power', 'burn_kw', 'burn_kgh', 'burn_bright', 'burn_temp', 'ban', 'fan_pct', 'blower_run', 'feeder_run', 'feeder2_run', 'feeder', 'burn_ign', 'fuel', 'fuel_cap', 'fuel_pct'], 0],
      ['Ekran Ogrzewanie (CO)', ['co_temp', 'co_set', 'co_manual', 'co_pump', 'co_comfort', 'co_eco', 'sch_co', 'co_mode'], 0],
      ['Ekran Woda użytkowa (CWU)', ['cwu_temp', 'cwu_set', 'cwu_comfort', 'cwu_eco', 'sch_cwu', 'cwu_mode', 'cwu_pump'], 0],
      ['Menu → Palnik → NASTAWY', ['air_corr', 'power_min', 'power_max', 'fuel_heat', 'fuel_test'], 0],
      ['Menu → Ciepła woda → NASTAWY', ['cwu_hyst', 'cwu_boost', 'cwu_prio', 'legion'], 0],
      ['Menu → Historia alarmów', ['alarm', 'last_alarm', 'alarm_start', 'alarm_end'], 0],
      ['Menu → Kocioł → NASTAWY', ['boiler_hyst_on', 'boiler_hyst_off'], 0],
      ['Menu → Ogrzewanie obwód 1 → NASTAWY', ['co_hyst', 'co_calib', 'co_mode_s', 'co_cur_m20', 'co_cur_0', 'co_cur_10'], 0],
      ['System', ['can_ok', 'fw_ver'], 0],
    ];"""
s = sub1(s, r"const GR = \[\n.*?\n    \];", GR)
s = sub1(s, r"\n            \{ name: 'lite', label: .*?\n", "\n")
s = sub1(s, r"\n            \{ name: 'esphome_node', label: .*?\n", "\n")
s = sub1(s, r"\n            \{ name: 'mirror_mode', label: .*?\n", "\n")
s = s.replace("esphome_node: c.esphome_node || '', ", '')
s = re.sub(r"lite: !!c\.lite, demo: !!c\.demo, mirror_mode: .*?'auto',", "demo: !!c.demo,", s, count=1, flags=re.S)
s = sub1(s, r"        const nd = \(v\.esphome_node.*?\n", '')
s = sub1(s, r"        if \(v\.lite\) cfg\.lite = true; else delete cfg\.lite;\n", '')
s = sub1(s, r"        if \(v\.mirror_mode === 'on'\).*?\n", '')
s = s.replace("{ name: 'demo', label: 'Tryb demo (dane przykładowe, bez ESP)'", "{ name: 'demo', label: 'Tryb demo (dane przykładowe, bez ESP)'")

# ---- rdzen: ekrany, menu, tabele ----
# v93: ekran Konfiguracja
s = cut(s, "      if (s === 'conf') {", "      if (s !== 'info') return ob.call(this, s);")
# komentarz z historia rdzenia
s = sub1(s, r"/\* pelletcan-lite-core v6\.9 .*?\*/\n", '')
# menu rdzenia i _body rdzenia -> minimalne (ekran INFO zostaje; reszte rysuja moduly)
info = re.search(r"      case 'info': return P\(TITLES\.info, \[.*?\]\);\n", s, re.S)
assert info, 'brak case info'
NEWBODY = """  _menu() { return this._page('MENU', 'main', ''); }
  _body(s) {
    const back = ['kociol', 'info'].includes(s) ? 'menu' : this._backTo;
    const P = (t, b) => this._page(t, back, b.join(''));
    if (s === 'alarm') return this._alarmPg(this._backTo === 'main' ? 'main' : 'menu');
    switch (s) {
""" + info.group(0) + """      default: return this._menu();
    }
  }

"""
s = cut(s, '  _menu() {', '  _render(force) {', NEWBODY)
# _go rdzenia: bez PIN-u, testu i modulacji dmuchawy
s = sub1(s, r"    if \(s === 'burner_s' && this\._scr === 'fanmod'\) this\._backTo = 'burn';\n    if \(s !== 'test'.*?\n    if \(s === 'level'\).*?\n    if \(s === 'fanmod'\).*?\n", '')
# render: blokada ekranow serwisowych
s = sub1(s, r"    if \(SERVICE\.includes\(this\._scr\) && !this\._unl\(\)\) \{.*?\}\n", '')
# click handler: wiersze pedit/pr*
s = sub1(s, r"\n      else if \(act === 'pedit' \|\| act\.startsWith\('pr'\)\) this\._prAct\(act, a, e\);", '')
# stale i tabele
s = sub1(s, r"const LVL_MS = 300000, SERVICE = \[[^\]]*\];", '')
s = sub1(s, r"// poziom menu \(serwis\).*?\nconst LVL = .*?\ntry \{ LVL\.t = .*?\n", '')
s = sub1(s, r"const MENU = \[\n.*?\n\];\n", '')
s = sub1(s, r"const TITLES = \{\n.*?\n\};", "const TITLES = {\n  menu: 'MENU', boiler: 'NASTAWY', burner_s: 'NASTAWY', co_s: 'NASTAWY', cwu_s: 'NASTAWY', alarm: 'ALARMY', info: 'INFO',\n};")
s = sub1(s, r"const SCREEN_OPTS = \[\n.*?\n\];", """const SCREEN_OPTS = [
  ['main', 'Ekran główny'], ['heat', 'Ogrzewanie'], ['water', 'Woda użytkowa'], ['burn', 'Palnik'], ['quick', 'Szybkie ustawienia (okno)'], ['fuel', 'Paliwo (okno)'],
  ['menu', 'Menu'], ['prog', 'Program (harmonogram)'], ['kociol', 'Kocioł'], ['boiler', 'Kocioł – ustawienia'], ['burner_s', 'Palnik – ustawienia'], ['co_s', 'Ogrzewanie – ustawienia'], ['cwu_s', 'Woda – ustawienia'],
  ['alarm', 'Alarmy'], ['info', 'Info'],
];""")

# drobne czyszczenie rdzenia
s = s.replace("['main', 'heat', 'water', 'stats', 'prog'].includes(s)", "['main', 'heat', 'water', 'prog'].includes(s)")
s = s.replace("this._on('power_switch') || !this.E.power_switch ? 30 : 600", "30")
s = s.replace("const sw = this._on('power_switch') || this._on('on');", "const sw = this._on('on');")
s = sub1(s, r"  _mirror\(\) \{[^\n]*\}\n", "  _mirror() { return true; }\n")
s = sub1(s, r"\$\{act \? `<div class=\"alb\" data-act=\"confirm\">POTWIERDŹ</div><span class=\"ala\">AKTYWNY</span>` : ''\}", "${act ? `<span class=\"ala\">AKTYWNY</span>` : ''}")

s = s.replace(""".replace('class="alb" data-act="confirm"', 'class="alb al2" data-act="confirm"')""", "")
s = sub1(s, r"  // ---- zapis do ESP.*?\n  // tryb mirror:.*?\n", "")
s = sub1(s, r"      if \(this\._mirror\(\) && \['bdlg'.*?\n", "")
s = cut(s, "    // przytrzymanie + / −", "    root.addEventListener('scroll'")

s = sub1(s, r"      <span class=\"fbt\" data-act=\"fuelpm\" data-d=\"1\".*?\n", "")
s = sub1(s, r"      <span class=\"fbt\" data-act=\"fuelpm\" data-d=\"-1\".*?\n", "")
s = sub1(s, r"      <span class=\"fbt fau\" data-act=\"feedgo\">.*?\n", "")

s = re.sub(r'^[ \t]*//[^\n]*0x[0-9A-Fa-f]{3,}[^\n]*\n', '', s, flags=re.M)
Path(sys.argv[2]).write_text(s, encoding='utf-8')
print('post OK', len(s))
