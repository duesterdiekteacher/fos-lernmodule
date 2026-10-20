# -*- coding: utf-8 -*-
"""Erzeugt die drei Varianten des Lernmoduls "Kraft und Beschleunigung" (FOS 12) nach dem Aufbau der C#-Vorlage."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO, "kraft-beschleunigung")
CSS_BASE = open(os.path.join(HERE, "..", "stil_vorlage.css"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "..", "engine.js"), encoding="utf-8").read()
ENGINE_EXTRA = open(os.path.join(HERE, "..", "engine_extra.js"), encoding="utf-8").read()
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
        .formula-grid { display: grid; grid-template-columns: auto auto; gap: 4px 30px; justify-content: center; align-items: center; }
        .formula-grid .fname { font-family: 'Segoe UI', Arial, sans-serif; font-size: 17px; color: #cbd5e1; }
        .frac { display: inline-flex; flex-direction: column; vertical-align: middle; text-align: center; margin: 0 4px; }
        .frac > span:first-child { border-bottom: 2px solid currentColor; padding: 0 4px; }
        .frac > span:last-child { padding: 0 4px; }
        .gesetz {
            background: #0f2a3b; border-left: 5px solid #38bdf8; border-radius: 8px;
            padding: 16px 20px; margin: 20px 0; color: #e0f2fe; font-size: 18px; line-height: 1.7;
        }
        .gesetz strong { color: #7dd3fc; }
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
            .formula-grid { grid-template-columns: 1fr; gap: 0; }
            .formula-grid .fname { margin-top: 8px; }
            .gesetz { font-size: 17px; padding: 12px 14px; }
        }
        /* ---------- kreative Aufgabentypen ---------- */
        .debate { display: flex; flex-direction: column; gap: 12px; text-align: left; }
        .bubble { position: relative; max-width: 85%; padding: 12px 16px; border-radius: 14px; font-size: 17px; line-height: 1.55; color: #f1f5f9; }
        .bubble.l { align-self: flex-start; background: #1e3a5f; border: 2px solid #38bdf8; border-bottom-left-radius: 2px; }
        .bubble.r { align-self: flex-end; background: #3b2a0a; border: 2px solid #f59e0b; border-bottom-right-radius: 2px; }
        .bubble .who { display: block; font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #cbd5e1; }
        .predict-msg { margin: 10px 0; color: #e0f2fe; font-size: 16px; line-height: 1.6; }
        .predict-msg:empty { display: none; }
        .quiz-option.locked-opt { cursor: default; opacity: 0.85; }
        .sim-box { background: #0f172a; border: 2px solid #334155; border-radius: 10px; padding: 12px; margin: 10px 0; text-align: center; }
        .sim svg { width: 100%; max-width: 560px; height: auto; }
        .sim-box .btn-new { margin-top: 8px; }
        .follow { margin-top: 14px; border-top: 1px dashed #475569; padding-top: 12px; }
        .follow-q { font-weight: bold; color: #f8fafc; }
        .lab { background: #0f172a; border: 2px solid #334155; border-radius: 10px; padding: 14px; }
        .lab-view svg { width: 100%; max-width: 560px; height: auto; display: block; margin: 0 auto; }
        .lab-out { text-align: center; font-size: 19px; color: #e2e8f0; margin: 8px 0 12px 0; }
        .lab-slider { margin: 10px 0; }
        .lab-slider label { display: block; color: #cbd5e1; font-size: 16px; margin-bottom: 4px; }
        .lab-slider input[type=range] { width: 100%; accent-color: #38bdf8; height: 28px; }
        .missions { list-style: none; margin: 14px 0 0 0; padding: 0; }
        .missions li { padding: 8px 10px 8px 36px; margin-bottom: 6px; border-radius: 8px; background: #1e293b; position: relative; color: #e2e8f0; line-height: 1.5; }
        .missions li::before { content: "☐"; position: absolute; left: 10px; color: #94a3b8; }
        .missions li.done { background: #14532d; }
        .missions li.done::before { content: "✓"; color: #4ade80; font-weight: bold; }
        .pens { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 8px; }
        .pen { background: #1e293b; color: #f1f5f9; border: 2px solid var(--pc); border-radius: 999px; padding: 8px 16px; font-size: 16px; cursor: pointer; }
        .pen.active { background: var(--pc); color: #0f172a; font-weight: bold; }
        .draw-area { cursor: crosshair; }
        .draw-msgs { list-style: none; padding: 0; margin: 6px 0 0 0; }
        .draw-msgs li { padding: 4px 0; }
        .draw-msgs li.ok { color: #4ade80; } .draw-msgs li.bad { color: #fecaca; }
        .text-answer { width: 100%; background: #0f172a; color: #f8fafc; border: 2px solid #475569; border-radius: 8px; padding: 10px; font-size: 17px; font-family: inherit; line-height: 1.6; resize: vertical; }
        .text-answer:focus { outline: none; border-color: #38bdf8; }
        .model { background: #0f2a3b; border: 1px solid #38bdf8; border-radius: 10px; padding: 14px 16px; margin-top: 12px; }
        .model h4 { color: #7dd3fc; margin-bottom: 6px; }
        .model p { color: #e0f2fe; line-height: 1.6; }
        .model-q { margin-top: 10px; font-weight: bold; }
        .checklist { list-style: none; padding: 0; margin: 6px 0 0 0; }
        .checklist li { margin: 6px 0; color: #e2e8f0; }
        .checklist input { transform: scale(1.3); margin-right: 8px; }
        .mini-lab { display: block; font-weight: bold; color: #cbd5e1; margin-bottom: 2px; }
        svg.mini { width: 200px; max-width: 100%; height: auto; display: block; }
        .quiz-question > .sketch svg.mini { width: 360px; }
        @media (max-width: 600px) {
            .bubble { max-width: 95%; font-size: 16px; }
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


def gesetz(nr, text):
    return f'<div class="gesetz"><strong>{nr}. Newtonsches Gesetz:</strong> {text}</div>'


F = 'font-family="Segoe UI, Arial"'
MARK = '<defs><marker id="{id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>'
NEWTON2 = '<div class="formula big">F = m · a</div>'
FORMELN = f'''<div class="formula"><div class="formula-grid">
<span class="fname">Zeit-Ort-Gesetz:</span><span>x(t) = v₀ · t + ½ · a · t²</span>
<span class="fname">Zeit-Geschwindigkeit-Gesetz:</span><span>v(t) = v₀ + a · t</span>
<span class="fname">Beschleunigung:</span><span>a = {frac("Δv", "Δt")}</span>
</div></div>'''

# ---------------------------------------------------------------- Skizzen
AUTO = f"""
<div class="sketch">
<svg viewBox="0 0 560 200" role="img" aria-label="Auto mit gleich großer Antriebskraft nach vorn und Widerstandskraft nach hinten">
  {MARK.format(id="pa")}
  <rect x="200" y="80" width="170" height="50" rx="10" fill="#1e3a5f" stroke="#38bdf8" stroke-width="3"/>
  <path d="M235,80 L260,48 L325,48 L345,80 Z" fill="#1e3a5f" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="240" cy="132" r="18" fill="#0f172a" stroke="#94a3b8" stroke-width="3"/>
  <circle cx="330" cy="132" r="18" fill="#0f172a" stroke="#94a3b8" stroke-width="3"/>
  <line x1="40" y1="170" x2="520" y2="170" stroke="#475569" stroke-width="2"/>
  <line x1="375" y1="100" x2="505" y2="100" stroke="#4ade80" stroke-width="5" marker-end="url(#pa)"/>
  <text x="440" y="88" fill="#4ade80" font-size="16" font-weight="bold" text-anchor="middle" {F}>Antriebskraft</text>
  <line x1="195" y1="100" x2="65" y2="100" stroke="#f87171" stroke-width="5" marker-end="url(#pa)"/>
  <text x="130" y="88" fill="#f87171" font-size="16" font-weight="bold" text-anchor="middle" {F}>Widerstandskraft</text>
  <text x="285" y="194" fill="#cbd5e1" font-size="15" text-anchor="middle" {F}>v = 100 km/h, konstant</text>
