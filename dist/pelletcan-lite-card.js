/* PelletCAN lite v2.3 - karta tylko do odczytu, poziom podstawowy (ekran glowny, paliwo, CO, CWU, palnik, nastawy, harmonogram, alarmy, INFO).
   Typ karty: custom:pelletcan-card-lite. Plik generowany: tools/build_lite.py (zrodlo: repo PelletCAN). Nie edytuj recznie.
   Karta zawiera wylacznie kod podgladu: bez zapisu do kotla i bez ekranow wyzszych poziomow menu. */
/* PelletCAN-card - JEDEN plik wejsciowy karty Tekla/Estyma Igneo Touch (wersja karty: patrz CARD_VER nizej i version.json).
   Rejestruje karte custom:pelletcan-card-lite (stary typ custom:pelletcan-lite-core dziala dalej; tryb lite: lite: true w konfiguracji karty; typ pelletcan-lite-core_lite = alias).
   Dziala tak: pobiera rdzen pelletcan-lite-core.js (z tego samego katalogu) (baza v6.9), naklada poprawki (lista EDITS) i dolacza moduly:
     poprawki ekranow (menu, PROGRAM, NASTAWY) | paski harmonogramu | poziomy dostepu z ESP + parametry palnika/CWU | Antylegionella | Ogrzewanie 1
     | czas podawania | historia alarmow z kotla | grafiki z folderu img/ | autor na ekranie INFO | v9.2: automatyczne wykrywanie encji, tryb lite (lite: true w YAML), nowy edytor.
   Zasob w HA: tylko ten plik. Po zmianie podbij ?v= w adresie zasobu i zrob Ctrl+F5. */
