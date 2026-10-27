# -*- coding: utf-8 -*-
"""Erzeugt die drei Varianten des Lernmoduls "Die Kraft – eine gerichtete Größe" (FOS 12) nach dem Aufbau der C#-Vorlage."""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO, "kraft-vektoren")
CSS_BASE = open(os.path.join(HERE, "..", "stil_vorlage.css"), encoding="utf-8").read()
ENGINE = open(os.path.join(HERE, "..", "engine.js"), encoding="utf-8").read()
ENGINE_EXTRA = open(os.path.join(HERE, "..", "engine_extra.js"), encoding="utf-8").read()
ENGINE_VEKTOR = open(os.path.join(HERE, "..", "engine_vektor.js"), encoding="utf-8").read()
TASKS_JS = open(os.path.join(HERE, "tasks.js"), encoding="utf-8").read()

# gemeinsames CSS aus dem Modul "Kraft und Beschleunigung" übernehmen (gleiches Aussehen)
KB = open(os.path.join(HERE, "..", "kraft-beschleunigung", "build.py"), encoding="utf-8").read()
css_extra = re.search(r'css \+= """(.*?)"""', KB, re.S).group(1)
css = CSS_BASE.replace("grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));",
                       "grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));")
css += css_extra + """
        .vec { position: relative; display: inline-block; font-style: italic; }
        .vec::after { content: "→"; position: absolute; left: -1px; right: 0; top: -0.72em; font-size: 0.75em; font-style: normal; text-align: center; }
        .quiz-question ul { margin: 6px 0 4px 26px; }
        .quiz-question li { margin: 2px 0; }
        .sketch svg { max-width: 460px; }
        .sketch.wide svg { max-width: 560px; }
        .vec-area svg { max-width: 460px; touch-action: manipulation; }
        .vec-read li { font-weight: bold; }
        .quad { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-width: 460px; margin: 15px auto; }
        .quad div { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px; text-align: center; color: #e2e8f0; line-height: 1.6; }
        .quad strong { color: #7dd3fc; }
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
    s = f"{x:.{dec}f}".replace("-", "−").replace(".", ",")
    return s


V = '<span class="vec">F</span>'                       # Kraftvektor
def Vi(i): return f'<span class="vec">F</span><sub>{i}</sub>'
def Fi(i): return f'F<sub>{i}</sub>'


# ---------------------------------------------------------------- SVG-Skizzen
SF = 'font-family="Segoe UI, Arial"'
ARR = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>'


class K:
    def __init__(self, mn, mx, major, minor=None, size=400, ux="", uy="", labstep=None, aria="Koordinatensystem"):
        self.mn, self.mx, self.W, P = mn, mx, size, 34
        self.P = P
        self.sc = (size - 2 * P) / (mx - mn)
        s = [f'<svg viewBox="0 0 {size} {size}" role="img" aria-label="{aria}">', ARR]
        minor = minor or major
        k = 0
        while mn + k * minor <= mx + 1e-9:
            v = mn + k * minor
            col = "#334155" if abs(round(v / major) * major - v) < 1e-9 else "#1f2b3e"
            s.append(f'<line x1="{self.X(v):.1f}" y1="{self.Y(mn):.1f}" x2="{self.X(v):.1f}" y2="{self.Y(mx):.1f}" stroke="{col}" stroke-width="1"/>')
            s.append(f'<line x1="{self.X(mn):.1f}" y1="{self.Y(v):.1f}" x2="{self.X(mx):.1f}" y2="{self.Y(v):.1f}" stroke="{col}" stroke-width="1"/>')
            k += 1
        s.append(f'<line x1="{self.X(mn):.1f}" y1="{self.Y(0):.1f}" x2="{self.X(mx) + 14:.1f}" y2="{self.Y(0):.1f}" stroke="#94a3b8" stroke-width="2" marker-end="url(#ah)"/>')
        s.append(f'<line x1="{self.X(0):.1f}" y1="{self.Y(mn):.1f}" x2="{self.X(0):.1f}" y2="{self.Y(mx) - 14:.1f}" stroke="#94a3b8" stroke-width="2" marker-end="url(#ah)"/>')
        ls = labstep or major
        v = math.ceil(mn / ls) * ls
        while v <= mx + 1e-9:
            if abs(v) > 1e-9:
                t = f"{v:g}".replace("-", "−").replace(".", ",")
                s.append(f'<text x="{self.X(v):.1f}" y="{self.Y(0) + 17:.1f}" fill="#94a3b8" font-size="12" text-anchor="middle" {SF}>{t}</text>')
                s.append(f'<text x="{self.X(0) - 6:.1f}" y="{self.Y(v) + 4:.1f}" fill="#94a3b8" font-size="12" text-anchor="end" {SF}>{t}</text>')
            v += ls
        if ux:
            s.append(f'<text x="{size - 4}" y="{self.Y(0) - 8:.1f}" fill="#cbd5e1" font-size="13" text-anchor="end" {SF}>{ux}</text>')
        if uy:
            s.append(f'<text x="{self.X(0) + 8:.1f}" y="16" fill="#cbd5e1" font-size="13" {SF}>{uy}</text>')
        self.s = s

    def X(self, v): return self.P + (v - self.mn) * self.sc
    def Y(self, v): return self.W - self.P - (v - self.mn) * self.sc

    def pfeil(self, x0, y0, x1, y1, col, w=4, dash=False):
        d = ' stroke-dasharray="6 5"' if dash else ""
        self.s.append(f'<line x1="{self.X(x0):.1f}" y1="{self.Y(y0):.1f}" x2="{self.X(x1):.1f}" y2="{self.Y(y1):.1f}" stroke="{col}" stroke-width="{w}"{d} marker-end="url(#ah)"/>')

    def strich(self, x0, y0, x1, y1, col="#94a3b8"):
        self.s.append(f'<line x1="{self.X(x0):.1f}" y1="{self.Y(y0):.1f}" x2="{self.X(x1):.1f}" y2="{self.Y(y1):.1f}" stroke="{col}" stroke-width="1.5" stroke-dasharray="5 4"/>')

    def text(self, x, y, t, col, size=15, anchor="middle", bold=True):
        b = ' font-weight="bold"' if bold else ""
        self.s.append(f'<text x="{self.X(x):.1f}" y="{self.Y(y) + 5:.1f}" fill="{col}" font-size="{size}"{b} text-anchor="{anchor}" {SF}>{t}</text>')

    def bogen(self, a, r, col, txt="", a0=0.0, rtxt=None):
        cx, cy = self.X(0), self.Y(0)
        p = lambda d: (cx + r * math.cos(math.radians(d)), cy - r * math.sin(math.radians(d)))
        (x1, y1), (x2, y2) = p(a0), p(a)
        large = 1 if ((a - a0) % 360) > 180 else 0
        self.s.append(f'<path d="M{x1:.1f},{y1:.1f} A{r},{r} 0 {large} 0 {x2:.1f},{y2:.1f}" fill="none" stroke="{col}" stroke-width="2.5"/>')
        if txt:
            m = a0 + ((a - a0) % 360) / 2
            rr = rtxt or r + 16
            tx, ty = cx + rr * math.cos(math.radians(m)), cy - rr * math.sin(math.radians(m))
            self.s.append(f'<text x="{tx:.1f}" y="{ty + 5:.1f}" fill="{col}" font-size="15" font-weight="bold" text-anchor="middle" {SF}>{txt}</text>')

    def svg(self, caption="", wide=False):
        self.s.append(f'<circle cx="{self.X(0):.1f}" cy="{self.Y(0):.1f}" r="4" fill="#f8fafc"/></svg>')
        cap = f'<p class="caption">{caption}</p>' if caption else ""
        return f'<div class="sketch{" wide" if wide else ""}">' + "".join(self.s) + cap + "</div>"


def sub(b, i): return f'{b}<tspan font-size="72%" dy="4">{i}</tspan>'
def komp(F, a): return F * math.cos(math.radians(a)), F * math.sin(math.radians(a))


def sk_quadranten():
    k = K(-500, 500, 100, size=380, ux="x", uy="y", labstep=200, aria="Koordinatensystem mit Quadranten und einer Kraft von 400 N unter 120 Grad")
    for (x, y, t) in [(330, 400, "I"), (-330, 400, "II"), (-330, -420, "III"), (330, -420, "IV")]:
        k.text(x, y, t, "#475569", 24)
    k.text(330, 320, "0° bis 90°", "#64748b", 12, bold=False)
    k.text(-330, 320, "90° bis 180°", "#64748b", 12, bold=False)
    k.text(-330, -340, "180° bis 270°", "#64748b", 12, bold=False)
    k.text(330, -340, "270° bis 360°", "#64748b", 12, bold=False)
    x, y = komp(400, 120)
    k.bogen(120, 40, "#fbbf24", "α = 120°", rtxt=62)
    k.pfeil(0, 0, x, y, "#f87171", 5)
    k.text(x - 20, y + 30, "F = 400 N", "#f87171", 15)
    return k.svg("Die Kraft zeigt nach links oben. Sie liegt im II. Quadranten. Der Winkel wird ab der positiven x-Achse gegen den Uhrzeigersinn gemessen.")


def sk_zerlegen():
    k = K(-400, 600, 100, size=380, ux=sub("F", "x") + " in N", uy=sub("F", "y") + " in N", labstep=200,
          aria="Kraft 500 N unter 115 Grad mit ihren Komponenten")
    x, y = komp(500, 115)
    k.strich(x, 0, x, y)
    k.strich(0, y, x, y)
    k.pfeil(0, 0, x, 0, "#f87171", 5)
    k.pfeil(0, 0, 0, y, "#4ade80", 5)
    k.pfeil(0, 0, x, y, "#f8fafc", 4)
    k.bogen(115, 36, "#fbbf24", "α", rtxt=50)
    k.text(x / 2, -75, sub("F", "x") + " = −211,31 N", "#f87171", 14)
    k.text(20, y / 2 + 40, sub("F", "y") + " = 453,15 N", "#4ade80", 14, anchor="start")
    k.text(x - 10, y + 40, "F = 500 N", "#f8fafc", 15)
    return k.svg("F = 500 N, α = 115° (II. Quadrant). Die x-Komponente ist negativ, die y-Komponente positiv.")


def sk_hilfswinkel():
    x, y = -163.69, 135.17
    k = K(-300, 300, 100, size=360, ux=sub("F", "x") + " in N", uy=sub("F", "y") + " in N",
          aria="Kraft im II. Quadranten mit Hilfswinkel und Winkel zur x-Achse")
    k.strich(x, 0, x, y)
    k.bogen(140.45, 30, "#fbbf24", "α", rtxt=44)
    k.bogen(180, 70, "#38bdf8", "α′", a0=140.45, rtxt=88)
    k.pfeil(0, 0, x, y, "#f8fafc", 5)
    k.text(x - 10, y + 30, "F = 212,29 N", "#f8fafc", 14)
    return k.svg("α′ liegt zwischen Pfeil und x-Achse (blau). α wird immer ab der positiven x-Achse gemessen (gelb): α = 180° − α′.")


KR = [(500, 115, "#38bdf8"), (260, 195, "#f59e0b"), (390, 320, "#4ade80")]


def sk_drei():
    k = K(-600, 600, 200, 100, size=380, ux=sub("F", "x") + " in N", uy=sub("F", "y") + " in N",
          aria="Drei Kräfte an einem Punkt und ihre Resultierende")
    sx = sy = 0
    for j, (F, a, col) in enumerate(KR):
        x, y = komp(F, a)
        sx, sy = sx + x, sy + y
        k.pfeil(0, 0, x, y, col, 4)
        k.text(x * 1.13, y * 1.13, "F" + "₁₂₃"[j], col, 16)
    k.pfeil(0, 0, sx, sy, "#c084fc", 6)
    k.text(sx - 40, sy + 45, sub("F", "res"), "#c084fc", 16)
    return k.svg("Drei Kräfte greifen in einem Punkt an. Sie wirken zusammen wie eine einzige Kraft: die Resultierende (lila).")


def sk_polygon():
    k = K(-500, 500, 100, size=380, ux="x in N", uy="y in N", labstep=200, aria="Kräftepolygon: Pfeile werden aneinandergehängt")
    px = py = 0
    for j, (F, a, col) in enumerate(KR):
        x, y = komp(F, a)
        k.pfeil(px, py, px + x, py + y, col, 4)
        k.text(px + x / 2 + (30 if j == 1 else -30), py + y / 2, "F" + "₁₂₃"[j], col, 16)
        px, py = px + x, py + y
    k.pfeil(0, 0, px, py, "#c084fc", 6, dash=True)
    k.text(px / 2 + 10, py / 2 - 40, sub("F", "res"), "#c084fc", 16)
    return k.svg("Kräftepolygon: Jeder Pfeil beginnt an der Spitze des vorherigen. Die Resultierende geht vom Anfang bis zur letzten Spitze.")


def sk_gleichgewicht():
    k = K(-400, 400, 100, size=360, ux=sub("F", "x") + " in N", uy=sub("F", "y") + " in N", labstep=200,
          aria="Zwei Kräfte, ihre Resultierende und die Gleichgewichtskraft")
    a = komp(300, 30)
    b = komp(200, 150)
    r = (a[0] + b[0], a[1] + b[1])
    k.pfeil(0, 0, *a, "#38bdf8", 4)
    k.text(a[0] + 25, a[1] + 15, "F₁", "#38bdf8", 16)
    k.pfeil(0, 0, *b, "#f59e0b", 4)
    k.text(b[0] - 25, b[1] + 15, "F₂", "#f59e0b", 16)
    k.pfeil(0, 0, *r, "#c084fc", 4, dash=True)
    k.text(r[0] + 45, r[1] + 10, sub("F", "res"), "#c084fc", 16)
    k.pfeil(0, 0, -r[0], -r[1], "#f472b6", 5)
    k.text(-r[0] + 35, -r[1] - 10, "F₃", "#f472b6", 16)
    return k.svg("F₃ (pink) ist genauso groß wie die Resultierende von F₁ und F₂, zeigt aber in die Gegenrichtung. Zusammen ist die Summe null.")


def sk_rakete():
    k = K(-3.5, 3.5, 1, 0.25, size=420, ux=sub("F", "x") + " in MN", uy=sub("F", "y") + " in MN",
          aria="Landende Rakete mit Windkraft nach rechts und Gewichtskraft nach unten")
    X, Y = k.X, k.Y
    P = lambda pts: " ".join(f"{X(a):.1f},{Y(b):.1f}" for a, b in pts)
    k.s.append('<g fill="#0f172a" stroke="#e2e8f0" stroke-width="2.5" stroke-linejoin="round" opacity="0.9">')
    k.s.append(f'<polygon points="{P([(-0.18, -1.05), (0.18, -1.05), (0.1, -0.75), (-0.1, -0.75)])}"/>')
    k.s.append(f'<polygon points="{P([(-0.3, -0.35), (-0.55, -0.7), (-0.55, -0.95), (-0.3, -0.75)])}"/>')
    k.s.append(f'<polygon points="{P([(0.3, -0.35), (0.55, -0.7), (0.55, -0.95), (0.3, -0.75)])}"/>')
    k.s.append(f'<path d="M{X(0):.1f},{Y(0.92):.1f} C{X(0.32):.1f},{Y(0.55):.1f} {X(0.36):.1f},{Y(-0.3):.1f} {X(0.22):.1f},{Y(-0.75):.1f} '
               f'L{X(-0.22):.1f},{Y(-0.75):.1f} C{X(-0.36):.1f},{Y(-0.3):.1f} {X(-0.32):.1f},{Y(0.55):.1f} {X(0):.1f},{Y(0.92):.1f} Z"/>')
    k.s.append(f'<circle cx="{X(0):.1f}" cy="{Y(0.3):.1f}" r="{X(0.12) - X(0):.1f}"/></g>')
    k.pfeil(0, 0, 0.8, 0, "#f87171", 4)
    k.text(0.75, 0.32, sub("F", "W") + " = 0,8 MN", "#f87171", 14, anchor="start")
    k.pfeil(0, 0, 0, -2.8, "#f87171", 4)
    k.text(0.2, -2.6, sub("F", "G") + " = 2,8 MN", "#f87171", 14, anchor="start")
    return k.svg("Kurz vor der Landung: Der Seitenwind drückt mit 0,8 MN nach rechts, die Gewichtskraft zieht mit 2,8 MN nach unten. Beide greifen im Schwerpunkt an.")


SK_QUAD = sk_quadranten()
SK_ZERL = sk_zerlegen()
SK_HILF = sk_hilfswinkel()
SK_DREI = sk_drei()
SK_POLY = sk_polygon()
SK_GG = sk_gleichgewicht()
SK_RAK = sk_rakete()

KOMP_FORMELN = f'<div class="formula big">{Fi("x")} = F · cos α &nbsp;&nbsp;&nbsp; {Fi("y")} = F · sin α</div>'
BETRAG_FORMEL = f'<div class="formula big">F = √({Fi("x")}² + {Fi("y")}²) &nbsp;&nbsp;&nbsp; α′ = arctan {frac("|" + Fi("y") + "|", "|" + Fi("x") + "|")}</div>'
QUAD_REGELN = '''<div class="quad">
<div><strong>II. Quadrant</strong><br>F<sub>x</sub> −, F<sub>y</sub> +<br>α = 180° − α′</div>
<div><strong>I. Quadrant</strong><br>F<sub>x</sub> +, F<sub>y</sub> +<br>α = α′</div>
<div><strong>III. Quadrant</strong><br>F<sub>x</sub> −, F<sub>y</sub> −<br>α = 180° + α′</div>
<div><strong>IV. Quadrant</strong><br>F<sub>x</sub> +, F<sub>y</sub> −<br>α = 360° − α′</div>
</div>'''


def beispiel_drei():
    rows, sx, sy = [], 0, 0
    for j, (F, a, _) in enumerate(KR):
        x, y = komp(F, a)
        x, y = round(x, 2), round(y, 2)
        sx, sy = sx + x, sy + y
        rows.append([Fi(j + 1), f"{F} N", f"{a}°", f"{de(x)} N", f"{de(y)} N"])
    rows.append(["<strong>Summe</strong>", "", "", f"<strong>{de(sx)} N</strong>", f"<strong>{de(sy)} N</strong>"])
    return table(["Kraft", "Betrag", "Winkel", "x-Komponente", "y-Komponente"], rows), sx, sy


BSP_TAB, BSX, BSY = beispiel_drei()
BF = math.hypot(BSX, BSY)
BH = math.degrees(math.atan(abs(BSY) / abs(BSX)))
BA = 180 - BH

# Gleichgewichts-Beispiel
GA, GB = komp(300, 30), komp(200, 150)
GRX, GRY = round(GA[0], 2) + round(GB[0], 2), round(GA[1], 2) + round(GB[1], 2)
GRF = math.hypot(GRX, GRY)
GRA = math.degrees(math.atan2(GRY, GRX)) % 360

# ---------------------------------------------------------------- Inhalte
M = {}

M[1] = dict(
 card=("🧭", "Modul 1: Die Kraft als Vektor", "Betrag, Richtung, Angriffspunkt. Und: Wie gibt man eine Richtung mit einem Winkel an?"),
 title="Modul 1: Die Kraft als Vektor",
 full=f"""
