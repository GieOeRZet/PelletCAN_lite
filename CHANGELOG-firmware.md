# Changelog – firmware PelletCAN lite

## v1.0 – Pierwsza wersja lite
- Minimalny firmware tylko do odczytu: ESP wysyła do kotla wyłącznie zapytania o rejestry (SDO), bez zapisu; brak usług (akcji), przycisków i przełączników.
- Jeden obieg CO. W pliku użytkownika tylko: Wi-Fi, hasło AP, (opcjonalnie) stały IP, klucz API, hasło OTA, nazwa, nazwa w HA, antena zewnętrzna. Parametry CAN (125 kbit/s, 16 MHz) wpisane w kodzie.
- Dwa pliki: `esphome/PelletCAN_lite.yaml` (wgrywasz do ESP) i `esphome/PelletCAN_lite_packages.yaml` (rdzeń pobierany z GitHuba przy kompilacji).
- Encje jak w pełnym PelletCAN (te same nazwy): temperatury kotła/CO/CWU/zewnętrzna, pompy, mieszacze, palnik (stan, moc %, kW, spalanie, jasność, temperatura, czas podawania), zbiornik (kg, pojemność, %), podajnik, podajnik palnika, dmuchawa, zakaz rozpalenia, alarm aktywny, tryby (tekst), harmonogramy (do podglądu na karcie), CAN OK, wersja firmware.
