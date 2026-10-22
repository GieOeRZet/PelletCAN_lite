# Changelog – PelletCAN lite (karta)

Historia zmian firmware: [CHANGELOG-firmware.md](CHANGELOG-firmware.md).

## v1.0 – Pierwsza wersja lite
- Karta `custom:pelletcan-lite-card` (HACS): ekran główny, okno Paliwo (zapełnienie zbiornika), Ogrzewanie 1 (CO), Woda (CWU), Palnik oraz Menu z jedną pozycją „Informacje o programie”.
- Tylko odczyt: karta niczego nie zapisuje do kotła (nastawy, tryb pracy, harmonogram, ilość paliwa, podawanie, włącznik, potwierdzanie alarmu są nieklikalne; przyciski zapisu usunięte z ekranów).
- Zbudowana z kodu pełnej karty PelletCAN (te same grafiki i wygląd), skrypt budujący: `tools/build_lite.py`. Może działać obok pełnej karty (inne nazwy elementów).
