# -*- coding: utf-8 -*-
"""Erzeugt die drei Varianten des Lernmoduls "Die Reibung" (FOS 12) nach dem Aufbau der C#-Vorlage."""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO, "reibung")
CSS_BASE = open(os.path.join(HERE, "..", "stil_vorlage.css"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "..", "engine.js"), encoding="utf-8").read()
ENGINE_EXTRA = open(os.path.join(HERE, "..", "engine_extra.js"), encoding="utf-8").read()
TASKS_JS = open(os.path.join(HERE, "tasks.js"), encoding="utf-8").read()

# gemeinsames CSS aus dem Modul "Kraft und Beschleunigung" übernehmen (gleiches Aussehen)
KB = open(os.path.join(HERE, "..", "kraft-beschleunigung", "build.py"), encoding="utf-8").read()
css_extra = re.search(r'css \+= """(.*?)"""', KB, re.S).group(1)
css = CSS_BASE.replace("grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));",
                       "grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));")
css += css_extra + """
        .quiz-question ul { margin: 6px 0 4px 26px; }
        .quiz-question li { margin: 2px 0; }
        .quiz-question .table-wrap table { min-width: 0; }
        .lab-out span { white-space: nowrap; }
        .schritte { counter-reset: s; list-style: none; margin: 15px 0; padding: 0; }
        .schritte li { counter-increment: s; position: relative; padding: 10px 14px 10px 52px; margin-bottom: 8px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; line-height: 1.6; }
        .schritte li::before { content: counter(s); position: absolute; left: 12px; top: 9px; width: 28px; height: 28px; border-radius: 50%; background: #0ea5e9; color: #fff; font-weight: bold; text-align: center; line-height: 28px; }
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


def de(x, dec=2):
    return f"{x:.{dec}f}".replace("-", "−").replace(".", ",")


def schritte(items):
    return '<ol class="schritte">' + "".join(f"<li>{s}</li>" for s in items) + "</ol>"


G = 9.81
SF = 'font-family="Segoe UI, Arial"'
ARR = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>'
COL = dict(G="#94a3b8", N="#38bdf8", H="#f87171", R="#fbbf24", Z="#4ade80", C="#f472b6")


def ix(b, i): return f'{b}<tspan font-size="72%" dy="4">{i}</tspan>'
def pf(x1, y1, x2, y2, col, w=4): return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{col}" stroke-width="{w}" marker-end="url(#ah)"/>'
def tx(x, y, s, col, size=16, anchor="middle", bold=True):
    b = ' font-weight="bold"' if bold else ""
    return f'<text x="{x:.1f}" y="{y:.1f}" fill="{col}" font-size="{size}"{b} text-anchor="{anchor}" {SF}>{s}</text>'
def sketch(svg, caption=""):
    cap = f'<p class="caption">{caption}</p>' if caption else ""
    return f'<div class="sketch">{svg}{cap}</div>'


# ---------------------------------------------------------------- Skizzen
def sk_rauheit():
    # zwei raue Oberflächen, stark vergrößert, Zacken greifen ineinander
    hs = [14, 22, 10, 18, 26, 12, 20, 16, 24, 11, 19, 15, 23, 13, 21, 17]
    step = 500 / len(hs)
    top, bot = [], []
    for k, h in enumerate(hs):
        x = 20 + k * step
        top += [(x, 128 - h * 0.2), (x + step / 2, 128 + h)]
        bot += [(x, 136 - h * 0.2 + 4), (x + step / 2, 136 + h + 4)]
    top.append((520, 128)); bot.append((520, 140))
    up = "M20,60 L520,60 " + " ".join(f"L{x:.1f},{y:.1f}" for x, y in reversed(top)) + " Z"
    dn = "M20,230 L520,230 " + " ".join(f"L{x:.1f},{y:.1f}" for x, y in reversed(bot)) + " Z"
    s = f'<svg viewBox="0 0 540 250" role="img" aria-label="Zwei raue Oberflächen stark vergrößert. Die Unebenheiten greifen ineinander.">{ARR}'
    s += f'<path d="{dn}" fill="#3b2a0a" stroke="#f59e0b" stroke-width="2"/>'
    s += f'<path d="{up}" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/>'
    s += tx(270, 100, "Körper (stark vergrößert)", "#e0f2fe", 16) + tx(270, 205, "Unterlage", "#fde68a", 16)
    s += pf(330, 32, 470, 32, COL["Z"], 4) + tx(400, 22, "Bewegung", COL["Z"], 14)
    s += pf(210, 32, 70, 32, COL["R"], 4) + tx(140, 22, "Reibungskraft", COL["R"], 14)
    return s + "</svg>"


def sk_kiste():
    s = f'<svg viewBox="0 0 540 270" role="img" aria-label="Kiste auf ebenem Boden mit Gewichtskraft, Normalkraft, Zugkraft und Reibungskraft">{ARR}'
    s += '<rect x="20" y="180" width="500" height="20" fill="#3b2a0a"/><line x1="20" y1="180" x2="520" y2="180" stroke="#f59e0b" stroke-width="2"/>'
    s += '<rect x="200" y="90" width="130" height="90" rx="5" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/>'
    s += pf(240, 135, 240, 245, COL["G"]) + tx(230, 240, ix("F", "G"), COL["G"], 17, "end")
    s += pf(300, 178, 300, 250, COL["N"]) + tx(311, 245, ix("F", "N") + " (drückt auf den Boden)", COL["N"], 15, "start")
    s += pf(330, 120, 450, 120, COL["Z"]) + tx(455, 125, ix("F", "Z"), COL["Z"], 17, "start")
    s += pf(220, 176, 110, 176, COL["R"]) + tx(105, 165, ix("F", "R"), COL["R"], 17, "end")
    return s + "</svg>"


def sk_zugdiagramm():
    x0, y0, w, h = 70, 220, 420, 170
    X = lambda t: x0 + t * w
    Y = lambda f: y0 - f * h
    s = f'<svg viewBox="0 0 540 270" role="img" aria-label="Verlauf der Zugkraft: steigt bis zur Haftreibungskraft, fällt dann auf die Gleitreibungskraft">{ARR}'
    s += f'<line x1="{x0}" y1="{y0}" x2="{x0 + w + 18}" y2="{y0}" stroke="#94a3b8" stroke-width="2" marker-end="url(#ah)"/>'
    s += f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0 - h - 22}" stroke="#94a3b8" stroke-width="2" marker-end="url(#ah)"/>'
    s += tx(x0 + w + 16, y0 + 22, "Zeit", "#cbd5e1", 14, "end", False) + tx(x0 + 8, 22, "Zugkraft", "#cbd5e1", 14, "start", False)
    pts = [(0, 0), (0.4, 0.9), (0.44, 0.62), (1, 0.62)]
    s += '<polyline points="' + " ".join(f"{X(a):.1f},{Y(b):.1f}" for a, b in pts) + '" fill="none" stroke="#4ade80" stroke-width="4" stroke-linejoin="round"/>'
    s += f'<line x1="{x0}" y1="{Y(0.9):.1f}" x2="{X(0.4):.1f}" y2="{Y(0.9):.1f}" stroke="{COL["R"]}" stroke-dasharray="5 4"/>'
    s += f'<line x1="{x0}" y1="{Y(0.62):.1f}" x2="{X(0.44):.1f}" y2="{Y(0.62):.1f}" stroke="{COL["N"]}" stroke-dasharray="5 4"/>'
    s += tx(x0 - 6, Y(0.9) + 5, ix("F", "R,H"), COL["R"], 15, "end") + tx(x0 - 6, Y(0.62) + 5, ix("F", "R,G"), COL["N"], 15, "end")
    s += tx(X(0.2), Y(0.3) - 12, "Kiste ruht", "#e2e8f0", 14, "middle", False)
    s += tx(X(0.72), Y(0.62) - 12, "Kiste rutscht", "#e2e8f0", 14, "middle", False)
    s += tx(X(0.4) + 6, Y(0.9) - 10, "losreißen", "#fbbf24", 14, "start")
    return s + "</svg>"


def sk_f1_kurve():
    cx, cy, R = 270, 300, 220
    s = f'<svg viewBox="0 40 540 300" role="img" aria-label="Rennwagen in einer Kurve von oben. Die Zentripetalkraft zeigt zur Kurvenmitte.">{ARR}'
    for rr in (R + 24, R - 24):
        a1, a2 = math.radians(160), math.radians(20)
        s += f'<path d="M{cx + rr * math.cos(a1):.1f},{cy - rr * math.sin(a1):.1f} A{rr},{rr} 0 0 1 {cx + rr * math.cos(a2):.1f},{cy - rr * math.sin(a2):.1f}" fill="none" stroke="#64748b" stroke-width="2"/>'
    phi = math.radians(118)
    px, py = cx + R * math.cos(phi), cy - R * math.sin(phi)
    s += f'<line x1="{px:.1f}" y1="{py:.1f}" x2="{cx}" y2="{cy}" stroke="#475569" stroke-dasharray="5 4"/>'
    s += f'<g transform="translate({px:.1f},{py:.1f}) rotate({90 - 118})"><rect x="-22" y="-10" width="44" height="20" rx="6" fill="#f59e0b"/><rect x="6" y="-7" width="10" height="14" rx="2" fill="#0f172a"/><rect x="-26" y="-13" width="8" height="26" rx="2" fill="#b45309"/></g>'
    ex, ey = px + (cx - px) * 0.45, py + (cy - py) * 0.45
    s += pf(px, py, ex, ey, COL["C"], 4) + tx(ex - 10, ey + 4, ix("F", "C"), COL["C"], 18, "end")
    tdx, tdy = math.sin(phi), math.cos(phi)
    s += pf(px + tdx * 30, py + tdy * 30, px + tdx * 110, py + tdy * 110, "#e2e8f0", 2.5) + tx(px + tdx * 115 + 4, py + tdy * 115 - 6, "v", "#e2e8f0", 17, "start")
    mx, my = px + (cx - px) * 0.72, py + (cy - py) * 0.72
    s += tx(mx + 12, my, "r", "#cbd5e1", 17, "start")
    s += f'<circle cx="{cx}" cy="{cy}" r="5" fill="#f472b6"/>' + tx(cx + 12, cy + 5, "Kurvenmitte", "#f472b6", 14, "start", False)
    return s + "</svg>"


def sk_f1_seite():
    s = f'<svg viewBox="0 0 540 250" role="img" aria-label="Rennwagen von der Seite mit Gewichtskraft, Abtriebskraft und Normalkraft">{ARR}'
    s += '<line x1="20" y1="170" x2="520" y2="170" stroke="#64748b" stroke-width="3"/>'
    s += '<path d="M110,150 L130,125 L250,120 L280,100 L320,100 L330,120 L420,128 L440,150 Z" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/>'
    s += '<rect x="96" y="96" width="14" height="40" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/><rect x="80" y="92" width="44" height="8" fill="#38bdf8"/>'
    s += '<rect x="440" y="140" width="40" height="6" fill="#38bdf8"/>'
    s += '<circle cx="160" cy="150" r="20" fill="#0f172a" stroke="#e2e8f0" stroke-width="3"/><circle cx="390" cy="150" r="20" fill="#0f172a" stroke="#e2e8f0" stroke-width="3"/>'
    s += pf(250, 40, 250, 92, COL["H"], 4) + tx(262, 60, ix("F", "Ab") + " (Abtrieb durch Flügel)", COL["H"], 15, "start")
    s += pf(300, 120, 300, 165, COL["G"], 4) + tx(312, 158, ix("F", "G"), COL["G"], 16, "start")
    s += pf(220, 172, 220, 238, COL["N"], 5) + tx(232, 232, ix("F", "N") + " = " + ix("F", "G") + " + " + ix("F", "Ab"), COL["N"], 16, "start")
    return s + "</svg>"


def sk_rampe(a=25, m=10, zug=False, k=1.45):
    ar = math.radians(a)
    base, x0 = 300, 50
    L = min(400, 250 / math.sin(ar))
    ux, uy = math.cos(ar), -math.sin(ar)
    nx, ny = -math.sin(ar), -math.cos(ar)
    topX, topY = x0 + L * ux, base + L * uy
    sx, sy = x0 + 0.5 * L * ux, base + 0.5 * L * uy
    bw, bh = 64, 40
    cx, cy = sx + nx * bh / 2, sy + ny * bh / 2
    FG = m * G
    FN, FH = FG * math.cos(ar), FG * math.sin(ar)
    s = f'<svg viewBox="0 30 540 400" role="img" aria-label="Kiste auf einer schiefen Ebene mit Gewichtskraft, Normalkraft und Hangabtriebskraft">{ARR}'
    s += f'<polygon points="{x0},{base} {topX:.1f},{topY:.1f} {topX:.1f},{base}" fill="#3b2a0a" stroke="#f59e0b" stroke-width="2"/>'
    s += f'<line x1="10" y1="{base}" x2="530" y2="{base}" stroke="#64748b" stroke-width="2"/>'
    r = 46
    s += f'<path d="M{x0 + r},{base} A{r},{r} 0 0 0 {x0 + r * ux:.1f},{base + r * uy:.1f}" fill="none" stroke="#e2e8f0" stroke-width="2"/>'
    s += tx(x0 + (r + 16) * math.cos(ar / 2), base - (r + 16) * math.sin(ar / 2) + 5, "α", "#e2e8f0", 16)
    s += f'<g transform="translate({cx:.1f},{cy:.1f}) rotate({-a})"><rect x="{-bw / 2}" y="{-bh / 2}" width="{bw}" height="{bh}" rx="4" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/></g>'
    gx, gy = cx, cy + FG * k
    nX, nY = cx - nx * FN * k, cy - ny * FN * k
    hX, hY = cx - ux * FH * k, cy - uy * FH * k
    s += f'<line x1="{nX:.1f}" y1="{nY:.1f}" x2="{gx:.1f}" y2="{gy:.1f}" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>'
    s += f'<line x1="{hX:.1f}" y1="{hY:.1f}" x2="{gx:.1f}" y2="{gy:.1f}" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>'
    s += pf(cx, cy, gx, gy, COL["G"]) + tx(gx + 6, gy + 18, ix("F", "G"), COL["G"], 17, "start")
    s += pf(cx, cy, nX, nY, COL["N"]) + tx(nX + 24, nY + 6, ix("F", "N"), COL["N"], 17)
    s += pf(cx, cy, hX, hY, COL["H"]) + tx(hX - 8, hY - 10, ix("F", "H"), COL["H"], 17, "end")
    # Winkel α zwischen F_G und F_N
    s += f'<path d="M{cx:.1f},{cy + 34:.1f} A34,34 0 0 1 {cx + 34 * math.sin(ar):.1f},{cy + 34 * math.cos(ar):.1f}" fill="none" stroke="#e2e8f0" stroke-width="1.5"/>'
    s += tx(cx + 44 * math.sin(ar / 2) + 2, cy + 44 * math.cos(ar / 2) + 6, "α", "#e2e8f0", 14)
    if zug:
        zX, zY = cx + ux * (bw / 2 + 120), cy + uy * (bw / 2 + 120)
        s += pf(cx + ux * bw / 2, cy + uy * bw / 2, zX, zY, COL["Z"]) + tx(zX + 4, zY - 8, ix("F", "Z"), COL["Z"], 17, "start")
        s += pf(sx - ux * 34, sy - uy * 34 + 3, sx - ux * 100, sy - uy * 100 + 3, COL["R"]) + tx(sx - ux * 100 - 4, sy - uy * 100 + 24, ix("F", "R"), COL["R"], 17, "end")
    s += f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="4" fill="#f8fafc"/>'
    return s + "</svg>"


MU_TAB = table(["Werkstoffpaarung", "Haftreibung μ<sub>H</sub>", "Gleitreibung μ<sub>G</sub>"], [
    ["Gummi auf Asphalt, trocken", "0,9", "0,8"], ["Gummi auf Asphalt, nass", "0,5", "0,35"],
    ["Holz auf Holz", "0,5", "0,3"], ["Stahl auf Stahl, trocken", "0,2", "0,15"],
    ["Stahl auf Stahl, geschmiert", "0,1", "0,05"], ["Stahl auf Eis (Schlittschuh)", "0,03", "0,01"],
    ["Wälzlager (Rollreibung)", "–", "etwa 0,002"]])

F_R = '<div class="formula big">F<sub>R</sub> = μ · F<sub>N</sub></div>'
F_C = f'<div class="formula big">F<sub>C</sub> = {frac("m · v²", "r")}</div>'
F_EBENE = f'''<div class="formula"><div class="formula-grid">
<span class="fname">Normalkraft:</span><span>F<sub>N</sub> = F<sub>G</sub> · cos α</span>
<span class="fname">Hangabtriebskraft:</span><span>F<sub>H</sub> = F<sub>G</sub> · sin α</span>
</div></div>'''

RAUH = sketch(sk_rauheit(), "Unter dem Mikroskop ist jede Oberfläche rau. Die Unebenheiten greifen ineinander.")
KISTE = sketch(sk_kiste(), "Kiste auf ebenem Boden: Die Reibungskraft F<sub>R</sub> wirkt gegen die Zugkraft F<sub>Z</sub>.")
ZUGD = sketch(sk_zugdiagramm(), "Zum Losreißen braucht man die größte Kraft. Danach reicht die kleinere Gleitreibungskraft.")
KURVE = sketch(sk_f1_kurve(), "Von oben: Die Zentripetalkraft F<sub>C</sub> zeigt immer zur Kurvenmitte.")
SEITE = sketch(sk_f1_seite(), "Von der Seite: Der Abtrieb drückt den Wagen zusätzlich auf die Straße.")
RAMPE = sketch(sk_rampe(28, 10), "Die Gewichtskraft F<sub>G</sub> wird zerlegt: F<sub>N</sub> senkrecht zur Rampe, F<sub>H</sub> parallel zur Rampe.")
RAMPE_ZUG = sketch(sk_rampe(22, 10, zug=True), "Beim Hinaufziehen zeigen F<sub>H</sub> und F<sub>R</sub> beide hangabwärts.")

# ---------------------------------------------------------------- Inhalte
M = {}

M[1] = dict(
 card=("🧱", "Modul 1: Was ist Reibung?", "Haftreibung, Gleitreibung, Rollreibung. Nützlich oder störend?"),
 title="Modul 1: Was ist Reibung?",
 full=f"""
