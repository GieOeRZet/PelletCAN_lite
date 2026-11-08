# PelletCAN – grafiki karty

Karta szuka w tym folderze plików (kolejność: png, webp, jpg, jpeg, svg):

- `kociol.*` – kocioł na ekranie głównym (domyślnie 170x334 px)
- `palnik.*` – palnik (domyślnie 260x290 px)
- `bojler.*` – zasobnik CWU (domyślnie proporcje 70x124)

Podmiana: wgraj np. `kociol.png` (ma pierwszeństwo przed `kociol.webp`), odśwież Ctrl+F5.
Aby wrócić do domyślnej grafiki, usuń swój plik – domyślne to `kociol.webp`, `palnik.webp` i `bojler.svg`.
Zalecane: przezroczyste tło, te same proporcje co domyślne.

## Grafiki panela (`panel/`)
Folder `panel/NNN.png` to oryginalne grafiki panela. Domyślnie karta używa z niego tylko zbiornika paliwa; opcja **Grafiki panela: Pełne** (`grafiki: pelne`) włącza resztę (wentylator, podajniki, zawór, grzałka, kocioł, palnik). Typ obrazu kotła: `boiler_image: 11 | 12 | 13`.