</svg>
<p class="caption">Beide Kräfte sind gleich groß. Die resultierende Kraft ist null. Die Geschwindigkeit bleibt gleich.</p>
</div>
"""

SKATER = f"""
<div class="sketch">
<svg viewBox="0 0 560 230" role="img" aria-label="Zwei Personen auf Skateboards stoßen sich voneinander ab">
  {MARK.format(id="ps")}
  <circle cx="230" cy="45" r="18" fill="#1e3a5f" stroke="#38bdf8" stroke-width="3"/>
  <rect x="210" y="66" width="40" height="80" rx="10" fill="#1e3a5f" stroke="#38bdf8" stroke-width="3"/>
  <line x1="250" y1="90" x2="278" y2="90" stroke="#38bdf8" stroke-width="6" stroke-linecap="round"/>
  <rect x="195" y="150" width="70" height="8" rx="4" fill="#94a3b8"/>
  <circle cx="207" cy="164" r="6" fill="#94a3b8"/><circle cx="253" cy="164" r="6" fill="#94a3b8"/>
  <circle cx="330" cy="40" r="20" fill="#3b2a0a" stroke="#f59e0b" stroke-width="3"/>
  <rect x="306" y="63" width="48" height="83" rx="10" fill="#3b2a0a" stroke="#f59e0b" stroke-width="3"/>
  <line x1="306" y1="90" x2="282" y2="90" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
  <rect x="295" y="150" width="70" height="8" rx="4" fill="#94a3b8"/>
  <circle cx="307" cy="164" r="6" fill="#94a3b8"/><circle cx="353" cy="164" r="6" fill="#94a3b8"/>
  <line x1="40" y1="172" x2="520" y2="172" stroke="#475569" stroke-width="2"/>
  <line x1="195" y1="110" x2="95" y2="110" stroke="#f87171" stroke-width="5" marker-end="url(#ps)"/>
  <line x1="365" y1="110" x2="465" y2="110" stroke="#f87171" stroke-width="5" marker-end="url(#ps)"/>
  <text x="140" y="98" fill="#f87171" font-size="16" font-weight="bold" text-anchor="middle" {F}>F₂₁</text>
  <text x="420" y="98" fill="#f87171" font-size="16" font-weight="bold" text-anchor="middle" {F}>F₁₂</text>
  <text x="230" y="200" fill="#38bdf8" font-size="15" text-anchor="middle" {F}>Person 1: 50 kg</text>
  <text x="330" y="200" fill="#f59e0b" font-size="15" text-anchor="middle" {F}>Person 2: 75 kg</text>
  <text x="140" y="140" fill="#cbd5e1" font-size="14" text-anchor="middle" {F}>a = 2,4 m/s²</text>
  <text x="420" y="140" fill="#cbd5e1" font-size="14" text-anchor="middle" {F}>a = 1,6 m/s²</text>