<h3>Warum bleibt eine Kiste stehen?</h3>
<p>Sie ziehen an einer schweren Kiste. Zuerst bewegt sie sich nicht. Eine Kraft hält dagegen. Diese Kraft heißt <strong>Reibungskraft</strong> F<sub>R</sub>.</p>
<p>Reibung entsteht an der Berührungsfläche von zwei Körpern. Keine Oberfläche ist ganz glatt. Unter dem Mikroskop sieht man viele kleine Unebenheiten. Sie greifen ineinander und verhaken sich.</p>
{RAUH}
{box("🧠 Merke", "Die Reibungskraft wirkt immer <strong>entgegen</strong> der Bewegung. Ruht der Körper, wirkt sie gegen die geplante Bewegung.")}

<h3>Drei Arten der Reibung</h3>
{table(["Reibungsart", "Wann?", "Beispiel"], [
  ["<strong>Haftreibung</strong>", "Der Körper ruht und soll bewegt werden.", "Auto parkt am Hang, Schraube hält"],
  ["<strong>Gleitreibung</strong>", "Der Körper rutscht über die Unterlage.", "Schrank schieben, Bremsbacke"],
  ["<strong>Rollreibung</strong>", "Der Körper rollt.", "Fahrradreifen, Kugellager"]])}
