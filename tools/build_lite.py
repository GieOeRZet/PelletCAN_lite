#!/usr/bin/env python3
"""Buduje karte PelletCAN_lite z kodu pelnej karty PelletCAN.

Uzycie:  python3 tools/build_lite.py [sciezka_do_repo_PelletCAN]   (domyslnie ../tekla-igneo-ha)
Wynik:   dist/pelletcan-lite-card.js (jeden plik: rdzen + poprawki + modul lite, przyciety do poziomu podstawowego)
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
    t = t.replace('pelletcan-card', 'pelletcan-card-lite')
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
card = card.replace("'pelletcan-card-lite', name: 'PelletCAN-card'", "'pelletcan-card-lite', name: 'PelletCAN-card lite'")
card = card.replace("description: 'Panel kotła pelletowego (replika panelu Igneo Touch) dla PelletCAN'", "description: 'PelletCAN lite: podgląd kotła pelletowego (tylko odczyt)'")

import subprocess, tempfile
tmp = Path(tempfile.mkdtemp())
(tmp / 'card.js').write_text(card, encoding='utf-8')
(tmp / 'core.js').write_text(core, encoding='utf-8')
T = ROOT / 'tools'
subprocess.run([str(T / 'stage.sh'), str(tmp / 'card.js'), str(tmp / 'core.js'), str(tmp / 'pruned.js')], check=True)
subprocess.run(['node', str(T / 'roles.js'), str(tmp / 'pruned.js'), str(tmp / 'final.js')], check=True)
card = (tmp / 'final.js').read_text(encoding='utf-8')

header = '''/* PelletCAN lite v%s - karta tylko do odczytu, poziom podstawowy (ekran glowny, paliwo, CO, CWU, palnik, nastawy, harmonogram, alarmy, INFO).
   Typ karty: custom:pelletcan-card-lite. Plik generowany: tools/build_lite.py (zrodlo: repo PelletCAN). Nie edytuj recznie.
   Karta zawiera wylacznie kod podgladu: bez zapisu do kotla i bez ekranow wyzszych poziomow menu. */
''' % VER
card = header + card
(ROOT / 'dist' / 'pelletcan-lite-card.js').write_text(card, encoding='utf-8')
print('OK', VER, len(card))