</svg>
<p class="caption">Person 1 drückt auf Person 2 (F₁₂). Person 2 drückt gleich stark zurück (F₂₁). Beide rollen auseinander. Die leichtere Person wird stärker beschleunigt.</p>
</div>
"""

FALLROHR = f"""
<div class="sketch">
<svg viewBox="0 0 560 290" role="img" aria-label="Zwei Fallrohre: mit Luft fällt die Feder langsamer, im Vakuum fallen Feder und Kugel gleich">
  <rect x="110" y="30" width="110" height="230" rx="12" fill="none" stroke="#94a3b8" stroke-width="3"/>
  <rect x="340" y="30" width="110" height="230" rx="12" fill="none" stroke="#94a3b8" stroke-width="3"/>
  <text x="165" y="22" fill="#cbd5e1" font-size="16" font-weight="bold" text-anchor="middle" {F}>mit Luft</text>
  <text x="395" y="22" fill="#cbd5e1" font-size="16" font-weight="bold" text-anchor="middle" {F}>Vakuum</text>
  <circle cx="190" cy="205" r="16" fill="#3b2a0a" stroke="#f59e0b" stroke-width="3"/>
  <ellipse cx="140" cy="95" rx="9" ry="24" fill="#e2e8f0" transform="rotate(25 140 95)"/>
  <line x1="129" y1="117" x2="151" y2="73" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="420" cy="205" r="16" fill="#3b2a0a" stroke="#f59e0b" stroke-width="3"/>
  <ellipse cx="370" cy="205" rx="9" ry="24" fill="#e2e8f0" transform="rotate(25 370 205)"/>
  <line x1="359" y1="227" x2="381" y2="183" stroke="#94a3b8" stroke-width="2"/>
  <line x1="345" y1="205" x2="445" y2="205" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="280" y="285" fill="#cbd5e1" font-size="14" text-anchor="middle" {F}>Beide Rohre: Feder und Kugel wurden gleichzeitig losgelassen.</text>
</svg>
<p class="caption">Mit Luft bremst der Luftwiderstand die Feder stark. Im Vakuum gibt es keinen Luftwiderstand: Beide fallen gleich schnell.</p>
</div>
"""


def vt(lines, tmax=5, vmax=50, vstep=10, aria="v-t-Diagramm"):
    """lines: [(lab, farbe, [(t, v), ...], label_index)]"""
    x0, y0, w, h = 64, 262, 420, 228
    X = lambda t: x0 + t / tmax * w
    Y = lambda v: y0 - v / vmax * h
    s = [f'<svg viewBox="0 0 540 310" role="img" aria-label="{aria}">']
    v = vstep / 2
    while v <= vmax:
        s.append(f'<line x1="{x0}" y1="{Y(v):.1f}" x2="{X(tmax):.1f}" y2="{Y(v):.1f}" stroke="#334155" stroke-width="1"/>')
        v += vstep / 2
    for t in range(1, tmax + 1):
        s.append(f'<line x1="{X(t):.1f}" y1="{y0}" x2="{X(t):.1f}" y2="{Y(vmax):.1f}" stroke="#334155" stroke-width="1"/>')
    s.append(f'<line x1="{x0}" y1="{y0}" x2="{X(tmax) + 22:.1f}" y2="{y0}" stroke="#94a3b8" stroke-width="2"/>')
    s.append(f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{Y(vmax) - 18:.1f}" stroke="#94a3b8" stroke-width="2"/>')
    for t in range(0, tmax + 1):
        s.append(f'<text x="{X(t):.1f}" y="{y0 + 22}" fill="#cbd5e1" font-size="15" text-anchor="middle" {F}>{t}</text>')
    for v in range(vstep, vmax + 1, vstep):
        s.append(f'<text x="{x0 - 8}" y="{Y(v) + 5:.1f}" fill="#cbd5e1" font-size="15" text-anchor="end" {F}>{v}</text>')
    s.append(f'<text x="{X(tmax) + 22:.1f}" y="{y0 + 42}" fill="#cbd5e1" font-size="15" text-anchor="end" {F}>t in s</text>')
    s.append(f'<text x="{x0 + 8}" y="{Y(vmax) - 6:.1f}" fill="#cbd5e1" font-size="15" {F}>v in m/s</text>')
    for lab, col, pts, li in lines:
        s.append('<polyline points="' + " ".join(f"{X(t):.1f},{Y(v):.1f}" for t, v in pts) + f'" fill="none" stroke="{col}" stroke-width="3.5"/>')
        t, v = pts[li]
        lx, anchor = X(t) + 10, "start"
        if lx > 470:
            lx, anchor = X(t) - 10, "end"
        s.append(f'<text x="{lx:.1f}" y="{max(Y(v) - 10, 24):.1f}" fill="{col}" font-size="16" font-weight="bold" text-anchor="{anchor}" {F}>{lab}</text>')
    return s, X, Y


def vt_beispiel():
    # Lkw (a = 2 m/s²) und Motorrad (a = 8 m/s²) aus der Ruhe, dazu ein Auto mit konstant 15 m/s
    s, X, Y = vt([("Motorrad", "#f59e0b", [(0, 0), (5, 40)], 1),
                  ("Auto, konstant", "#4ade80", [(0, 15), (5, 15)], 0),
                  ("Lkw", "#38bdf8", [(0, 0), (5, 10)], 1)],
                 aria="v-t-Diagramm mit drei Bewegungen")
    s.append('</svg>')
    return '<div class="sketch">' + "".join(s) + '<p class="caption">Motorrad: steile Gerade, große Beschleunigung. Lkw: flache Gerade, kleine Beschleunigung. Auto: waagerecht, konstante Geschwindigkeit.</p></div>'


def vt_steigung():
    # Motorrad a = 8 m/s²: Steigungsdreieck und Fläche
    s, X, Y = vt([], aria="v-t-Diagramm mit Steigungsdreieck und Fläche unter der Geraden")
    s.append(f'<polygon points="{X(0):.1f},{Y(0):.1f} {X(4):.1f},{Y(32):.1f} {X(4):.1f},{Y(0):.1f}" fill="#f59e0b" fill-opacity="0.18"/>')
    s.append(f'<polyline points="{X(0):.1f},{Y(0):.1f} {X(5):.1f},{Y(40):.1f}" fill="none" stroke="#f59e0b" stroke-width="3.5"/>')
    # Steigungsdreieck zwischen t = 1 s und t = 3 s
    s.append(f'<polyline points="{X(1):.1f},{Y(8):.1f} {X(3):.1f},{Y(8):.1f} {X(3):.1f},{Y(24):.1f}" fill="none" stroke="#f8fafc" stroke-width="2.5"/>')
    s.append(f'<text x="{X(2):.1f}" y="{Y(8) + 20:.1f}" fill="#f8fafc" font-size="16" font-weight="bold" text-anchor="middle" {F}>Δt = 2 s</text>')
    s.append(f'<text x="{X(3) + 8:.1f}" y="{Y(16) + 5:.1f}" fill="#f8fafc" font-size="16" font-weight="bold" {F}>Δv = 16 m/s</text>')
    s.append(f'<text x="{X(3.3):.1f}" y="{Y(5):.1f}" fill="#fbbf24" font-size="16" font-weight="bold" text-anchor="middle" {F}>Fläche = Strecke</text>')
    s.append('</svg>')
    return ('<div class="sketch">' + "".join(s) +
            '<p class="caption">Steigung: a = Δv / Δt = 16 m/s / 2 s = 8 m/s². Die Fläche bis 4 s ist ein Dreieck: x = ½ · 4 s · 32 m/s = 64 m.</p></div>')


VT_BEISPIEL = vt_beispiel()
VT_STEIGUNG = vt_steigung()

# ---------------------------------------------------------------- Inhalte
M = {}

M[1] = dict(
 card=("🚌", "Modul 1: Das Trägheitsgesetz", "Warum kippt man im Bus nach vorn? Das 1. Newtonsche Gesetz."),
 title="Modul 1: Das Trägheitsgesetz",
 full=f"""