<p>Meistens gilt: <strong>Haftreibung &gt; Gleitreibung &gt; Rollreibung</strong>. Deshalb rollt man schwere Lasten auf Rollen. Und deshalb ist das Losreißen am schwersten.</p>

<h3>Losreißen und Weiterziehen</h3>
<p>Die Haftreibung ist nur so groß wie nötig. Zieht niemand, ist sie null. Ziehen Sie stärker, wächst sie mit. Erst wenn die Zugkraft größer als die <strong>größte Haftreibungskraft</strong> F<sub>R,H</sub> ist, rutscht die Kiste los. Dann wirkt die kleinere <strong>Gleitreibungskraft</strong> F<sub>R,G</sub>.</p>
{ZUGD}

<h3>Nützlich oder störend?</h3>
{table(["nützlich", "störend"], [
  ["Bremsen, Reifen auf der Straße", "Verschleiß in Lagern und Getrieben"],
  ["Schuhsohlen beim Gehen", "Wärme und Energieverlust im Motor"],
  ["Schrauben, Nägel, Knoten halten", "klemmende Führungen"]])}
{box("💡 Technik", "Ingenieure machen Reibung gezielt <strong>groß</strong> (Bremsbelag, Reifenprofil) oder <strong>klein</strong> (Schmierung, Wälzlager).")}
""",
 short=f"""