<h3>Skalare und Vektoren</h3>
<p>Manche Größen sind schon mit einer Zahl und einer Einheit vollständig beschrieben. Beispiel: Die Masse eines Rucksacks ist 8 kg. Solche Größen heißen <strong>Skalare</strong>.</p>
<p>Bei anderen Größen fehlt dann noch etwas Wichtiges: die <strong>Richtung</strong>. „Ich drücke mit 300 N“ reicht nicht. Nach oben? Nach links? Solche Größen heißen <strong>Vektoren</strong>.</p>
{table(["Skalare (nur Betrag)", "Vektoren (Betrag und Richtung)"], [
  ["Masse, Zeit, Temperatur", "Kraft, Gewichtskraft"],
  ["Volumen, Dichte", "Geschwindigkeit, Beschleunigung"]])}

<h3>Die drei Bestimmungsstücke einer Kraft</h3>
<p>Eine Kraft ist erst vollständig beschrieben, wenn man drei Dinge kennt:</p>
{table(["Bestimmungsstück", "Frage", "Im Pfeil"], [
  ["Betrag", "Wie stark?", "Länge des Pfeils"],
  ["Richtung", "Wohin?", "Pfeilspitze"],
  ["Angriffspunkt", "Wo greift sie an?", "Anfang des Pfeils"]])}