<h3>Das 1. Newtonsche Gesetz</h3>
<p>Isaac Newton hat 1687 drei Gesetze der Bewegung veröffentlicht. Das erste lautet in einfachen Worten:</p>
{gesetz(1, "Ein Körper bleibt in Ruhe oder bewegt sich gleichförmig geradeaus weiter. Das ändert sich nur, wenn eine äußere Kraft auf ihn wirkt.")}
<p>Man nennt es auch das <strong>Trägheitsgesetz</strong>. Jeder Körper ist „träge“: Er will seinen Bewegungszustand beibehalten.</p>

<h3>Was ist der Bewegungszustand?</h3>
<p>Der Bewegungszustand ist die <strong>Geschwindigkeit</strong> mit <strong>Betrag</strong> (wie schnell?) und <strong>Richtung</strong> (wohin?). Er ändert sich, wenn ein Körper …</p>
<ul>
<li>schneller wird (anfahren),</li>
<li>langsamer wird (bremsen),</li>
<li>die Richtung ändert (Kurve), auch bei gleichem Tempo.</li>
</ul>
<p>Für jede dieser Änderungen braucht man eine Kraft. Je größer die <strong>Masse</strong>, desto träger ist der Körper. Ein voller Einkaufswagen ist schwerer anzuschieben als ein leerer.</p>

<h3>Trägheit im Alltag</h3>
{table(["Situation", "Was passiert?", "Warum?"], [
  ["Bus bremst stark", "Fahrgäste kippen nach vorn", "Der Körper will mit der alten Geschwindigkeit weiterfahren."],
  ["Bus fährt ruckartig an", "Fahrgäste kippen nach hinten", "Der Körper will in Ruhe bleiben."],
  ["Auto fährt schnell in eine Kurve", "Man wird nach außen gedrückt", "Der Körper will geradeaus weiter."],
  ["Unfall mit Sicherheitsgurt", "Der Gurt hält den Körper fest", "Ohne Gurt würde der Körper weiterfliegen."]])}

<h3>Wichtig: Bewegung braucht keine Kraft</h3>
<p>Viele denken: „Ohne Kraft bleibt alles stehen.“ Das stimmt nicht. Auf der Erde bremsen nur Reibung und Luftwiderstand. Im Weltraum fliegt eine Raumsonde ohne Antrieb einfach immer weiter.</p>
<p>Ein Auto fährt mit konstant 100 km/h. Der Motor treibt an, aber Luft und Reibung bremsen genauso stark. Die Kräfte heben sich auf. Das nennt man <strong>Kräftegleichgewicht</strong>.</p>
{AUTO}
{box("🧠 Merke", "Nicht die Bewegung braucht eine Kraft, sondern die <strong>Änderung</strong> der Bewegung. Heben sich alle Kräfte auf, ist die <strong>resultierende Kraft</strong> null. Dann bleibt der Bewegungszustand gleich.")}
""",
 short=f"""
{gesetz(1, "Ein Körper bleibt in Ruhe oder bewegt sich gleichförmig geradeaus weiter, solange keine äußere Kraft wirkt (Trägheitsgesetz).")}
<p><strong>Bewegungszustand</strong> = Geschwindigkeit nach Betrag und Richtung. Anfahren, Bremsen und Kurven sind Änderungen.</p>
<p>Bus bremst → Fahrgäste kippen nach vorn. Bus fährt an → nach hinten. Kurve → nach außen.</p>
<p><strong>Kräftegleichgewicht:</strong> Heben sich alle Kräfte auf, ist die resultierende Kraft null. Der Körper fährt mit konstanter Geschwindigkeit weiter.</p>
""",
)

M[2] = dict(
 card=("🚀", "Modul 2: Kraft, Masse und Beschleunigung", "Das 2. Newtonsche Gesetz: F = m · a. Rechnen und umstellen."),
 title="Modul 2: Kraft, Masse und Beschleunigung",
 full=f"""