(async () => {
  if (window.__pcLiteCard) return;
  window.__pcLiteCard = true;
  try {
    if (customElements.get('pelletcan-lite-core')) {
      console.warn('pelletcan-lite-core v7.8: element juz zarejestrowany (stara wersja w pamieci strony) - zrob twarde odswiezenie (Ctrl+F5)');
      return;
    }
    (() => {
/* Brak domyślnych encji – użytkownik wskazuje własne w edytorze karty (lub w YAML: entities:). */
const BTN = ['button', 'input_button'];
const S = ['sensor', 'input_number', 'number'], B = ['binary_sensor', 'switch', 'input_boolean'];
const ENT_GROUPS = [
  ['Kocioł', [
    ['boiler_temp', 'Temperatura kotła', S], ['boiler_set', 'Temp. zadana kotła (wynikowa)', S], ['boiler_manual', 'Temp. zadana kotła (ręczna)', S], ['mode', 'Tryb pracy kotła', S], ['sch_boil', 'Harmonogram kotła (rejestry, tekst)', S], ['on', 'Kocioł włączony', B], ['outside', 'Temperatura zewnętrzna', S], ['ret_temp', 'Temperatura powrotu', S], ['mix_co1', 'Mieszacz CO1 stan (0 stoi, 1 zamyka, 2 otwiera)', S], ['mix_ret', 'Mieszacz powrotu stan (0 stoi, 1 zamyka, 2 otwiera)', S], ['boiler_hyst_on', 'Histereza załączenia kotła', S], ['boiler_hyst_off', 'Histereza wyłączenia kotła', S]]],
  ['Ogrzewanie 1 – nastawy', [
    ['co_hyst', 'CO1 histereza', S], ['co_calib', 'CO1 kalibracja czujnika', S], ['co_mode_s', 'CO1 tryb pracy (0 ręczny / 1 pogodowy)', S], ['co_cur_m20', 'CO1 krzywa pogodowa -20 °C', S], ['co_cur_0', 'CO1 krzywa pogodowa 0 °C', S], ['co_cur_10', 'CO1 krzywa pogodowa +10 °C', S]]],
  ['Woda – nastawy', [
    ['cwu_hyst', 'CWU histereza', S], ['cwu_boost', 'CWU zagrzej teraz (0/1)', S], ['cwu_prio', 'CWU priorytet (0/1)', S]]],
  ['Palnik', [
    ['burner', 'Stan palnika (tekst)', S], ['burner_code', 'Kod stanu palnika', S], ['power', 'Moc palnika [%]', S], ['burn_kw', 'Moc palnika [kW]', S], ['burn_kgh', 'Spalanie [kg/h]', S], ['burn_bright', 'Jasność płomienia', S], ['burn_temp', 'Temperatura palnika', S], ['air_corr', 'Korekta powietrza [%]', S], ['power_min', 'Moc min [%]', S], ['power_max', 'Moc max [%]', S], ['fuel_heat', 'Wartość opałowa [kWh/kg]', S], ['fuel_test', 'Ilość paliwa test [kg/h]', S], ['ban', 'Zakaz rozpalenia (wejście)', B], ['fan_pct', 'Dmuchawa [%]', S], ['burn_ign', 'Palnik zapalarka [%]', S], ['blower_run', 'Dmuchawa pracuje', B], ['feeder_run', 'Podajnik pracuje', B], ['feeder2_run', 'Podajnik palnika pracuje', B], ['feeder', 'Podajnik', S], ['burn_time', 'Czas pracy palnika', S], ['fuel', 'Paliwo w zbiorniku [kg]', S], ['fuel_cap', 'Pojemność zbiornika [kg]', S], ['fuel_pct', 'Zapełnienie zbiornika [%]', S], ['feed_time', 'Czas podawania ręcznego [s]', S]]],
  ['Ogrzewanie (CO)', [
    ['co_temp', 'Temperatura CO', S], ['co_set', 'Temp. zadana CO (wynikowa)', S], ['co_manual', 'Temp. zadana CO (ręczna)', S], ['co_pump', 'Pompa CO', B], ['co_comfort', 'CO – komfort (zadana)', S], ['co_eco', 'CO – ekonomiczna (zadana)', S], ['sch_co', 'Harmonogram CO (rejestry, tekst)', S], ['co_mode', 'Tryb CO (Off/Eko/Harmonogram/Komfort)', S]]],
  ['Woda użytkowa (CWU)', [
    ['cwu_temp', 'Temperatura CWU', S], ['cwu_set', 'Temp. zadana CWU (wynikowa)', S], ['cwu_comfort', 'CWU – komfort', S], ['cwu_eco', 'CWU – ekonomiczna', S], ['sch_cwu', 'Harmonogram CWU (rejestry, tekst)', S], ['cwu_mode', 'Tryb CWU (Off/Eko/Harmonogram/Komfort)', S], ['cwu_pump', 'Pompa CWU', B]]],
  ['Alarmy i system', [
    ['alarm', 'Alarm aktywny', B], ['last_alarm', 'Ostatni alarm', S], ['alarm_start', 'Alarm – początek', S], ['alarm_end', 'Alarm – koniec', S], ['can_ok', 'Łączność CAN OK', B]]]
];
const TEKLA_DEF = {};
ENT_GROUPS.forEach(g => g[1].forEach(f => { TEKLA_DEF[f[0]] = ''; }));
// końcówki entity_id (nazwy z ESPHome tekla_estyma) używane przez „uzupełnij z prefiksu"
const ROLE_KEY = {
  boiler_temp: 'kociol_temperatura', boiler_set: 'kociol_zadana_wynikowa', boiler_manual: 'kociol_zadana_reczna', mode: 'kociol_tryb_pracy', on: 'kociol_wlaczony', outside: 'temperatura_zewnetrzna', fuel: 'zbiornik_paliwo', fuel_cap: 'zbiornik_pojemnosc', fuel_pct: 'zbiornik_zapelnienie', fan_pct: 'dmuchawa_obroty', blower_run: 'dmuchawa_pracuje', feeder_run: 'podajnik_pracuje', feeder2_run: 'podajnik_palnika_pracuje', burner: 'palnik_stan', burn_temp: 'temperatura_palnika', air_corr: 'korekta_powietrza', power_min: 'moc_min', power_max: 'moc_max', fuel_heat: 'wartosc_opalowa', fuel_test: 'ilosc_paliwa_test', ban: 'zakaz_rozpalenia', co_mode: 'co_tryb', cwu_mode: 'cwu_tryb', burner_code: 'palnik_kod_stanu', power: 'moc_palnika', co_temp: 'co_temperatura', co_set: 'co_zadana_wynikowa', co_manual: 'co_zadana_reczna', co_pump: 'co_pompa', cwu_temp: 'cwu_temperatura', cwu_set: 'cwu_zadana_wynikowa', cwu_comfort: 'cwu_zadana_komfort', cwu_eco: 'cwu_zadana_ekonomiczna', cwu_pump: 'cwu_pompa', sch_boil: 'kociol_harmonogram_rejestry', sch_co: 'co_harmonogram_rejestry', sch_cwu: 'cwu_harmonogram_rejestry', co_comfort: 'co_zadana_komfort', co_eco: 'co_zadana_ekonomiczna', burn_ign: 'palnik_zapalarka', ret_temp: 'temperatura_powrotu', mix_co1: 'mieszacz_co1_stan', mix_ret: 'mieszacz_powrotu_stan', boiler_hyst_on: 'histereza_zalaczenia_kotla', boiler_hyst_off: 'histereza_wylaczenia_kotla', co_hyst: 'co1_histereza', co_calib: 'co1_kalibracja_czujnika', co_mode_s: 'co1_tryb_pracy_0_reczny_1_pogodowy', co_cur_m20: 'co1_krzywa_pogodowa_20_c', co_cur_0: 'co1_krzywa_pogodowa_0_c', co_cur_10: 'co1_krzywa_pogodowa_10_c', cwu_hyst: 'cwu_histereza', cwu_boost: 'cwu_zagrzej_teraz_0_1', cwu_prio: 'cwu_priorytet_0_1', alarm: 'alarm_aktywny', last_alarm: 'ostatni_alarm', alarm_start: 'alarm_poczatek', alarm_end: 'alarm_koniec', can_ok: 'can_ok',
};
const SCREEN_OPTS = [
  ['main', 'Ekran główny'], ['heat', 'Ogrzewanie'], ['water', 'Woda użytkowa'], ['burn', 'Palnik'], ['quick', 'Szybkie ustawienia (okno)'], ['fuel', 'Paliwo (okno)'],
  ['menu', 'Menu'], ['prog', 'Program (harmonogram)'], ['kociol', 'Kocioł'], ['boiler', 'Kocioł – ustawienia'], ['burner_s', 'Palnik – ustawienia'], ['co_s', 'Ogrzewanie – ustawienia'], ['cwu_s', 'Woda – ustawienia'],
  ['alarm', 'Alarmy'], ['info', 'Info'],
];
// harmonogramy (godziny komfortu) – na razie przepisane z panelu, do czasu odczytu z rejestrów
const SCHED_DEF = { cwu: [[0, 24]], co: [[2.5, 10], [16.5, 21]] };
const ICO = {"hopper":{"vb":"0 0 39.6 32.8","d":"M39.0 0.1L37.5 0.4L36.8 1.6L36.9 16.2L36.5 18.8L35.8 20.5L35.0 21.1L28.2 30.1L28.1 30.9L28.9 32.0L29.6 32.0L30.9 31.0L32.9 28.1L37.6 22.5L39.2 19.9L39.5 18.6L39.6 1.4ZM1.5 0.0L0.4 0.8L0.0 1.9L0.2 17.4L0.8 20.1L1.9 22.1L2.8 22.9L3.1 23.8L9.1 31.1L10.8 32.1L11.5 31.0L11.4 29.9L7.8 24.9L5.0 21.9L3.2 19.0L3.0 17.9L3.1 2.0L2.8 0.4Z"},"flame":{"vb":"0 0 29.0 38.9","d":"M17.2 0.1L14.8 0.0L12.8 0.6L11.0 1.5L9.1 3.2L8.5 4.4L8.2 6.0L8.6 12.4L7.9 13.2L3.4 13.2L2.0 13.9L1.6 14.4L1.8 15.5L4.1 16.5L4.8 17.1L5.2 18.5L5.2 19.5L4.6 21.2L1.6 24.2L0.0 27.9L0.1 30.4L0.6 32.6L1.9 35.5L3.6 37.9L5.2 38.9L6.1 38.6L6.1 37.4L5.4 34.4L5.4 32.8L6.2 29.2L8.4 26.6L10.1 25.8L12.5 23.5L13.1 19.9L13.9 18.9L14.8 19.0L16.1 19.9L18.6 23.5L19.0 25.5L18.8 29.4L19.4 29.6L20.8 28.6L21.9 28.6L23.5 30.2L24.0 32.1L24.0 34.2L23.6 35.9L22.2 37.9L22.4 38.4L23.1 38.4L24.2 37.1L26.0 35.9L28.2 32.5L29.0 28.6L29.0 25.9L28.4 22.5L27.1 19.5L26.2 15.6L26.2 14.2L26.9 12.5L26.9 11.5L26.4 11.1L25.1 11.5L23.9 13.0L22.8 13.5L21.0 12.9L18.6 10.5L17.4 7.6L16.8 5.2L17.2 3.1L18.1 1.6L17.9 0.6Z"},"radi":{"vb":"0 0 29.8 36.5","d":"M4.0 0.2L3.4 1.2L2.8 3.6L0.0 6.2L0.4 7.2L2.9 9.5L3.2 10.2L3.5 19.8L3.4 26.8L2.9 27.6L0.9 29.4L0.2 30.8L2.9 32.4L3.5 33.5L3.8 35.5L4.6 36.4L5.5 36.4L6.0 35.9L6.2 32.1L7.1 31.1L8.0 30.9L9.6 31.0L10.5 31.6L10.9 32.5L11.0 35.6L11.9 36.5L12.9 36.4L13.4 35.8L13.6 32.1L14.6 31.2L15.8 30.9L16.8 30.9L18.0 31.9L18.4 32.8L18.5 35.8L19.2 36.4L20.1 36.2L20.6 35.6L21.0 32.2L21.9 31.4L22.8 31.0L24.0 31.0L25.2 31.6L25.9 32.5L26.1 35.8L26.8 36.4L28.0 36.1L28.4 35.8L28.8 32.8L29.5 30.6L28.6 26.0L28.8 11.5L29.8 6.1L28.5 0.6L28.0 0.2L26.6 0.1L25.8 1.1L25.0 4.9L24.1 5.6L23.1 5.8L21.6 4.6L20.9 0.9L20.1 0.1L19.0 0.1L18.0 1.4L17.8 4.8L17.2 5.5L16.1 5.9L14.4 5.1L13.9 3.9L13.8 1.1L13.0 0.1L11.9 0.0L10.6 1.2L10.6 3.4L10.2 5.0L9.5 5.6L7.6 5.8L6.8 5.1L6.5 4.5L6.2 0.8L5.2 0.0ZM23.1 7.4L24.4 7.6L25.0 8.2L25.6 9.9L25.9 27.1L25.4 28.6L23.8 30.1L23.0 30.1L21.4 28.5L21.0 27.6L21.2 9.6L21.8 8.2ZM7.6 7.4L9.8 7.6L10.4 8.2L10.6 9.2L10.9 26.9L10.4 28.9L9.1 30.1L7.6 30.1L7.0 29.5L6.2 27.9L6.4 9.4L6.8 8.0ZM16.2 7.2L16.9 7.4L17.6 8.1L18.0 9.6L18.2 24.2L18.1 27.9L17.2 29.8L16.6 30.2L15.1 29.9L13.9 28.5L13.5 27.4L13.8 9.5L14.5 7.9Z"},"faucet":{"vb":"0 0 40.6 43.5","d":"M37.0 35.5L36.4 36.0L35.8 38.1L34.8 39.5L34.6 41.1L36.5 43.4L38.1 43.5L39.0 43.1L40.4 41.8L40.6 40.0L40.4 39.0L38.6 35.9ZM1.6 9.2L0.5 10.0L0.0 11.1L0.0 22.1L0.2 23.0L1.2 24.2L2.6 24.4L3.5 23.8L3.9 22.6L4.0 11.6L3.8 10.0L3.2 9.5ZM6.6 1.1L5.9 2.9L5.8 4.6L6.1 6.2L6.9 7.2L8.6 8.1L9.8 8.1L14.0 7.0L15.5 7.4L16.2 8.5L16.1 10.1L15.6 10.8L13.1 11.5L11.0 13.2L8.1 13.6L7.6 14.8L7.5 16.4L7.9 18.2L9.0 19.0L25.2 18.9L28.4 19.5L30.1 20.8L31.6 21.4L32.6 22.6L34.2 25.8L34.4 28.6L34.9 29.8L37.6 30.1L39.4 29.5L39.5 27.2L38.6 22.6L37.5 20.2L33.6 16.6L30.6 14.9L27.0 13.9L25.5 12.6L24.8 11.5L22.5 11.1L21.8 10.6L21.5 10.0L21.6 7.9L22.5 7.1L24.5 7.2L27.2 8.1L28.4 8.1L30.4 7.2L31.4 6.4L31.9 5.0L31.9 3.1L31.6 2.2L30.5 0.9L27.5 0.0L22.6 1.2L19.5 0.1L18.2 0.0L15.8 1.0L14.1 1.1L12.2 0.5L8.9 0.0L7.4 0.5Z"},"power":{"vb":"0 0 45.1 44.0","d":"M42.5 39.2L42.0 39.6L41.4 41.2L41.6 43.1L42.5 44.0L44.1 43.9L44.9 43.4L45.1 42.8L45.1 40.6L44.4 39.5ZM35.4 39.1L34.6 39.6L33.8 40.9L33.6 42.1L34.8 43.8L36.2 44.0L37.8 43.2L38.2 41.4L37.4 39.8ZM28.4 39.1L27.4 39.6L26.1 40.9L26.0 42.0L26.9 43.5L28.1 44.0L29.0 44.0L30.5 43.0L30.9 41.1L29.5 39.5ZM26.1 2.8L25.1 3.6L25.0 4.9L28.0 7.0L30.2 8.0L34.4 11.9L36.2 14.9L37.6 18.6L38.0 20.2L38.0 24.9L37.6 27.0L35.9 31.0L34.6 32.5L34.9 34.5L35.9 34.9L37.1 34.2L37.9 33.4L39.5 30.1L41.2 23.8L41.2 20.5L39.5 14.9L38.0 11.9L36.4 9.6L32.2 5.8L30.9 5.2L27.1 2.8ZM14.5 2.5L12.1 3.8L10.4 5.1L8.9 5.6L6.6 7.5L3.6 10.8L2.6 13.1L1.6 14.6L0.0 19.8L0.1 25.4L1.6 30.2L3.0 32.6L3.6 34.4L6.9 37.6L10.8 40.5L15.0 42.1L19.6 42.9L20.2 42.6L21.0 41.6L20.4 40.5L12.6 38.4L7.9 34.8L5.2 31.4L3.2 27.1L3.1 19.8L3.6 16.8L5.5 13.2L9.0 9.2L13.8 6.2L15.4 5.6L16.0 5.0L16.2 4.4L16.0 3.6L15.2 2.8ZM19.8 0.0L19.1 0.6L18.9 1.5L19.1 4.2L19.0 20.5L19.5 21.5L21.2 21.8L22.2 20.6L22.2 1.0L21.2 0.0Z"}};
const HOP_ROWS = [[8.0, [5.5, 11.2, 17.2, 22.9, 28.8, 34.6]], [14.0, [8.3, 14.2, 19.9, 25.8, 31.4]], [19.7, [11.2, 17.1, 22.6, 28.4]], [25.4, [14.2, 20.1, 25.8]], [31.2, [16.9, 22.6]]]; // zasobnik: rzedy kropek (od gory), uklad ze zdjecia panelu
const BURNER = { 0: 'Wyłączony', 1: 'Rozpalanie', 2: 'Rozżarzanie', 5: 'Modulacja', 6: 'Wygaszanie', 7: 'Czyszczenie', 8: 'Pauza', 9: 'Stop', 10: 'Alarm' };
const TITLES = {
  menu: 'MENU', boiler: 'NASTAWY', burner_s: 'NASTAWY', co_s: 'NASTAWY', cwu_s: 'NASTAWY', alarm: 'ALARMY', info: 'INFO',
};
const MODES = [
  { n: 'Off', ic: 'mdi:power', sup: 'off', pos: 0.052 }, { n: 'Eko', ic: 'mdi:moon-waning-crescent', sup: 'eco', pos: 0.37 },
  { n: 'Harmonogram', ic: 'mdi:clock-outline', sup: '', pos: 0.664 }, { n: 'Komfort', ic: 'mdi:white-balance-sunny', sup: 'comf', pos: 1 }];
// nazwy alarmów (kod z ESP -> opis jak na panelu)
const ALARM_PL = {
  1: 'Czujnik kotła', 2: 'Przegrzanie kotła', 3: 'Czujnik powrotu', 4: 'Czujnik temp. podajnika', 5: 'STB', 6: 'Przegrzanie podajnika', 7: 'Łańcuch bezpieczeństwa', 8: 'Czujnik spalin',
  20: 'Czujnik pokojowy CO1', 21: 'Czujnik pokojowy CO2', 24: 'Czujnik CO1', 25: 'Czujnik CO2', 30: 'Czujnik CWU', 31: 'Czujnik bufora góra', 32: 'Czujnik bufora dół',
  50: 'Rezerwa paliwa', 51: 'Brak paliwa w zasobniku', 110: 'Brak komunikacji z modułem BIG', 115: 'Brak komunikacji z modułem lambda', 130: 'Faza czyszczenia', 131: 'Błąd wygaszania',
  140: 'Brak ognia/opału', 150: 'Dodatkowy magazyn: brak paliwa/max', 151: 'Dodatkowy magazyn: rezerwa', 160: 'Wymiennik do czyszczenia', 161: 'Palnik do czyszczenia',
  200: 'Ruszt', 201: 'Awaria dmuchawy', 202: 'Drzwi kotła otwarte', 203: 'Bardzo niski poziom tlenu' };
const DAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'], DAYS_FULL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
const PROG_LBL = ['WODA', 'OGRZEWANIE', 'KOCIOŁ']; // kind: 0 = CWU, 1 = CO, 2 = kocioł
// okna ustawień CO / CWU (zakresy wg panelu)
const CDLG = {
  co: { lo1: 15, hi1: 30, lo2: 10, hi2: 30, step: 0.5, dec: 1, w1: 2, w2: 3, ck: 'co_comfort', ek: 'co_eco', mk: 'co_mode' },
  cwu: { lo1: 20, hi1: 70, lo2: 20, hi2: 70, step: 1, dec: 0, w1: 0, w2: 1, ck: 'cwu_comfort', ek: 'cwu_eco', mk: 'cwu_mode' } };
const MX = [28, 42.5, 57, 71.5]; // środki ikon trybów w oknach (cqw); suwak trybu: left 24, width 52

const LIVE = ['main', 'water', 'heat', 'burn'];
const IMG = () => window.TEKLA_IMG || {}; // grafiki: tekla-panel-burner.js (kocioł + palnik, WebP)

window.__pcLiteDefs = { ENT_GROUPS, ROLE_KEY, SCREEN_OPTS };
class TeklaPanelCard extends HTMLElement {
  setConfig(c) {
    this._cfg = c || {};
    this.E = Object.assign({}, TEKLA_DEF, this._cfg.entities || {});
    this.SCH = Object.assign({}, SCHED_DEF, this._cfg.schedules || {});
    this._scr = this._cfg.screen || 'main'; this._backTo = 'main';
    this._modal = false; this._scroll = {}; this._sig = '';
    if (!document.getElementById('pcl-font')) {
      const l = document.createElement('link'); l.id = 'pcl-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&display=swap';
      document.head.appendChild(l);
    }
    if (c && c.screen === 'quick') { this._scr = 'main'; this._modal = true; }
    if (c && c.screen === 'fuel') { this._scr = 'main'; this._modal = 'fuel'; }
    void 0;
    if (!this._imgL) { this._imgL = () => this._built && this._render(true); window.addEventListener('pcl-img', this._imgL); }
    if (!this.shadowRoot) this._build();
    else this._render(true);
  }
  getCardSize() { return 6; }
  static getStubConfig() { return { screen: 'main', entities: {} }; }
  static getConfigElement() { return document.createElement('pelletcan-lite-core-editor'); }

  set hass(h) {
    this._hass = h;
    if (!this._rf0) { this._rf0 = 1; this._refresh(true); }
    this._trackFeed();
    if (!this._built) return;
    this._render(false);
  }

  /* ---------- helpers ---------- */
  _unl() { return Date.now() - LVL.t < LVL_MS; }
  
  _touch() { if (this._unl()) void 0; }
  
  _mirror() { return true; }
  
  
  _refresh(force) { const n = Date.now(); if (!force && n - (this._rfAt || 0) < 30000) return; this._rfAt = n; void 0; }
  // harmonogram: kind 0 = CWU, 1 = CO, 2 = kocioł; zwraca 7 liczb (24 bity) albo null
  _bits(kind) {
    const s = this._s(['sch_cwu', 'sch_co', 'sch_boil'][kind]), arr = new Array(7).fill(null);
    if (s && !['unknown', 'unavailable'].includes(s.state)) s.state.trim().split(/\s+/).forEach((h, i) => { if (i < 7 && /^[0-9A-Fa-f]{6}$/.test(h)) arr[i] = parseInt(h, 16); });
    const sp = this._sp || (this._sp = {});
    for (let d = 0; d < 7; d++) { const q = sp[kind + ':' + d]; if (q) { if (arr[d] === q.bits || Date.now() - q.t > 20000) delete sp[kind + ':' + d]; else arr[d] = q.bits; } }
    return arr;
  }
  _bands(bits) {
    if (bits == null) return null;
    const o = []; let st = null;
    for (let i = 0; i <= 24; i++) { const b = i < 24 && ((bits >> i) & 1); if (b && st === null) st = i; if (!b && st !== null) { o.push([st, i]); st = null; } }
    return o;
  }
  _today() { return (new Date().getDay() + 6) % 7; }
  _todayBands(kind, fb) { return this._bands(this._bits(kind)[this._today()]) || fb; }
  _bMode() {
    const t = this._t('mode', '').toLowerCase(), man = /ręcz|recz/.test(t);
    return t.includes('czas') ? (man ? 1 : 0) : (man ? 3 : 2);
  }
  _chipHtml(bm) {
    return bm < 2 ? `<span class="ck"><ha-icon icon="mdi:clock-outline"></ha-icon><sup>${bm ? 'M' : 'A'}</sup></span>` : `<u>${bm === 2 ? 'AUTO' : 'MAN'}</u>`;
  }
  // suwak jak w oknach panelu (kolorowy do wskaźnika, reszta szara)
  _sl(attrs, x, y, w, p) {
    p = Math.max(0, Math.min(1, p)); const f = Math.max(p, 0.001);
    return `<div class="sl" ${attrs} style="left:${x}cqw;top:${y}cqw;width:${w}cqw"><b style="width:${(p * 100).toFixed(1)}%;background-size:${(100 / f).toFixed(1)}% 100%"></b><i style="left:${(p * 100).toFixed(1)}%"></i></div>`;
  }
  _mdiIcon(attrs, x, y, inner, on) { return `<span class="mdi ${on ? 'on' : ''}" ${attrs} style="left:${x}cqw;top:${y}cqw">${inner}</span>`; }
  // okno trybu kotła
  _bOpen() {
    const bm = this._bMode(), v = Math.round(this._v('boiler_manual'));
    const val = isNaN(v) ? 65 : Math.max(60, Math.min(80, v));
    this._bd = { mode: bm, m0: bm, val, v0: val };
    this._modal = 'boiler'; this._refresh(); this._render(true);
  }
  _bDlg() {
    const d = this._bd || (this._bOpen(), this._bd), man = d.mode === 1 || d.mode === 3;
    const top = man ? `<div class="bval">${d.val}</div><span class="blb" style="left:17cqw">60</span><span class="blb" style="left:79cqw">80</span>
      ${this._sl('data-act="bslide"', 17, 27, 66, (d.val - 60) / 20)}
      <div class="bpm" data-act="bval" data-d="-1" style="left:17cqw"><i></i></div><div class="bpm pl" data-act="bval" data-d="1" style="left:50.5cqw"><i></i><i></i></div>`
      : '<div class="btxt">W tym trybie temperatura<br>zadawana jest automatycznie.</div>';
    const ic = [
      `<ha-icon icon="mdi:clock-outline"></ha-icon><sup>A</sup>`, `<ha-icon icon="mdi:clock-outline"></ha-icon><sup>M</sup>`, '<u class="plq">AUTO</u>', '<u class="plq">MAN</u>'];
    return `<div class="qd"><div class="qx" data-act="cancel"></div><div class="qbg"></div>${top}
      ${ic.map((h, i) => this._mdiIcon(`data-act="bm" data-i="${i}"`, MX[i], 45, h, d.mode === i)).join('')}
      ${this._sl('data-act="bmslide"', 24, 49.6, 52, (MX[d.mode] - 24) / 52)}
      <div class="qok" data-act="ok">OK</div></div>`;
  }
  // okno ustawień obiegu (CO / CWU): komfort, eco, tryb
  _cOpen(k) {
    const c = CDLG[k], cf = this._v(c.ck), ec = this._v(c.ek), mm = this._mode(c.mk);
    const mi = mm ? MODES.indexOf(mm) : 3;
    const cfv = isNaN(cf) ? c.hi1 : cf, ecv = isNaN(ec) ? c.lo2 : ec;
    this._cd = { k, comf: cfv, eco: ecv, mode: mi, c0: cfv, e0: ecv, m0: mi };
    this._modal = k; this._refresh(); this._render(true);
  }
  _cDlg(k) {
    if (!this._cd || this._cd.k !== k) return '';
    const c = CDLG[k], d = this._cd, f = v => v.toFixed(c.dec);
    const blk = (w, y, lo, hi, val, icon, sup) => `
      ${this._mdiIcon('', 40, y + 3.2, `<ha-icon icon="${icon}"></ha-icon><sup>${sup}</sup>`, true)}<div class="cval" style="top:${y - 1.3}cqw">${f(val)}</div>
      <span class="blb" style="left:21cqw;top:${y + 4}cqw">${lo}</span><span class="blb" style="left:79cqw;top:${y + 4}cqw">${hi}</span>
      ${this._sl(`data-act="cslide" data-w="${w}"`, 21, y + 12.5, 58, (val - lo) / (hi - lo))}
      <div class="bpm sm" data-act="cval" data-w="${w}" data-d="-1" style="left:6.5cqw;top:${y + 8.3}cqw"><i></i></div><div class="bpm sm pl" data-act="cval" data-w="${w}" data-d="1" style="left:81.5cqw;top:${y + 8.3}cqw"><i></i><i></i></div>`;
    return `<div class="qd"><div class="qx" data-act="cancel"></div><div class="qbg"></div>
      ${blk('comf', 8.4, c.lo1, c.hi1, d.comf, 'mdi:white-balance-sunny', 'comf')}${blk('eco', 24, c.lo2, c.hi2, d.eco, 'mdi:moon-waning-crescent', 'eco')}
      ${MODES.map((m, i) => this._mdiIcon(`data-act="cm" data-i="${i}"`, MX[i], 45, `<ha-icon icon="${m.ic}"></ha-icon>${m.sup ? `<sup>${m.sup}</sup>` : ''}`, d.mode === i)).join('')}
      ${this._sl('data-act="cmslide"', 24, 49.6, 52, (MX[d.mode] - 24) / 52)}
      <div class="qok" data-act="ok">OK</div></div>`;
  }
  
  _slFrac(a, e) { const r = a.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); }
  // ekran PROGRAM: 7 dni z paskami 0–24 i edycja godzin
  _dayBar(bits) {
    if (bits == null) return '<svg viewBox="0 0 240 24" preserveAspectRatio="none" class="dbar"><text x="120" y="17" text-anchor="middle" font-size="14" fill="#9fb0d8">--</text></svg>';
    let r = '', t = '';
    (this._bands(bits) || []).forEach(([a, b]) => { r += `<rect x="${a * 10}" y="3" width="${(b - a) * 10}" height="14" fill="#ff2a22"/>`; });
    for (let h = 0; h <= 24; h++) t += `<line x1="${h * 10}" y1="${h % 6 === 0 ? 18 : 20}" x2="${h * 10}" y2="24" stroke="#c5d0ea" stroke-width="${h % 6 === 0 ? 2 : 1}"/>`;
    return `<svg viewBox="0 0 240 24" preserveAspectRatio="none" class="dbar"><rect x="0" y="15" width="240" height="2.4" fill="#ff2a22"/>${r}${t}</svg>`;
  }
  _progHdr(title, edit) {
    return `<div class="h2"><span class="bk" ${edit ? 'data-act="pcancel"' : `data-go="${this._backTo || 'main'}"`}>&lsaquo; ${edit ? 'PROGRAM' : PROG_LBL[(this._prog || {}).kind ?? 2]}</span><span class="tt">${title}</span>
      <span class="hi"><span data-go="main"><ha-icon class="cy" icon="mdi:home-variant"></ha-icon></span></span></div>`;
  }
  _progPg() {
    const kind = (this._prog || {}).kind ?? 2, pe = this._pe;
    if (pe) {
      let cells = '';
      for (let h = 0; h < 24; h++) {
        const on = (pe.bits >> h) & 1;
        cells += `<div class="hc ${on ? 'on' : ''}" data-act="phr" data-h="${h}" style="left:${(3.6 + (h % 12) * 7.6).toFixed(1)}cqw;top:${(h < 12 ? 14 : 28.6)}cqw"><b>${h}</b></div>`;
      }
      return `${this._progHdr(DAYS_FULL[pe.day].toUpperCase(), true)}${cells}
        <div class="pb" data-act="pall" data-v="1" style="left:3.6cqw;width:27cqw">KOMFORT 24 h</div><div class="pb" data-act="pall" data-v="0" style="left:33cqw;width:20cqw">ECO 24 h</div>
        <div class="pb" data-act="pcancel" style="left:62cqw;width:15cqw">ANULUJ</div><div class="pb" data-act="pok" style="left:79.5cqw;width:15cqw">OK</div>`;
    }
    const bits = this._bits(kind), td = this._today();
    const rows = DAYS.map((n, d) => `<div class="prow ${d === td ? 'td' : ''}" data-act="pday" data-d="${d}"><span class="pn">${n}</span><div class="pbar">${this._dayBar(bits[d])}<span class="pbl">0</span><span class="pbl" style="left:25%">6</span><span class="pbl" style="left:50%">12</span><span class="pbl" style="left:75%">18</span><span class="pbl" style="left:100%">24</span></div></div>`).join('');
    return `${this._progHdr('PROGRAM')}<div class="plist">${rows}</div>`;
  }
  _trackFeed() {
    const v = this._v('feed_time'), f = this._ft || (this._ft = { v: NaN, dec: 0 });
    if (!isNaN(v) && !isNaN(f.v) && v < f.v) {
      f.dec = Date.now();
      clearTimeout(this._ftTimer);
      this._ftTimer = setTimeout(() => this._built && this._render(true), 15500);
    }
    f.v = v;
  }
  // ilość paliwa [kg]: po kliknięciu + / − pokazujemy wartość zadaną do czasu potwierdzenia z kotła (maks. 8 s)
  _fuelKg() {
    const p = this._fp;
    if (p && Date.now() - p.t < 8000 && this._v('fuel') !== p.kg) return p.kg;
    if (p) this._fp = null;
    return this._v('fuel');
  }
  
  _fuelPct() {
    const kg = this._fuelKg(), cap = this._v('fuel_cap');
    if (this._fp && !isNaN(kg) && !isNaN(cap) && cap > 0) return Math.max(0, Math.min(1, kg / cap));
    const p = this._v('fuel_pct');
    if (!isNaN(p)) return Math.max(0, Math.min(1, p / 100));
    return isNaN(kg) || isNaN(cap) || cap <= 0 ? 0 : Math.max(0, Math.min(1, kg / cap));
  }
  // licznik przy przycisku podajnika: stan spoczynku 30 s (kocioł wyłączony: 600 s); po starcie odlicza co 1 s, po zatrzymaniu/końcu wraca
  
  
  
  _feeding() { return !!this._ft && Date.now() - this._ft.dec < 15000; }
  _s(k) { return this._hass && this.E[k] && this._hass.states[this.E[k]]; }
  _v(k) { const s = this._s(k); if (!s) return NaN; const n = parseFloat(s.state); return isNaN(n) ? NaN : n; }
  _on(k) { const s = this._s(k); return !!s && s.state === 'on'; }
  // tryb pracy obiegu: Off / Eko / Harmonogram / Komfort (tekst z ESP) -> ikona, podpis, pozycja suwaka
  _mode(k) {
    const t = (this._s(k) && !['unknown', 'unavailable'].includes(this._s(k).state) ? this._s(k).state : '').toLowerCase();
    let i = -1;
    if (t.startsWith('off')) i = 0; else if (t.startsWith('eko') || t.startsWith('eco')) i = 1;
    else if (t.startsWith('har') || t.startsWith('cza')) i = 2; else if (t.startsWith('kom') || t.startsWith('com')) i = 3;
    const p = this._mp && this._mp[k];
    if (p) { if (i === p.i || Date.now() - p.t > 20000) delete this._mp[k]; else i = p.i; }
    return i < 0 ? null : MODES[i];
  }
  // zmiana trybu: select z ESP (opcja Off/Eko/Harmonogram/Komfort); do potwierdzenia z kotła pokazujemy wybór od razu
  
  // Test wyjść: tryb dmuchawy / podajnika z tekstu z ESP -> 'auto' | 'off' | 'on'
  
  
  
  
  
  _t(k, d = '-') { const s = this._s(k); return !s || ['unknown', 'unavailable'].includes(s.state) ? d : s.state; }
  _p(v, n = 1) { return isNaN(v) ? '-' : v.toFixed(n); }
  _opt(k, n = 0, d = '-') { const v = this._v(k); return isNaN(v) ? d : v.toFixed(n); }

  /* ---------- skeleton ---------- */
  _build() {
    this._built = true;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${this._css()}</style>
      <div class="bezel"><div class="strip" id="strip"></div><div class="screen" id="scr"></div></div>`;
    root.addEventListener('click', e => {
      this._touch();
      const a = e.target.closest('[data-go],[data-act]'); if (!a || !this._hass) return;
      if (a.dataset.go) { this._go(a.dataset.go, a.dataset.back); return; }
      const act = a.dataset.act;
      if (act === 'quick') { this._modal = true; this._render(true); }
      else if (act === 'fuel') { this._modal = 'fuel'; this._render(true); }
      else if (act === 'ok') { if (['boiler', 'co', 'cwu'].includes(this._modal)) void 0; else { this._modal = false; this._render(true); } }
      else if (act === 'cancel') { this._modal = false; this._render(true); }
      else if (act === 'bdlg') this._bOpen();
      else if (act === 'cdlg') this._cOpen(a.dataset.k);
      else if (act === 'cval' || act === 'cslide') {
        const c = CDLG[this._cd.k], w = a.dataset.w, lo = w === 'comf' ? c.lo1 : c.lo2, hi = w === 'comf' ? c.hi1 : c.hi2, cur = this._cd[w];
        let v = act === 'cval' ? cur + +a.dataset.d * c.step : lo + this._slFrac(a, e) * (hi - lo);
        v = Math.round(v / c.step) * c.step; this._cd[w] = Math.max(lo, Math.min(hi, v)); this._render(true);
      }
      else if (act === 'prog') { this._prog = { kind: +a.dataset.kind }; this._pe = null; this._go('prog', a.dataset.back || 'main'); this._refresh(true); }
      else if (act === 'more') {
        const ev = new Event('hass-more-info', { bubbles: true, composed: true });
        ev.detail = { entityId: this.E[a.dataset.e] }; this.dispatchEvent(ev);
      }
    });
    root.addEventListener('scroll', e => {
      const t = e.target; if (t && t.classList && t.classList.contains('list')) this._scroll[this._scr] = t.scrollTop;
    }, true);
    this._render(true);
  }
  _go(s, back) {
    this._backTo = back || (LIVE.includes(this._scr) ? this._scr : 'main');
    if (s === 'main') this._backTo = 'main';
    this._scr = s; this._modal = false; this._pe = null; this._pr = null;
    if (['main', 'heat', 'water', 'prog'].includes(s)) this._refresh();
    this._render(true);
  }

  /* ---------- parts ---------- */
  _hdrLive(title) {
    return `<div class="h2"><span class="bk" data-go="main">EKRAN GŁ.</span><span class="tt">${title}</span>
      <span class="hi"><ha-icon icon="mdi:account"></ha-icon><span data-go="main"><ha-icon class="cy" icon="mdi:home-variant"></ha-icon></span></span></div>`;
  }
  _fan(spin) {
    return `<svg viewBox="0 0 24 24" class="fan4 ${spin ? 'spin' : ''}"><g fill="#fff"><path d="M12 11C9.6 8.8 9.4 3.4 12 1.6C14.6 3.4 14.4 8.8 12 11Z"/><path d="M13 12C15.2 9.6 20.6 9.4 22.4 12C20.6 14.6 15.2 14.4 13 12Z"/><path d="M12 13C14.4 15.2 14.6 20.6 12 22.4C9.4 20.6 9.6 15.2 12 13Z"/><path d="M11 12C8.8 14.4 3.4 14.6 1.6 12C3.4 9.4 8.8 9.6 11 12Z"/></g><circle cx="12" cy="12" r="1.6" fill="#51618f"/></svg>`;
  }
  _augSvg(anim = true) {
    return `<svg viewBox="-2 -2 104 48" class="aug"><defs><clipPath id="augc"><rect x="-2" y="-2" width="104" height="17.6"/><rect x="-2" y="31.4" width="104" height="17.6"/></clipPath></defs><rect x="0" y="15.6" width="100" height="15.8" rx="2" fill="#566690" stroke="#fff" stroke-width="3.4"/><g clip-path="url(#augc)"><g><polyline points="-33.2,0 -18.5,44 -3.8,0 10.9,44 25.6,0 40.3,44 55.0,0 69.7,44 84.4,0 99.1,44 113.8,0 128.5,44 143.2,0 157.9,44 172.6,0 187.3,44" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="miter"/>${anim ? '<animateTransform attributeName="transform" type="translate" from="0 0" to="29.4 0" dur=".6s" repeatCount="indefinite"/>' : ''}</g></g></svg>`;
  }
  _auger(n, run) {
    if (!run) return '';
    return `<span class="augw">${this._augSvg()}<sup>${n}</sup></span>`;
  }
  _fuelDlg() {
    // wymiary 1:1 ze zdjęcia panelu (dialog 1555 px = 94,2 cqw => 0,0606 cqw/px)
    const kg = this._fuelKg(), cap = this._v('fuel_cap'), ft = this._v('feed_time');
    const pct = this._fuelPct();
    const barTop = 9.58, barH = 32.7, y = barTop + barH * (1 - pct);
    const chev = (d, top) => `<svg viewBox="0 0 24 13" class="fch" style="top:${top.toFixed(2)}cqw"><path d="${d}" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/></svg>`;
    return `<div class="qd"><div class="qbg" style="top:4.7cqw;height:51.2cqw"></div>
      <div class="ftk"><div class="fth"></div>
        <svg viewBox="0 0 42 20" class="fhd"><path d="M3 20V9Q3 2.2 9.5 2.2H32.5Q39 2.2 39 9V20" fill="none" stroke="#f9d3cf" stroke-width="4.4"/></svg>
        <div class="fbar"><i style="height:${(pct * 100).toFixed(1)}%"></i></div>
        <div class="fhn" style="top:${y.toFixed(2)}cqw"></div>
        ${chev('M2 11L12 2.5L22 11', y - 3.03 - 1.25)}${chev('M2 2L12 10.5L22 2', y + 2.73 - 1.25)}
        <span class="fe">E</span></div>
      <span class="ftt">Paliwo</span>
      <span class="fkg">${isNaN(kg) ? '-' : Math.round(kg)}kg</span>
      <div class="qok" data-act="ok" style="left:82.4cqw;top:45.8cqw;width:10.1cqw;height:6.67cqw;background:linear-gradient(#5b6a8a,#3e4a68);border-color:#2c3550">OK</div></div>`;
  }
  _hopper() {
    // zasobnik wypelniany "kropkami" proporcjonalnie do paliwa: 0 / 20 / 40 / 60 / 80 / 100 % (rzedy od dolu)
    const lv = Math.ceil(this._fuelPct() * HOP_ROWS.length - 1e-9);
    let dots = '';
    for (let i = 0; i < lv; i++) { const [y, xs] = HOP_ROWS[HOP_ROWS.length - 1 - i]; dots += xs.map(x => `<circle cx="${x}" cy="${y}" r="1.5"/>`).join(''); }
    return `<svg viewBox="${ICO.hopper.vb}" class="ic2" fill="#d6e4ff"><path d="${ICO.hopper.d}"/>${dots}</svg>`;
  }
  _brow(first, gear, second, third) {
    return `<div class="brow"><div class="c1">${first}</div><div class="c">${second || ''}</div><div class="c">${third || ''}</div><div class="c"></div><div class="c"></div><div class="c"></div>
      <div class="cg" ${gear ? `data-go="${gear}" data-back="${this._scr}"` : ''}><ha-icon icon="mdi:cogs"></ha-icon></div></div>`;
  }
  _sched(bands) {
    const X = h => 29 + h * 6.35;
    let t = '';
    for (let h = 0; h <= 24; h++) t += `<line x1="${X(h).toFixed(1)}" y1="${h % 6 === 0 ? 25 : 27}" x2="${X(h).toFixed(1)}" y2="32" stroke="#c5d0ea" stroke-width="${h % 6 === 0 ? 2 : 1.2}"/>`;
    const lab = [0, 6, 12, 18, 24].map(h => `<text x="${X(h).toFixed(1)}" y="49" text-anchor="${h === 0 ? 'start' : h === 24 ? 'end' : 'middle'}" font-size="17" fill="#dfe7fa">${h}</text>`).join('');
    const bs = (bands || []).map(([a, b]) => `<rect x="${X(a).toFixed(1)}" y="9" width="${((b - a) * 6.35).toFixed(1)}" height="14" fill="#ff2a22"/>`).join('');
    return `<svg viewBox="0 0 205 56" preserveAspectRatio="none" class="sched"><rect x="27" y="20" width="155" height="3" fill="#ff2a22"/>${bs}${t}${lab}</svg>`;
  }
  _tank() {
    return `<svg viewBox="0 0 70 124" preserveAspectRatio="none" class="tank"><defs><linearGradient id="tk" x1="0" x2="1"><stop offset="0" stop-color="#c9d3ea"/><stop offset=".45" stop-color="#ffffff"/><stop offset="1" stop-color="#aab7d6"/></linearGradient>
      <linearGradient id="cl" x1="0" x2="1"><stop offset="0" stop-color="#5f8cd8"/><stop offset="1" stop-color="#9dbcf0"/></linearGradient></defs>
      <rect x="8" y="6" width="54" height="110" rx="14" fill="url(#tk)"/><ellipse cx="35" cy="8" rx="26" ry="4" fill="#eef2fb"/>
      <g transform="translate(7.5 9.5) scale(.91 .7)"><path d="M14 32h12v-5h8v5h2c8 0 12 4 12 14" fill="none" stroke="#e5352b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect x="22" y="20" width="14" height="5" rx="2" fill="#e5352b"/>
      <path d="M45 52q0 6-3 9 3 0 6 0" fill="none" stroke="#e5352b" stroke-width="0"/><circle cx="48" cy="58" r="3.4" fill="#e5352b"/></g>
      <path d="M18 70h34l-4 6 4 6-4 6 4 6-4 6H18l4-6-4-6 4-6-4-6z" fill="url(#cl)" opacity=".9"/>
      <g stroke="#fff" stroke-width="1.2" opacity=".9"><path d="M20 74h30M20 80h30M20 86h30M20 92h30M20 98h30M20 104h30"/></g></svg>`;
  }
  _rad(on) {
    let c = '';
    for (let i = 0; i < 9; i++) {
      const x = 37 + i * 21.9;
      c += `<rect x="${x}" y="8" width="14" height="126" rx="6" fill="url(#rd)"/><ellipse cx="${x + 7}" cy="9" rx="9" ry="6" fill="#f2f6ff"/><ellipse cx="${x + 7}" cy="133" rx="9" ry="6" fill="#dfe8fb"/>`;
    }
    return `<svg viewBox="0 0 232 143" preserveAspectRatio="none" class="rad"><defs><linearGradient id="rd" x1="0" x2="1"><stop offset="0" stop-color="#8fa8dc"/><stop offset=".45" stop-color="#ffffff"/><stop offset="1" stop-color="#8ea7da"/></linearGradient></defs>
      ${c}<rect x="34" y="22" width="196" height="5" rx="2" fill="#cfdaf3"/><rect x="34" y="112" width="196" height="5" rx="2" fill="#cfdaf3"/>
      <circle cx="26" cy="15" r="6" fill="none" stroke="#fff" stroke-width="2.6"/><path d="M0 15h18M32 15h6" stroke="#fff" stroke-width="3"/><path d="M0 124h38" stroke="#fff" stroke-width="3.2"/></svg>`;
  }
  _switch(closed) {
    return `<svg viewBox="0 0 110 36" class="sw"><g stroke="#fff" stroke-width="7.4" stroke-linecap="round" fill="none"><path d="M3.7 30H28.8M75.3 30H106.3"/><path d="${closed ? 'M28.8 30L78.4 30' : 'M28.8 30L71.3 4.4'}"/></g><circle cx="28.8" cy="30" r="6.4" fill="#fff"/><circle cx="77" cy="30" r="6.4" fill="#fff"/></svg>`;
  }
  _burner() {
    return `<img class="burn" alt="Palnik" src="${IMG().burner || ''}" draggable="false">`;
  }
  _boilerMain(burning) {
    return `<img class="boil" alt="Tekla" src="${IMG().boiler || ''}" draggable="false">`;
  }
  _pump(spin) {
    return `<svg viewBox="0 0 24 24" class="pmp ${spin ? 'spin' : ''}"><circle cx="12" cy="12" r="10" fill="none" stroke="#e9f0ff" stroke-width="2"/><circle cx="12" cy="12" r="7.6" fill="#e9f0ff" opacity=".35"/><path d="M12 5.6L18 16.6H6Z" fill="#fff"/></svg>`;
  }
  _lamp(on) { return `<span class="lamp ${on ? 'on' : ''}"></span>`; }

  /* ---------- live screens ---------- */
  _main(ctx) {
    const { burning, alarm, bname, out, sw } = ctx;
    const d = new Date();
    let day = d.toLocaleDateString('pl-PL', { weekday: 'long' }); day = day.charAt(0).toUpperCase() + day.slice(1);
    const time = d.toLocaleTimeString('pl-PL', { hour: 'numeric', minute: '2-digit' });
    const bar = (cls) => `<i class="ind ${cls}"></i>`;
    const fuel = this._s('fuel') && !isNaN(this._fuelKg()) ? Math.round(this._fuelKg()) : '-';
    return `
      <div class="top"><span class="tm">${time}</span><span class="dy">${day}</span>
        <span class="ot"><svg viewBox="0 0 108 68" class="wx" fill="#dbe7ff"><g stroke="#dbe7ff" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="79" cy="32" r="14"/><path d="M79 5V9M79 55V59M52 32H56M102 32H106M60 13L63 16M98 13L95 16M98 51L95 48"/></g><path d="M12 68A12 12 0 0 1 13 44A18 18 0 0 1 46 36A15 15 0 0 1 74 50A9 9 0 0 1 72 68Z" stroke="#4a5a8c" stroke-width="3"/></svg>${this._p(out)}</span></div>
      ${this._boilerMain(burning)}
      <div class="big" data-act="more" data-e="boiler_temp">${this._p(this._v('boiler_temp'))}</div>
      <div class="st ${alarm ? 'al' : ''}">${bname}</div>
      <div class="tag" data-act="bdlg"><b>${isNaN(this._v('boiler_set')) ? '-' : Math.round(this._v('boiler_set'))}</b>${this._chipHtml(ctx.bm)}</div>
      ${ctx.bm < 2 ? `<div class="tbar" data-act="prog" data-kind="2" data-back="main">${this._sched(this._todayBands(2, []))}</div>` : ''}
      <div class="bbar">
        <div class="cell"><svg viewBox="0 0 35 30.2" class="ic mic"><path d="M0 1.3H35M0 8.5H35M0 15.8H35" stroke="#d6e4ff" stroke-width="2.6" fill="none"/><text x="0" y="29.7" textLength="35" lengthAdjust="spacingAndGlyphs" font-size="11" font-weight="700" fill="#d6e4ff" font-family="Roboto Condensed,Roboto,Arial,sans-serif">MENU</text></svg><small class="mn" data-go="menu"></small></div>
        <div class="cell" data-act="fuel"><small class="fl">${fuel === '-' ? '-' : fuel + 'kg'}</small>${this._hopper()}</div>
        <div class="cell" data-go="burn">${bar(this._v('burner_code') % 256 === 5 ? 'g' : [1, 2].includes(this._v('burner_code') % 256) ? 'g gb' : '')}${this._on('ban') ? '<i class="ban"></i>' : ''}<svg viewBox="${ICO.flame.vb}" class="ic2" fill="#d6e4ff" fill-rule="evenodd"><path d="${ICO.flame.d}"/></svg></div>
        <div class="cell" data-go="heat">${bar(this._on('co_pump') ? 'g' : '')}<span class="radi"><svg viewBox="${ICO.radi.vb}" class="ic2" fill="#d6e4ff" fill-rule="evenodd"><path d="${ICO.radi.d}"/></svg><sup>1</sup></span></div>
        <div class="cell"></div>
        <div class="cell" data-go="water">${bar(this._on('cwu_pump') ? 'g' : '')}<svg viewBox="${ICO.faucet.vb}" class="ic2" fill="#d6e4ff" fill-rule="evenodd"><path d="${ICO.faucet.d}"/></svg></div>
        <div class="cell" data-act="quick">${bar(sw ? 'g' : 'r')}<svg viewBox="${ICO.power.vb}" class="ic2" fill="#d6e4ff" fill-rule="evenodd"><path d="${ICO.power.d}"/></svg></div>
      </div>
      <div class="mnb" data-go="menu"></div>${alarm ? '<div class="alic" data-go="alarm" data-back="main">!</div>' : ''}`;
  }
  _water(ctx) {
    const set = this._v('cwu_set'), cf = this._v('cwu_comfort'), eco = this._v('cwu_eco');
    const wm = this._mode('cwu_mode');
    const m = wm ? [wm.ic, wm.sup] : !isNaN(set) && !isNaN(eco) && set === eco && set !== cf ? ['mdi:weather-night', 'eco'] : ['mdi:white-balance-sunny', 'comf'];
    return `${this._hdrLive('WODA')}
      ${this._tank().replace('class="tank"', 'class="tank pos-tank"')}
      <div class="bigv" data-act="more" data-e="cwu_temp">${this._p(this._v('cwu_temp'))}</div>
      <div class="box b1" data-act="cdlg" data-k="cwu"><b>${isNaN(set) ? '-' : Math.round(set)}</b><span class="mi"><ha-icon icon="${m[0]}"></ha-icon><sup>${m[1]}</sup></span></div>
      <div class="box b2" data-act="prog" data-kind="0" data-back="water">${this._sched(this._todayBands(0, this.SCH.cwu))}</div>
      ${this._brow(`${this._pump(this._on('cwu_pump'))}`, 'cwu_s')}${this._modal === 'cwu' ? this._cDlg('cwu') : ''}`;
  }
  _heat(ctx) {
    const sv = this._v('co_set'), aux = isNaN(sv) ? '' : Math.round(sv);
    return `${this._hdrLive('OGRZEWANIE 1')}
      <div class="cot" data-act="more" data-e="co_temp">${this._p(this._v('co_temp'))}${aux !== '' ? `<sup>${aux}</sup>` : ''}</div>
      ${this._rad()}
      ${this._switch(this._on('co_pump'))}
      <div class="box b1 mono" data-act="cdlg" data-k="co"><span class="mi lone"><ha-icon icon="${(this._mode('co_mode') || { ic: 'mdi:white-balance-sunny' }).ic}"></ha-icon><sup>${this._mode('co_mode') ? this._mode('co_mode').sup : 'comf'}</sup></span></div>
      <div class="box b2" data-act="prog" data-kind="1" data-back="heat">${this._sched(this._todayBands(1, this.SCH.co))}</div>
      ${this._brow(`${this._pump(this._on('co_pump'))}`, 'co_s')}${this._modal === 'co' ? this._cDlg('co') : ''}`;
  }
  _burn(ctx) {
    const kgh = this._opt('burn_kgh', 1), kw = this._opt('burn_kw', 1), br = this._opt('burn_bright', 0), bt = this._opt('burn_temp', 0);
    const pw = this._p(this._v('power'), 0);
    const fanOff = this._v('fan_pct') === 0; // wentylator stoi: bez liczby i bez ikony
    const fan = fanOff ? '' : this._opt('fan_pct', 0, ''), fd = this._s('feeder') ? this._t('feeder', '') : '', tm = this._s('burn_time') ? this._t('burn_time', '') : '';
    return `${this._hdrLive('PALNIK')}
      <div class="bname">${ctx.bname}</div>${this._burner()}
      <div class="stats"><div>spalanie[kg/h]=${kgh}</div><div>moc[kW]=${kw}</div><div>moc[%]=${pw}</div><div>jasność=${br}</div><div>&nbsp;</div><div>T. palnika=${bt}</div></div>
      <div class="mini"><span>${fan}</span><span>${fd}</span><span class="tmn">${tm}</span></div>
      ${this._brow(fanOff ? '' : this._fan(isNaN(this._v('fan_pct')) ? (this._s('blower_run') ? this._on('blower_run') : ctx.burning) : this._v('fan_pct') > 0), 'burner_s', this._auger(1, this._on('feeder_run')), this._auger(2, this._on('feeder2_run')))}`;
  }
  _quick(sw) {
    const set = this._v('cwu_set'), cf = this._v('cwu_comfort'), eco = this._v('cwu_eco');
    const wm = this._mode('cwu_mode');
    const wpos = wm ? wm.pos : !isNaN(set) && !isNaN(eco) && set === eco && set !== cf ? 0.32 : 0.95;
    const cm = (this._s('co_mode') ? this._t('co_mode', 'comf') : 'comf').toLowerCase();
    const cmm = this._mode('co_mode');
    const cpos = cmm ? cmm.pos : cm.startsWith('eco') ? 0.32 : cm.startsWith('off') ? 0.05 : 0.95;
    const mi = (k, n, x, y, ic, sup) => `<span class="mdi" data-act="setmode" data-k="${k}" data-i="${n}" style="left:${x}cqw;top:${y}cqw"><ha-icon icon="${ic}"></ha-icon>${sup ? `<sup>${sup}</sup>` : ''}</span>`;
    const modes = (k, y, xs) => MODES.map((m, n) => mi(k, n, xs[n], y, m.ic, m.sup)).join('');
    const slider = (k, x, y, w, p) => { const f = Math.max(p, 0.001); return `<div class="sl" data-act="slider" data-k="${k}" style="left:${x}cqw;top:${y}cqw;width:${w}cqw"><b style="width:${(p * 100).toFixed(1)}%;background-size:${(100 / f).toFixed(1)}% 100%"></b><i style="left:${(p * 100).toFixed(1)}%"></i></div>`; };
    return `<div class="qd"><div class="qbg"></div>
      <span class="qa" style="left:8.1cqw;top:11.7cqw">Kocioł</span><span class="tgq ${sw ? 'on' : ''}" data-act="toggle"><i></i></span>
      <span class="qa" style="left:7.8cqw;top:25.2cqw">Ogrzewanie 1</span>${modes('co_mode', 24.7, [39.5, 51.7, 63, 75.8])}${slider('co_mode', 37.5, 28.9, 38.4, cpos)}
      <span class="qa" style="left:7.6cqw;top:45.5cqw">Woda użytkowa</span>${modes('cwu_mode', 45.3, [38.5, 51, 61.8, 74.9])}${slider('cwu_mode', 37.1, 49.1, 38.4, wpos)}
      <div class="qok" data-act="ok">OK</div></div>`;
  }

  /* ---------- list pages (menu / ustawienia) ---------- */
  _hdr(title, back, sup = '1') {
    const PL = { boiler: 'KOCIOŁ', burner_s: 'PALNIK', co_s: 'OGRZEWANIE 1', cwu_s: 'WODA' }, lab = PL[this._scr] || (back === 'menu' ? 'MENU' : back === 'main' ? 'EKRAN GŁ.' : 'WSTECZ');
    return `<div class="h2"><span class="bk" data-go="${back}">&lsaquo; ${lab}</span><span class="tt">${title}</span>
      <span class="hi"><span class="wr">${this._unl() ? `<ha-icon icon="mdi:wrench"></ha-icon><sup>${sup}</sup>` : '<ha-icon class="pp" icon="mdi:account"></ha-icon>'}</span><span data-go="main"><ha-icon class="cy" icon="mdi:home-variant"></ha-icon></span></span></div>`;
  }
  _row(label, val) { return `<div class="row"><span class="l">${label}</span><span class="v">${val}</span></div>`; }
  _tog(label, on, red) { return `<div class="row ${red ? 'red' : ''}"><span class="l">${label}</span><span class="tg ${on ? 'on' : ''}"><i></i></span></div>`; }
  _page(title, back, body) { return `${this._hdr(title, back)}<div class="list">${body}</div>`; }
  // Moc dmuchawy modulacja [%]: 5 progow mocy kotla (20..100 %) -> obroty dmuchawy.
  // Wymiary zmierzone na zdjeciu panelu. Klik w wartosc = wybor, strzalki gora/dol = korekta co 1 (szkic lokalny, bez zapisu do kotla)
  
  _alarmPg(back) {
    const txt = this._t('last_alarm', ''), m = /kod\s+(\d+)/.exec(txt), code = m ? +m[1] : 0, act = this._on('alarm') || (this._v('burner_code') & 255) === 10;
    const raw = ALARM_PL[code] || ((/\(([^)]*)\)/.exec(txt) || [])[1] || '');
    const nm = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : '';
    const t0 = parseInt(this._t('alarm_start', '0'), 10), d = t0 > 1e9 ? new Date(t0 * 1000) : null;
    const dd = d ? d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }) : '-';
    const tt = d ? d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : '-';
    const body = code ? `<span class="al1" style="left:9.8cqw;top:17.4cqw">NR: 1</span><span class="al1" style="left:30cqw;top:17.7cqw">KOD: ${code}</span>
        <span class="al1" style="left:9.8cqw;top:24cqw">${nm}</span>
        <span class="al1" style="left:9.8cqw;top:30cqw">Powstanie:</span><span class="al1" style="left:46cqw;top:30.2cqw">${dd}</span><span class="al1" style="left:71cqw;top:30.4cqw">${tt}</span>
        ${act ? `<span class="ala">AKTYWNY</span>` : ''}
        <div class="alar" style="top:22cqw">&#8963;</div><div class="alar" style="top:35.5cqw">&#8964;</div>`
      : '<span class="al1" style="left:0;right:0;text-align:center;top:26cqw">Brak alarmów</span>';
    return `${this._hdr('HISTORIA ALARMÓW', back, '2')}<div class="alln" style="top:14.2cqw"></div>${body}<div class="alln" style="top:49.6cqw"></div>`;
  }
  _menu() { return this._page('MENU', 'main', ''); }
  _body(s) {
    const back = ['kociol', 'info'].includes(s) ? 'menu' : this._backTo;
    const P = (t, b) => this._page(t, back, b.join(''));
    if (s === 'alarm') return this._alarmPg(this._backTo === 'main' ? 'main' : 'menu');
    switch (s) {
      case 'info': return P(TITLES.info, [`<div class="inf"><div class="dim">igneo Touch wersja</div><div class="dim rd">Nazwa kotła</div><div>Tekla / Estyma</div><div class="big2">Controller by Estyma (www.estyma.pl)</div></div>`]);
      default: return this._menu();
    }
  }

  _render(force) {
    if (!this._built || !this._hass) return;
    const keys = Object.keys(this.E).map(k => (this._hass.states[this.E[k]] || {}).state);
    const sig = this._scr + '|' + this._modal + '|' + keys.join(',') + '|' + new Date().getMinutes();
    if (!force && sig === this._sig) return;
    this._sig = sig;
    const R = this.shadowRoot, scr = R.getElementById('scr');
    const code = this._v('burner_code') & 255;
    const burning = [1, 2, 5].includes(code);
    const alarm = this._on('alarm') || code === 10;
    const sw = this._on('on');
    const bname = isNaN(code) ? this._t('burner') : (BURNER[code] || this._t('burner'));
    const mode = this._t('mode', '').toLowerCase();
    const chip = mode.includes('ręcz') || mode.includes('recz') ? 'MAN' : mode.includes('czas') ? 'TIME' : 'AUTO';
    const ctx = { burning, alarm, bname, chip, bm: this._bMode(), out: this._v('outside'), sw };
    // diody na obudowie (płomień: rozpalanie = płynne pulsowanie, modulacja = świeci)
    const fl = code === 5 ? 'on' : (code === 1 || code === 2) ? 'bl' : '';
    const strip = R.getElementById('strip');
    if (strip.dataset.fl !== fl || strip.dataset.sw !== String(sw) || strip.dataset.al !== String(alarm)) {
      strip.dataset.fl = fl; strip.dataset.sw = String(sw); strip.dataset.al = String(alarm);
      strip.innerHTML = `
      <div class="sr"><ha-icon icon="mdi:power"></ha-icon><i class="led g ${sw ? 'on' : ''}"></i></div>
      <div class="sr"><ha-icon icon="mdi:fire"></ha-icon><i class="led o ${fl}"></i></div>
      <div class="sr"><ha-icon icon="mdi:alert-outline"></ha-icon><i class="led r ${alarm ? 'on' : ''}"></i></div>`;
    }
    const live = LIVE.includes(this._scr);
    scr.className = 'screen ' + (live ? 's-' + this._scr : 'is-sub') + (this._scr === 'alarm' ? ' s-alarm' : '');
    let html;
    if (this._scr === 'main') html = this._main(ctx) + (this._modal === 'fuel' ? this._fuelDlg() : this._modal === 'boiler' ? this._bDlg() : this._modal ? this._quick(sw) : '');
    else if (this._scr === 'water') html = this._water(ctx);
    else if (this._scr === 'heat') html = this._heat(ctx);
    else if (this._scr === 'burn') html = this._burn(ctx);
    else if (this._scr === 'menu') html = this._menu();
    else if (this._scr === 'prog') html = this._progPg();
    else if (this._scr === 'kociol') html = this._kociol(ctx) + (this._modal === 'boiler' ? this._bDlg() : '');
    else html = this._body(this._scr);
    scr.innerHTML = html;
    const l = scr.querySelector('.list');
    if (l && this._scroll[this._scr]) l.scrollTop = this._scroll[this._scr];
  }

  _css() {
    return `
    :host{display:block}
    *{box-sizing:border-box}
    .bezel{container-type:inline-size;display:grid;grid-template-columns:14% 1fr;align-items:center;background:linear-gradient(160deg,#17181b,#050506);border-radius:16px;padding:2.6% 2.6% 2.6% 0;box-shadow:0 6px 24px #0008,inset 0 0 0 1px #2c2c2e;font-family:'Roboto Condensed','Arial Narrow',Roboto,sans-serif}
    .strip{display:flex;flex-direction:column;justify-content:space-around;align-items:center;height:100%;padding:0 0 0 8%;gap:6cqw}
    .sr{display:flex;align-items:center;gap:2.6cqw;color:#c9ccd3}
    .sr ha-icon{--mdc-icon-size:5.2cqw}
    .led{width:3.4cqw;height:1.7cqw;border-radius:.5cqw;background:#25282c;display:block}
    .led.g.on{background:#8bf01f;box-shadow:0 0 1.6cqw #8bf01f}.led.o.on{background:#ffb21a;box-shadow:0 0 1.6cqw #ffb21a}.led.r.on{background:#ff2a22;box-shadow:0 0 1.6cqw #ff2a22}
    .led.o.bl{animation:blk 3s ease-in-out infinite}
    @keyframes blk{0%,100%{background:#25282c;box-shadow:0 0 0 #ffb21a00}50%{background:#ffb21a;box-shadow:0 0 1.6cqw #ffb21a}}
    .screen{container-type:inline-size;position:relative;aspect-ratio:768/437;width:100%;overflow:hidden;border-radius:4px;color:#fff;user-select:none;-webkit-tap-highlight-color:transparent;background:linear-gradient(#566187,#2c355a 55%,#1b2240)}
    ha-icon{--mdc-icon-size:6.6cqw;display:inline-flex}
    .cy{color:#19d3f7}
    .spin{animation:spin 2.4s linear infinite}
    /* main */
    .s-main{background:linear-gradient(180deg,#5c6890,#3e4a74 70%)}
    .top{position:absolute;left:0;right:0;top:0;height:9cqw;font-size:4.6cqw;line-height:9cqw}
    .tm{position:absolute;left:4.2cqw}.dy{position:absolute;left:0;right:.8cqw;text-align:center;font-size:4.6cqw;letter-spacing:-.25cqw}
    .ot{position:absolute;right:11.2cqw;display:flex;align-items:center;gap:1.9cqw}.ot .wx{width:7cqw;height:4.4cqw}
    .boil{position:absolute;left:7cqw;top:7.2cqw;width:16cqw;height:auto;display:block;pointer-events:none}
    .big{position:absolute;left:30.4cqw;width:46cqw;top:11.9cqw;text-align:center;font-size:18.3cqw;line-height:1;color:#eaf0ff;cursor:pointer}
    .st{position:absolute;left:30.5cqw;width:46cqw;top:29cqw;text-align:center;font-size:7.4cqw;line-height:1;color:#eef3ff}.st.al{color:#ff5a52}
    .tag{position:absolute;right:.3cqw;top:12.8cqw;width:27.3cqw;height:7.1cqw;background:linear-gradient(#4d78cc,#3b5fa8);border:.3cqw solid #6a93e0;display:flex;align-items:center;gap:2cqw;padding-left:1.9cqw;cursor:pointer;border-radius:.4cqw;box-sizing:border-box}
    .tag b{font-size:7.5cqw;font-weight:400;color:#e8f0ff;line-height:1}
    .tag u{text-decoration:none;font-size:1.9cqw;border:.2cqw solid #dfe8ff;color:#dfe8ff;padding:.1cqw .5cqw;border-radius:.4cqw;font-weight:700;align-self:flex-start;margin-top:1.2cqw}
    .bbar{position:absolute;left:0;right:0;bottom:0;height:15.5cqw;display:flex;background:#3d63b5}
    .cell{position:relative;flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:.2cqw;background:linear-gradient(#5d8ae0,#4268bd);border-left:.5cqw solid #263872;padding-top:1.7cqw;cursor:pointer}
    .cell:first-child{border-left:0}.cell:nth-child(5){background:linear-gradient(#4f78c8,#3d62b4);cursor:default}
    .cell .ic{width:7.4cqw;height:7.4cqw}.cell:first-child .ic{margin-top:-3.4cqw}.cell ha-icon{--mdc-icon-size:7cqw;color:#d6e4ff}
    .cell small.fl{position:absolute;top:.9cqw;font-size:3.3cqw;font-weight:700;color:#e3ecff}
    .cell em{font-style:normal;font-size:3.6cqw;line-height:.4;color:#d6e4ff}
    .mnb{position:absolute;left:0;bottom:0;width:14.28%;height:15.5cqw}
    .radi{position:relative;display:flex}.radi sup{position:absolute;right:-2cqw;top:-.8cqw;font-size:3cqw;color:#d6e4ff}
    /* dolny pasek 1:1 z panelu (wymiary ze zdjecia, 1 px zdjecia = .1683cqw) */
    .cell{padding-top:0}
    .cell>svg,.cell>.radi{position:absolute!important;left:50%;margin:0!important;transform:translateX(-50%)}
    .cell small.fl{top:1.07cqw;font-size:3.4cqw;line-height:1;font-weight:500;letter-spacing:-.02em;transform:scaleX(.85)}
    /* ikony dolnego paska: ksztalty sledzone ze zdjecia panelu */
    .cell>.mic{width:5.9cqw!important;height:5.08cqw!important;top:6.0cqw}
    .cell[data-act=fuel]>svg{width:6.66cqw!important;height:5.52cqw!important;top:6.75cqw;left:calc(50% + 0.04cqw)}
    .cell[data-go=burn]>svg.ic2{width:4.88cqw!important;height:6.55cqw!important;top:5.13cqw;left:calc(50% + 0.2cqw)}
    .cell[data-go=heat]>.radi{top:5.47cqw;left:calc(50% + -0.56cqw);display:block}.cell[data-go=heat] .radi svg{width:5.02cqw!important;height:6.14cqw!important;display:block}
    .cell[data-go=heat] .radi sup{right:auto;left:calc(100% + .9cqw);top:-.1cqw;font-size:2.7cqw;line-height:1}
    .cell[data-go=water]>svg.ic2{width:6.83cqw!important;height:7.32cqw!important;top:4.88cqw;left:calc(50% + 0.16cqw)}
    .cell[data-act=quick]>svg.ic2{width:7.59cqw!important;height:7.41cqw!important;top:4.88cqw;left:calc(50% + 0.24cqw)}
    .ind{top:1.4cqw;height:1.3cqw;width:9.6cqw;margin-left:-4.8cqw;border-radius:.5cqw}
    .ind.g,.ind.gb{background:#3ee34a;box-shadow:0 0 1.4cqw #3ee34a}
    .ind.gb{animation:ignb 3s ease-in-out infinite}
    @keyframes ignb{0%,100%{background:#31477f;box-shadow:0 0 0 #3ee34a00}50%{background:#3ee34a;box-shadow:0 0 1.4cqw #3ee34a}}
    .ind{position:absolute;top:1.9cqw;left:50%;width:9.8cqw;height:1cqw;margin-left:-4.9cqw;background:#31477f;border-radius:.6cqw}
    .ind.y{background:#ece23a;box-shadow:0 0 1.4cqw #ece23a}.ind.w{background:#cfe0ff;box-shadow:0 0 1.2cqw #9fc0ff}.ind.g{background:#86e61f;box-shadow:0 0 1.4cqw #86e61f}.ind.r{background:#2c3e70}
    .ban{position:absolute;right:31%;bottom:21%;width:3.3cqw;height:2.6cqw;border-radius:.5cqw;background:linear-gradient(#ff5a4a,#d8281c);box-shadow:0 0 .8cqw rgba(240,48,31,.55)}.ban::before{content:'';position:absolute;left:20%;right:20%;top:-1.6cqw;height:1.9cqw;border:.5cqw solid #e5352b;border-bottom:0;border-radius:1.4cqw 1.4cqw 0 0;box-sizing:border-box}.ban::after{content:'';position:absolute;left:43%;width:14%;top:24%;height:38%;background:#7a1510;border-radius:.2cqw}
    .alic{position:absolute;left:87cqw;top:31cqw;width:6.4cqw;height:6.4cqw;border-radius:50%;background:#f4c20d;color:#2b2b2b;font-size:5.2cqw;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;animation:alb 1.1s steps(1) infinite}
    @keyframes alb{50%{opacity:.12}}
    .s-alarm{background:linear-gradient(#5b88cc,#4975b9)}
    .al1{position:absolute;font-size:4.6cqw;line-height:1;color:#fff;white-space:nowrap}
    .alln{position:absolute;left:11.7cqw;right:13.5cqw;height:.4cqw;background:#19b4e8}
    .alb{position:absolute;left:32.7cqw;top:36.4cqw;width:26.7cqw;height:7.4cqw;display:flex;align-items:center;justify-content:center;font-size:4.2cqw;background:linear-gradient(#6a93d8,#5079c0);border:.3cqw solid #86a9e4;border-radius:.5cqw;cursor:pointer}
    .ala{position:absolute;left:32.7cqw;width:26.7cqw;text-align:center;top:45.3cqw;font-size:4.2cqw;line-height:1;color:#ff4a3d}
    .alar{position:absolute;left:86cqw;width:9.6cqw;height:6.2cqw;display:flex;align-items:center;justify-content:center;font-size:6cqw;line-height:1;background:linear-gradient(#6a93d8,#5079c0);border:.3cqw solid #86a9e4;border-radius:.5cqw;opacity:.8}
    /* quick dialog */
    .qd{position:absolute;inset:0;background:rgba(30,40,78,.72)}
    .qbg{position:absolute;left:4.95cqw;top:6.5cqw;width:94.3cqw;height:49.2cqw;background:linear-gradient(#5a88cd,#4a76bb);border:.3cqw solid #7fa6e4;border-radius:.5cqw;box-sizing:border-box;box-shadow:0 0 3cqw #0008}
    .qa{position:absolute;color:#fff;font-size:4.1cqw;font-weight:700;line-height:1;white-space:nowrap}
    .tgq{position:absolute;left:38.2cqw;top:11.85cqw;width:10cqw;height:3.8cqw;border-radius:1.9cqw;background:#68789b;box-shadow:inset 0 0 .8cqw #0006;cursor:pointer}
    .tgq i{position:absolute;top:.3cqw;width:3.2cqw;height:3.2cqw;border-radius:50%;background:radial-gradient(#fff,#b9c6e3)}
    .tgq.on{background:linear-gradient(#58b52b,#3e951a)}.tgq.on i{right:.3cqw}.tgq:not(.on) i{left:.3cqw}
    .tgq.on::before{content:'I';position:absolute;left:1.6cqw;top:.3cqw;font-size:3cqw;line-height:3.2cqw;color:#e8ffd8}
    .mdi{cursor:pointer;position:absolute;color:#e3ecff;display:flex;align-items:center;justify-content:center;width:6cqw;height:6cqw;margin:-3cqw 0 0 -3cqw}.mdi ha-icon{--mdc-icon-size:5.6cqw}.mdi sup{position:absolute;left:3.6cqw;top:-.6cqw;font-size:2.1cqw}
    .sl{position:absolute;height:2.2cqw;border-radius:1.1cqw;background:#68789b;box-shadow:inset 0 0 .6cqw #0006;cursor:pointer}.sl::before{content:'';position:absolute;inset:-2.4cqw 0}
    .sl b{position:absolute;left:0;top:0;bottom:0;border-radius:1.1cqw;background-image:linear-gradient(90deg,#3fd0ff,#e9e14a 40%,#ff7a22 70%,#ff2a22);background-repeat:no-repeat}
    .sl i{position:absolute;top:-1.05cqw;width:3.9cqw;height:3.9cqw;margin-left:-1.95cqw;border-radius:50%;background:radial-gradient(#fff,#aebddb);box-shadow:0 0 .8cqw #0008}
    .qok{position:absolute;left:82.7cqw;top:44.9cqw;width:10.4cqw;height:6.9cqw;display:flex;align-items:center;justify-content:center;font-size:4.6cqw;background:linear-gradient(#5e86c9,#4a6fb0);border:.3cqw solid #86a9e4;border-radius:.5cqw;cursor:pointer;box-sizing:border-box}
    .tag .ck{position:relative;display:inline-flex;color:#e8f0ff;margin-left:2cqw;align-self:center}.tag .ck ha-icon{--mdc-icon-size:5.6cqw}.tag .ck sup{position:absolute;right:-1.7cqw;bottom:-.6cqw;font-size:2.4cqw;font-weight:700}
    .tbar{position:absolute;right:.3cqw;top:21.4cqw;width:27.3cqw;height:8.6cqw;cursor:pointer}
    .qx{position:absolute;inset:0}
    .bval{position:absolute;left:0;right:0;top:7.4cqw;text-align:center;font-size:15cqw;line-height:1;color:#fff}
    .blb{position:absolute;top:19.2cqw;font-size:4.6cqw;line-height:1;color:#fff;transform:translateX(-50%)}
    .btxt{position:absolute;left:8cqw;right:8cqw;top:13cqw;text-align:center;font-size:5.6cqw;line-height:1.3;color:#fff}
    .bpm{position:absolute;top:32cqw;width:32.5cqw;height:8.6cqw;background:linear-gradient(#6a93d8,#5079c0);border:.3cqw solid #86a9e4;border-radius:.5cqw;cursor:pointer;box-sizing:border-box}
    .bpm i{position:absolute;left:50%;top:50%;width:5cqw;height:.8cqw;margin:-.4cqw 0 0 -2.5cqw;background:#e8f0ff}.bpm.pl i+i{width:.8cqw;height:5cqw;margin:-2.5cqw 0 0 -.4cqw}
    .bpm.sm{width:12cqw;height:8.2cqw}
    .cval{position:absolute;left:46cqw;font-size:9cqw;line-height:1;color:#fff}
    .mdi.on{color:#fff}.mdi.on ha-icon{filter:drop-shadow(0 0 .5cqw #fff)}.mdi .plq{text-decoration:none;font-size:2.8cqw;font-weight:700;background:#e3ecff;color:#3a5ba0;padding:.3cqw 1cqw;border-radius:.4cqw;line-height:1}
    .mdi sup{left:3.8cqw}
    /* PROGRAM */
    .plist{position:absolute;left:0;right:0;top:10.4cqw;bottom:0;padding:.4cqw 3cqw 0 3.4cqw}
    .prow{display:flex;align-items:center;height:6.4cqw;cursor:pointer;border-bottom:.25cqw solid #ffffff1c}.prow.td .pn{color:#19d3f7}
    .pn{width:8cqw;font-size:4.2cqw}.pbar{position:relative;flex:1;height:5.2cqw}.dbar{width:100%;height:100%;display:block}
    .pbl{position:absolute;bottom:-1.1cqw;font-size:1.7cqw;color:#c5d0ea;transform:translateX(-50%);display:none}
    .hc{position:absolute;width:7.2cqw;height:10.6cqw;box-sizing:border-box;border:.3cqw solid #6980b8;border-radius:.6cqw;background:#3d4e83;display:flex;align-items:flex-end;justify-content:center;cursor:pointer;padding-bottom:1cqw}
    .hc b{font-weight:400;font-size:3.6cqw;color:#dfe7fa}.hc.on{background:linear-gradient(#ff5a3c,#e0301f);border-color:#ff8a6e}.hc.on b{color:#fff}
    .pb{position:absolute;top:44.6cqw;height:8cqw;display:flex;align-items:center;justify-content:center;font-size:3.6cqw;white-space:nowrap;background:linear-gradient(#6a93d8,#5079c0);border:.3cqw solid #86a9e4;border-radius:.5cqw;cursor:pointer;box-sizing:border-box}
    /* live sub screens */
    .h2{position:absolute;left:0;right:0;top:0;height:9.8cqw;background:linear-gradient(#6e778f,#59627c);border-bottom:.3cqw solid #343c55;display:flex;align-items:center;justify-content:space-between;padding:0 3.2cqw 0 3.9cqw;font-size:4.4cqw}
    .h2 .bk{color:#19d3f7;cursor:pointer;min-width:20cqw}.h2 .tt{position:absolute;left:24cqw;right:24cqw;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .hi{display:flex;align-items:center;gap:2.4cqw;color:#e3e9f7}.hi ha-icon{--mdc-icon-size:5.4cqw}.hi span{cursor:pointer}.wr{display:flex;align-items:flex-start;color:#e3e9f7}.wr sup{font-size:2.2cqw}
    .s-water,.s-heat,.s-burn{background:linear-gradient(180deg,#5c6890,#3e4a74 70%)}
    .pos-tank{position:absolute;left:18.7cqw;top:12cqw;width:18.9cqw;height:35.4cqw;object-fit:contain}
    .bigv{position:absolute;left:36.3cqw;top:12.4cqw;width:36cqw;text-align:center;font-size:20.8cqw;color:#fff;line-height:1;cursor:pointer}
    .box{position:absolute;right:.2cqw;width:26.4cqw;box-sizing:border-box;background:linear-gradient(#4b5f95,#3d4e83);border:.3cqw solid #6980b8;border-radius:.6cqw;display:flex;align-items:center;justify-content:space-between;padding:0 3cqw 0 3.4cqw;cursor:pointer}
    .box.b1{top:14.6cqw;height:7.3cqw;padding-left:3.4cqw}.box.b1 b{font-size:7.9cqw;font-weight:400;color:#e8f0ff;line-height:1}.box.b2{top:23.9cqw;height:7.3cqw;padding:0}
    .mi{position:relative;display:inline-flex;color:#e8f0ff;margin-right:3.4cqw}.mi ha-icon{--mdc-icon-size:5cqw}.mi sup{position:absolute;right:-4.6cqw;top:-.4cqw;font-size:2.2cqw}.mi.lone{margin-left:auto;margin-right:3.4cqw}
    .sched{width:100%;height:100%;display:block}
    .brow{position:absolute;left:0;right:0;bottom:0;height:9.4cqw;display:grid;grid-template-columns:7.8% 8.3% 8.3% 8.3% 8.3% 8.6% 1fr;background:#51618f}
    .brow>div{border-left:.3cqw solid #7b8fc2;background:linear-gradient(#6676a3,#4a5a88);display:flex;align-items:center;justify-content:center;color:#e3ecff}
    .brow .c1{border-left:0}.brow .pmp{width:5.6cqw;height:5.6cqw}.brow ha-icon{--mdc-icon-size:5.8cqw}
    .brow .fanb{--mdc-icon-size:7cqw}.brow .cg{background:linear-gradient(#8aa0cf,#6e86b8);cursor:pointer}.brow .cg ha-icon{--mdc-icon-size:7.4cqw}
    .cot{position:absolute;left:4.6cqw;top:18.65cqw;font-size:8.05cqw;line-height:1;color:#fff;cursor:pointer;white-space:nowrap}.cot sup{font-size:5.9cqw;vertical-align:top;margin-left:.5cqw;position:relative;top:-.45cqw;line-height:1}
    .rad{position:absolute;left:16.7cqw;top:24.1cqw;width:30.2cqw;height:18.6cqw}
    .sw{position:absolute;left:53.8cqw;top:15.36cqw;width:12.6cqw}
    .box.mono{justify-content:flex-end}
    .bname{position:absolute;left:3.3cqw;top:11.4cqw;font-size:7.4cqw;line-height:1;color:#fff;width:48cqw;text-align:center}
    .burn{position:absolute;left:13.1cqw;top:18.9cqw;width:21.5cqw;height:auto;pointer-events:none}
    .stats{position:absolute;right:.5cqw;top:11.85cqw;font-size:4.3cqw;line-height:5.13cqw;text-align:center;color:#fff;width:46cqw}
    .mini span{position:absolute;top:42cqw;font-size:3.8cqw;line-height:1;color:#fff;transform:translateX(-50%);white-space:nowrap}.mini span:nth-child(1){left:3.9cqw}.mini span:nth-child(2){left:11.95cqw}.mini span:nth-child(3){left:36.85cqw}
    /* list pages */
    .is-sub{background:linear-gradient(180deg,#5c6890,#3b4670 70%)}
    .list{position:absolute;left:0;right:0;top:10cqw;bottom:0;overflow-y:auto;scrollbar-width:none;padding:0 2.8cqw 2cqw 2.4cqw}.list::-webkit-scrollbar{display:none}
    .row{display:flex;align-items:center;justify-content:space-between;min-height:11cqw;border-bottom:.3cqw solid #ffffff22;font-size:4.4cqw;padding:0 1.2cqw}
    .row .l{display:flex;align-items:center;gap:1.6cqw}.row .v{color:#fff;font-weight:300;white-space:nowrap}.row.go{cursor:pointer}.ch{color:#19d3f7;font-size:6cqw}.row .l.cy{color:#19d3f7}
    .row.red .l{color:#ff6b62}.mi ha-icon{--mdc-icon-size:6.4cqw;color:#e3e9f7;flex:none}.ch2{color:#fff;font-size:6cqw}
    .tg{width:7.4cqw;height:3.8cqw;border-radius:1.9cqw;background:#3b4670;position:relative;box-shadow:inset 0 0 .6cqw #000}
    .tg i{position:absolute;left:.4cqw;top:.4cqw;width:3cqw;height:3cqw;border-radius:50%;background:radial-gradient(#fff,#a9b4d0)}
    .tg.on{background:#58b52b}.tg.on i{left:4cqw}
    .lamp{width:2.6cqw;height:2.6cqw;border-radius:50%;background:#2a3358;display:inline-block}.lamp.on{background:#86e61f;box-shadow:0 0 1cqw #86e61f}
    .abo em.cl{cursor:pointer}.abo em.dis{opacity:.4}.row.ro{opacity:.55}
    .pvl{position:absolute;inset:0;background:rgba(6,6,6,.92);pointer-events:none}
    .pdlg{position:absolute;left:4.23cqw;top:5.38cqw;width:91.35cqw;height:50.2cqw;box-sizing:border-box;border-radius:.8cqw;background:linear-gradient(#666,#404040);border:.26cqw solid #5e5e5e;box-shadow:0 .4cqw 1.2cqw #000a;color:#fff}
    .pdt{position:absolute;left:0;right:0;top:2.3cqw;text-align:center;font-size:5.4cqw;line-height:6cqw}
    .pbt{position:absolute;width:10.77cqw;height:7.5cqw;box-sizing:border-box;border:.26cqw solid #2c2c2c;border-radius:.8cqw;background:linear-gradient(#686868,#454545);box-shadow:inset 0 .26cqw 0 rgba(255,255,255,.22);cursor:pointer;display:flex;align-items:center;justify-content:center}
    .pbt i{position:absolute;left:50%;top:50%;width:5.1cqw;height:.8cqw;margin:-.4cqw 0 0 -2.55cqw;background:#d4d4d4}
    .pbt.pl i+i{width:.8cqw;height:5.1cqw;margin:-2.55cqw 0 0 -.4cqw}
    .pbt.pok{font-size:4.3cqw;color:#f2f2f2}
    .pdg{position:absolute;width:10.77cqw;top:19.6cqw;height:20cqw;line-height:20cqw;text-align:center;font-size:20cqw;font-weight:400;-webkit-text-stroke:.3cqw #fff;transform:scaleX(.74)}
    .abo{display:flex;gap:1.6cqw}.abo em{font-style:normal;display:flex;flex-direction:column;align-items:center}.abo small{font-size:2cqw;color:#e0e7f8}
    .abo b{width:6cqw;height:5.6cqw;border-radius:.8cqw;background:#3b4670;box-shadow:inset 0 0 .6cqw #000;display:flex;align-items:center;justify-content:center;color:#b5e61d;font-size:5.4cqw;font-weight:400}
    .net,.inf{padding:2cqw;font-size:3.8cqw}.net div{display:flex;justify-content:space-between;padding:2cqw 0;border-bottom:.3cqw solid #ffffff22}
    .gn{color:#86e61f}.rd{color:#ff6b62}.dim{color:#aab4d4;font-size:3.4cqw;padding:1.4cqw 0}.inf .rd{color:#ff6b62}.inf div{padding:1.2cqw 0}.big2{font-size:4.4cqw}
    @keyframes spin{to{transform:rotate(360deg)}}
    .brow .fan4{width:6.1cqw;height:6.1cqw}.fan4.spin{animation:spin .7s linear infinite}
    .ftk{position:absolute;left:12.4cqw;top:8.34cqw;width:25.6cqw;height:44.5cqw;background:linear-gradient(#f4b5b8,#f09aa2);border:.25cqw solid #e0453b;box-sizing:border-box;overflow:hidden}
    .fth{position:absolute;left:0;right:0;top:0;height:6.97cqw;background:linear-gradient(#f6604f,#e5352b);border-bottom:.3cqw solid #b8352c}.fhd{position:absolute;left:9.47cqw;top:2.7cqw;width:6.4cqw;height:3cqw}
    .fbar{position:absolute;left:9.7cqw;top:9.58cqw;width:6.06cqw;height:32.7cqw;background:#6c7898;border:.25cqw solid #e9edf8;box-sizing:border-box;display:flex;align-items:flex-end}
    .fbar i{display:block;width:100%;background:repeating-linear-gradient(45deg,#f3e24f 0 .5cqw,#e1c92f .5cqw 1cqw)}
    .fhn{position:absolute;left:12.67cqw;width:11.4cqw;height:.45cqw;background:#fff;margin-top:-.22cqw}.fhn::before{content:'';position:absolute;left:-.95cqw;top:-.72cqw;width:1.9cqw;height:1.9cqw;border-radius:50%;background:#fff}
    .fch{position:absolute;left:18.13cqw;width:4.55cqw;height:2.5cqw}.fe{position:absolute;left:6.4cqw;bottom:3.3cqw;font-size:4.2cqw;line-height:1;color:#f5a21a;font-weight:700}
    .ftt{position:absolute;left:45.55cqw;top:6.9cqw;font-size:5.4cqw;line-height:1;color:#fff}
    .fbt{position:absolute;display:flex;align-items:center;justify-content:center;color:#fff;font-size:7.5cqw;line-height:1;background:linear-gradient(#5b6a8a,#3e4a68);border:.3cqw solid #2c3550;border-radius:.8cqw;box-sizing:border-box}
    .fkg{position:absolute;left:47cqw;width:13.4cqw;text-align:center;top:25.6cqw;font-size:5.4cqw;line-height:1;color:#fff}
    .fau{left:47.2cqw;top:45.1cqw;width:11cqw;height:7.4cqw}.fau .aug{width:6.1cqw;height:2.9cqw}.fts{position:absolute;left:59.2cqw;top:46.2cqw;font-size:5.4cqw;line-height:1;color:#fff}
    .svsep{display:flex;align-items:center;gap:2cqw;color:#19d3f7;font-size:4cqw;line-height:1;padding:2.6cqw 0 1.4cqw;letter-spacing:.3cqw}.svsep::before,.svsep::after{content:'';flex:1;height:.3cqw;background:#19d3f7}
    .fmt{position:absolute;left:0;right:0;top:8.2cqw;text-align:center;font-size:5.2cqw;line-height:1;color:#fff}
    .fmb{position:absolute;left:9.98cqw;top:13.6cqw;width:71.7cqw;height:36.3cqw;background:#050505;box-sizing:border-box}.fmb svg{width:100%;height:100%;display:block}
    .fmp{position:absolute;width:3.6cqw;height:3.6cqw;margin:-1.8cqw 0 0 -1.8cqw;border-radius:50%;background:#050505;border:.45cqw solid #aebddb;cursor:pointer}
    .fmp.sel{background:radial-gradient(#8bf01f,#58b52b 70%);border-color:#e8ffd8;box-shadow:0 0 1.4cqw #8bf01f}
    .fmv{position:absolute;width:10cqw;margin-left:-5cqw;text-align:center;font-size:4.4cqw;line-height:1;color:#fff;cursor:pointer}.fmv.sel{color:#19d3f7}
    .fml{position:absolute;top:49.8cqw;width:10cqw;margin-left:-5cqw;text-align:center;font-size:4.2cqw;line-height:1;color:#fff;cursor:pointer}
    .fma{cursor:pointer}.plist{overflow-y:auto;scrollbar-width:none;padding:.6cqw 0 0 0!important}.plist::-webkit-scrollbar{display:none}.prow{height:11.3cqw!important;border-bottom:0!important;flex:none!important;align-items:flex-start!important}.prow.td .pn{color:#cfe0ff!important}.pn{width:13.7cqw!important;font-size:5.6cqw!important;font-weight:700;color:#cfe0ff;padding-left:3.6cqw;box-sizing:border-box;margin-top:.2cqw}.pbar{flex:none!important;width:74.7cqw;height:5cqw!important;margin-top:.7cqw}.pbl{display:block!important;bottom:auto!important;top:5.2cqw;font-size:4.2cqw!important;font-weight:700;color:#e3ecff}.row .tgq{position:relative;display:inline-block;vertical-align:middle;left:auto;top:auto;width:11.5cqw;height:5cqw;border-radius:2.5cqw}.row .tgq i{top:.55cqw;width:3.9cqw;height:3.9cqw}.row .tgq.on i{right:.55cqw}.row .tgq:not(.on) i{left:.55cqw}.row .tgq.on::before{left:2.3cqw;top:.55cqw;font-size:3.6cqw;line-height:3.9cqw}.row .tgq:not(.on)::after{content:'';position:absolute;right:1.7cqw;top:1.4cqw;width:2.2cqw;height:2.2cqw;border:.4cqw solid #e3e9f7;border-radius:50%;box-sizing:border-box}.hi{gap:.5cqw;margin-right:-.8cqw}.hi>ha-icon:not(.cy),.hi .pp{--mdc-icon-size:7.3cqw;color:#fff}.hi .cy{--mdc-icon-size:7.4cqw;transform:translateY(.9cqw)}.po{position:absolute;left:9cqw;right:9cqw;top:15.5cqw}.opt{padding:2cqw 0;margin-bottom:2cqw;border:.35cqw solid #5b6a8f;border-radius:1cqw;text-align:center;font-size:5cqw;color:#e8eefc;cursor:pointer}.opt.on{background:#f3f7ff;border-color:#f3f7ff;color:#1a3d8f;font-weight:600}.rt{position:absolute;left:30.5cqw;width:46cqw;top:29.5cqw;text-align:center;font-size:5.8cqw;line-height:1;color:#eef3ff}.brow .c1 .bk{width:100%;height:100%;display:flex;align-items:center;justify-content:center;cursor:pointer}.brow .c1 .bk ha-icon{--mdc-icon-size:6.6cqw;color:#e3e9f7}.row[data-act]{cursor:pointer}.fma.dis{opacity:.5}.fmc{width:5.4cqw;height:3.2cqw}
    .augw{position:relative;display:inline-block;line-height:0}.aug{width:6.2cqw;height:2.9cqw;overflow:visible}.augw sup{position:absolute;right:-.7cqw;top:-1.2cqw;font-size:2.1cqw;color:#fff;line-height:1}
    `;
  }
}
if (!customElements.get('pelletcan-lite-core')) customElements.define('pelletcan-lite-core', TeklaPanelCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'pelletcan-lite-core', name: 'Tekla – panel igneo Touch', description: 'Replika panelu Estyma Igneo Touch' });

/* ---------- edytor karty (wizualny konfigurator) ---------- */
class TeklaPanelCardEditor extends HTMLElement {
  setConfig(c) { this._cfg = c || {}; this._draw(); }
  set hass(h) { this._hass = h; if (this._form) this._form.hass = h; }
  _flat() {
    const d = { screen: this._cfg.screen || 'main' };
    const e = this._cfg.entities || {};
    for (const k of Object.keys(TEKLA_DEF)) d['e_' + k] = e[k] || '';
    return d;
  }
  _draw() {
    if (!this._form) {
      this._form = document.createElement('ha-form');
      this._form.computeLabel = s => s.label || s.name;
      this._form.addEventListener('value-changed', ev => this._changed(ev.detail.value));
      this.appendChild(this._form);
      const n = document.createElement('div');
      n.style.cssText = 'font-size:12px;opacity:.7;margin-top:8px';
      n.textContent = 'Pola możesz zostawić puste – wtedy dany element panelu pokaże „-".';
      this.appendChild(n);
      const box = document.createElement('div');
      box.style.cssText = 'display:flex;gap:8px;align-items:center;margin:12px 0 4px;flex-wrap:wrap';
      box.innerHTML = `<input id="pfx" placeholder="prefiks encji, np. tekla_" style="flex:1;min-width:140px;padding:8px;border-radius:6px;border:1px solid var(--divider-color,#888);background:var(--card-background-color,#fff);color:var(--primary-text-color,#000)">
        <button id="auto" style="padding:8px 14px;border-radius:6px;border:0;background:var(--primary-color,#03a9f4);color:var(--text-primary-color,#fff);cursor:pointer">Uzupełnij z prefiksu</button>
        <div id="autost" style="flex-basis:100%;font-size:12px;opacity:.8"></div>`;
      this.insertBefore(box, this._form);
      box.querySelector('#auto').addEventListener('click', () => this._auto(box.querySelector('#pfx').value.trim(), box.querySelector('#autost')));
    }
    if (!this._form.schema || !this._form.schema.length) {
      const schema = [{ name: 'screen', label: 'Ekran startowy', selector: { select: { mode: 'dropdown', options: SCREEN_OPTS.map(o => ({ value: o[0], label: o[1] })) } } }];
      for (const [title, fields] of ENT_GROUPS) {
        schema.push({
          type: 'expandable', title, flatten: true,
          schema: fields.map(f => ({ name: 'e_' + f[0], label: f[1], selector: { entity: { domain: f[2] } } })),
        });
      }
      this._form.schema = schema;
    }
    this._form.data = this._flat();
    if (this._hass) this._form.hass = this._hass;
  }
  _auto(prefix, out) {
    if (!this._hass) { out.textContent = 'Brak połączenia z HA.'; return; }
    const ids = Object.keys(this._hass.states), pf = prefix.toLowerCase();
    const cur = Object.assign({}, this._cfg.entities || {});
    let n = 0, miss = [];
    for (const [title, fields] of ENT_GROUPS) for (const f of fields) {
      const [k, label, doms] = f, key = ROLE_KEY[k];
      if (cur[k] || !key) continue;
      const re = new RegExp('(^|_)' + key + '(_\\d+)?$');
      const c = ids.filter(id => {
        const [d, o] = id.split('.');
        return doms.includes(d) && o.includes(pf) && re.test(o);
      }).sort((a, b) => a.length - b.length);
      if (c.length) { cur[k] = c[0]; n++; } else miss.push(label);
    }
    this._cfg = Object.assign({}, this._cfg, { entities: cur });
    this._form.data = this._flat();
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._cfg }, bubbles: true, composed: true }));
    out.textContent = `Dobrano ${n} encji (puste pola uzupełnione, wybrane wcześniej bez zmian).` + (miss.length ? ' Nie znaleziono: ' + miss.join(', ') + '.' : '');
  }
  _changed(v) {
    const entities = {};
    for (const k of Object.keys(TEKLA_DEF)) if (v['e_' + k]) entities[k] = v['e_' + k];
    const cfg = Object.assign({}, this._cfg, { screen: v.screen || 'main', entities });
    this._cfg = cfg;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg }, bubbles: true, composed: true }));
  }
}
if (!customElements.get('pelletcan-lite-core-editor')) customElements.define('pelletcan-lite-core-editor', TeklaPanelCardEditor);

    })();

    const C = customElements.get('pelletcan-lite-core');
    if (!C) { console.error('pelletcan-card-lite: brak elementu po zaladowaniu'); return; }
    // key -> { tytul, rola encji, min, max, krok, miejsca po przecinku }
    const PR = [];
    C.prototype._po = function (k) {
      const c = PR[k], v = this._v(c.r);
      if (isNaN(v)) return '-';
      if (c.tog) return '<span class="tgq' + (v >= 1 ? ' on' : '') + '"><i></i></span>';
      return c.opts ? (c.opts[Math.round(v)] != null ? c.opts[Math.round(v)] : '-') : v.toFixed(c.dc);
    };

    // ekran PROGRAM jak na panelu: naglowek z postacia, slupki pomaranczowe, os z cyframi
    C.prototype._progHdr = function (title, edit) {
      const lab = edit ? 'PROGRAM' : ['WODA', 'OGRZEWANIE 1', 'KOCIOŁ'][(this._prog || {}).kind != null ? this._prog.kind : 2];
      return `<div class="h2"><span class="bk" ${edit ? 'data-act="pcancel"' : `data-go="${this._backTo || 'main'}"`}>&lsaquo; ${lab}</span><span class="tt">${title}</span>
        <span class="hi">${this._unl() ? '<span class="wr"><ha-icon icon="mdi:wrench"></ha-icon><sup>1</sup></span>' : '<ha-icon class="pp" icon="mdi:account"></ha-icon>'}<span data-go="main"><ha-icon class="cy" icon="mdi:home-variant"></ha-icon></span></span></div>`;
    };
    C.prototype._dayBar = function (bits) {
      if (bits == null) return '<svg viewBox="0 0 240 24" preserveAspectRatio="none" class="dbar"><text x="120" y="17" text-anchor="middle" font-size="14" fill="#9fb0d8">--</text></svg>';
      let r = '', t = '';
      (this._bands(bits) || []).forEach(([a, b]) => { r += `<rect x="${a * 10}" y="0.5" width="${(b - a) * 10}" height="14.2" fill="#e8601c"/>`; });
      for (let h = 0; h <= 24; h++) t += `<line x1="${h * 10}" y1="16.4" x2="${h * 10}" y2="${h % 6 === 0 ? 22 : 19.5}" stroke="#dfe8ff" stroke-width="${h % 6 === 0 ? 1.8 : 1}"/>`;
      return `<svg viewBox="0 0 240 24" preserveAspectRatio="none" class="dbar"><rect x="0" y="14.6" width="240" height="1.5" fill="#ff3a2c"/>${r}${t}</svg>`;
    };
    // podglad pojedynczych ekranow PROGRAM w osobnej karcie: screen: prog_0 (woda) / prog_1 (CO) / prog_2 (kociol)
    const _sc = C.prototype.setConfig;
    C.prototype.setConfig = function (c) {
      _sc.call(this, c);
      const m = /^prog_([012])$/.exec((c && c.screen) || '');
      if (m) { this._prog = { kind: +m[1] }; this._scr = 'prog'; this._backTo = ['water', 'heat', 'kociol'][+m[1]]; }
    };

    const VALVE = '<svg viewBox="0 0 24 24" style="width:6.6cqw;height:6.6cqw"><path d="M2.5 9.5L11.5 14.5L2.5 19.5Z M21.5 9.5L12.5 14.5L21.5 19.5Z" fill="#e3e9f7"/><path d="M7 6.5Q12 3 17 6.5" stroke="#8fd6ff" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M5.8 4.2L6.9 7.4L9.6 6" fill="#8fd6ff"/></svg>';
    C.prototype._valve = function (mv) { return mv === 1 ? VALVE : mv === 2 ? '<span style="display:inline-block;transform:scaleX(-1)">' + VALVE + '</span>' : ''; };
    C.prototype._kociol = function (ctx) {
      const bm = ctx.bm, rt = this._v('ret_temp');
      // ikona zaworu (jak na panelu): pojawia sie, gdy mieszacz pracuje; 1 = zamyka (strzalka w lewo), 2 = otwiera (w prawo)
      const mx = this._v('mix_co1') || 0, mr = this._v('mix_ret') || 0, mv = mx > 0 ? mx : mr;
      return `${this._hdr('KOCIOŁ', 'menu')}
        ${this._boilerMain(ctx.burning).replace('class="boil"', 'class="boil" style="top:14.6cqw;left:8cqw"')}
        <div class="big" data-act="more" data-e="boiler_temp" style="top:16cqw;font-size:20cqw">${this._p(this._v('boiler_temp'))}</div>
        <div class="rt" style="top:38cqw;font-size:4.7cqw">T. powrotu=${isNaN(rt) ? '-' : rt.toFixed(1)}</div>
        <div class="tag" data-act="bdlg"><b>${isNaN(this._v('boiler_set')) ? '-' : Math.round(this._v('boiler_set'))}</b>${this._chipHtml(bm)}</div>
        ${bm < 2 ? `<div class="tbar" data-act="prog" data-kind="2" data-back="kociol" style="top:23.8cqw">${this._sched(this._todayBands(2, []))}</div>` : ''}
        ${this._brow('<div class="bk" data-go="menu"><ha-icon icon="mdi:arrow-left-circle-outline"></ha-icon></div>', 'boiler', '', this._valve(mv))}`;
    };
    const q = (v, c) => Number(Math.max(c.lo, Math.min(c.hi, Math.round(v / c.st) * c.st)).toFixed(c.dc));
    C.prototype._prow = function (label, val, k) {
      return `<div class="row" data-act="pedit" data-k="${k}"><span class="l">${label}</span><span class="v">${val}</span></div>`;
    };
    
    

    // ---- modul: paski harmonogramu ----
    await (async () => {
    const C = customElements.get('pelletcan-lite-core');
    const o = C.prototype._kociol;
    C.prototype._kociol = function (ctx) {
      let h = o.call(this, ctx);
      if (h.indexOf('data-back="kociol"') < 0) {
        const t = `<div class="tbar" data-act="prog" data-kind="2" data-back="kociol" style="top:23.8cqw">${this._sched(this._todayBands(2, []))}</div>`;
        const i = h.indexOf('<div class="brow"');
        h = i < 0 ? h + t : h.slice(0, i) + t + h.slice(i);
      }
      return h;
    };

    })();

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

    // ---- modul: czas podawania ----
    await (async () => {
    const C = customElements.get('pelletcan-lite-core');
    if (C.prototype.__v83) return;
    C.prototype.__v83 = true;
    const o = C.prototype._t;
    C.prototype._t = function (k, d) {
      const r = o.call(this, k, d);
      if (k === 'feeder' && typeof r === 'string' && /^\s*0(\.0+)?\s*s?\s*$/.test(r)) return '';
      return r;
    };

    })();

    // ---- modul: historia alarmow ----
    await (async () => {
    const C = customElements.get('pelletcan-lite-core');
    if (C.prototype.__v84) return;
    C.prototype.__v84 = true;
    const MAXAL = 20;
    const num = s => { const n = parseFloat(s); return isNaN(n) ? NaN : n; };
    const tm = x => x.lu != null ? x.lu : (x.last_updated ? Date.parse(x.last_updated) / 1000 : (x.lc != null ? x.lc : 0));
    const st = x => x.s != null ? x.s : x.state;

    // v9.1: historia alarmow z KOTLA (firmware >= 2.25: encje "Alarm wpis 1..20" = "kod N (opis)|poczatek|koniec"); rekorder HA tylko jako zapas dla starszego firmware
    C.prototype._alFromSensors = function () {
      const stt = this._hass && this._hass.states; if (!stt) return null;
      const out = []; let found = false;
      for (const id in stt) {
        if (!/^sensor\..*alarm_wpis_\d+$/.test(id)) continue; found = true;
        const p = String(stt[id].state).split('|'); if (p.length < 3) continue;
        const start = num(p[1]), end = num(p[2]); if (!(start > 1e9)) continue;
        out.push({ start, end: end > 1e9 && end >= start ? end : 0, txt: p[0] });
      }
      return found ? out.sort((x, y) => y.start - x.start).slice(0, MAXAL) : null;
    };

    C.prototype._alLoad = async function () {
      const fs = this._alFromSensors();
      if (fs) {
        void 0;
        this._ah = fs; this._ai = 0; this._alBusy = false;
        const tok0 = this._altok = (this._altok || 0) + 1;
        [5000, 12000].forEach(ms => setTimeout(() => { if (tok0 !== this._altok || this._scr !== 'alarm') return; const f = this._alFromSensors(); if (f) { this._ah = f; this._render(true); } }, ms));
        if (this._scr === 'alarm') this._render(true);
        return;
      }
      const E = this.E, ids = [E.alarm_start, E.alarm_end, E.last_alarm].filter(Boolean);
      this._ah = null; this._ai = 0; this._alBusy = true; const tok = this._altok = (this._altok || 0) + 1;
      let list = [];
      try {
        const now = Date.now();
        const res = await this._hass.callWS({ type: 'history/history_during_period', start_time: new Date(now - 60 * 864e5).toISOString(), end_time: new Date(now).toISOString(), entity_ids: ids, include_start_time_state: true, significant_changes_only: false, minimal_response: true, no_attributes: true });
        const g = id => (res[id] || []).map(x => ({ t: tm(x), s: st(x) })).sort((a, b) => a.t - b.t);
        const S = g(E.alarm_start), En = g(E.alarm_end), T = g(E.last_alarm).filter(x => /kod\s+\d+/.test(x.s));
        const seen = new Map();
        for (const e of S) {
          const v = num(e.s); if (!(v > 1e9)) continue;
          let txt = '', end = 0;
          for (const x of T) { if (x.t <= e.t + 0.01) txt = x.s; else break; }
          for (const x of En) { if (x.t <= e.t + 3) { const n = num(x.s); if (n > 1e9) end = n; } else break; }
          if (!seen.has(v) || (!seen.get(v).txt && txt)) seen.set(v, { start: v, end, txt });
        }
        list = [...seen.values()].sort((a, b) => b.start - a.start).slice(0, MAXAL);
      } catch (e) { console.warn('tekla alarm history', e); }
      if (tok !== this._altok) return;
      if (!list.length) { const t0 = num(this._t('alarm_start', '0')); const txt = this._t('last_alarm', ''); if (/kod\s+\d+/.test(txt) && t0 > 1e9) list = [{ start: t0, end: 0, txt }]; }
      this._ah = list; this._ai = 0; this._alBusy = false;
      if (this._scr === 'alarm') this._render(true);
    };

    const og = C.prototype._go;
    C.prototype._go = function (s, b) {
      if (s === 'alarm') { this._ai = 0; this._ah = null; this._alLoad(); }
      return og.call(this, s, b);
    };

    // klikniecia strzalek + styl - podpiecie przy pierwszym rysowaniu (niezaleznie od momentu zbudowania karty)
    const ensure = self => {
      const R = self.shadowRoot; if (!R || self.__alL) return; self.__alL = true;
      const s = document.createElement('style');
      s.textContent = '.alar{opacity:1;width:11cqw;height:7.4cqw;left:85cqw}.alar svg{pointer-events:none}'
        + '.alb.al2{left:50%;transform:translateX(-50%);top:38cqw;width:34cqw;height:9cqw;font-size:5.4cqw;font-weight:500;letter-spacing:.02em;color:#fff;background:linear-gradient(#6a93d8,#5079c0);border:.3cqw solid #86a9e4;border-radius:.5cqw;cursor:pointer}'
        + '.alb.al2:active{filter:brightness(1.15)}.ala.al2{left:50%;transform:translateX(-50%);width:34cqw;top:48cqw;font-size:4.6cqw}';
      R.appendChild(s);
      R.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest('[data-act]'); if (!a) return;
        const act = a.dataset.act;
        if (act === 'alup' && self._ah && self._ai < self._ah.length - 1) { self._ai++; self._render(true); }
        else if (act === 'aldn' && self._ah && self._ai > 0) { self._ai--; self._render(true); }
      });
    };

    const CHEV = up => `<svg viewBox="0 0 24 24" style="width:70%;height:70%"><polyline points="${up ? '5,15 12,8 19,15' : '5,9 12,16 19,9'}" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const oa = C.prototype._alarmPg;
    C.prototype._alarmPg = function (back) {
      ensure(this);
      if (this._ah === undefined && !this._alBusy && this._hass) this._alLoad();
      const list = this._ah, i = this._ai || 0;
      let h;
      if (!list || !list.length) h = oa.call(this, back);
      else {
        const r = list[Math.min(i, list.length - 1)];
        this._t = (k, d) => k === 'last_alarm' ? r.txt : k === 'alarm_start' ? String(r.start) : C.prototype._t.call(this, k, d);
        try { h = oa.call(this, back); } finally { delete this._t; }
        h = h.replace('NR: 1', `NR: ${i + 1}`);
        if (i > 0) h = h.replace(/<div class="alb"[^>]*>[^<]*<\/div><span class="ala">[^<]*<\/span>/, '');
        const up = i < list.length - 1, dn = i > 0;
        const btn = (top, act, ok, svg) => `<div class="alar" data-act="${ok ? act : 'alnone'}" style="top:${top}cqw;${ok ? 'cursor:pointer;opacity:1' : 'opacity:.35'}">${svg}</div>`;
        h = h.replace(/<div class="alar" style="top:22cqw">[\s\S]*?<\/div><div class="alar" style="top:35\.5cqw">[\s\S]*?<\/div>/,
          list.length > 1 ? btn(22, 'alup', up, CHEV(true)) + btn(35.5, 'aldn', dn, CHEV(false)) : '');
      }
      // przycisk POTWIERDZ na srodku pustego pola (tylko aktywny, najnowszy alarm)
      return h.replace('<span class="ala">', '<span class="ala al2">');
    };

    })();

    // ---- modul: grafiki z plikow ----
    (async () => {
    const C = customElements.get('pelletcan-lite-core');
    if (C.prototype.__v85) return;
    C.prototype.__v85 = true;

    const BASE = new URL('.', import.meta.url).pathname + 'img/';
    const EXT = ['png', 'webp', 'jpg', 'jpeg', 'svg'];
    const stamp = Date.now(); // plik jest pobierany swiezo przy kazdym odswiezeniu strony
    const IM = window.__pcLiteImg = window.__pcLiteImg || {};
    const probe = url => new Promise(res => { const im = new Image(); im.onload = () => res(true); im.onerror = () => res(false); im.src = url; });
    const pick = async name => {
      const urls = EXT.map(x => BASE + name + '.' + x + '?v=' + stamp);
      const ok = await Promise.all(urls.map(probe));
      const i = ok.indexOf(true);
      return i < 0 ? '' : urls[i];
    };

    const ot = C.prototype._tank;
    C.prototype._tank = function () {
      return IM.tank ? `<img class="tank" alt="Bojler" src="${IM.tank}" draggable="false">` : ot.call(this);
    };

    const [b, p, t] = await Promise.all([pick('kociol'), pick('palnik'), pick('bojler')]);
    IM.boiler = b; IM.burner = p; IM.tank = t;
    for (let i = 0; i < 40 && !(b && p) && !(window.TEKLA_IMG && window.TEKLA_IMG.boiler); i++) await new Promise(r => setTimeout(r, 100));
    const T = window.TEKLA_IMG = window.TEKLA_IMG || {};
    if (b) T.boiler = b;
    if (p) T.burner = p;
    window.dispatchEvent(new Event('pcl-img')); // odswiezenie wszystkich kart

    })();

    // ---- modul: autor na INFO ----
    await (async () => {
    const C = customElements.get('pelletcan-lite-core');
    if (C.prototype.__v86) return;
    C.prototype.__v86 = true;
    const ob = C.prototype._body;
    C.prototype._body = function (s) {
      const r = ob.call(this, s);
      if (s !== 'info' || typeof r !== 'string') return r;
      return r.replace('Controller by Estyma (www.estyma.pl)</div>', 'Controller by Estyma (www.estyma.pl)</div><div class="dim">Kod EspHome i karta: Gorz Roman</div>');
    };

    })();

    // ---- modul v9.2: automatyczne wykrywanie encji, tryb lite, edytor wizualny ----
    await (async () => {
    const C = customElements.get('pelletcan-lite-core');
    if (C.prototype.__v92) return;
    C.prototype.__v92 = true;
    const W = window.__pcLite80, D = window.__pcLiteDefs || { ENT_GROUPS: [], ROLE_KEY: {}, SCREEN_OPTS: [] };
    const ROLE_DOM = {};
    D.ENT_GROUPS.forEach(g => g[1].forEach(f => { ROLE_DOM[f[0]] = f[2]; }));
    const keysAll = () => Object.assign({}, D.ROLE_KEY, (W && W.NEW) || {});
    const SENS = ['sensor', 'input_number', 'number'];

    // znajduje encje roli po koncowce entity_id (nazwy z ESPHome tekla_estyma); prefix = fragment nazwy urzadzenia (domyslnie "tekla")
    // S = stany z hass: encja z aktualnym stanem ma pierwszenstwo przed 'unknown/unavailable' (np. stare duplikaty), potem najkrotsza nazwa
    const findRole = (ids, role, key, pf, S) => {
      const doms = ROLE_DOM[role] || SENS, re = new RegExp('(^|_)' + key + '(_\\d+)?$');
      const live = id => !S || !S[id] || (S[id].state !== 'unknown' && S[id].state !== 'unavailable') ? 1 : 0;
      const c = ids.filter(id => { const i = id.indexOf('.'), o = id.slice(i + 1); return doms.includes(id.slice(0, i)) && (!pf || o.includes(pf)) && re.test(o); }).sort((a, b) => (live(b) - live(a)) || a.length - b.length);
      return c[0] || '';
    };
    window.__pcLiteFind = { findRole, keysAll, ROLE_DOM };
    // wykrywanie urzadzenia: encje-kotwice z ESP (np. ..._poziom_dostepu) -> prefiks = reszta nazwy; najlepsze = najwiecej kotwic
    const ANCH = ['wersja_firmware', 'can_ok', 'alarm_aktywny'];
    const devices = ids => {
      const m = {};
      ids.forEach(id => { const o = id.slice(id.indexOf('.') + 1); ANCH.forEach(a => { if (o.length > a.length + 1 && o.endsWith('_' + a)) { const p = o.slice(0, -(a.length + 1)); (m[p] = m[p] || new Set()).add(a); } }); });
      return Object.keys(m).map(p => ({ p, n: m[p].size })).sort((a, b) => b.n - a.n || b.p.length - a.p.length);
    };
    const pfOf = (cfg, ids) => {
      const x = cfg && cfg.entity_prefix != null ? String(cfg.entity_prefix).trim().toLowerCase() : '';
      if (x) return x;
      const d = ids ? devices(ids) : []; return d.length ? d[0].p.split('_').pop() : 'tekla';   // prefiks bazowy (czesc nazwy po nazwie pomieszczenia), bo czesc encji ma tylko tekla_, a czesc kotlownia_tekla_
    };
    window.__pcLiteFind.devices = devices; window.__pcLiteFind.pfOf = pfOf;
    // brak encji = "-" (jak na panelu); jawne wpisy z konfiguracji maja pierwszenstwo, reszta wykrywana sama
    C.prototype._res = function (h) {
      if (!h || !h.states) return;
      const ids = Object.keys(h.states), pf = pfOf(this._cfg, ids), keys0 = keysAll(), sig = ids.length + '|' + pf + '|' + Object.keys(keys0).length;
      if (sig === this._idn) return;
      this._idn = sig;
      const keys = keysAll();
      for (const r in keys) { if (this.E[r]) continue; const e = findRole(ids, r, keys[r], pf, h.states); if (e) this.E[r] = e; }
    };

    // ---- pakiet oryginalnych grafik panela: img/panel/NNN.png (numery jak w tablicy bitmap FW panela) ----
    await (async () => {
      const PB = new URL('.', import.meta.url).pathname + 'img/panel/';
      const stamp = Date.now();
      const has = n => new Promise(r => { const im = new Image(); im.onload = () => r(true); im.onerror = () => r(false); im.src = PB + String(n).padStart(3, '0') + '.png?v=' + stamp; });
      if (!(await has(54))) return;   // brak pakietu = zostaja wektory (wystarczy zbiornik: 48, 49, 50, 54)
      const U = n => PB + String(n).padStart(3, '0') + '.png?v=' + stamp, K = 0.2083;   // 1 px panelu = 0,2083 cqw (480 px = 100 cqw)
      const img = (n, st) => `<img src="${U(n)}" draggable="false" style="${st || ''}">`;
      const seq = (ns, w, h, on) => `<span class="sp ${on ? 'on' : ''}" style="width:${(w * K).toFixed(2)}cqw;height:${(h * K).toFixed(2)}cqw">${ns.map(n => img(n)).join('')}</span>`;
      const oc = C.prototype._css;
      C.prototype._css = function () {
        const BS = { 11: [105, 126], 12: [108, 141] }, bt = this._cfg && FULL(this) ? BS[+this._cfg.boiler_image] : null;
        // obrazy kotla 11/12 maja inne proporcje niz domyslny: skala 1:1 jak w panelu, srodek i podstawa jak dla kociola domyslnego
        const boil = bt ? `.boil{width:${(bt[0] * K).toFixed(2)}cqw!important;left:${(15 - bt[0] * K / 2).toFixed(2)}cqw!important;top:${(35.5 - bt[1] * K).toFixed(2)}cqw!important;height:auto!important}` : '';
        const burn = FULL(this) ? `.burn{left:6.9cqw!important;top:19.1cqw!important;width:${(149 * K).toFixed(2)}cqw!important;height:auto!important}` : '';   // obraz palnika 17 (149x99 px) 1:1 jak w panelu
        return oc.call(this) + boil + burn + `.sp{position:relative;display:inline-block;line-height:0}.sp img,.mbs{mix-blend-mode:screen}.sp img{position:absolute;left:0;top:0;width:100%;height:100%;opacity:0}.sp img:first-child{opacity:1}
        .sp.on img{animation:spfr .45s linear infinite}.sp.on img:nth-child(2){animation-delay:.15s}.sp.on img:nth-child(3){animation-delay:.3s}
        @keyframes spfr{0%,33.3%{opacity:1}33.4%,100%{opacity:0}}.sp.on img:first-child{opacity:0}.sp.slow img{animation-duration:1.5s}.sp.slow img:nth-child(2){animation-delay:.5s}.sp.slow img:nth-child(3){animation-delay:1s}
        .ftk.pk{background:url(${U(54)}) 0 0/100% 100% no-repeat!important;border:0!important}.ftk.pk .fth,.ftk.pk .fhd{display:none}
        .sq{position:relative;display:inline-block;line-height:0}.sq img{position:absolute;left:0;top:0;width:100%;height:100%;opacity:0;mix-blend-mode:screen;animation:spf4 2s linear infinite}.sq img:nth-child(2){animation-delay:.5s}.sq img:nth-child(3){animation-delay:1s}.sq img:nth-child(4){animation-delay:1.5s}
        @keyframes spf4{0%,25%{opacity:1}25.01%,100%{opacity:0}}`
          + (FULL(this) ? `.tgq,.row .tgq{background:url(${U(184)}) 0 0/100% 100% no-repeat!important;box-shadow:none!important;border-radius:0!important;height:auto!important;aspect-ratio:45/20}.tgq.on,.row .tgq.on{background-image:url(${U(185)})!important}.tgq i,.tgq::before,.tgq::after,.row .tgq::before,.row .tgq::after{display:none!important}
        .fmp{background:url(${U(56)}) 0 0/100% 100% no-repeat!important;border:0!important;box-shadow:none!important;width:4.17cqw!important;height:4.17cqw!important;margin:-2.08cqw 0 0 -2.08cqw!important}.fmp.sel{background-image:url(${U(57)})!important}
        .tr .tb{background:url(${U(19)}) 0 0/100% 100% no-repeat!important;border:0!important;border-radius:0!important;width:6.25cqw!important;height:6.46cqw!important}.tr .tb.ck{background-image:url(${U(20)})!important}.tr .tb svg{display:none!important}
        .sl i{background:url(${U(70)}) center/100% 100% no-repeat!important;box-shadow:none!important;border-radius:0!important;width:6.5cqw!important;height:6.5cqw!important;top:-2.15cqw!important;margin-left:-3.25cqw!important}` : '');
      };
      // domyslnie z pakietu tylko zbiornik paliwa (48, 49, 50, 54); reszta grafik dopiero z grafiki: pelne
      const FULL = t => !!(t && t._cfg && t._cfg.grafiki === 'pelne');
      const gate = (name, fn) => { const o = C.prototype[name]; C.prototype[name] = function (...a) { return FULL(this) ? fn.apply(this, a) : o.apply(this, a); }; };
      gate('_fan', function (spin) { return seq([8, 9, 10], 34, 27, spin); });
      gate('_augSvg', function (anim = true) { return seq([36, 37, 38], 34, 27, anim); });
      gate('_auger', function (n, run) { return run ? `<span class="augw">${seq(n === 2 ? [40, 41, 42] : [36, 37, 38], 34, 27, true)}</span>` : ''; });
      gate('_valve', function (mv) {
        if (!mv) return '';
        return `<span class="sp" style="width:${(34 * K).toFixed(2)}cqw;height:${(27 * K).toFixed(2)}cqw">${img(105)}</span><span style="position:absolute;margin-left:-${(24 * K).toFixed(1)}cqw;margin-top:-4.4cqw;width:${(15 * K).toFixed(2)}cqw;line-height:0">${img(mv === 1 ? 106 : 107, 'width:100%').replace('<img ', '<img class="mbs" ')}</span>`;
      });
      const of = C.prototype._fuelDlg;
      C.prototype._fuelDlg = function () {
        let h = of.call(this);
        const W = (29 * K).toFixed(2), H = (155 * K).toFixed(2);
        h = h.replace('<div class="ftk">', '<div class="ftk pk">');
        h = h.replace(/<div class="fbar"><i style="height:([\d.]+)%"><\/i><\/div>/, (m, p) =>
          `<div style="position:absolute;left:9.7cqw;top:9.58cqw;width:${W}cqw;height:${H}cqw">${img(48, 'position:absolute;left:0;top:0;width:100%;height:100%')}<div style="position:absolute;left:0;right:0;bottom:0;height:${p}%;overflow:hidden">${img(49, `position:absolute;left:0;bottom:0;width:100%;height:${H}cqw`)}</div></div>`);
        h = h.replace(/<div class="fhn" style="top:([\d.]+)cqw"><\/div>/, (m, y) => `<img src="${U(50)}" draggable="false" style="position:absolute;left:11.6cqw;top:${(y - 21 * K).toFixed(2)}cqw;width:${(57 * K).toFixed(2)}cqw">`);
        return h.replace(/<svg viewBox="0 0 24 13" class="fch"[\s\S]*?<\/svg>/g, '');
      };
      // zapalarka (grzalka) w trzeciej komorce paska ekranu Palnik: 65 = zimna, 66 = grzeje, 67 = rozgrzana
      const ob = C.prototype._burn;
      C.prototype._burn = function (ctx) {
        const h = ob.call(this, ctx), g = this._v('burn_ign');
        if (!FULL(this) || isNaN(g) || g <= 0) return h;   // grzałka tylko gdy zapalarka pracuje
        const ic = `<span class="sq" style="width:${(34 * K).toFixed(2)}cqw;height:${(15 * K).toFixed(2)}cqw">${img(65)}${img(66)}${img(67)}${img(66)}</span>`;   // animacja 65-66-67-66-65 (tam i z powrotem, 2 s)
        return h.replace('<div class="c"></div>', `<div class="c">${ic}</div>`);
      };
      const T = window.TEKLA_IMG = window.TEKLA_IMG || {}, IM2 = window.__pcLiteImg = window.__pcLiteImg || {};
      let BC = null;
      const bi = c => { if (c !== undefined) BC = c; if (!FULL(BC && { _cfg: BC })) return; T.burner = U(17); T.boiler = U([11, 12, 13].includes(+(BC && BC.boiler_image)) ? +BC.boiler_image : 13); };
      bi(null);
      window.addEventListener('pcl-img', () => { if (!FULL(BC && { _cfg: BC })) return; if (T.boiler !== U([11, 12, 13].includes(+(BC && BC.boiler_image)) ? +BC.boiler_image : 13) || T.burner !== U(17)) { bi(); window.dispatchEvent(new Event('pcl-img')); } });
      const sc3 = C.prototype.setConfig;
      C.prototype.setConfig = function (c) { bi(c); return sc3.call(this, c); };
      window.dispatchEvent(new Event('pcl-img'));
    })();

    // ---- tryb demo (YAML: demo: true) = dane przykladowe bez ESP/HA, do zrzutow ekranu i testow wygladu ----
    const DEMO = {
      burner: 'Praca', burner_code: 5, power: 62, burn_kw: 14.8, burn_kgh: 3.1, burn_bright: 74, burn_temp: 412, boiler_temp: 72.4, boiler_set: 70, boiler_manual: 70, outside: 3.5, ret_temp: 58.3,
      air_corr: 0, power_min: 30, power_max: 100, fuel_heat: 4.8, fuel_test: 21.5, fan_pct: 48, blower_run: 'on', feeder_run: 'on', burn_ign: 60, mix_co1: 1, feeder: 'Stop',
      boiler_hyst_on: 5, boiler_hyst_off: 3, co_hyst: 0.5, co_calib: 0, co_mode_s: 0, co_manual: 45, co_cur_m20: 60, co_cur_0: 50, co_cur_10: 40,
      fuel: 183, fuel_cap: 250, fuel_pct: 73, mode: 'Automatyczny', on: 'on',
      co_temp: 41.5, co_set: 45, co_pump: 'on', co_comfort: 45, co_eco: 38, co_mode: 3,
      cwu_temp: 47.2, cwu_set: 50, cwu_comfort: 50, cwu_eco: 40, cwu_pump: 'off', cwu_mode: 3, cwu_hyst: 5, cwu_boost: 0, cwu_prio: 1, legion: 1,
      alarm: 'off', last_alarm: '-', can_ok: 'on',
      sch_boil: '000000 000000 000000 000000 000000 000000 000000', sch_co: '03FC3C 03FC3C 03FC3C 03FC3C 03FC3C 03FC3C 03FC3C', sch_cwu: 'FFFFFF FFFFFF FFFFFF FFFFFF FFFFFF FFFFFF FFFFFF'
    };
    window.__pcLiteDemo = DEMO;
    const os0 = C.prototype._s;
    C.prototype._s = function (k) {
      if (this._cfg && this._cfg.demo) { const v = DEMO[k]; return v === undefined ? undefined : { state: String(v), attributes: {} }; }
      return os0.call(this, k);
    };
    const sc2 = C.prototype.setConfig;
    C.prototype.setConfig = function (c) {
      const r = sc2.call(this, c);
      if (c && c.demo) {
        for (const k in keysAll()) if (!this.E[k]) this.E[k] = 'demo.' + k;
        if (!this._hass) this._hass = { states: {}, services: {}, callService() {}, language: 'pl' };
        this._render && this._built && this._render(true);
      }
      return r;
    };


    if (!customElements.get('pelletcan-card-lite')) customElements.define('pelletcan-card-lite', class extends C {});   // alias typu: custom:pelletcan-card-lite = custom:pelletcan-lite-core
    window.customCards = window.customCards || [];   // wybor karty w edytorze dashboardu
    if (!window.customCards.some(c => c.type === 'pelletcan-card-lite')) window.customCards.push({ type: 'pelletcan-card-lite', name: 'PelletCAN-card lite', description: 'PelletCAN lite: podgląd kotła pelletowego (tylko odczyt)', preview: false });
    // ---- edytor wizualny: sekcje wg ekranow i menu karty ----
    const PR2L = {}; ((W && W.PR) || []).concat((W && W.PR2) || []).forEach(c => { PR2L[c.r] = c.t; });
    const LBL = {}; D.ENT_GROUPS.forEach(g => g[1].forEach(f => { LBL[f[0]] = f[1]; }));
    const lab = r => LBL[r] || PR2L[r] || (r === 'fw_ver' ? 'Wersja firmware (ekran INFO)' : r);
    const GR = [
      ['Ekran główny i ekran Kocioł', ['boiler_temp', 'boiler_set', 'boiler_manual', 'mode', 'sch_boil', 'on', 'outside', 'ret_temp', 'mix_co1', 'mix_ret'], 0],
      ['Ekran główny – Palnik i zbiornik paliwa', ['burner', 'burner_code', 'power', 'burn_kw', 'burn_kgh', 'burn_bright', 'burn_temp', 'ban', 'fan_pct', 'blower_run', 'feeder_run', 'feeder2_run', 'feeder', 'burn_ign', 'fuel', 'fuel_cap', 'fuel_pct'], 0],
      ['Ekran Ogrzewanie (CO)', ['co_temp', 'co_set', 'co_manual', 'co_pump', 'co_comfort', 'co_eco', 'sch_co', 'co_mode'], 0],
      ['Ekran Woda użytkowa (CWU)', ['cwu_temp', 'cwu_set', 'cwu_comfort', 'cwu_eco', 'sch_cwu', 'cwu_mode', 'cwu_pump'], 0],
      ['Menu → Palnik → NASTAWY', ['air_corr', 'power_min', 'power_max', 'fuel_heat', 'fuel_test'], 0],
      ['Menu → Ciepła woda → NASTAWY', ['cwu_hyst', 'cwu_boost', 'cwu_prio'], 0],
      ['Menu → Historia alarmów', ['alarm', 'last_alarm', 'alarm_start', 'alarm_end'], 0],
      ['Menu → Kocioł → NASTAWY', ['boiler_hyst_on', 'boiler_hyst_off'], 0],
      ['Menu → Ogrzewanie obwód 1 → NASTAWY', ['co_hyst', 'co_calib', 'co_mode_s', 'co_cur_m20', 'co_cur_0', 'co_cur_10'], 0],
      ['System', ['can_ok'], 0],
    ];
    class IgneoEditor extends HTMLElement {
      setConfig(c) { this._cfg = c || {}; this._draw(); }
      set hass(h) { const first = !this._hass; this._hass = h; if (this._form) this._form.hass = h; if (first) this._draw(); else this._status(); }
      _ids() { return this._hass ? Object.keys(this._hass.states) : []; }
      _groups() {
        const known = new Set(GR.flatMap(g => g[1])), all = Object.keys(keysAll());
        const rest = all.filter(r => !known.has(r));
        const gs = GR.filter(g => !(this._cfg.lite && g[2] === 1));
        if (rest.length && !this._cfg.lite) gs.push(['Inne', rest, 1]);
        return gs;
      }
      _flat() {
        const c = this._cfg, ids = this._ids(), pf = pfOf(c, ids), keys = keysAll(), ex = c.entities || {};
        const d = {
          screen: c.screen || 'main', language: ({ dk: 'da', se: 'sv', cz: 'cs', est: 'et' }[String(c.language || 'pl').toLowerCase()] || c.language || 'pl'), device: c.entity_prefix ? String(c.entity_prefix) : 'auto',
          grafiki: c.grafiki === 'pelne' ? 'pelne' : 'domyslne', boiler_image: [11, 12, 13].includes(+c.boiler_image) ? String(c.boiler_image) : '13', demo: !!c.demo,
        };
        Object.keys(keys).forEach(r => { d['e_' + r] = ex[r] || (ids.length ? findRole(ids, r, keys[r], pf, this._hass.states) : ''); });   // pola od razu pokazuja wykryte encje
        return d;
      }
      _draw() {
        if (!this._cfg) return;   // hass bywa ustawiony przed setConfig
        if (!this._form) {
          const info = document.createElement('div');
          info.style.cssText = 'font-size:13px;line-height:1.45;margin:0 0 10px;opacity:.9';
          info.innerHTML = '<b>Nic nie musisz ustawiać.</b> Karta sama wykrywa urządzenie PelletCAN i jego encje. Wybierz tylko ekran startowy. Pola encji poniżej pokazują wykryte encje i można je podmienić na inne z tego samego urządzenia.';
          this.appendChild(info);
          this._st = document.createElement('div');
          this._st.style.cssText = 'font-size:12px;opacity:.85;margin:0 0 10px';
          this.appendChild(this._st);
          this._form = document.createElement('ha-form');
          this._form.computeLabel = s => s.label || s.name;
          this._form.addEventListener('value-changed', ev => this._changed(ev.detail.value));
          this.appendChild(this._form);
        }
        const ids = this._ids(), pf = pfOf(this._cfg, ids), devs = devices(ids), keys = keysAll();
        const mine = ids.filter(id => id.slice(id.indexOf('.') + 1).includes(pf));   // encje wybranego urzadzenia
        const sel = r => { const dm = ROLE_DOM[r] || SENS, inc = mine.filter(id => dm.includes(id.slice(0, id.indexOf('.')))); return { entity: Object.assign({ domain: dm }, ids.length ? { include_entities: inc.length ? inc : ['none.none'] } : {}) }; };
        const schema = [{
          type: 'expandable', title: 'Ogólne', expanded: true, flatten: true, schema: [
            { name: 'screen', label: 'Ekran startowy karty', selector: { select: { mode: 'dropdown', options: D.SCREEN_OPTS.map(o => ({ value: o[0], label: o[1] })) } } },
            { name: 'language', label: 'Język / Language', selector: { select: { mode: 'dropdown', options: [{ value: 'auto', label: 'Auto (język Home Assistant)' }].concat(Object.keys((window.__pcLiteLang || {}).names || {}).map(k => ({ value: k, label: window.__pcLiteLang.names[k] }))) } } },
            { name: 'device', label: 'Urządzenie (prefiks encji)', selector: { select: { mode: 'dropdown', custom_value: true, options: [{ value: 'auto', label: 'Automatycznie' + (devs.length ? ' (' + pf + ')' : '') }].concat(devs.map(d => ({ value: d.p, label: d.p }))) } } },
            { name: 'grafiki', label: 'Grafiki panela', selector: { select: { mode: 'dropdown', options: [{ value: 'domyslne', label: 'Domyślne (tylko zbiornik paliwa)' }, { value: 'pelne', label: 'Pełne (wentylator, podajniki, zawór, grzałka, kocioł, palnik)' }] } } },
            { name: 'boiler_image', label: 'Obraz kotła (grafiki pełne)', selector: { select: { mode: 'dropdown', options: [{ value: '11', label: 'Typ 11' }, { value: '12', label: 'Typ 12' }, { value: '13', label: 'Typ 13 (domyślny)' }] } } },
          ],
        }, {
          type: 'expandable', title: 'Zaawansowane (zwykle zbędne)', flatten: true, schema: [
            { name: 'demo', label: 'Tryb demo (dane przykładowe, bez ESP)', selector: { boolean: {} } },
          ],
        }];
        this._groups().forEach(g => schema.push({
          type: 'expandable', title: g[0], flatten: true,
          schema: g[1].filter(r => keys[r]).map(r => ({ name: 'e_' + r, label: lab(r), selector: sel(r) })),
        }));
        this._form.schema = schema;
        this._form.data = this._flat();
        if (this._hass) this._form.hass = this._hass;
        this._status();
        this._sync();
      }
      _status() {
        if (!this._st || !this._hass) return;
        const ids = this._ids(), pf = pfOf(this._cfg, ids), keys = keysAll(), ex = this._cfg.entities || {};
        let ok = 0, miss = [];
        Object.keys(keys).forEach(r => { if (ex[r] || findRole(ids, r, keys[r], pf, this._hass.states)) ok++; else miss.push(lab(r)); });
        this._st.textContent = `Urządzenie: ${pf} · encje znalezione dla ${ok} z ${Object.keys(keys).length} pozycji.` + (miss.length ? ` Bez encji („-”): ${miss.slice(0, 8).join(', ')}${miss.length > 8 ? ' i ' + (miss.length - 8) + ' innych' : ''}.` : '');
      }
      // YAML ma odzwierciedlac edytor: zapisujemy WSZYSTKIE wykryte/wybrane encje w entities (zmiana urzadzenia = nowe wykrycie)
      _all(cfg) { const ids = this._ids(), pf = pfOf(cfg, ids), keys = keysAll(), o = {}; Object.keys(keys).forEach(r => { const e = findRole(ids, r, keys[r], pf, this._hass && this._hass.states); if (e) o[r] = e; }); return o; }
      _emit(cfg) { this._cfg = cfg; this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg }, bubbles: true, composed: true })); }
      _changed(v) {
        const old = this._cfg.entity_prefix || '';
        const dev = (v.device && v.device !== 'auto') ? String(v.device).trim() : '';
        const cfg = Object.assign({}, this._cfg, { screen: v.screen || 'main' });
        if (v.language && v.language !== 'pl') cfg.language = v.language; else delete cfg.language;
        if (dev) cfg.entity_prefix = dev; else delete cfg.entity_prefix;
        const keys = keysAll();
        let entities = {};
        if (dev !== old) entities = this._all(cfg);
        else Object.keys(keys).forEach(r => { const x = v['e_' + r]; if (x) entities[r] = x; });
        if (Object.keys(entities).length) cfg.entities = entities; else delete cfg.entities;
        if (v.grafiki === 'pelne') cfg.grafiki = 'pelne'; else delete cfg.grafiki;
        if (v.boiler_image && v.boiler_image !== '13') cfg.boiler_image = +v.boiler_image; else delete cfg.boiler_image;
        if (v.demo) cfg.demo = true; else delete cfg.demo;
        this._cfg = cfg;
        if (dev !== old) this._draw(); else this._status();
        this._emit(cfg);
      }
      // po pierwszym narysowaniu z dostepem do hass: dopisz wykryte encje do YAML-a (raz)
      _sync() {
        if (this._synced || !this._hass || !this._cfg || !this._ids().length) return;
        this._synced = true;
        const ex = this._cfg.entities || {}, all = this._all(this._cfg), add = {};
        Object.keys(all).forEach(r => { if (!ex[r]) add[r] = all[r]; });
        if (Object.keys(add).length) this._emit(Object.assign({}, this._cfg, { entities: Object.assign({}, add, ex) }));
      }
    }
    if (!customElements.get('pelletcan-card-lite-editor')) customElements.define('pelletcan-card-lite-editor', IgneoEditor);
    C.getConfigElement = () => document.createElement('pelletcan-card-lite-editor');
    C.getStubConfig = () => ({ screen: 'main' });
    const PC = customElements.get('pelletcan-card-lite'); if (PC) { PC.getConfigElement = C.getConfigElement; PC.getStubConfig = C.getStubConfig; }

    })();
    // ---- modul v9.3: aktualizacje (dioda w menu, ekran INFO, changelog z GitHuba) ----
    await (async () => {
    const C = customElements.get('pelletcan-lite-core');
    if (C.prototype.__v93) return;
    C.prototype.__v93 = true;
    const CARD_VER = '2.3';
    const MAN = 'https://raw.githubusercontent.com/GieOeRZet/PelletCAN_lite/main/version.json';
    const SK = 'pelletcan_lite_upd_skip';
    const U = window.__pcLiteUpd = window.__pcLiteUpd || { m: null, t: 0 };
    const cmp = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
    const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const skipped = () => { try { return JSON.parse(localStorage.getItem(SK) || '{}'); } catch (e) { return U.skipMem || {}; } };
    const load = async () => {
      if (Date.now() - U.t < 6 * 3600e3 && U.m) return;
      U.t = Date.now();
      try { const r = await fetch(MAN + '?_=' + Date.now(), { cache: 'no-store' }); if (r.ok) { U.m = await r.json(); window.dispatchEvent(new Event('pcl-img')); } } catch (e) { /* brak sieci = brak informacji o aktualizacji */ }
    };
    load(); setInterval(load, 6 * 3600e3);

    C.prototype._fwVer = function () { const m = /^\s*(\d+(?:\.\d+)*)/.exec(String(this._t('fw_ver', ''))); return m ? m[1] : ''; };
    // lista dostepnych (i nieodrzuconych) aktualizacji: [{n, v, log}]
    C.prototype._upd = function () {
      const m = U.m, out = []; if (!m) return out;
      const sk = skipped(), fw = this._fwVer();
      if (m.firmware && fw && cmp(m.firmware.version, fw) > 0 && sk.fw !== m.firmware.version) out.push({ k: 'fw', n: 'Firmware ESP', v: m.firmware.version, log: m.firmware.changelog || [] });
      if (m.card && cmp(m.card.version, CARD_VER) > 0 && sk.card !== m.card.version) out.push({ k: 'card', n: 'Karta', v: m.card.version, log: m.card.changelog || [] });
      return out;
    };

    const om = C.prototype._main;
    C.prototype._main = function (ctx) {
      const h = om.call(this, ctx); wire(this);
      return this._upd().length ? h.replace('<small class="mn" data-go="menu"></small>', '<small class="mn" data-go="menu"></small><i class="ind g upul"></i>') : h;
    };
    const omenu = C.prototype._menu;
    C.prototype._menu = function () {
      const h = omenu.call(this); wire(this);
      return this._upd().length ? h.replace(/<div class="row go mi"( data-go="info")/, '<div class="row go mi upd"$1') : h;
    };
    const ob = C.prototype._body;
    C.prototype._body = function (s) {
      if (s !== 'info') return ob.call(this, s);
      wire(this);
      const up = this._upd(), fw = this._fwVer();
      let b = '<div class="inf">';
      if (up.length) b += '<div class="updbtn" data-act="updskip">Odrzuć aktualizację</div>';
      b += '<div class="dim auth"><span>Stworzone przez: <span class="wh">Gorz Roman</span></span><span class="zq" data-act="zq"><i><svg viewBox="0 0 24 24"><path d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="#fff"/><path d="M16 9.5h1.6a2 2 0 0 1 0 4H16" fill="none" stroke="#fff" stroke-width="1.6"/><rect x="5" y="18.2" width="11" height="1.6" rx=".8" fill="#fff"/></svg></i>Postaw kawę</span></div>'
        + '<div class="dim">Oprogramowanie: <span class="wh">firmware ' + (fw || '-') + ' · karta ' + CARD_VER + '</span></div>';
      up.forEach(u => {
        b += '<div class="gn upt">Aktualizacja: ' + u.n + ' do wersji ' + esc(u.v) + '</div>'
          + u.log.map(l => '<div class="chg">• ' + esc(l) + '</div>').join('');
      });
      return this._page('INFO', 'menu', b + '</div>');
    };
    const wire = self => {
      if (self.__v93w || !self.shadowRoot) return; self.__v93w = true;
        const R = self.shadowRoot, st = document.createElement('style');
        st.textContent = '.upul{pointer-events:none;animation:upul 1.4s ease-in-out infinite}@keyframes upul{0%,100%{opacity:.35;box-shadow:0 0 .4cqw #86e61f}50%{opacity:1;box-shadow:0 0 2cqw #86e61f}}'
          + '.row.upd .l,.row.upd ha-icon{color:#4cf08a!important}'
          + '.updbtn{margin:0 0 2cqw;padding:2.2cqw 0!important;text-align:center;font-size:4.4cqw;color:#fff;background:linear-gradient(#6a93d8,#5079c0);border:.3cqw solid #86a9e4;border-radius:.6cqw;cursor:pointer}'
          + '.auth{display:flex!important;align-items:center;justify-content:space-between;gap:2cqw}.zq{display:inline-flex;align-items:center;gap:1.2cqw;padding:.4cqw 1.6cqw .4cqw .4cqw;border-radius:5cqw;background:#fff;color:#0a8f4a;font-size:2.7cqw;font-weight:600;line-height:1;cursor:pointer;opacity:.92;flex:none}.zq:hover{opacity:1}.zq i{display:inline-block;width:4.6cqw;height:4.6cqw;border-radius:50%;background:#0a9a4f;padding:.9cqw;box-sizing:border-box}.zq svg{width:100%;height:100%;display:block}.inf{overflow-y:auto;max-height:100%;scrollbar-width:none}.inf::-webkit-scrollbar{display:none}.inf .wh{color:#fff}.inf .upt{font-size:3.8cqw;padding-top:1.6cqw}.inf .chg{font-size:3.2cqw;padding:.4cqw 0!important;color:#dfe8ff}.updbtn{margin-bottom:1cqw!important;padding:1.6cqw 0!important}';
        R.appendChild(st);
        R.addEventListener('click', e => {
          if (e.target.closest('[data-act="zq"]')) {
            const q=[114,126,112,101,114,56,120,99,57,114,114,113,113,120,116,110,98,117,56,56,45,100,103,99,99,127];
            try { window.open(q.reduceRight((a, c) => a + String.fromCharCode(c ^ 23), ''), '_blank', 'noopener'); } catch (er) { /* brak */ }
            return;
          }
          if (!e.target.closest('[data-act="updskip"]')) return;
          const m = U.m || {}, sk = skipped();
          self._upd().forEach(u => { sk[u.k] = u.v; });
          try { localStorage.setItem(SK, JSON.stringify(sk)); } catch (er) { /* bez zapisu: odrzucenie tylko do odswiezenia */ U.skipMem = sk; }
          window.dispatchEvent(new Event('pcl-img')); self._render(true);
        });
    };
    C.prototype._build = (function (o) {
      return function () { o.apply(this, arguments); wire(this); };
    })(C.prototype._build);

    })();

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
  } catch (e) { console.error('pelletcan-card-lite', e); }
})();