<p>Den Vektor schreibt man mit Pfeil: {V}. Ohne Pfeil meint man nur den Betrag: F = 400 N.</p>
{box("📏 Kräftemaßstab", "Damit man einen Pfeil zeichnen kann, legt man einen Maßstab fest. Beispiel: 1 cm ≙ 100 N. Eine Kraft von 400 N ist dann 4 cm lang.")}

<h3>Die Richtung als Winkel</h3>
<p>Im Koordinatensystem gibt man die Richtung mit dem <strong>Winkel α</strong> an. Dabei gilt immer:</p>
<ul>
<li>Man startet an der <strong>positiven x-Achse</strong> (nach rechts).</li>
<li>Man dreht <strong>gegen den Uhrzeigersinn</strong>.</li>
<li>α liegt zwischen 0° und 360°.</li>
</ul>
{SK_QUAD}
{table(["Richtung", "Winkel α"], [
  ["nach rechts", "0°"], ["nach oben", "90°"], ["nach links", "180°"], ["nach unten", "270°"]])}
{box("🧠 Merke", "Eine Kraft ist ein <strong>Vektor</strong>. Sie hat Betrag, Richtung und Angriffspunkt. Die Richtung ist der Winkel α zur positiven x-Achse, gemessen gegen den Uhrzeigersinn.")}
""",
 short=f"""