<h3>Das 2. Newtonsche Gesetz</h3>
{gesetz(2, "Wirkt eine Kraft auf einen Körper, wird er in Richtung der Kraft beschleunigt. Die Beschleunigung ist proportional zur Kraft und umgekehrt proportional zur Masse.")}
<p>Als Formel ist das ganz kurz:</p>
{NEWTON2}
{table(["Zeichen", "Bedeutung", "Einheit"], [
  ["F", "Kraft (genauer: resultierende Kraft)", "N (Newton)"],
  ["m", "Masse des Körpers", "kg"],
  ["a", "Beschleunigung", "m/s²"]])}

<h3>Was bedeutet das?</h3>
<ul>
<li><strong>Doppelte Kraft</strong> → doppelte Beschleunigung. a ist proportional zu F.</li>
<li><strong>Doppelte Masse</strong> → halbe Beschleunigung. a ist umgekehrt proportional zu m.</li>
</ul>
{table(["Änderung", "neue Beschleunigung"], [
  ["F verdoppelt", "2 · a"],
  ["m verdoppelt", "a / 2"],
  ["F und m verdoppelt", "a (bleibt gleich)"],
  ["m halbiert", "2 · a"]])}

<h3>Die Einheit Newton</h3>
<p>Aus F = m · a folgt: <strong>1 N = 1 kg · m/s²</strong>. Eine Kraft von 1 N beschleunigt einen Körper mit 1 kg mit 1 m/s². Seine Geschwindigkeit steigt also jede Sekunde um 1 m/s.</p>

<h3>Umstellen</h3>
<div class="formula">a = {frac("F", "m")} &nbsp;&nbsp;&nbsp;&nbsp; m = {frac("F", "a")}</div>

<h3>Beispiel</h3>
<p>Ein Kleinwagen (m = 1000 kg) beschleunigt mit a = 2 m/s². Welche Kraft ist nötig?</p>
<div class="formula">F = m · a = 1000 kg · 2 m/s² = 2000 N = 2 kN</div>
{box("⚠️ Typische Fehler", "Massen in <strong>kg</strong> einsetzen: 1,2 t = 1200 kg, 500 g = 0,5 kg. Kräfte in <strong>N</strong>: 3 kN = 3000 N.")}
{box("💡 Resultierende Kraft", "F ist die Summe aller Kräfte. Treibt ein Motor mit 3000 N an und bremst die Luft mit 800 N, dann ist F = 3000 N − 800 N = 2200 N.")}
""",
 short=f"""
{gesetz(2, "Die Beschleunigung ist proportional zur Kraft und umgekehrt proportional zur Masse.")}
{NEWTON2}
<p>a = F / m, &nbsp; m = F / a. &nbsp; <strong>1 N = 1 kg · m/s²</strong>.</p>
<p>Doppelte Kraft → doppelte a. Doppelte Masse → halbe a.</p>
<p><strong>Beispiel:</strong> 1000 kg · 2 m/s² = 2000 N. Massen in kg, Kräfte in N einsetzen!</p>
""",
)

M[3] = dict(
 card=("🛹", "Modul 3: Kraft und Gegenkraft", "Das 3. Newtonsche Gesetz: actio = reactio. Und was passiert beim Zusammenstoß?"),
 title="Modul 3: Kraft und Gegenkraft",
 full=f"""
<h3>Das 3. Newtonsche Gesetz</h3>
{gesetz(3, "Übt Körper 1 eine Kraft auf Körper 2 aus, dann übt Körper 2 eine gleich große, entgegengesetzte Kraft auf Körper 1 aus.")}
<p>Kurz: <strong>actio = reactio</strong> (Wirkung = Gegenwirkung). Kräfte treten also immer <strong>paarweise</strong> auf.</p>
{SKATER}

<h3>Beispiele</h3>
{table(["Kraft", "Gegenkraft"], [
  ["Die Hand drückt gegen die Wand.", "Die Wand drückt gegen die Hand."],
  ["Die Erde zieht den Apfel an.", "Der Apfel zieht die Erde an."],
  ["Die Rakete stößt Gas nach hinten.", "Das Gas drückt die Rakete nach vorn."],
  ["Der Fuß drückt den Boden nach hinten.", "Der Boden drückt den Fuß nach vorn. So kann man gehen."]])}

<h3>Gleiche Kraft, verschiedene Wirkung</h3>
<p>Kraft und Gegenkraft sind gleich groß. Die <strong>Wirkung</strong> kann aber sehr verschieden sein. Das zeigt das 2. Gesetz: a = F / m.</p>
<p>Beispiel: Ein Pkw (1200 kg) und ein Lkw (12 000 kg) stoßen zusammen. Beide erfahren eine Kraft von 24 000 N.</p>
{table(["", "Pkw", "Lkw"], [
  ["Kraft", "24 000 N", "24 000 N"],
  ["Masse", "1200 kg", "12 000 kg"],
  ["Beschleunigung a = F / m", "20 m/s²", "2 m/s²"]])}