<p>Die <strong>Reibungskraft</strong> F<sub>R</sub> entsteht, weil sich die Unebenheiten der Oberflächen verhaken. Sie wirkt immer <strong>gegen die Bewegung</strong>.</p>
<p><strong>Haftreibung</strong>: Körper ruht. <strong>Gleitreibung</strong>: Körper rutscht. <strong>Rollreibung</strong>: Körper rollt. Meist gilt: Haft &gt; Gleit &gt; Roll.</p>
<p>Zum Losreißen braucht man die größte Kraft. Rutscht der Körper, reicht eine kleinere Kraft.</p>
{ZUGD}
<p>Reibung ist <strong>nützlich</strong> (Bremsen, Gehen, Schrauben) oder <strong>störend</strong> (Verschleiß, Wärme).</p>
""",
)

M[2] = dict(
 card=("⬇️", "Modul 2: Die Normalkraft", "Mit welcher Kraft drückt ein Körper auf seine Unterlage?"),
 title="Modul 2: Die Normalkraft",
 full=f"""
<h3>Was ist die Normalkraft?</h3>
<p>Die <strong>Normalkraft</strong> F<sub>N</sub> ist die Kraft, mit der ein Körper auf seine Unterlage drückt. Sie wirkt immer <strong>senkrecht zur Oberfläche</strong>. „Normal“ heißt in der Mathematik „senkrecht“.</p>
<p>Die Unterlage drückt mit einer gleich großen Kraft zurück (3. Newtonsches Gesetz). Je stärker ein Körper auf die Unterlage drückt, desto stärker verhaken sich die Unebenheiten. Die Reibung wird größer.</p>
{KISTE}