<p><strong>Skalare</strong> haben nur einen Betrag (Masse, Zeit). <strong>Vektoren</strong> haben Betrag und Richtung (Kraft, Geschwindigkeit).</p>
<p>Eine Kraft {V} hat <strong>Betrag</strong> (Pfeillänge), <strong>Richtung</strong> (Pfeilspitze) und <strong>Angriffspunkt</strong> (Pfeilanfang). Maßstab z. B. 1 cm ≙ 100 N.</p>
{SK_QUAD}
<p><strong>Winkel α:</strong> ab der positiven x-Achse, gegen den Uhrzeigersinn, 0° bis 360°. Rechts 0°, oben 90°, links 180°, unten 270°.</p>
""",
)

M[2] = dict(
 card=("📐", "Modul 2: Eine Kraft zerlegen", "Jede Kraft lässt sich in eine x- und eine y-Komponente zerlegen."),
 title="Modul 2: Eine Kraft zerlegen",
 full=f"""
<h3>Die Idee</h3>
<p>Eine schräge Kraft wirkt gleichzeitig ein Stück nach links oder rechts und ein Stück nach oben oder unten. Man kann sie deshalb durch zwei Kräfte ersetzen:</p>
<ul>
<li>die <strong>x-Komponente</strong> {Fi("x")} (waagerecht),</li>
<li>die <strong>y-Komponente</strong> {Fi("y")} (senkrecht).</li>
</ul>
<p>Zusammen haben beide genau dieselbe Wirkung wie die schräge Kraft.</p>
{SK_ZERL}