<p>Der Pkw wird zehnmal so stark abgebremst. Deshalb sind die Insassen im Pkw stärker gefährdet.</p>

<h3>Achtung: Nicht verwechseln!</h3>
<p>Kraft und Gegenkraft wirken auf <strong>zwei verschiedene Körper</strong>. Deshalb heben sie sich nicht auf.</p>
<p>Beim <strong>Kräftegleichgewicht</strong> wirken zwei Kräfte auf <strong>denselben</strong> Körper. Beispiel: Ein Buch liegt auf dem Tisch. Die Gewichtskraft zieht es nach unten. Der Tisch drückt es nach oben. Beide Kräfte wirken auf das Buch.</p>
{table(["", "Kraft und Gegenkraft", "Kräftegleichgewicht"], [
  ["Gesetz", "3. Newtonsches Gesetz", "1. Newtonsches Gesetz"],
  ["Angriff", "an zwei verschiedenen Körpern", "am selben Körper"],
  ["Heben sich auf?", "<span class='nok'>Nein</span>", "<span class='ok'>Ja</span>"]])}
""",
 short=f"""
{gesetz(3, "Übt Körper 1 eine Kraft auf Körper 2 aus, übt Körper 2 eine gleich große, entgegengesetzte Kraft auf Körper 1 aus (actio = reactio).")}
{SKATER}
<p>Kraft und Gegenkraft wirken auf <strong>verschiedene</strong> Körper. Sie heben sich nicht auf.</p>
<p><strong>Zusammenstoß Pkw (1200 kg) und Lkw (12 000 kg):</strong> Beide spüren 24 000 N. Der Pkw wird mit 20 m/s² abgebremst, der Lkw nur mit 2 m/s².</p>
<p><strong>Kräftegleichgewicht</strong> (Buch auf dem Tisch): Zwei Kräfte am <strong>selben</strong> Körper heben sich auf.</p>
""",
)

M[4] = dict(
 card=("🪶", "Modul 4: Gewichtskraft und freier Fall", "Feder und Bowlingkugel: Warum fallen im Vakuum alle Körper gleich schnell?"),
 title="Modul 4: Gewichtskraft und freier Fall",
 full=f"""
<h3>Die Gewichtskraft</h3>
<p>Die Erde zieht jeden Körper nach unten. Diese Kraft ist die <strong>Gewichtskraft</strong>:</p>
<div class="formula big">F<sub>G</sub> = m · g &nbsp;&nbsp; mit g = 9,81 m/s²</div>
<p>Das ist das 2. Newtonsche Gesetz F = m · a. Die Beschleunigung ist hier die <strong>Fallbeschleunigung g</strong>.</p>

<h3>Beispiel: Tischtennisball und Medizinball</h3>
{table(["", "Tischtennisball", "Medizinball"], [
  ["Masse", "2,7 g = 0,0027 kg", "3 kg"],
  ["Gewichtskraft F<sub>G</sub> = m · g", "0,0027 kg · 9,81 m/s² ≈ 0,026 N", "3 kg · 9,81 m/s² = 29,43 N"],
  ["Beschleunigung a = F<sub>G</sub> / m", "0,026487 N / 0,0027 kg = 9,81 m/s²", "29,43 N / 3 kg = 9,81 m/s²"]])}
<p>Der Medizinball wird über 1000-mal so stark angezogen. Trotzdem ist die Beschleunigung <strong>genau gleich</strong>.</p>

<h3>Warum fallen alle Körper gleich schnell?</h3>
<p>Ein schwerer Körper wird stärker angezogen. Er ist aber auch träger. Beides wächst im gleichen Verhältnis:</p>
<div class="formula">a = {frac("F<sub>G</sub>", "m")} = {frac("m · g", "m")} = g</div>
<p>Die Masse kürzt sich heraus. Ohne Luft fallen deshalb <strong>alle Körper gleich schnell</strong>.</p>
{FALLROHR}
<p>In der Luft gibt es zusätzlich den <strong>Luftwiderstand</strong>. Bei einer Feder ist er im Vergleich zur winzigen Gewichtskraft sehr groß. Deshalb segelt die Feder langsam zu Boden.</p>
{box("🌙 Versuch auf dem Mond", "1971 ließ ein Astronaut der Apollo-15-Mission auf dem Mond einen Hammer und eine Feder gleichzeitig fallen. Auf dem Mond gibt es keine Luft. Beide kamen gleichzeitig am Boden an.")}
{box("🧠 Was bedeutet g = 9,81 m/s²?", "Beim freien Fall steigt die Geschwindigkeit <strong>jede Sekunde um 9,81 m/s</strong>. Nach 1 s: 9,81 m/s. Nach 2 s: 19,62 m/s. Nach 3 s: 29,43 m/s (über 100 km/h).")}
""",
 short=f"""
<div class="formula">F<sub>G</sub> = m · g &nbsp;&nbsp; mit g = 9,81 m/s²</div>
<p><strong>Beispiel:</strong> Tischtennisball (2,7 g): F<sub>G</sub> ≈ 0,026 N. Medizinball (3 kg): F<sub>G</sub> = 29,43 N. Beide: a = F<sub>G</sub> / m = 9,81 m/s².</p>
<p>Schwerer Körper: mehr Kraft, aber auch mehr Trägheit. a = m · g / m = g. <strong>Im Vakuum fallen alle Körper gleich schnell.</strong></p>
{FALLROHR}
<p>In der Luft bremst der Luftwiderstand leichte Körper wie eine Feder stark ab.</p>
""",
)

M[5] = dict(
 card=("📐", "Modul 5: Gleichmäßig beschleunigte Bewegung", "Die Formeln für Ort und Geschwindigkeit. Und: km/h in m/s umrechnen."),
 card_locked="Gesperrt. Schließen Sie zuerst die Module 1 bis 4 ab.",
 title="Modul 5: Gleichmäßig beschleunigte Bewegung",
 full=f"""