<h3>Auf ebenem Boden</h3>
<p>Liegt ein Körper auf ebenem Boden, drückt nur sein Gewicht. Dann gilt:</p>
<div class="formula big">F<sub>N</sub> = F<sub>G</sub> = m · g</div>
<p>Mit g = 9,81 m/s². Beispiel: Eine Kiste mit 50 kg drückt mit F<sub>N</sub> = 50 kg · 9,81 m/s² = 490,5 N auf den Boden.</p>

<h3>Wann ist F<sub>N</sub> nicht gleich F<sub>G</sub>?</h3>
{table(["Situation", "Normalkraft"], [
  ["Jemand drückt zusätzlich von oben", "größer als F<sub>G</sub>"],
  ["Flügel erzeugen Abtrieb (Rennwagen)", "größer als F<sub>G</sub>"],
  ["Ein Seil zieht schräg nach oben", "kleiner als F<sub>G</sub>"],
  ["Der Körper steht auf einer Schräge", "kleiner als F<sub>G</sub>"]])}

<h3>Der Formel-1-Wagen</h3>
<p>Ein Formel-1-Wagen hat Flügel vorn und hinten. Sie funktionieren wie umgedrehte Flugzeugflügel. Der Fahrtwind drückt den Wagen auf die Straße. Diese Kraft heißt <strong>Abtrieb</strong> F<sub>Ab</sub>. Je schneller der Wagen fährt, desto größer ist der Abtrieb.</p>
{SEITE}
{box("🧠 Merke", "Die Normalkraft hängt ab von der <strong>Masse</strong>, der <strong>Neigung</strong> der Unterlage und von <strong>zusätzlichen Kräften</strong> (z. B. Abtrieb). Beim Rennwagen also auch von der Geschwindigkeit.")}
""",
 short=f"""
<p>Die <strong>Normalkraft</strong> F<sub>N</sub> wirkt <strong>senkrecht zur Oberfläche</strong>. Mit ihr drückt der Körper auf die Unterlage.</p>
<div class="formula big">ebener Boden: F<sub>N</sub> = F<sub>G</sub> = m · g</div>
<p>Zusätzliche Kraft von oben oder Abtrieb → F<sub>N</sub> größer. Zug nach oben oder Schräge → F<sub>N</sub> kleiner.</p>
{SEITE}
""",
)

M[3] = dict(
 card=("📏", "Modul 3: Die Reibungskraft berechnen", "F_R = μ · F_N. Reibungszahlen vergleichen und anwenden."),
 title="Modul 3: Die Reibungskraft berechnen",
 full=f"""
<h3>Die Formel</h3>
<p>Die Reibungskraft hängt von zwei Dingen ab: von der <strong>Normalkraft</strong> und von den <strong>Werkstoffen</strong>, die sich berühren.</p>
{F_R}
{table(["Zeichen", "Bedeutung", "Einheit"], [
  ["F<sub>R</sub>", "Reibungskraft", "N"],
  ["μ (sprich: mü)", "Reibungszahl", "keine Einheit"],
  ["F<sub>N</sub>", "Normalkraft", "N"]])}
<p>Für die Haftreibung schreibt man μ<sub>H</sub> und F<sub>R,H</sub>. Für die Gleitreibung μ<sub>G</sub> und F<sub>R,G</sub>.</p>
<p><strong>Wichtig:</strong> Die Größe der Auflagefläche kommt in der Formel nicht vor. Eine Kiste reibt hochkant genauso stark wie flach.</p>

<h3>Reibungszahlen (gerundete Richtwerte)</h3>
{MU_TAB}
<p>Was fällt auf?</p>
<ul>
<li>Die Haftreibungszahl ist immer größer als die Gleitreibungszahl (oder gleich).</li>
<li><strong>Schmieren</strong> verkleinert die Reibungszahl deutlich.</li>
<li><strong>Rollen</strong> statt Gleiten verkleinert sie noch viel stärker.</li>
<li>Nässe macht die Straße rutschig.</li>
</ul>

<h3>Beispiel</h3>
<p>Ein Schraubstock (m = 25 kg) steht auf einer Werkbank. Haftreibungszahl: μ<sub>H</sub> = 0,2. Ab welcher Kraft rutscht er?</p>
{schritte([
  "F<sub>N</sub> = m · g = 25 kg · 9,81 m/s² = 245,25 N",
  "F<sub>R,H</sub> = μ<sub>H</sub> · F<sub>N</sub> = 0,2 · 245,25 N = 49,05 N",
  "Die Zugkraft muss größer als <strong>49,05 N</strong> sein."])}
{box("⚠️ Typischer Fehler", "Nicht μ · m rechnen! Eine Masse ist keine Kraft. Zuerst immer die Normalkraft in Newton bestimmen.")}
""",
 short=f"""
{F_R}
<p>μ = Reibungszahl (ohne Einheit). Haftreibung: μ<sub>H</sub>, Gleitreibung: μ<sub>G</sub>. Die Auflagefläche spielt keine Rolle.</p>
{MU_TAB}
<p>μ<sub>H</sub> ≥ μ<sub>G</sub>. Schmieren und Rollen machen μ klein. Nässe macht die Straße rutschig.</p>
<p><strong>Beispiel:</strong> 25 kg, μ<sub>H</sub> = 0,2 → F<sub>N</sub> = 245,25 N → F<sub>R,H</sub> = 49,05 N.</p>
""",
)

M[4] = dict(
 card=("📦", "Modul 4: Eine schwere Kiste bewegen", "Wie viele Personen braucht man zum Anziehen und zum Weiterziehen?"),
 title="Modul 4: Eine schwere Kiste bewegen",
 full=f"""