<h3>Die Formeln</h3>
{KOMP_FORMELN}
<p>F ist der Betrag der Kraft. α ist der Winkel zur positiven x-Achse.</p>
{box("💡 Eselsbrücke", "<strong>c</strong>os gehört zur x-Achse, die Seite direkt am Winkel. <strong>s</strong>in gehört zur y-Achse, die Seite gegenüber vom Winkel.")}

<h3>Die Vorzeichen</h3>
<p>Komponenten können negativ sein:</p>
<ul>
<li>{Fi("x")} &gt; 0: nach rechts. &nbsp;{Fi("x")} &lt; 0: nach links.</li>
<li>{Fi("y")} &gt; 0: nach oben. &nbsp;{Fi("y")} &lt; 0: nach unten.</li>
</ul>
{table(["Quadrant", "Winkel", "F<sub>x</sub>", "F<sub>y</sub>"], [
  ["I.", "0° bis 90°", "+", "+"], ["II.", "90° bis 180°", "−", "+"],
  ["III.", "180° bis 270°", "−", "−"], ["IV.", "270° bis 360°", "+", "−"]])}
<p>Setzen Sie den Winkel α von 0° bis 360° ein. Dann liefert der Taschenrechner die Vorzeichen automatisch.</p>

<h3>Beispiel</h3>
<p>F = 500 N, α = 115°.</p>
<div class="formula">{Fi("x")} = 500 N · cos 115° = −211,31 N<br>{Fi("y")} = 500 N · sin 115° = 453,15 N</div>
<p>Kontrolle: 115° liegt im II. Quadranten. Also {Fi("x")} negativ, {Fi("y")} positiv. <span class="ok">✓</span></p>
{box("⚠️ Typische Fehler", "Taschenrechner im Modus <strong>RAD</strong> statt <strong>DEG</strong>. sin und cos vertauscht. Vorzeichen nicht mit dem Quadranten kontrolliert.")}
""",
 short=f"""
{KOMP_FORMELN}
{SK_ZERL}
<p>Vorzeichen: rechts und oben positiv, links und unten negativ. I.: + / +, II.: − / +, III.: − / −, IV.: + / −.</p>
<p><strong>Beispiel:</strong> 500 N, 115°: {Fi("x")} = −211,31 N, {Fi("y")} = 453,15 N. Taschenrechner auf <strong>DEG</strong>!</p>
""",
)

M[3] = dict(
 card=("🔄", "Modul 3: Betrag und Winkel berechnen", "Der umgekehrte Weg: Aus F<sub>x</sub> und F<sub>y</sub> wird wieder Betrag und Winkel."),
 title="Modul 3: Betrag und Winkel berechnen",
 full=f"""