<h3>Konstante Beschleunigung</h3>
<p>Sie haben das Fortgeschrittenen-Modul freigeschaltet! Wirkt eine konstante Kraft, ist auch die Beschleunigung konstant. Die Geschwindigkeit steigt dann jede Sekunde um denselben Betrag. Das nennt man eine <strong>gleichmäßig beschleunigte Bewegung</strong>.</p>
{FORMELN}
{table(["Zeichen", "Bedeutung", "Einheit"], [
  ["x", "zurückgelegter Weg (Ort)", "m"],
  ["v₀", "Anfangsgeschwindigkeit", "m/s"],
  ["v", "Geschwindigkeit zur Zeit t", "m/s"],
  ["t", "Zeit", "s"],
  ["a", "Beschleunigung", "m/s²"]])}

<h3>km/h und m/s</h3>
<p>In den Formeln brauchen Sie <strong>m/s</strong>. Geschwindigkeiten stehen aber oft in km/h.</p>
<div class="formula">1 m/s = 3,6 km/h &nbsp;&nbsp;&nbsp; km/h <strong>: 3,6</strong> → m/s &nbsp;&nbsp;&nbsp; m/s <strong>· 3,6</strong> → km/h</div>
<p>Beispiel: 100 km/h : 3,6 ≈ 27,78 m/s. 10 m/s · 3,6 = 36 km/h.</p>

<h3>Beispiel</h3>
<p>Ein Zug fährt aus dem Stand an (v₀ = 0). Er beschleunigt 20 s lang mit a = 0,5 m/s².</p>
{table(["Gesucht", "Rechnung"], [
  ["Geschwindigkeit nach 20 s", "v = 0 + 0,5 m/s² · 20 s = 10 m/s = 36 km/h"],
  ["Strecke nach 20 s", "x = 0 + ½ · 0,5 m/s² · (20 s)² = ½ · 0,5 · 400 m = 100 m"]])}
{box("💡 Sonderfall v₀ = 0", "Startet der Körper aus der Ruhe, werden die Formeln kürzer: v = a · t und x = ½ · a · t².")}
{box("⚠️ Typische Fehler", "Das <strong>½</strong> vergessen. Das <strong>t²</strong> nicht quadrieren. km/h nicht in <strong>m/s</strong> umrechnen. Beim Bremsen ist a negativ.")}
""",
 short=f"""
{FORMELN}
<p>v₀: Anfangsgeschwindigkeit in m/s, t: Zeit in s, a: Beschleunigung in m/s².</p>
<p><strong>km/h : 3,6 = m/s.</strong> Beispiel: 100 km/h ≈ 27,78 m/s.</p>
<p><strong>Beispiel Zug</strong> (v₀ = 0, a = 0,5 m/s², t = 20 s): v = 10 m/s, x = ½ · 0,5 · 20² m = 100 m.</p>
<p>Achtung: ½ und t² nicht vergessen!</p>
""",
)

M[6] = dict(
 card=("🏎️", "Modul 6: Sportwagen gegen freien Fall", "Ein Sportwagen gegen einen frei fallenden Körper: Wer beschleunigt stärker?"),
 card_locked="Gesperrt. Danach vergleichen Sie einen Sportwagen mit dem freien Fall.",
 title="Modul 6: Sportwagen gegen freien Fall",
 full=f"""
<h3>Wie stark beschleunigt ein Fahrzeug?</h3>
<p>Für Autos gibt man oft an: „von 0 auf 100 km/h in … Sekunden“. Daraus berechnen Sie die Beschleunigung mit a = Δv / Δt. Danach können Sie sie mit dem freien Fall vergleichen.</p>

<h3>Beispiel: Motorrad</h3>
<p>Ein Motorrad beschleunigt in 3,5 s von 0 auf 100 km/h.</p>
{table(["Schritt", "Rechnung"], [
  ["① Umrechnen", "Δv = 100 km/h : 3,6 ≈ 27,78 m/s"],
  ["② Beschleunigung", "a = Δv / Δt = 27,78 m/s / 3,5 s ≈ 7,94 m/s²"],
  ["③ Vergleich mit g", "a / g = 7,94 / 9,81 ≈ 0,81 → etwa 81 % der Fallbeschleunigung"],
  ["④ Strecke Motorrad", "x = ½ · 7,94 m/s² · (3,5 s)² ≈ 48,6 m"],
  ["⑤ Strecke freier Fall", "x = ½ · 9,81 m/s² · (3,5 s)² ≈ 60,1 m"]])}
{box("💡 Schneller Weg für die Strecke", "Startet der Körper aus der Ruhe, gilt auch: x = ½ · v · t. Für das Motorrad: ½ · 27,78 m/s · 3,5 s ≈ 48,6 m.")}

<h3>Und die Kraft?</h3>
<p>Mit dem 2. Newtonschen Gesetz können Sie ausrechnen, welche Kraft dafür nötig ist. Das Motorrad wiegt mit Fahrer 280 kg:</p>
<div class="formula">F = m · a = 280 kg · 7,94 m/s² ≈ 2223 N</div>
<p>Dabei sind Luftwiderstand und Reibung nicht berücksichtigt. In Wirklichkeit muss der Motor mehr leisten.</p>