<h3>Die Situation</h3>
<p>Eine schwere Kiste soll über den Boden gezogen werden. Eine Person allein schafft es nicht. Wie viele Personen braucht man?</p>
<p>Die Lösung geht immer in denselben Schritten:</p>
{schritte([
  "Masse in kg umrechnen (falls nötig).",
  "Gewichtskraft berechnen: F<sub>G</sub> = m · g.",
  "Normalkraft bestimmen: auf ebenem Boden F<sub>N</sub> = F<sub>G</sub>.",
  "Reibungskraft berechnen: Zum Anziehen F<sub>R,H</sub> = μ<sub>H</sub> · F<sub>N</sub>. Zum Weiterziehen F<sub>R,G</sub> = μ<sub>G</sub> · F<sub>N</sub>.",
  "Durch die Kraft einer Person teilen.",
  "<strong>Aufrunden!</strong> 2,3 Personen gibt es nicht. Mit 2 Personen reicht es nicht, also braucht man 3."])}

<h3>Beispiel</h3>
<p>Ein Schrank (m = 120 kg) steht auf einem Fliesenboden. Reibungszahlen: μ<sub>H</sub> = 0,5 und μ<sub>G</sub> = 0,3. Eine Person zieht mit 250 N.</p>
{table(["", "Anziehen (Haftreibung)", "Weiterziehen (Gleitreibung)"], [
  ["Normalkraft", "120 kg · 9,81 m/s² = 1177,2 N", "1177,2 N"],
  ["Reibungskraft", "0,5 · 1177,2 N = 588,6 N", "0,3 · 1177,2 N = 353,16 N"],
  ["Personen", "588,6 N / 250 N = 2,35 → <strong>3</strong>", "353,16 N / 250 N = 1,41 → <strong>2</strong>"]])}
{box("🧠 Merke", "Zum <strong>Anziehen</strong> braucht man mehr Kraft als zum <strong>Weiterziehen</strong>, weil μ<sub>H</sub> &gt; μ<sub>G</sub>. Lässt man ganz los, bremst die Gleitreibung die Kiste ab.")}
""",
 short=f"""
{schritte([
  "F<sub>N</sub> = F<sub>G</sub> = m · g",
  "Anziehen: F<sub>R,H</sub> = μ<sub>H</sub> · F<sub>N</sub>. Weiterziehen: F<sub>R,G</sub> = μ<sub>G</sub> · F<sub>N</sub>",
  "Durch die Kraft einer Person teilen und <strong>aufrunden</strong>."])}
<p><strong>Beispiel:</strong> 120 kg, μ<sub>H</sub> = 0,5, μ<sub>G</sub> = 0,3, 250 N pro Person → Anziehen 588,6 N (3 Personen), Weiterziehen 353,16 N (2 Personen).</p>
""",
)

M[5] = dict(
 card=("🏎️", "Modul 5: Formel 1 in der Kurve", "Zentripetalkraft und Abtrieb: Warum rutscht der Wagen nicht weg?"),
 card_locked="Gesperrt. Schließen Sie zuerst die Module 1 bis 4 ab.",
 title="Modul 5: Formel 1 in der Kurve",
 full=f"""
<h3>Die Zentripetalkraft</h3>
<p>Ohne Kraft fährt ein Körper geradeaus (Trägheitsgesetz). Damit er eine Kurve fährt, muss eine Kraft zur <strong>Kurvenmitte</strong> wirken. Sie heißt <strong>Zentripetalkraft</strong> F<sub>C</sub>.</p>
{F_C}
{table(["Zeichen", "Bedeutung", "Einheit"], [
  ["F<sub>C</sub>", "Zentripetalkraft", "N"],
  ["m", "Masse des Körpers", "kg"],
  ["v", "Geschwindigkeit", "m/s"],
  ["r", "Radius der Kurve", "m"]])}
{KURVE}
<ul>
<li>Doppelte Geschwindigkeit → <strong>vierfache</strong> Kraft (v steht im Quadrat).</li>
<li>Doppelter Radius → halbe Kraft. Enge Kurven brauchen mehr Kraft.</li>
<li>Doppelte Masse → doppelte Kraft.</li>
</ul>
{box("⚠️ Einheit", "Die Geschwindigkeit muss in <strong>m/s</strong> eingesetzt werden: v in m/s = v in km/h : 3,6. Beispiel: 216 km/h : 3,6 = 60 m/s.")}

<h3>Wer liefert die Zentripetalkraft?</h3>
<p>Beim Auto liefert die <strong>Haftreibung</strong> zwischen Reifen und Straße die Zentripetalkraft. Die Reifen rutschen nicht seitlich weg, solange gilt:</p>
<div class="formula big">F<sub>C</sub> ≤ μ<sub>H</sub> · F<sub>N</sub></div>
<p>Daraus kann man die nötige Normalkraft berechnen: F<sub>N</sub> = F<sub>C</sub> / μ<sub>H</sub>.</p>