<h3>Der umgekehrte Weg</h3>
<p>Oft kennt man die Komponenten {Fi("x")} und {Fi("y")}. Gesucht sind dann Betrag F und Winkel α.</p>

<h3>Der Betrag</h3>
<p>{Fi("x")}, {Fi("y")} und F bilden ein rechtwinkliges Dreieck. F ist die Hypotenuse. Also gilt der <strong>Satz des Pythagoras</strong>:</p>
<div class="formula big">F = √({Fi("x")}² + {Fi("y")}²)</div>
<p>Das Vorzeichen spielt hier keine Rolle, denn beim Quadrieren wird alles positiv.</p>

<h3>Der Winkel in zwei Schritten</h3>
<p>Der Taschenrechner liefert bei arctan nur Winkel zwischen −90° und +90°. Er weiß nicht, in welchem Quadranten die Kraft liegt. Deshalb geht man so vor:</p>
<ol class="schritte">
<li><strong>Quadrant bestimmen</strong> aus den Vorzeichen von {Fi("x")} und {Fi("y")}.</li>
<li><strong>Hilfswinkel α′ berechnen</strong> mit den Beträgen (ohne Minuszeichen): α′ = arctan({frac("|" + Fi("y") + "|", "|" + Fi("x") + "|")}). α′ ist der spitze Winkel zwischen Pfeil und x-Achse.</li>
<li><strong>α mit der Quadranten-Regel</strong> berechnen.</li>
</ol>
{QUAD_REGELN}
{SK_HILF}

<h3>Beispiel</h3>
<p>{Fi("x")} = −163,69 N, {Fi("y")} = 135,17 N.</p>
{table(["Schritt", "Rechnung"], [
  ["Betrag", "F = √(163,69² + 135,17²) N = 212,29 N"],
  ["① Quadrant", "F<sub>x</sub> negativ, F<sub>y</sub> positiv → II. Quadrant"],
  ["② Hilfswinkel", "α′ = arctan(135,17 / 163,69) = 39,55°"],
  ["③ Winkel", "α = 180° − 39,55° = 140,45°"]])}
{box("⚠️ Achtung", "Tippt man arctan(135,17 / −163,69) direkt ein, zeigt der Rechner −39,55°. Das wäre der IV. Quadrant, also falsch. Darum immer zuerst den Quadranten bestimmen.")}
{box("💡 Sonderfälle", "Ist F<sub>x</sub> = 0, zeigt die Kraft genau nach oben (90°) oder unten (270°). Ist F<sub>y</sub> = 0, zeigt sie nach rechts (0°) oder links (180°).")}
""",
 short=f"""
{BETRAG_FORMEL}
<p>1. Quadrant aus den Vorzeichen. 2. Hilfswinkel α′ mit Beträgen. 3. Quadranten-Regel:</p>
{QUAD_REGELN}
<p><strong>Beispiel:</strong> {Fi("x")} = −163,69 N, {Fi("y")} = 135,17 N → F = 212,29 N, II. Quadrant, α′ = 39,55°, α = 140,45°.</p>
<p>Der Rechner liefert bei arctan nur −90° bis +90°. Nie ungeprüft übernehmen!</p>
""",
)

M[4] = dict(
 card=("➕", "Modul 4: Kräfte addieren", "Mehrere Kräfte greifen an einem Punkt an. Wie groß ist die resultierende Kraft?"),
 card_locked="Gesperrt. Schließen Sie zuerst die Module 1 bis 3 ab.",
 title="Modul 4: Kräfte addieren",
 full=f"""
<h3>Die resultierende Kraft</h3>
<p>Sie haben die Fortgeschrittenen-Module freigeschaltet! Greifen mehrere Kräfte an einem Punkt an, wirken sie zusammen wie <strong>eine einzige Kraft</strong>. Diese Kraft heißt <strong>resultierende Kraft</strong> {Vi("res")}.</p>
{SK_DREI}

<h3>Zeichnerisch: Pfeile aneinanderhängen</h3>
<p>Man hängt die Kraftpfeile hintereinander: Der nächste Pfeil beginnt an der Spitze des vorherigen. Die Resultierende geht vom ersten Anfang bis zur letzten Spitze. Das nennt man <strong>Kräftepolygon</strong>. Bei nur zwei Kräften entsteht ein <strong>Kräfteparallelogramm</strong>.</p>
{SK_POLY}

<h3>Rechnerisch: die Komponenten-Methode</h3>
<ol class="schritte">
<li>Jede Kraft in {Fi("x")} und {Fi("y")} zerlegen.</li>
<li>Alle x-Komponenten addieren: {Fi("res,x")} = {Fi("1,x")} + {Fi("2,x")} + {Fi("3,x")}</li>
<li>Alle y-Komponenten addieren: {Fi("res,y")} = {Fi("1,y")} + {Fi("2,y")} + {Fi("3,y")}</li>
<li>Betrag und Winkel von {Fi("res")} berechnen (wie in Modul 3).</li>
</ol>

