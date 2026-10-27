# Hinweise für Claude

Lernplattform für den Unterricht an der FOS (Fachoberschule). Eigenständig: keine Links zur Berufsschul-Seite (Repository `lernmodule`) und umgekehrt.

## Aufbau
- `index.html`: Startseite mit allen Themen, gruppiert nach Fach. Neue Karten an die Markierung `NEUE THEMEN HIER EINFÜGEN` (Links mit `themenordner/`).
- Jedes Thema hat einen eigenen Ordner mit `index.html` (Themenseite) und drei Varianten: komplett, kompakt, nur Quiz.

## Bei jedem neuen Modul
- Inhalt und Aufgaben vorher mit der Lehrkraft abstimmen, Vorschau zeigen, erst nach OK nach `main` pushen.
- Keine personenbezogenen Daten. Das Repository ist öffentlich.
- Keine fremden Bilder oder Texte (Schulbuch, Zeitungen, Webseiten) hochladen. Lerntexte selbst formulieren.
- Anrede: **Sie** (FOS). Kurze Sätze, klare Struktur, auch für Schüler mit LRS gut lesbar. Anspruch: FOS-Niveau.
- Aufgabentypen mischen: Zahlen eingeben (mit Zufallswerten, „Neue Zahlen“), Zuordnen, Reihenfolge, Richtig/Falsch, Fehler finden, Begründen.

## Erzeugung
- `_werkzeuge/engine.js`: gemeinsame Aufgaben-Engine. Typen `mc`, `num`, `match`, `order`. num-Felder: `ans` in Tausendsteln, `tol` = Spielraum, `errors` = typische Fehler mit Hinweis.
  Pro Thema legt `tasks.js` fest: `BASIC` (Grundlagen-Module) und `ADVANCED` (werden danach freigeschaltet).
- `_werkzeuge/engine_extra.js`: zusätzliche Verständnis-Aufgaben, nach engine.js einbinden. Typen `predict` (vorhersagen, Animation aus `SIMS`, dann Begründungsfrage), `lab` (Schieberegler mit Aufträgen), `draw` (Geraden ins Diagramm zeichnen), `text` (in eigenen Worten erklären, Musterlösung mit Checkliste, zählt als „erledigt“). Außerdem in engine.js: `debate` („Wer hat recht?“ mit Auswahlfeldern). In Auswahllisten kein HTML verwenden.
- `_werkzeuge/engine_vektor.js`: Koordinatensystem und Kraftpfeile (`koord`, `pfeil`, `bogen`) und Aufgabentyp `vector` (Pfeile vom Ursprung einzeichnen, Prüfung mit Toleranz). VOR tasks.js einbinden; engine_extra.js meldet den Typ an. Fehlermeldungen in `errors` sind reiner Text (kein HTML).
- `_werkzeuge/stil_vorlage.css`: Design aus der C#-Vorlage des Kollegen.
- `_werkzeuge/<thema>/build.py` + `tasks.js`: Lerntexte und Aufgaben. Bauen mit `python3 _werkzeuge/<thema>/build.py`.
- Vor dem Hochladen: alle Generatoren mehrfach erzeugen, jedes Modul automatisch lösen, Handybreite 375 px prüfen. Physikwerte unabhängig nachrechnen.
