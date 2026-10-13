# -*- coding: utf-8 -*-
"""Erzeugt die drei Varianten des Lernmoduls "Gravitation und Gewichtskraft" (FOS 12) nach dem Aufbau der C#-Vorlage."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO, "gravitation")
CSS_BASE = open(os.path.join(HERE, "..", "stil_vorlage.css"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "..", "engine.js"), encoding="utf-8").read()
TASKS_JS = open(os.path.join(HERE, "tasks.js"), encoding="utf-8").read()

css = CSS_BASE.replace("grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));",
                       "grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));")
css += """
        .table-wrap { overflow-x: auto; }
        .table-wrap table { min-width: 420px; }
        .sketch {
            text-align: center; margin: 25px 0; background: #0f172a; padding: 20px;
            border-radius: 10px; border: 2px solid #334155;
        }
        .sketch svg { width: 100%; max-width: 560px; height: auto; }
        .sketch .caption { font-size: 14px; color: #94a3b8; margin: 10px 0 0 0; }
        .formula {
            font-family: 'Cambria Math', 'Cambria', 'Times New Roman', serif;
            background: #0f172a; border: 1px solid #334155; border-radius: 8px;
            padding: 15px 20px; margin: 15px 0; color: #e2e8f0; font-size: 20px; line-height: 1.9;
        }
        .formula.big { text-align: center; font-size: 26px; border-color: #38bdf8; }
        .frac { display: inline-flex; flex-direction: column; vertical-align: middle; text-align: center; margin: 0 4px; }
        .frac > span:first-child { border-bottom: 2px solid currentColor; padding: 0 4px; }
        .frac > span:last-child { padding: 0 4px; }
        .zeitung {
            background: #f1ede4; color: #1f1a14; border-radius: 6px; padding: 22px 26px; margin: 25px 0;
            font-family: Georgia, 'Times New Roman', serif; box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }
        .zeitung .kopf { display: flex; justify-content: space-between; font-size: 14px; border-bottom: 3px double #1f1a14; padding-bottom: 6px; }
        .zeitung .titel { font-family: 'Old English Text MT', 'UnifrakturMaguntia', Georgia, serif; font-size: 34px; text-align: center; margin: 8px 0 2px 0; color: #1f1a14; }
        .zeitung .schlag { text-align: center; font-size: 19px; font-weight: bold; letter-spacing: 1px; border-top: 1px solid #1f1a14; border-bottom: 1px solid #1f1a14; padding: 4px 0; margin-bottom: 12px; }
        .zeitung p { color: #1f1a14; font-size: 17px; line-height: 1.6; margin-bottom: 8px; }
        .zeitung .quelle { font-size: 13px; color: #5b5146; font-style: italic; margin: 0; }
        .ok { color: #4ade80; font-weight: bold; }
        .nok { color: #f87171; font-weight: bold; }
        .header .book-hint {
            display: inline-block; margin-top: 15px; background: #0f2a3b; border: 1px solid #38bdf8;
            color: #bae6fd; padding: 8px 16px; border-radius: 8px; font-size: 16px; line-height: 1.6;
        }
        .progress-fill { min-width: fit-content; padding: 0 14px; white-space: nowrap; }
        @media (max-width: 600px) {
            .sketch { overflow-x: auto; padding: 15px 10px; }
            .sketch svg { min-width: 0; }
            .module-content { padding: 22px 16px; }
            .header h1 { font-size: 30px; }
            .module-content h2 { font-size: 25px; }
            .formula { font-size: 17px; padding: 12px; overflow-x: auto; }
            .formula.big { font-size: 21px; }
            .zeitung { padding: 16px; }
            .zeitung .titel { font-size: 26px; }
        }
        /* ---------- Aufgabentypen ---------- */
        .task-head { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
        .task-type, .task-level {
            font-size: 13px; font-weight: 600; padding: 3px 10px; border-radius: 999px;
            background: #0f172a; border: 1px solid #475569; color: #cbd5e1;
        }
        .task-level { border-color: #a855f7; color: #e9d5ff; background: #2e1a47; }
        .task-note { color: #94a3b8; font-size: 15px; margin: -5px 0 12px 0; line-height: 1.6; }
        .quiz-question .sketch { margin: 10px 0 15px 0; }
        .fields { display: flex; flex-direction: column; gap: 10px; }
        .field-row {
            display: grid; grid-template-columns: minmax(150px, 1fr) minmax(170px, 1.3fr);
            gap: 4px 14px; align-items: center;
            background: #273449; border: 2px solid transparent; border-radius: 8px; padding: 10px 12px;
        }
        .field-row.ok { border-color: #22c55e; }
        .field-row.bad { border-color: #ef4444; }
        .field-label { color: #f1f5f9; font-size: 17px; }
        .field-input { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .field-input input, .field-input select {
            background: #0f172a; color: #f8fafc; border: 2px solid #475569; border-radius: 6px;
            font-size: 18px; padding: 8px 10px; font-family: inherit;
        }
        .field-input input { width: 9em; font-family: 'Consolas', 'Courier New', monospace; }
        .field-input input.small { width: 6em; }
        .field-input select { width: 100%; max-width: 340px; font-size: 16px; }
        .field-input input:focus, .field-input select:focus { outline: none; border-color: #38bdf8; }
        .field-input input:disabled, .field-input select:disabled { opacity: 0.85; }
        .field-pre, .field-unit { color: #cbd5e1; font-size: 17px; }
        .field-unit:empty { display: none; }
        .field-msg { grid-column: 1 / -1; color: #fecaca; font-size: 15px; }
        .field-msg:empty { display: none; }
        .order-end { color: #94a3b8; font-size: 14px; font-weight: 600; margin: 4px 0 6px 28px; }
        .order-list { list-style: decimal; margin-left: 28px; }
        .order-item {
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
            background: #273449; border: 2px solid transparent; border-radius: 8px;
            padding: 8px 10px; margin-bottom: 8px; color: #f1f5f9;
        }
        .order-item.ok { border-color: #22c55e; }
        .order-item.bad { border-color: #ef4444; }
        .order-btns { display: flex; gap: 6px; flex-shrink: 0; }
        .order-btns button {
            background: #334155; color: #f8fafc; border: 1px solid #64748b; border-radius: 6px;
            width: 38px; height: 34px; font-size: 15px; cursor: pointer;
        }
        .order-btns button:hover:not(:disabled) { background: #475569; }
        .order-btns button:disabled { opacity: 0.3; cursor: default; }
        .task-buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
        .btn-check, .btn-new { border: none; border-radius: 8px; padding: 10px 20px; font-size: 16px; font-weight: bold; cursor: pointer; }
        .btn-check { background: #0ea5e9; color: white; }
        .btn-check:hover { background: #0284c7; }
        .btn-new { background: #334155; color: #f1f5f9; border: 1px solid #64748b; }
        .btn-new:hover { background: #475569; }
        .quiz-feedback { line-height: 1.6; }
        .calc { text-align: left; font-family: "Segoe UI", Arial, sans-serif; font-size: 17px; color: #e2e8f0; line-height: 2.1; white-space: nowrap; overflow-x: auto; }
        .calc-nr { display: inline-block; min-width: 4.6em; color: #fbbf24; font-family: "Segoe UI", Arial, sans-serif; font-size: 15px; font-weight: bold; }
        @media (max-width: 600px) {
            .field-row { grid-template-columns: 1fr; }
            .field-input input { width: 100%; max-width: 12em; }
            .quiz-section { padding: 18px 10px; }
            .quiz-question { padding: 14px 10px; }
            .calc { font-size: 15px; white-space: normal; line-height: 1.7; }
            .calc > div { margin-bottom: 6px; }
        }
"""


def table(head, rows):
    h = "<div class=\"table-wrap\"><table><tr>" + "".join(f"<th>{c}</th>" for c in head) + "</tr>"
    for r in rows:
        h += "<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>"
    return h + "</table></div>"


def box(title, text):
    return f'<div class="info-box"><h4>{title}</h4><p>{text}</p></div>'


def frac(a, b):
    return f'<span class="frac"><span>{a}</span><span>{b}</span></span>'


F = 'font-family="Segoe UI, Arial"'
GESETZ = f'<div class="formula big">F<sub>G</sub> = G · {frac("m₁ · m₂", "r²")}</div>'
GEWICHT = '<div class="formula big">F<sub>G</sub> = m · g</div>'

# ---------------------------------------------------------------- Skizzen
ZWEI_MASSEN = f"""
<div class="sketch">
<svg viewBox="0 0 560 220" role="img" aria-label="Zwei Kugeln ziehen sich gegenseitig an. r ist der Abstand der Mittelpunkte.">
  <defs><marker id="pf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>
  <circle cx="120" cy="105" r="70" fill="#1e3a5f" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="440" cy="105" r="32" fill="#3b2a0a" stroke="#f59e0b" stroke-width="3"/>
  <circle cx="120" cy="105" r="4" fill="#f8fafc"/><circle cx="440" cy="105" r="4" fill="#f8fafc"/>
  <text x="120" y="98" fill="#f8fafc" font-size="22" font-weight="bold" text-anchor="middle" {F}>m₁</text>
  <text x="440" y="98" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle" {F}>m₂</text>
  <line x1="190" y1="105" x2="250" y2="105" stroke="#f87171" stroke-width="4" marker-end="url(#pf)"/>
  <line x1="408" y1="105" x2="348" y2="105" stroke="#f87171" stroke-width="4" marker-end="url(#pf)"/>
  <text x="222" y="92" fill="#f87171" font-size="18" font-weight="bold" text-anchor="middle" {F}>F</text>
  <text x="378" y="92" fill="#f87171" font-size="18" font-weight="bold" text-anchor="middle" {F}>F</text>
  <line x1="120" y1="190" x2="440" y2="190" stroke="#4ade80" stroke-width="2.5" marker-start="url(#pf)" marker-end="url(#pf)"/>
  <line x1="120" y1="112" x2="120" y2="198" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4 4"/>
  <line x1="440" y1="112" x2="440" y2="198" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4 4"/>
  <text x="280" y="182" fill="#4ade80" font-size="20" font-weight="bold" text-anchor="middle" {F}>r</text>
</svg>
<p class="caption">Beide Körper ziehen sich mit gleich großen Kräften an. r wird von Mittelpunkt zu Mittelpunkt gemessen.</p>
</div>
"""


def kurve():
    # F ~ 1/r²: r von 1 bis 5 (Einheiten), F(1) = 1
    x0, y0, sx, sy = 70, 210, 95, 170
    pts = []
    k = 1.0
    while k <= 5.0001:
        pts.append(f"{x0 + (k - 1) * sx:.1f},{y0 - sy / (k * k):.1f}")
        k += 0.05
    s = [f'<svg viewBox="0 0 520 260" role="img" aria-label="Kurve: Die Kraft nimmt mit dem Quadrat des Abstands ab.">',
         f'<line x1="{x0}" y1="{y0}" x2="{x0 + 4 * sx + 30}" y2="{y0}" stroke="#94a3b8" stroke-width="2"/>',
         f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="20" stroke="#94a3b8" stroke-width="2"/>',
         f'<text x="{x0 + 4 * sx + 30}" y="{y0 + 30}" fill="#cbd5e1" font-size="16" text-anchor="end" {F}>Abstand r</text>',
         f'<text x="{x0 - 10}" y="22" fill="#cbd5e1" font-size="16" text-anchor="end" {F}>F</text>',
         f'<polyline points="{" ".join(pts)}" fill="none" stroke="#38bdf8" stroke-width="3"/>']
    for k, lab in [(1, "F"), (2, "F/4"), (3, "F/9"), (4, "F/16")]:
        x, y = x0 + (k - 1) * sx, y0 - sy / (k * k)
        s.append(f'<circle cx="{x}" cy="{y:.1f}" r="5" fill="#fbbf24"/>')
        s.append(f'<text x="{x + 8}" y="{y - 8:.1f}" fill="#fbbf24" font-size="16" font-weight="bold" {F}>{lab}</text>')
        s.append(f'<text x="{x}" y="{y0 + 22}" fill="#cbd5e1" font-size="15" text-anchor="middle" {F}>{"r" if k == 1 else str(k) + "r"}</text>')
    s.append('</svg>')
    return '<div class="sketch">' + "".join(s) + '<p class="caption">Doppelter Abstand: ein Viertel der Kraft. Dreifacher Abstand: ein Neuntel.</p></div>'


KURVE = kurve()

ERDE = f"""
<div class="sketch">
<svg viewBox="0 0 560 330" role="img" aria-label="Erde mit Orten in verschiedenen Abständen zum Erdmittelpunkt">
  <defs><marker id="pe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>
  <circle cx="200" cy="170" r="150" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="6 6"/>
  <ellipse cx="200" cy="170" rx="118" ry="114" fill="#1e3a5f" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="200" cy="170" r="4" fill="#f8fafc"/>
  <text x="208" y="192" fill="#cbd5e1" font-size="13" {F}>Erdmittelpunkt</text>
  <line x1="200" y1="170" x2="200" y2="60" stroke="#4ade80" stroke-width="2.5" marker-end="url(#pe)"/>
  <text x="208" y="80" fill="#4ade80" font-size="15" font-weight="bold" {F}>Nordpol</text>
  <line x1="200" y1="170" x2="314" y2="170" stroke="#fbbf24" stroke-width="2.5" marker-end="url(#pe)"/>
  <text x="258" y="162" fill="#fbbf24" font-size="15" font-weight="bold" text-anchor="middle" {F}>Äquator</text>
  <line x1="200" y1="170" x2="94" y2="250" stroke="#f87171" stroke-width="2.5" marker-end="url(#pe)"/>
  <text x="40" y="282" fill="#f87171" font-size="15" font-weight="bold" {F}>Everest</text>
  <circle cx="306" cy="64" r="8" fill="#e2e8f0"/>
  <text x="318" y="50" fill="#e2e8f0" font-size="15" font-weight="bold" {F}>ISS</text>
  <text x="372" y="140" fill="#f8fafc" font-size="15" {F}>
    <tspan x="372" dy="0">Pol: r klein → g groß</tspan>
    <tspan x="372" dy="26">Äquator: r größer</tspan>
    <tspan x="372" dy="26">Berg: r noch größer</tspan>
    <tspan x="372" dy="26">ISS: r = R + 408 km</tspan>
  </text>
</svg>
<p class="caption">Die Erde ist an den Polen leicht abgeplattet (stark übertrieben gezeichnet). Die gestrichelte Linie ist die Bahn der ISS.</p>
</div>
"""

ZEITUNG = """
<div class="zeitung">
  <div class="kopf"><span>05.07.1687</span><span>Nürnberg</span></div>
  <div class="titel">Der Wissenskurier</div>
  <div class="schlag">EIN APFEL VERÄNDERT DIE WELT!</div>
  <p>Sir Isaac Newton, der gelehrte Mann aus Cambridge, sah in seinem Garten einen Apfel vom Baume fallen. Er fragte sich: Warum fällt der Apfel stets zur Erde und niemals seitwärts oder gen Himmel?</p>
  <p>Seine Antwort: Eine unsichtbare Kraft zieht alle Dinge zur Erde. Und dieselbe Kraft hält auch den Mond auf seiner Bahn und führt die Planeten um die Sonne.</p>
  <p>In seinem Werk „Principia“ zeigt Newton: Alle Körper ziehen einander an, gemäß ihrer Masse und ihrem Abstand. Himmel und Erde gehorchen demselben Gesetz!</p>
  <p class="quelle">Frei nachgestaltete Zeitungsmeldung. Ob der Apfel wirklich gefallen ist, weiß man nicht genau. Die Idee aber stimmt.</p>
</div>
"""

# ---------------------------------------------------------------- Inhalte
M = {}

M[1] = dict(
 card=("🍎", "Modul 1: Newton und der Apfel", "Wie alles begann. Und: Masse ist nicht dasselbe wie Gewichtskraft."),
 title="Modul 1: Newton und der Apfel",
 full=f"""
<h3>Wie alles begann</h3>
{ZEITUNG}
<p>Newtons großer Gedanke war: Der fallende Apfel und der kreisende Mond folgen <strong>demselben Gesetz</strong>. Diese Kraft heißt <strong>Gravitation</strong> (Massenanziehung).</p>

<h3>Gravitation ist eine Wechselwirkung</h3>
<p>Die Erde zieht den Apfel an. Aber der Apfel zieht auch die Erde an, und zwar <strong>genauso stark</strong>. Das ist Newtons Prinzip „actio = reactio“.</p>
<p>Warum bewegt sich dann nur der Apfel? Die gleiche Kraft beschleunigt eine kleine Masse stark und eine riesige Masse fast gar nicht.</p>

<h3>Masse und Gewichtskraft</h3>
<p>Im Alltag sagt man: „Ich wiege 75 kg.“ Physikalisch ist das ungenau. Man muss zwei Größen unterscheiden:</p>
{table(["", "Masse m", "Gewichtskraft F<sub>G</sub>"], [
  ["Was ist das?", "Eigenschaft des Körpers: Wie viel Stoff, wie träge?", "Kraft, mit der ein Himmelskörper den Körper anzieht"],
  ["Einheit", "Kilogramm (kg)", "Newton (N)"],
  ["Abhängig vom Ort?", "<span class='ok'>Nein</span>, überall gleich", "<span class='nok'>Ja</span>, z. B. auf dem Mond kleiner"],
  ["Messgerät", "Balkenwaage (Vergleich)", "Federkraftmesser"],
  ["Richtung?", "keine", "zum Erdmittelpunkt"]])}
{box("🧠 Faustregel", "Auf der Erde hat ein Körper mit <strong>100 g</strong> eine Gewichtskraft von ungefähr <strong>1 N</strong>. Eine Tafel Schokolade „wiegt“ also etwa 1 N.")}
""",
 short=f"""
<p><strong>Newton (1687):</strong> Dieselbe Kraft lässt den Apfel fallen und hält den Mond auf seiner Bahn. Alle Körper ziehen sich gegenseitig an: <strong>Gravitation</strong>.</p>
<p><strong>Wechselwirkung:</strong> Der Apfel zieht die Erde genauso stark an wie die Erde den Apfel.</p>
{table(["", "Masse m", "Gewichtskraft F<sub>G</sub>"], [
  ["Einheit", "kg", "N"],
  ["vom Ort abhängig?", "nein", "ja"],
  ["Messgerät", "Balkenwaage", "Federkraftmesser"]])}
<p>Faustregel: 100 g ≈ 1 N.</p>
""",
)

M[2] = dict(
 card=("🌍", "Modul 2: Das Gravitationsgesetz", "Die Formel, ihre Größen und was passiert, wenn man Masse oder Abstand ändert."),
 title="Modul 2: Das Gravitationsgesetz",
 full=f"""
<h3>Die Formel</h3>
<p>Newton fand heraus, wovon die Anziehungskraft zwischen zwei Körpern abhängt:</p>
{GESETZ}
{table(["Zeichen", "Bedeutung", "Einheit"], [
  ["F<sub>G</sub>", "Gravitationskraft", "N"],
  ["G", "Gravitationskonstante: 6,674 · 10⁻¹¹", "N·m²/kg²"],
  ["m₁, m₂", "Massen der beiden Körper", "kg"],
  ["r", "Abstand der Massenmittelpunkte", "m"]])}
{ZWEI_MASSEN}
{box("⚠️ Achtung bei r", "r ist der Abstand der <strong>Mittelpunkte</strong>. Stehen Sie auf der Erde, ist r der Abstand zum Erdmittelpunkt: etwa 6370 km. Und r muss in <strong>Metern</strong> eingesetzt werden.")}

<h3>Was bedeutet die Formel?</h3>
<ul>
<li><strong>Massen im Zähler:</strong> Doppelte Masse → doppelte Kraft. Die Kraft ist proportional zu m₁ und zu m₂.</li>
<li><strong>Abstand im Quadrat im Nenner:</strong> Doppelter Abstand → nur noch ein Viertel der Kraft. Man nennt das ein <strong>1/r²-Gesetz</strong>.</li>
<li><strong>G ist winzig:</strong> 0,000 000 000 066 74. Deshalb merkt man Gravitation nur, wenn mindestens ein Körper riesig ist.</li>
</ul>
{KURVE}
{table(["Änderung", "neue Kraft"], [
  ["m₁ verdoppelt", "2 · F"],
  ["r verdoppelt", "F / 2² = F / 4"],
  ["r verdreifacht", "F / 3² = F / 9"],
  ["r halbiert", "F · 2² = 4 · F"]])}
""",
 short=f"""
{GESETZ}
<p>G = 6,674 · 10⁻¹¹ N·m²/kg². m₁, m₂ in kg. <strong>r = Abstand der Mittelpunkte in m.</strong></p>
{ZWEI_MASSEN}
<p>Doppelte Masse → doppelte Kraft. Doppelter Abstand → <strong>ein Viertel</strong> der Kraft (1/r²).</p>
""",
)

M[3] = dict(
 card=("🔢", "Modul 3: Rechnen mit Zehnerpotenzen", "Riesige und winzige Zahlen sicher im Griff. Mit Fehlersuche."),
 title="Modul 3: Rechnen mit Zehnerpotenzen",
 full=f"""
<h3>Warum Zehnerpotenzen?</h3>
<p>Die Masse der Erde ist 5 971 000 000 000 000 000 000 000 kg. Das kann niemand lesen. Deshalb schreibt man: <strong>5,971 · 10²⁴ kg</strong>.</p>
<p>Die Form ist immer <strong>a · 10ⁿ</strong>. Dabei liegt a zwischen 1 und 10.</p>

<h3>Die Rechenregeln</h3>
{table(["Regel", "Beispiel"], [
  ["Multiplizieren: Hochzahlen addieren", "10⁻¹¹ · 10²⁴ = 10⁻¹¹⁺²⁴ = 10¹³"],
  ["Dividieren: Hochzahlen subtrahieren", "10¹³ : 10¹² = 10¹"],
  ["Potenzieren: Hochzahlen multiplizieren", "(10⁶)² = 10¹²"],
  ["Umrechnen km → m", "6373 km = 6373 · 10³ m = 6,373 · 10⁶ m"]])}
{box("🧮 Taschenrechner", "Für Zehnerpotenzen gibt es eine Taste: <strong>EXP</strong>, <strong>EE</strong> oder <strong>×10ˣ</strong>. 6,674 · 10⁻¹¹ tippen Sie so: 6.674 EXP (−) 11. Setzen Sie r² immer in Klammern!")}

<h3>Beispiel: Gravitationskraft auf 1 kg in Nürnberg</h3>
<p>Gegeben: M<sub>Erde</sub> = 5,971 · 10²⁴ kg, m = 1 kg, r = 6373 km.</p>
{table(["Schritt", "Rechnung"], [
  ["① SI-Einheiten", "r = 6373 km = 6,373 · 10⁶ m"],
  ["② Einsetzen", "F = 6,674 · 10⁻¹¹ · 5,971 · 10²⁴ · 1 / (6,373 · 10⁶)² N"],
  ["③ Zähler", "6,674 · 5,971 = 39,85 und 10⁻¹¹ · 10²⁴ = 10¹³ → 39,85 · 10¹³"],
  ["④ Nenner", "6,373² = 40,62 und (10⁶)² = 10¹² → 40,62 · 10¹²"],
  ["⑤ Teilen", "39,85 / 40,62 = 0,981 und 10¹³ / 10¹² = 10¹ → <strong>F ≈ 9,81 N</strong>"]])}
{box("💡 Kommt Ihnen 9,81 bekannt vor?", "Genau: Das ist der Ortsfaktor g. Darum geht es im nächsten Modul.")}

<h3>Einheitenprobe</h3>
<p>Setzen Sie die Einheiten ein: N·m²/kg² · kg · kg / m². kg² und m² kürzen sich. Übrig bleibt <strong>N</strong>. Passt!</p>
""",
 short=f"""
<p>Form: <strong>a · 10ⁿ</strong> mit 1 ≤ a &lt; 10. Beispiel: 6373 km = 6,373 · 10⁶ m.</p>
<div class="formula">10ᵃ · 10ᵇ = 10ᵃ⁺ᵇ &nbsp;&nbsp; 10ᵃ : 10ᵇ = 10ᵃ⁻ᵇ &nbsp;&nbsp; (10ᵃ)² = 10²ᵃ</div>
<p><strong>Beispiel Nürnberg (1 kg):</strong> F = 6,674 · 10⁻¹¹ · 5,971 · 10²⁴ / (6,373 · 10⁶)² N = 39,85 · 10¹³ / 40,62 · 10¹² N ≈ <strong>9,81 N</strong>.</p>
<p>Taschenrechner: Taste EXP / ×10ˣ. r² in Klammern setzen!</p>
""",
)

M[4] = dict(
 card=("⚖️", "Modul 4: Gewichtskraft und Ortsfaktor", "Vom Gravitationsgesetz zu F = m · g."),
 title="Modul 4: Gewichtskraft und Ortsfaktor g",
 full=f"""
<h3>Vom Gravitationsgesetz zur Gewichtskraft</h3>
<p>Für einen Körper auf der Erde gilt das Gravitationsgesetz mit m₁ = M<sub>Erde</sub> und m₂ = m:</p>
<div class="formula">F<sub>G</sub> = G · {frac("M<sub>Erde</sub> · m", "r²")} = m · <span style="color:#fbbf24">{frac("G · M<sub>Erde</sub>", "r²")}</span></div>
<p>Der gelbe Teil ist an einem festen Ort immer gleich. Man nennt ihn <strong>Ortsfaktor g</strong>:</p>
<div class="formula">g = {frac("G · M<sub>Erde</sub>", "r²")} ≈ 9,81 {frac("N", "kg")}</div>
<p>Damit wird die Formel ganz kurz:</p>
{GEWICHT}
{table(["Zeichen", "Bedeutung", "Einheit"], [
  ["F<sub>G</sub>", "Gewichtskraft", "N"],
  ["m", "Masse des Körpers", "kg"],
  ["g", "Ortsfaktor (auch: Fallbeschleunigung)", "N/kg = m/s²"]])}
{box("🧠 Was bedeutet g = 9,81 N/kg?", "Auf <strong>jedes Kilogramm</strong> wirkt eine Kraft von 9,81 N. Gleichzeitig ist g die Beschleunigung beim freien Fall: 9,81 m/s². Deshalb fallen im Vakuum alle Körper gleich schnell.")}

<h3>Beispiel</h3>
<p>Ein Mann hat die Masse 75 kg. Seine Gewichtskraft ist:</p>
<div class="formula">F<sub>G</sub> = 75 kg · 9,81 N/kg = 735,75 N ≈ 736 N</div>

<h3>Umstellen</h3>
<p>Wenn die Kraft bekannt ist und die Masse gesucht wird:</p>
<div class="formula">m = {frac("F<sub>G</sub>", "g")}</div>
{box("⚠️ Typischer Fehler", "Massen in g oder t erst in <strong>kg</strong> umrechnen! 250 g = 0,25 kg. 1,2 t = 1200 kg.")}
""",
 short=f"""
{GEWICHT}
<p>g = G · M<sub>Erde</sub> / r² ≈ <strong>9,81 N/kg</strong> (= m/s²). Das ist der Ortsfaktor: die Kraft pro Kilogramm.</p>
<p><strong>Beispiel:</strong> 75 kg · 9,81 N/kg ≈ 736 N. &nbsp; <strong>Umgestellt:</strong> m = F<sub>G</sub> / g.</p>
<p>Massen immer in kg einsetzen.</p>
""",
)

M[5] = dict(
 card=("🌙", "Modul 5: Mond, Mars und Co.", "Mond, Mars und Jupiter: Warum wiegt man dort unterschiedlich viel?"),
 card_locked="Gesperrt. Schließen Sie zuerst die Module 1 bis 4 ab.",
 title="Modul 5: Mond, Mars und Co.",
 full=f"""
<h3>Jeder Himmelskörper hat sein eigenes g</h3>
<p>Sie haben das Fortgeschrittenen-Modul freigeschaltet! Die Formel für g gilt nicht nur für die Erde. Für jeden Himmelskörper mit Masse M und Radius R gilt:</p>
<div class="formula big">g = G · {frac("M", "R²")}</div>
{table(["Himmelskörper", "Masse M", "Radius R", "g an der Oberfläche"], [
  ["Erde", "5,971 · 10²⁴ kg", "6371 km", "9,81 N/kg"],
  ["Mond", "7,342 · 10²² kg", "1737 km", "1,62 N/kg"],
  ["Mars", "6,417 · 10²³ kg", "3390 km", "3,73 N/kg"],
  ["Venus", "4,867 · 10²⁴ kg", "6052 km", "8,87 N/kg"],
  ["Jupiter", "1,898 · 10²⁷ kg", "69 911 km", "ca. 26 N/kg"]])}

<h3>Warum ist man auf dem Mond „leichter“?</h3>
<p>Zwei Effekte wirken gegeneinander:</p>
<ul>
<li>Der Mond ist <strong>kleiner</strong> (R ist nur 0,27-mal so groß). Ein kleiner Radius macht g <strong>größer</strong>.</li>
<li>Der Mond hat aber viel <strong>weniger Masse</strong> (etwa 81-mal weniger). Das macht g <strong>kleiner</strong>.</li>
</ul>
<div class="formula">{frac("g<sub>Mond</sub>", "g<sub>Erde</sub>")} = {frac("1/81", "0,27²")} ≈ 0,17 ≈ {frac("1", "6")}</div>
<p>Der Masseneffekt gewinnt. Auf dem Mond ist die Gewichtskraft nur etwa ein Sechstel.</p>
{table(["", "Erde", "Mond"], [
  ["Masse des Mannes", "75 kg", "75 kg"],
  ["Gewichtskraft", "75 kg · 9,81 N/kg ≈ 736 N", "75 kg · 1,62 N/kg ≈ 122 N"]])}
{box("🧠 Merke", "Die <strong>Masse</strong> nimmt man überall mit hin. Die <strong>Gewichtskraft</strong> hängt davon ab, wo man ist.")}
""",
 short=f"""
<div class="formula">g = G · M / R²</div>
<p>Mond: g = 1,62 N/kg. Mars: g = 3,73 N/kg. Jupiter: g ≈ 26 N/kg.</p>
<p><strong>Mond:</strong> Kleinerer Radius → g größer. Aber 81-mal weniger Masse → g kleiner. Der Masseneffekt gewinnt: g ist etwa ein Sechstel.</p>
<p>75 kg auf dem Mond: F<sub>G</sub> = 75 kg · 1,62 N/kg ≈ 122 N. Die Masse bleibt 75 kg.</p>
""",
)

M[6] = dict(
 card=("🎣", "Modul 6: Umstellen und Anwenden", "Formeln umstellen: Angelschnur, Aufzug und die Frage, wo g nur noch halb so groß ist."),
 card_locked="Gesperrt. Danach stellen Sie Formeln um und lösen Anwendungsaufgaben.",
 title="Modul 6: Umstellen und Anwenden",
 full=f"""
<h3>Formeln umstellen</h3>
<p>Oft ist nicht die Kraft gesucht, sondern eine andere Größe. Dann stellen Sie die Formel um. Was auf einer Seite passiert, muss auch auf der anderen passieren.</p>
{table(["Ausgangsformel", "gesucht", "umgestellt"], [
  ["F<sub>G</sub> = m · g", "m", "m = F<sub>G</sub> / g"],
  ["F<sub>G</sub> = m · g", "g", "g = F<sub>G</sub> / m"],
  ["g = G · M / r²", "M", "M = g · r² / G"],
  ["g = G · M / r²", "r", "r = √(G · M / g)"]])}
{box("💡 Quadrat auflösen", "Steht r² in der Formel, stellen Sie erst nach r² um. Dann ziehen Sie die Wurzel. Beispiel: r² = G · M / g → r = √(G · M / g).")}

<h3>Beispiel: Wie schwer darf der Fisch sein?</h3>
<p>Eine Angelschnur hält höchstens 230 N aus.</p>
{table(["Schritt", "Rechnung"], [
  ["① Formel", "F<sub>G</sub> = m · g"],
  ["② Umstellen", "m = F<sub>G</sub> / g"],
  ["③ Einsetzen", "m = 230 N / 9,81 N/kg"],
  ["④ Ergebnis", "m ≈ 23,45 kg → <strong>höchstens 23 kg</strong>"]])}
{box("⚠️ Sicher runden", "Bei Grenzwerten (Tragkraft, Belastung) wird <strong>abgerundet</strong>. Mit 24 kg würde die Schnur reißen. Das gilt auch für Aufzüge, Kräne und Regale.")}

<h3>Beispiel: Wo ist g halb so groß?</h3>
<p>Mit r = √(G · M / g) kann man ausrechnen, in welchem Abstand g einen bestimmten Wert hat. Für g = 4,905 N/kg (halb so groß) ergibt sich r ≈ 9010 km. Das sind etwa 2640 km über der Erdoberfläche.</p>
""",
 short=f"""
<p>m = F<sub>G</sub> / g &nbsp;·&nbsp; g = F<sub>G</sub> / m &nbsp;·&nbsp; r = √(G · M / g)</p>
<p><strong>Beispiel Angelschnur 230 N:</strong> m = 230 N / 9,81 N/kg ≈ 23,45 kg → höchstens 23 kg.</p>
<p><strong>Grenzwerte immer abrunden</strong>, sonst reißt Schnur oder Seil.</p>
""",
)

M[7] = dict(
 card=("🛰️", "Modul 7: Challenge – g hängt vom Ort ab", "Pol, Äquator, Mount Everest und ISS: Wie stark hängt g vom Ort ab?"),
 card_locked="Gesperrt. Die Challenge zum Schluss.",
 title="Modul 7: Challenge – g hängt vom Ort ab",
 full=f"""
<h3>9,81 N/kg ist nur ein Mittelwert</h3>
<p>Die Erde ist keine perfekte Kugel. An den Polen ist sie leicht abgeplattet. Deshalb ist r nicht überall gleich. Und weil r im Quadrat im Nenner steht, ändert sich auch g.</p>
{ERDE}
{table(["Ort", "Abstand r zum Erdmittelpunkt", "g"], [
  ["Nordpol", "6367 km", "9,830 N/kg"],
  ["Nürnberg", "6373 km", "9,812 N/kg"],
  ["Jakarta (nahe Äquator)", "6377 km", "9,799 N/kg"],
  ["Gipfel des Mount Everest", "6382 km", "9,784 N/kg"]])}
<p>Die Unterschiede sind klein, aber messbar. Ein Federkraftmesser zeigt am Nordpol mehr an als in Jakarta. Eine Balkenwaage nicht, denn sie vergleicht Massen.</p>
{box("🌀 Noch ein Effekt", "Die Erde dreht sich. Am Äquator wird man dadurch zusätzlich ein kleines bisschen „leichter“. Diesen Effekt lassen wir in unseren Rechnungen weg.")}

<h3>Und im Weltraum?</h3>
<p>Die ISS fliegt etwa 400 km hoch. Dort ist g immer noch fast 9 N/kg. Trotzdem schweben die Astronauten. Warum?</p>
<p>Die ISS fliegt sehr schnell (etwa 28 000 km/h). Sie fällt ständig zur Erde, verfehlt sie aber immer wieder. Station und Astronauten fallen gemeinsam. Das ist genau Newtons Idee vom Mond, der um die Erde „fällt“.</p>
""",
 short=f"""
<p>g hängt von r ab. Pol (r = 6367 km): 9,830 N/kg. Nürnberg (6373 km): 9,812 N/kg. Mount Everest (6382 km): 9,784 N/kg.</p>
<p>ISS (400 km Höhe): g ≈ 8,7 N/kg. Astronauten schweben, weil sie mit der Station im <strong>freien Fall</strong> um die Erde sind.</p>
""",
)

# ---------------------------------------------------------------- Seite bauen
TITEL = "Gravitation und Gewichtskraft"
DATEI = {"full": "gravitation_komplett.html", "short": "gravitation_kompakt.html", "quiz": "gravitation_quiz.html"}


def build(variant):
    titles = {"full": TITEL + " – Lernmodul", "short": TITEL + " – Kompakt", "quiz": TITEL + " – Quiz"}
    sub = {"full": "Von Newtons Apfel bis zur Raumstation ISS. Lerntexte, Aufgaben und ein Abzeichen am Ende.",
           "short": "Das Wichtigste in Kürze. Danach die Aufgaben.",
           "quiz": "Nur die Aufgaben. Testen Sie, was Sie schon können."}[variant]
    cards = ""
    for n in range(1, 8):
        icon, t, d = M[n]["card"]
        locked = n > 4
        desc = M[n].get("card_locked", d) if locked else d
        cards += f'''
            <div class="module-card{(" advanced-card locked" if locked else "")}" id="card-{n}" onclick="openModule({n})">
                <div class="module-icon">{icon}</div>
                <div class="module-title">{t}</div>
                <div class="module-description">{desc}</div>
            </div>
'''
    data = {}
    for n in range(1, 8):
        content = M[n]["full"] if variant == "full" else M[n]["short"] if variant == "short" else ""
        data[n] = dict(title=M[n]["title"], content=content)

    header_hint = ('<div class="book-hint">🧮 Taschenrechner erlaubt &nbsp;·&nbsp; G = 6,674 · 10⁻¹¹ N·m²/kg² &nbsp;·&nbsp; '
                   'M<sub>Erde</sub> = 5,971 · 10²⁴ kg &nbsp;·&nbsp; g = 9,81 N/kg</div>')
    return f'''<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{titles[variant]}</title>
    <style>{css}    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍎 {TITEL} 🌍</h1>
            <p>{sub}</p>
            {header_hint}
        </div>

        <div class="progress-bar">
            <div class="progress-fill" id="progress" style="width: 0%;">0 von 7 Modulen abgeschlossen</div>
        </div>

        <!-- MODULE GRID -->
        <div class="module-grid" id="module-grid">{cards}        </div>

        <!-- MODULE CONTENT SECTIONS -->
        <div id="module-content-container"></div>

        <!-- BADGE -->
        <div class="badge" id="badge">
            <div class="badge-icon">🏅</div>
            <h2>Herzlichen Glückwunsch!</h2>
            <p style="font-size: 20px;">Sie haben alle Grundlagen- und Fortgeschrittenen-Module geschafft.</p>
            <h2 id="expert-title" style="margin-top: 20px; color: #f8fafc;">🍎 NEWTONS ERBE: GRAVITATIONS-PROFI 🛰️</h2>
        </div>
    </div>

    <script>
const modules = {json.dumps(data, ensure_ascii=False, indent=2)};

{TASKS_JS}
{ENGINE}
    </script>
</body>
</html>
'''


os.makedirs(OUT, exist_ok=True)
for v, fn in DATEI.items():
    open(os.path.join(OUT, fn), "w", encoding="utf-8").write(build(v))
    print("geschrieben:", fn)
