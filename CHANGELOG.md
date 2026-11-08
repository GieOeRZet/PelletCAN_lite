# Changelog – PelletCAN lite (karta)

Historia zmian firmware: [CHANGELOG-firmware.md](CHANGELOG-firmware.md).

## 2.1
- Element karty: `custom:pelletcan-card-lite` (zamiast `pelletcan-lite-card`).
- Drobne poprawki interfejsu, nowe zrzuty ekranu.

## v2.0 – Poziom podstawowy z pełnej karty (tylko odczyt)
- Karta lite budowana z pełnej karty PelletCAN 1.39 (`tools/build_lite.py`): ekran główny, Paliwo, CO, CWU, Palnik oraz Menu z ekranami Kocioł, Palnik, Ogrzewanie obwód 1, CWU, Informacje i Alarmy – tylko poziom podstawowy.
- Wszystko tylko do podglądu: można wejść w ekrany, tryb ogrzewania i harmonogram, ale nie da się niczego zmienić; wywołania usług zapisu są zablokowane w karcie.
- Usunięte menu „Poziom menu” i wszystkie pozycje spoza poziomu podstawowego. Z kodu karty wycięto też zapisy do kotła, PIN, Test wyjść, Statystyki, Sieć, Konfigurację i wszystkie nastawy wyższych poziomów (jeden plik `pelletcan-lite-card.js`, bez pliku rdzenia).

## v1.0 – Pierwsza wersja lite
- Karta `custom:pelletcan-lite-card` (HACS): ekran główny, okno Paliwo (zapełnienie zbiornika), Ogrzewanie 1 (CO), Woda (CWU), Palnik oraz Menu z jedną pozycją „Informacje o programie”.
- Tylko odczyt: karta niczego nie zapisuje do kotła (nastawy, tryb pracy, harmonogram, ilość paliwa, podawanie, włącznik, potwierdzanie alarmu są nieklikalne; przyciski zapisu usunięte z ekranów).
- Zbudowana z kodu pełnej karty PelletCAN (te same grafiki i wygląd), skrypt budujący: `tools/build_lite.py`. Może działać obok pełnej karty (inne nazwy elementów).
- Wszystkie nazwy globalne, klucze i adres aktualizacji są własne (repo PelletCAN_lite): powiadomienie o aktualizacji w MENU sprawdza wyłącznie `version.json` tego repo.