<h3>Beispiel</h3>
{BSP_TAB}
<p>{Fi("res")} = √({de(BSX)}² + {de(BSY)}²) N = <strong>{de(BF)} N</strong>.</p>
<p>II. Quadrant, α′ = arctan({de(BSY)} / {de(abs(BSX))}) = {de(BH)}°, also α<sub>res</sub> = 180° − {de(BH)}° = <strong>{de(BA)}°</strong>.</p>
{box("⚠️ Beträge nie einfach addieren!", f"500 N + 260 N + 390 N = 1150 N ist <strong>falsch</strong>. Die Kräfte zeigen in verschiedene Richtungen und heben sich teilweise auf. Richtig sind {de(BF)} N. Beträge darf man nur addieren, wenn alle Kräfte in dieselbe Richtung zeigen.")}
""",
 short=f"""
<p>Mehrere Kräfte an einem Punkt wirken wie eine einzige Kraft: die <strong>Resultierende</strong> {Vi("res")}.</p>
{SK_DREI}
<p><strong>Komponenten-Methode:</strong> 1. Alle Kräfte zerlegen. 2. x-Komponenten addieren. 3. y-Komponenten addieren. 4. Betrag und Winkel berechnen.</p>
{BSP_TAB}
<p>{Fi("res")} = {de(BF)} N, α<sub>res</sub> = {de(BA)}°. <strong>Beträge nie einfach addieren!</strong></p>
""",
)

M[5] = dict(
 card=("⚖️", "Modul 5: Kräftegleichgewicht", "Wann heben sich Kräfte auf? Die Gleichgewichtskraft bestimmen."),
 card_locked="Gesperrt. Danach geht es um das Kräftegleichgewicht.",
 title="Modul 5: Kräftegleichgewicht",
 full=f"""
<h3>Wann herrscht Gleichgewicht?</h3>
<p>Ein Körper ist im <strong>Kräftegleichgewicht</strong>, wenn die resultierende Kraft null ist. Das heißt: Die Summe aller x-Komponenten ist null. Und die Summe aller y-Komponenten ist null.</p>
<div class="formula big">Σ {Fi("x")} = 0 &nbsp;&nbsp; und &nbsp;&nbsp; Σ {Fi("y")} = 0</div>
<p>Es können dabei viele Kräfte wirken. Sie heben sich nur gegenseitig auf.</p>
{box("🧠 Erinnerung an Newton", "Ist die resultierende Kraft null, ändert sich der Bewegungszustand nicht (1. Newtonsches Gesetz). Ein ruhender Körper bleibt in Ruhe. Ein bewegter Körper bewegt sich gleichförmig geradeaus weiter.")}

<h3>Die Gleichgewichtskraft</h3>
<p>Sind die Kräfte nicht im Gleichgewicht, kann man eine weitere Kraft hinzufügen. Sie soll die Resultierende genau aufheben. Diese Kraft heißt <strong>Gleichgewichtskraft</strong>. Sie ist:</p>
<ul>
<li>genauso groß wie die Resultierende,</li>
<li>genau entgegengesetzt gerichtet.</li>
</ul>
{table(["", "Resultierende", "Gleichgewichtskraft"], [
  ["x-Komponente", "F<sub>res,x</sub>", "−F<sub>res,x</sub>"],
  ["y-Komponente", "F<sub>res,y</sub>", "−F<sub>res,y</sub>"],
  ["Betrag", "F<sub>res</sub>", "F<sub>res</sub> (gleich)"],
  ["Winkel", "α<sub>res</sub>", "α<sub>res</sub> ± 180°"]])}
{SK_GG}

<h3>Beispiel</h3>
<p>{Fi(1)} = 300 N bei 30° und {Fi(2)} = 200 N bei 150°. Gesucht ist die Gleichgewichtskraft {Fi(3)}.</p>
{table(["Schritt", "Rechnung"], [
  ["Resultierende x", f"259,81 N + (−173,21 N) = {de(GRX)} N"],
  ["Resultierende y", f"150,00 N + 100,00 N = {de(GRY)} N"],
  ["Gleichgewichtskraft", f"F<sub>3</sub> = ({de(-GRX)} N | {de(-GRY)} N)"],
  ["Betrag", f"F<sub>3</sub> = {de(GRF)} N"],
  ["Winkel", f"α<sub>res</sub> = {de(GRA, 1)}° → α<sub>3</sub> = {de(GRA, 1)}° + 180° = {de(GRA + 180, 1)}°"]])}
""",
 short=f"""