<h3>Beispiel</h3>
<p>Ein Wagen (m = 800 kg) fährt mit 216 km/h durch eine Kurve mit r = 80 m. Gummi auf Asphalt: μ<sub>H</sub> = 0,9.</p>
{schritte([
  "v = 216 km/h : 3,6 = 60 m/s",
  f"F<sub>C</sub> = 800 kg · (60 m/s)² / 80 m = 36 000 N",
  f"nötige Normalkraft: F<sub>N</sub> = 36 000 N / 0,9 = 40 000 N",
  f"Gewichtskraft: F<sub>G</sub> = 800 kg · 9,81 m/s² = 7848 N",
  f"Der Rest muss vom Abtrieb kommen: F<sub>Ab</sub> = 40 000 N − 7848 N = 32 152 N"])}
<p>Die Gewichtskraft allein reicht bei weitem nicht. Ohne Flügel würde der Wagen aus der Kurve rutschen. Darum hat ein Formel-1-Wagen so große Flügel.</p>
{box("🧠 Merke", "Die größtmögliche Kurvengeschwindigkeit hängt ab vom <strong>Kurvenradius</strong>, von der <strong>Reibungszahl</strong> (Reifen, Nässe, Temperatur) und von der <strong>Normalkraft</strong> (Gewicht und Abtrieb).")}
""",
 short=f"""
{F_C}
<p>F<sub>C</sub> zeigt zur Kurvenmitte. v in <strong>m/s</strong> einsetzen (km/h : 3,6). Doppelte Geschwindigkeit → vierfache Kraft.</p>
<p>Die Haftreibung der Reifen liefert F<sub>C</sub>: F<sub>C</sub> ≤ μ<sub>H</sub> · F<sub>N</sub>. Nötige Normalkraft: F<sub>N</sub> = F<sub>C</sub> / μ<sub>H</sub>.</p>
<p>Abtrieb: F<sub>Ab</sub> = F<sub>N</sub> − F<sub>G</sub>.</p>
<p><strong>Beispiel:</strong> 800 kg, 216 km/h = 60 m/s, r = 80 m → F<sub>C</sub> = 36 000 N. Mit μ<sub>H</sub> = 0,9: F<sub>N</sub> = 40 000 N, F<sub>G</sub> = 7848 N, F<sub>Ab</sub> = 32 152 N.</p>
""",
)

M[6] = dict(
 card=("📐", "Modul 6: Die schiefe Ebene", "Normalkraft und Hangabtriebskraft mit Sinus und Kosinus."),
 card_locked="Gesperrt. Schließen Sie zuerst die Module 1 bis 4 ab.",
 title="Modul 6: Die schiefe Ebene",
 full=f"""
<h3>Die Gewichtskraft zerlegen</h3>
<p>Ein Körper steht auf einer schrägen Fläche. Diese Fläche heißt <strong>schiefe Ebene</strong>. Ihr Neigungswinkel ist α.</p>
<p>Die Gewichtskraft F<sub>G</sub> zeigt immer senkrecht nach unten. Man zerlegt sie in zwei Teilkräfte:</p>
<ul>
<li><strong>Normalkraft</strong> F<sub>N</sub>: senkrecht zur Ebene. Sie drückt den Körper auf die Fläche.</li>
<li><strong>Hangabtriebskraft</strong> F<sub>H</sub>: parallel zur Ebene. Sie zieht den Körper hangabwärts.</li>
</ul>
{RAMPE}
{F_EBENE}
<p>Der Winkel zwischen F<sub>G</sub> und F<sub>N</sub> ist genauso groß wie der Neigungswinkel α. Deshalb gehört <strong>cos α</strong> zur Normalkraft (Ankathete) und <strong>sin α</strong> zur Hangabtriebskraft (Gegenkathete).</p>

<h3>Einfluss des Winkels</h3>
{table(["Winkel", "Normalkraft F<sub>N</sub>", "Hangabtriebskraft F<sub>H</sub>"], [
  ["0° (eben)", "= F<sub>G</sub>", "0"],
  ["30°", "0,87 · F<sub>G</sub>", "0,5 · F<sub>G</sub>"],
  ["45°", "0,71 · F<sub>G</sub>", "0,71 · F<sub>G</sub>"],
  ["90° (senkrecht)", "0", "= F<sub>G</sub>"]])}
<p>Je steiler die Ebene, desto <strong>größer</strong> wird F<sub>H</sub> und desto <strong>kleiner</strong> wird F<sub>N</sub>.</p>

<h3>Beispiel</h3>
<p>Eine Kiste (m = 10 kg) steht auf einer Rampe mit α = 25°.</p>
{schritte([
  f"F<sub>G</sub> = 10 kg · 9,81 m/s² = 98,1 N",
  f"F<sub>N</sub> = 98,1 N · cos 25° = {de(98.1 * math.cos(math.radians(25)))} N",
  f"F<sub>H</sub> = 98,1 N · sin 25° = {de(98.1 * math.sin(math.radians(25)))} N"])}
{box("⚠️ Taschenrechner", "Stellen Sie den Taschenrechner auf <strong>DEG</strong> (Grad). Im Modus RAD kommen falsche Werte heraus. Probe: cos 0° muss 1 ergeben, sin 30° muss 0,5 ergeben.")}
""",
 short=f"""
{RAMPE}
{F_EBENE}
<p>F<sub>N</sub> steht senkrecht zur Ebene, F<sub>H</sub> zeigt hangabwärts. Steiler → F<sub>H</sub> größer, F<sub>N</sub> kleiner. Bei 45° sind beide gleich.</p>
<p><strong>Beispiel:</strong> 10 kg, α = 25° → F<sub>G</sub> = 98,1 N, F<sub>N</sub> = {de(98.1 * math.cos(math.radians(25)))} N, F<sub>H</sub> = {de(98.1 * math.sin(math.radians(25)))} N. Taschenrechner auf DEG!</p>
""",
)

M[7] = dict(
 card=("🪵", "Modul 7: Challenge – Reibung an der Rampe", "Wie stark muss man ziehen, damit sich die Kiste hangaufwärts bewegt?"),
 card_locked="Gesperrt. Die Challenge zum Schluss.",
 title="Modul 7: Challenge – Reibung an der Rampe",
 full=f"""