<h3>Strecken vergleichen</h3>
<p>Starten zwei Körper aus der Ruhe, gilt für beide x = ½ · a · t². Bei gleicher Zeit sind ½ und t² gleich. Dann gilt:</p>
<div class="formula">{frac("x<sub>1</sub>", "x<sub>2</sub>")} = {frac("a<sub>1</sub>", "a<sub>2</sub>")}</div>
<p>Doppelte Beschleunigung bedeutet in derselben Zeit doppelte Strecke.</p>
""",
 short=f"""
<p><strong>Vorgehen:</strong> 100 km/h : 3,6 ≈ 27,78 m/s. Dann a = Δv / Δt. Dann a mit g = 9,81 m/s² vergleichen.</p>
<p><strong>Beispiel Motorrad</strong> (0–100 km/h in 3,5 s): a ≈ 7,94 m/s² ≈ 81 % von g. Strecke: x = ½ · a · t² ≈ 48,6 m. Freier Fall in 3,5 s: ≈ 60,1 m.</p>
<p>Kraft: F = m · a. Bei gleicher Zeit und v₀ = 0 gilt: x₁ / x₂ = a₁ / a₂.</p>
""",
)

M[7] = dict(
 card=("📈", "Modul 7: Challenge – Das v-t-Diagramm", "Bewegungen zeichnen und ablesen: Steigung und Fläche im v-t-Diagramm."),
 card_locked="Gesperrt. Die Challenge zum Schluss.",
 title="Modul 7: Challenge – Das v-t-Diagramm",
 full=f"""
<h3>Bewegungen zeichnen</h3>
<p>Im <strong>Zeit-Geschwindigkeit-Diagramm</strong> (v-t-Diagramm) steht die Zeit t auf der x-Achse. Die Geschwindigkeit v steht auf der y-Achse. Jede Bewegung ergibt eine Linie.</p>
{VT_BEISPIEL}
{table(["Form der Linie", "Bedeutung"], [
  ["steigende Gerade", "gleichmäßig schneller werden (a > 0)"],
  ["steilere Gerade", "größere Beschleunigung"],
  ["waagerechte Linie", "konstante Geschwindigkeit (a = 0)"],
  ["fallende Gerade", "gleichmäßig langsamer werden (a < 0)"],
  ["Linie bei v = 0", "Stillstand"]])}

<h3>Die Steigung ist die Beschleunigung</h3>
<p>Zeichnen Sie ein <strong>Steigungsdreieck</strong>. Lesen Sie Δt und Δv ab. Dann gilt a = Δv / Δt.</p>
{VT_STEIGUNG}

<h3>Die Fläche ist die Strecke</h3>
<p>Die Fläche unter der Linie hat die Einheit m/s · s = m. Sie ist die <strong>zurückgelegte Strecke</strong>. Startet der Körper aus der Ruhe, ist die Fläche ein Dreieck:</p>
<div class="formula">x = ½ · t · v &nbsp;&nbsp;&nbsp; (Grundseite · Höhe : 2)</div>
<p>Das passt zur Formel x = ½ · a · t², denn v = a · t.</p>
{box("✏️ So zeichnen Sie eine Bewegung", "1. Startpunkt markieren (bei v₀ = 0 im Ursprung). 2. Mit v = v₀ + a · t einen zweiten Punkt berechnen, z. B. bei t = 5 s. 3. Beide Punkte mit dem Lineal verbinden.")}
""",
 short=f"""
{VT_BEISPIEL}
<p><strong>Steigung = Beschleunigung</strong> (a = Δv / Δt). <strong>Fläche = Strecke</strong> (Dreieck: x = ½ · t · v).</p>
<p>Waagerecht: konstante Geschwindigkeit. Fallend: Bremsen. Steiler: größere Beschleunigung.</p>
<p><strong>Zeichnen:</strong> Startpunkt, zweiten Punkt mit v = v₀ + a · t berechnen, verbinden.</p>
""",
)

# ---------------------------------------------------------------- Seite bauen
TITEL = "Kraft und Beschleunigung"
DATEI = {"full": "kraft_beschleunigung_komplett.html", "short": "kraft_beschleunigung_kompakt.html", "quiz": "kraft_beschleunigung_quiz.html"}


def build(variant):
    titles = {"full": TITEL + " – Lernmodul", "short": TITEL + " – Kompakt", "quiz": TITEL + " – Quiz"}
    sub = {"full": "Die drei Newtonschen Gesetze, der freie Fall und der Sportwagen. Lerntexte, Aufgaben und ein Abzeichen am Ende.",
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

    header_hint = ('<div class="book-hint">🧮 Taschenrechner erlaubt &nbsp;·&nbsp; g = 9,81 m/s² &nbsp;·&nbsp; '
                   '1 N = 1 kg · m/s² &nbsp;·&nbsp; 1 m/s = 3,6 km/h</div>')
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
            <h1>🚀 {TITEL} 🏎️</h1>
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
            <h2 id="expert-title" style="margin-top: 20px; color: #f8fafc;">🚀 NEWTONS GESETZE: BEWEGUNGS-PROFI 🏎️</h2>
        </div>
    </div>

    <script>
const modules = {json.dumps(data, ensure_ascii=False, indent=2)};

{TASKS_JS}
{ENGINE}
{ENGINE_EXTRA}
    </script>
</body>
</html>
'''


os.makedirs(OUT, exist_ok=True)
for v, fn in DATEI.items():
    open(os.path.join(OUT, fn), "w", encoding="utf-8").write(build(v))
    print("geschrieben:", fn)