<div class="formula big">Gleichgewicht: Σ {Fi("x")} = 0 und Σ {Fi("y")} = 0</div>
<p>Dann ruht der Körper oder bewegt sich gleichförmig geradeaus (1. Newtonsches Gesetz).</p>
<p><strong>Gleichgewichtskraft:</strong> gleich groß wie die Resultierende, Gegenrichtung. Komponenten mit umgekehrtem Vorzeichen, Winkel ± 180°.</p>
{SK_GG}
<p><strong>Beispiel:</strong> 300 N / 30° und 200 N / 150° → Resultierende ({de(GRX)} N | {de(GRY)} N) → F<sub>3</sub> = ({de(-GRX)} N | {de(-GRY)} N), {de(GRF)} N, {de(GRA + 180, 1)}°.</p>
""",
)

M[6] = dict(
 card=("🚀", "Modul 6: Challenge – Die selbstlandende Rakete", "Wie muss das Triebwerk eingestellt werden, damit die Rakete weich landet?"),
 card_locked="Gesperrt. Die Challenge zum Schluss.",
 title="Modul 6: Challenge – Die selbstlandende Rakete",
 full=f"""
<h3>Die Situation</h3>
<p>Moderne Raketenstufen fliegen nach dem Start zurück und landen senkrecht auf einer Plattform. So kann man sie wiederverwenden. Kurz vor der Landung wirken auf die Rakete zwei Kräfte:</p>
<ul>
<li>die <strong>Gewichtskraft</strong> {Vi("G")} = 2,8 MN nach unten,</li>
<li>ein <strong>Seitenwind</strong> {Vi("W")} = 0,8 MN nach rechts.</li>
</ul>
{SK_RAK}
<p>Das Triebwerk lässt sich schwenken. Für eine weiche Landung soll die <strong>resultierende Kraft null</strong> sein. Die Triebwerkskraft {Vi("T")} muss also die Gleichgewichtskraft zu {Vi("G")} und {Vi("W")} sein.</p>
{box("🔢 Große Einheiten", "1 MN (Meganewton) = 1 000 000 N. Zum Rechnen mit F = m · g setzen Sie Newton ein.")}

<h3>Ihr Plan</h3>
<ol class="schritte">
<li>Die Masse der Rakete aus der Gewichtskraft berechnen: m = F<sub>G</sub> / g.</li>
<li>Gleichgewicht ansetzen: Welche Komponenten braucht {Vi("T")}?</li>
<li>{Vi("T")} im Schwerpunkt einzeichnen.</li>
<li>Den Betrag von {Vi("T")} berechnen.</li>
<li>Den Winkel α von {Vi("T")} zur positiven x-Achse bestimmen. Auf diesen Winkel wird die Düse eingestellt.</li>
</ol>
{box("💡 Tipp", "Alle Kräfte greifen im Schwerpunkt an. Legen Sie den Schwerpunkt in den Ursprung. Dann haben Sie alle Werkzeuge aus den Modulen 2 bis 5.")}
""",
 short=f"""
{SK_RAK}
<p>Gewichtskraft 2,8 MN nach unten, Seitenwind 0,8 MN nach rechts. Gesucht ist die Triebwerkskraft {Vi("T")}, sodass F<sub>res</sub> = 0.</p>
<p>1 MN = 1 000 000 N. Plan: Masse → Komponenten von {Vi("T")} → einzeichnen → Betrag → Winkel.</p>
""",
)

# ---------------------------------------------------------------- Seite bauen
TITEL = "Die Kraft – eine gerichtete Größe"
DATEI = {"full": "kraft_vektor_komplett.html", "short": "kraft_vektor_kompakt.html", "quiz": "kraft_vektor_quiz.html"}
N = len(M)


def build(variant):
    titles = {"full": TITEL + " – Lernmodul", "short": TITEL + " – Kompakt", "quiz": TITEL + " – Quiz"}
    sub_ = {"full": "Kräfte als Vektoren: zerlegen, addieren, ins Gleichgewicht bringen. Lerntexte, Aufgaben und ein Abzeichen am Ende.",
            "short": "Das Wichtigste in Kürze. Danach die Aufgaben.",
            "quiz": "Nur die Aufgaben. Testen Sie, was Sie schon können."}[variant]
    cards = ""
    for n in range(1, N + 1):
        icon, t, d = M[n]["card"]
        locked = n > 3
        desc = M[n].get("card_locked", d) if locked else d
        cards += f'''
            <div class="module-card{(" advanced-card locked" if locked else "")}" id="card-{n}" onclick="openModule({n})">
                <div class="module-icon">{icon}</div>
                <div class="module-title">{t}</div>
                <div class="module-description">{desc}</div>
            </div>
'''
    data = {}
    for n in range(1, N + 1):
        content = M[n]["full"] if variant == "full" else M[n]["short"] if variant == "short" else ""
        data[n] = dict(title=M[n]["title"], content=content)

    header_hint = ('<div class="book-hint">🧮 Taschenrechner im Modus <strong>DEG</strong> &nbsp;·&nbsp; g = 9,81 m/s² &nbsp;·&nbsp; '
                   '1 MN = 1 000 000 N</div>')
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
            <h1>🧭 {TITEL} 🚀</h1>
            <p>{sub_}</p>
            {header_hint}
        </div>

        <div class="progress-bar">
            <div class="progress-fill" id="progress" style="width: 0%;">0 von {N} Modulen abgeschlossen</div>
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
            <h2 id="expert-title" style="margin-top: 20px; color: #f8fafc;">🧭 KRAFTVEKTOR-PROFI 🚀</h2>
        </div>
    </div>

    <script>
const modules = {json.dumps(data, ensure_ascii=False, indent=2)};

{ENGINE_VEKTOR}
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