<h3>Hinaufziehen</h3>
<p>Eine Kiste soll an einem Seil die Rampe <strong>hinaufgezogen</strong> werden. Das Seil zieht parallel zur Rampe. Zwei Kräfte wirken dagegen, beide hangabwärts:</p>
<ul>
<li>die <strong>Hangabtriebskraft</strong> F<sub>H</sub> = F<sub>G</sub> · sin α,</li>
<li>die <strong>Haftreibungskraft</strong> F<sub>R,H</sub> = μ<sub>H</sub> · F<sub>N</sub> = μ<sub>H</sub> · F<sub>G</sub> · cos α.</li>
</ul>
{RAMPE_ZUG}
<p>Die Kiste setzt sich erst in Bewegung, wenn die Zugkraft beide Kräfte überwindet:</p>
<div class="formula big">F<sub>Z</sub> &gt; F<sub>H</sub> + F<sub>R,H</sub></div>
{box("⚠️ Achtung", "Auf der Rampe ist die Normalkraft <strong>kleiner</strong> als F<sub>G</sub>. Für die Reibung rechnen Sie mit F<sub>N</sub> = F<sub>G</sub> · cos α, nicht mit F<sub>G</sub>.")}

<h3>Beispiel</h3>
<p>Eine Holzkiste (m = 10 kg) auf einer Holzrampe (α = 20°). Holz auf Holz: μ<sub>H</sub> = 0,5.</p>
{schritte([
  "F<sub>G</sub> = 10 kg · 9,81 m/s² = 98,1 N",
  f"F<sub>N</sub> = 98,1 N · cos 20° = {de(98.1 * math.cos(math.radians(20)))} N",
  f"F<sub>H</sub> = 98,1 N · sin 20° = {de(98.1 * math.sin(math.radians(20)))} N",
  f"F<sub>R,H</sub> = 0,5 · {de(98.1 * math.cos(math.radians(20)))} N = {de(0.5 * 98.1 * math.cos(math.radians(20)))} N",
  f"F<sub>Z</sub> &gt; {de(98.1 * math.sin(math.radians(20)))} N + {de(0.5 * 98.1 * math.cos(math.radians(20)))} N = <strong>{de(98.1 * math.sin(math.radians(20)) + 0.5 * 98.1 * math.cos(math.radians(20)))} N</strong>"])}

<h3>Rutscht die Kiste von allein?</h3>
<p>Ohne Seil rutscht die Kiste nur, wenn F<sub>H</sub> größer ist als die größte Haftreibungskraft. An der Grenze gilt F<sub>G</sub> · sin α = μ<sub>H</sub> · F<sub>G</sub> · cos α. Daraus folgt:</p>
<div class="formula big">tan α = μ<sub>H</sub></div>
<p>Bei Holz auf Holz (μ<sub>H</sub> = 0,5) ist der Grenzwinkel etwa 26,6°. Die Masse spielt dabei keine Rolle.</p>
{box("💡 Hinunterziehen", "Soll die Kiste hinuntergezogen werden, hilft die Hangabtriebskraft mit. Dann gilt F<sub>Z</sub> &gt; F<sub>R,H</sub> − F<sub>H</sub>.")}
""",
 short=f"""
{RAMPE_ZUG}
<p>Beim <strong>Hinaufziehen</strong> wirken F<sub>H</sub> und F<sub>R,H</sub> beide hangabwärts:</p>
<div class="formula big">F<sub>Z</sub> &gt; F<sub>G</sub> · sin α + μ<sub>H</sub> · F<sub>G</sub> · cos α</div>
<p><strong>Beispiel:</strong> 10 kg, α = 20°, μ<sub>H</sub> = 0,5 → F<sub>Z</sub> &gt; {de(98.1 * math.sin(math.radians(20)))} N + {de(0.5 * 98.1 * math.cos(math.radians(20)))} N = {de(98.1 * math.sin(math.radians(20)) + 0.5 * 98.1 * math.cos(math.radians(20)))} N.</p>
<p>Von allein rutschen: ab <strong>tan α = μ<sub>H</sub></strong>. Hinunterziehen: F<sub>Z</sub> &gt; F<sub>R,H</sub> − F<sub>H</sub>.</p>
""",
)

# ---------------------------------------------------------------- Seite bauen
TITEL = "Die Reibung"
DATEI = {"full": "reibung_komplett.html", "short": "reibung_kompakt.html", "quiz": "reibung_quiz.html"}


def build(variant):
    titles = {"full": TITEL + " – Lernmodul", "short": TITEL + " – Kompakt", "quiz": TITEL + " – Quiz"}
    sub = {"full": "Haftreibung, Gleitreibung, Normalkraft, Formel 1 in der Kurve und die schiefe Ebene. Lerntexte, Aufgaben und ein Abzeichen am Ende.",
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

    header_hint = ('<div class="book-hint">🧮 Taschenrechner erlaubt (Modus DEG) &nbsp;·&nbsp; g = 9,81 m/s² &nbsp;·&nbsp; '
                   '1 m/s = 3,6 km/h &nbsp;·&nbsp; Reibungszahlen stehen in den Aufgaben</div>')
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
            <h1>🧱 {TITEL} 🏎️</h1>
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
            <h2 id="expert-title" style="margin-top: 20px; color: #f8fafc;">🧱 REIBUNG: HAFT-, GLEIT- UND KURVEN-PROFI 🏎️</h2>
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
