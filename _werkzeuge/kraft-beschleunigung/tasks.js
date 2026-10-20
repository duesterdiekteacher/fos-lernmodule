// =====================================================================
// Aufgaben für das Modul "Kraft und Beschleunigung" (FOS 12)
// Hilfsfunktionen aus engine.js. num-Felder: ans in Tausendsteln der Einheit
// (9,81 -> 9810). tol = erlaubter Spielraum in Tausendsteln.
// Werte wie im Arbeitsblatt: g = 9,81 m/s², Feder 2 g, Bowlingkugel 5,6 kg,
// Sportwagen 1200 kg, 0 auf 100 km/h in 5,6 s.
// =====================================================================

const BASIC = [1, 2, 3, 4];
const ADVANCED = [5, 6, 7];
const UNLOCK_TEXT = {
    5: 'Die Formeln für Ort und Geschwindigkeit. Und: km/h in m/s umrechnen.',
    6: 'Ein Sportwagen gegen einen frei fallenden Körper: Wer beschleunigt stärker?',
    7: 'Bewegungen zeichnen und ablesen: Steigung und Fläche im v-t-Diagramm.'
};

const g0 = 9.81;

// ---------- Zahlen ----------
const T = x => Math.round(x * 1000);                       // Wert -> Tausendstel
function de(x, dec) {                                        // 9.811 -> "9,811", 11772 -> "11 772"
    let s = (dec === undefined) ? String(Number(x.toFixed(6))) : x.toFixed(dec);
    let [g, k] = s.replace('-', '').split('.');
    if (g.length > 4) g = g.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (x < 0 && Number(s) !== 0 ? '−' : '') + g + (k ? ',' + k : '');
}
const relTol = (x, p) => Math.max(1, Math.round(Math.abs(T(x)) * p));    // p = 0.01 -> 1 %

// Beim ersten Öffnen kommen die Werte aus dem Arbeitsblatt, danach neue Zahlen
const _seen = {};
function erstesMal(key) { if (_seen[key]) return false; _seen[key] = true; return true; }

const RF = ['richtig', 'falsch'];
function richtigFalsch(all, n, expl) {
    return function () {
        const sel = pickN(all, n);
        if (sel.every(x => x.answer === sel[0].answer)) return richtigFalsch(all, n, expl)();
        return {
            type: 'match', q: 'Richtig oder falsch?', options: RF, items: sel,
            hint: 'Rot markierte Aussagen haben Sie noch falsch eingeschätzt. Lesen Sie den Lerntext dazu noch einmal.',
            explanation: expl
        };
    };
}

// Rechenweg mit Zeilennummern (für "Fehler finden")
function calcBox(lines) {
    return '<div class="calc">' + lines.map((s, k) => '<div><span class="calc-nr">Zeile ' + (k + 1) + '</span>' + s + '</div>').join('') + '</div>';
}
function fehlerTask(q, lines, falsch, expl, hint) {
    return {
        type: 'mc', svg: calcBox(lines), q,
        options: lines.map((s, k) => 'Zeile ' + (k + 1)), correct: falsch - 1,
        hint: hint || 'Prüfen Sie jede Zeile: Stimmt die Formel? Stimmen die Einheiten? Stimmt die Rechnung?',
        explanation: expl
    };
}

// ---------- v-t-Diagramm als SVG ----------
// lines: [{lab, col, pts: [[t, v], ...], at: Index des beschrifteten Punkts, dots: true}]
const COL = ['#38bdf8', '#f59e0b', '#4ade80', '#f472b6'];
function vtSvg(lines, opt) {
    opt = opt || {};
    const tmax = opt.tmax || 5, vmax = opt.vmax || 50, vstep = opt.vstep || 10;
    const x0 = 64, y0 = 262, w = 420, h = 228;
    const X = t => x0 + t / tmax * w, Y = v => y0 - v / vmax * h;
    const F = 'font-family="Segoe UI, Arial"';
    let s = '<svg viewBox="0 0 540 310" role="img" aria-label="v-t-Diagramm: Geschwindigkeit in m/s über der Zeit in s">';
    for (let v = vstep / 2; v <= vmax; v += vstep / 2)
        s += '<line x1="' + x0 + '" y1="' + Y(v) + '" x2="' + X(tmax) + '" y2="' + Y(v) + '" stroke="#334155" stroke-width="1"/>';
    for (let t = 1; t <= tmax; t++)
        s += '<line x1="' + X(t) + '" y1="' + y0 + '" x2="' + X(t) + '" y2="' + Y(vmax) + '" stroke="#334155" stroke-width="1"/>';
    s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + (X(tmax) + 22) + '" y2="' + y0 + '" stroke="#94a3b8" stroke-width="2"/>';
    s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + (Y(vmax) - 18) + '" stroke="#94a3b8" stroke-width="2"/>';
    for (let t = 0; t <= tmax; t++)
        s += '<text x="' + X(t) + '" y="' + (y0 + 22) + '" fill="#cbd5e1" font-size="15" text-anchor="middle" ' + F + '>' + t + '</text>';
    for (let v = vstep; v <= vmax; v += vstep)
        s += '<text x="' + (x0 - 8) + '" y="' + (Y(v) + 5) + '" fill="#cbd5e1" font-size="15" text-anchor="end" ' + F + '>' + v + '</text>';
    s += '<text x="' + (X(tmax) + 22) + '" y="' + (y0 + 42) + '" fill="#cbd5e1" font-size="15" text-anchor="end" ' + F + '>t in s</text>';
    s += '<text x="' + (x0 + 8) + '" y="' + (Y(vmax) - 6) + '" fill="#cbd5e1" font-size="15" ' + F + '>v in m/s</text>';
    lines.forEach((L, k) => {
        const col = L.col || COL[k % COL.length];
        s += '<polyline points="' + L.pts.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ') + '" fill="none" stroke="' + col + '" stroke-width="3.5"/>';
        if (L.dots) L.pts.forEach(p => {
            s += '<line x1="' + X(p[0]) + '" y1="' + Y(p[1]).toFixed(1) + '" x2="' + x0 + '" y2="' + Y(p[1]).toFixed(1) + '" stroke="' + col + '" stroke-width="1.5" stroke-dasharray="5 4"/>';
            s += '<line x1="' + X(p[0]) + '" y1="' + Y(p[1]).toFixed(1) + '" x2="' + X(p[0]) + '" y2="' + y0 + '" stroke="' + col + '" stroke-width="1.5" stroke-dasharray="5 4"/>';
            s += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]).toFixed(1) + '" r="5" fill="' + col + '"/>';
        });
        if (L.lab) {
            const p = L.pts[L.at === undefined ? L.pts.length - 1 : L.at];
            let lx = X(p[0]) + 10, anchor = 'start';
            if (lx > 500) { lx = X(p[0]) - 10; anchor = 'end'; }
            const ly = Math.max(Y(p[1]) - 8, 24);
            s += '<text x="' + lx + '" y="' + ly.toFixed(1) + '" fill="' + col + '" font-size="19" font-weight="bold" text-anchor="' + anchor + '" ' + F + '>' + L.lab + '</text>';
        }
    });
    return s + '</svg>';
}

// ---------- Fahrzeuge (0 auf 100 km/h) ----------
const FAHRZEUGE = [
    { name: 'Sportwagen', m: 1200, t: 5.6 },
    { name: 'Elektro-Sportwagen', m: 2100, t: 2.9 },
    { name: 'Kleinwagen', m: 1050, t: 12.5 },
    { name: 'Kompakt-SUV', m: 1600, t: 9.2 },
    { name: 'Motorrad (mit Fahrer)', m: 290, t: 3.4 },
    { name: 'Lieferwagen', m: 2500, t: 15 }
];
const V100 = 100 / 3.6;

// ---------- Leichte und schwere Gegenstände (freier Fall) ----------
const LEICHT = [
    { n: 'Feder', g: 2 }, { n: '1-Cent-Münze', g: 2.3 }, { n: 'Blatt Papier', g: 5 }, { n: 'Wattebausch', g: 0.5 }
];
const SCHWER = [
    { n: 'Bowlingkugel', kg: 5.6 }, { n: 'Hantelscheibe', kg: 10 }, { n: 'Wassermelone', kg: 4.2 }, { n: 'Kugelstoßkugel', kg: 7.26 }
];
function fallPaar(key) {
    if (erstesMal(key)) return [LEICHT[0], SCHWER[0]];
    return [rnd(LEICHT), rnd(SCHWER)];
}

// =====================================================================
const TASKS = {
// ---------------------------------------------------------------- Modul 1
1: [
    {
        type: 'mc', shuffle: true,
        q: 'Eine Raumsonde fliegt weit weg von allen Planeten und Sternen. Die Triebwerke werden abgeschaltet. Was passiert?',
        options: ['Die Sonde wird langsamer und bleibt irgendwann stehen.',
                  'Die Sonde fliegt mit gleicher Geschwindigkeit geradeaus weiter.',
                  'Die Sonde wird immer schneller.',
                  'Die Sonde fliegt eine Kurve und kehrt um.'],
        correct: 1,
        wrongHints: { 'Die Sonde wird langsamer und bleibt irgendwann stehen.': 'Auf der Erde bremsen Reibung und Luftwiderstand. Im leeren Weltraum gibt es beides nicht.' },
        hint: 'Denken Sie an das 1. Newtonsche Gesetz: Ohne Kraft ändert sich der Bewegungszustand nicht.',
        explanation: 'Ohne Kraft bleibt der Bewegungszustand erhalten. Die Sonde fliegt mit <strong>gleicher Geschwindigkeit geradeaus</strong> weiter. Dafür braucht sie keinen Antrieb. Deshalb fliegen Raumsonden jahrzehntelang durch das Sonnensystem.'
    },
    function () {
        const all = [
            ['Ein Bus bremst plötzlich stark.', 'nach vorn'],
            ['Ein Zug macht eine Vollbremsung.', 'nach vorn'],
            ['Ein Fahrrad prallt gegen einen Bordstein.', 'nach vorn'],
            ['Eine Straßenbahn fährt ruckartig an.', 'nach hinten'],
            ['Eine Achterbahn wird beim Start stark beschleunigt.', 'nach hinten'],
            ['Ein Flugzeug beschleunigt auf der Startbahn.', 'nach hinten'],
            ['Ein Auto fährt schnell in eine Linkskurve.', 'nach rechts'],
            ['Ein Auto fährt schnell in eine Rechtskurve.', 'nach links']
        ].map(x => ({ left: x[0], answer: x[1] }));
        const kurve = rnd(all.filter(x => x.answer === 'nach rechts' || x.answer === 'nach links'));
        const vorn = rnd(all.filter(x => x.answer === 'nach vorn'));
        const hinten = rnd(all.filter(x => x.answer === 'nach hinten'));
        const rest = rnd(all.filter(x => x !== vorn && x !== hinten && x.answer.indexOf('rechts') < 0 && x.answer.indexOf('links') < 0));
        return {
            type: 'match', q: 'In welche Richtung kippen die Personen? (vom Fahrzeug aus gesehen)',
            options: ['nach vorn', 'nach hinten', 'nach rechts', 'nach links'],
            items: shuffle([kurve, vorn, hinten, rest]),
            hint: 'Der Körper will seine alte Bewegung beibehalten. Überlegen Sie: Was macht das Fahrzeug, was „will“ der Körper?',
            explanation: 'Bremsen: Der Körper will weiterfahren → <strong>nach vorn</strong>. Anfahren: Der Körper will stehen bleiben → <strong>nach hinten</strong>. Kurve: Der Körper will geradeaus weiter → zur <strong>Kurvenaußenseite</strong> (Linkskurve: nach rechts).'
        };
    },
    {
        type: 'mc', shuffle: true, level: 'Begründen',
        q: 'Ein Bus bremst stark. Die stehenden Fahrgäste kippen nach vorn. Welche Erklärung ist richtig?',
        options: ['Eine Kraft drückt die Fahrgäste nach vorn.',
                  'Wegen ihrer Trägheit bewegen sich die Fahrgäste mit der alten Geschwindigkeit weiter. Gebremst wird nur der Bus.',
                  'Der Fahrtwind schiebt die Fahrgäste nach vorn.',
                  'Die Fahrgäste werden beim Bremsen schwerer.'],
        correct: 1,
        wrongHints: { 'Eine Kraft drückt die Fahrgäste nach vorn.': 'Es gibt keine Kraft nach vorn. Fragen Sie sich: Welcher Körper wird hier gebremst, und welcher nicht?' },
        hint: 'Trägheit: Jeder Körper behält seine Geschwindigkeit bei, solange keine Kraft wirkt.',
        explanation: 'Der Bus wird gebremst, die Fahrgäste aber nicht. Wegen ihrer <strong>Trägheit</strong> bewegen sie sich weiter. Erst eine Kraft (Haltestange, Sicherheitsgurt) bremst sie ab. Genau dafür gibt es den Gurt.'
    },
    {
        type: 'mc', shuffle: true, level: 'Begründen',
        q: 'Ein Auto fährt auf gerader Straße mit konstant 100 km/h. Der Motor treibt die ganze Zeit an. Warum wird das Auto nicht schneller?',
        options: ['Bei konstanter Geschwindigkeit braucht der Motor keine Kraft.',
                  'Antriebskraft und Widerstandskräfte (Luft, Reibung) sind gleich groß. Die resultierende Kraft ist null.',
                  'Die Antriebskraft ist kleiner als die Widerstandskräfte.',
                  'Das Auto ist zu schwer, um schneller zu werden.'],
        correct: 1,
        wrongHints: {
            'Bei konstanter Geschwindigkeit braucht der Motor keine Kraft.': 'Ohne Motor würden Luftwiderstand und Reibung das Auto abbremsen.',
            'Die Antriebskraft ist kleiner als die Widerstandskräfte.': 'Dann würde das Auto langsamer werden.'
        },
        hint: 'Wenn sich die Geschwindigkeit nicht ändert, ist die Summe aller Kräfte …?',
        explanation: 'Antriebskraft und Widerstandskräfte heben sich auf: <strong>Kräftegleichgewicht</strong>. Die resultierende Kraft ist null. Nach dem 1. Gesetz bleibt die Geschwindigkeit dann konstant.'
    },
    richtigFalsch([
        { left: 'Ein Körper, der sich gleichförmig geradeaus bewegt, braucht keine resultierende Kraft.', answer: 'richtig' },
        { left: 'Damit sich ein Körper bewegt, muss immer eine resultierende Kraft auf ihn wirken.', answer: 'falsch' },
        { left: 'Je größer die Masse, desto träger ist ein Körper.', answer: 'richtig' },
        { left: 'Fährt ein Auto mit konstantem Tempo durch eine Kurve, ändert sich sein Bewegungszustand.', answer: 'richtig' },
        { left: 'Zum Bewegungszustand gehören Betrag und Richtung der Geschwindigkeit.', answer: 'richtig' },
        { left: 'Ein ruhender Körper bleibt nur dann in Ruhe, wenn gar keine Kräfte auf ihn wirken.', answer: 'falsch' },
        { left: 'Das 1. Newtonsche Gesetz heißt auch Trägheitsgesetz.', answer: 'richtig' }
    ], 5, 'Nicht die Bewegung braucht eine Kraft, sondern die <strong>Änderung</strong> der Bewegung. Auch eine Richtungsänderung (Kurve) ist eine Änderung. Kräfte, die sich aufheben, ändern nichts.')
],
// ---------------------------------------------------------------- Modul 2
2: [
    function () {
        const m1 = rint(70, 100), a1 = rnd([0.8, 1.2, 1.5, 2]);
        const FkN = rnd([2.4, 3.6, 4.5, 6]), mt = rnd([1.2, 1.5, 1.8]);
        const F3 = rnd([150, 240, 360, 450]), a3 = rnd([1.5, 2, 2.5, 3]);
        const a2 = FkN * 1000 / (mt * 1000), m3 = F3 / a3;
        const fields = shuffle([
            { label: 'Radfahrer mit Rad: m = ' + m1 + ' kg, a = ' + de(a1) + ' m/s². Gesucht: Kraft F', unit: 'N', ans: T(m1 * a1), tol: 10,
              errors: [{ v: T(m1 / a1), msg: 'F = m · a: malnehmen, nicht teilen.', tol: relTol(m1 / a1, 0.01) }] },
            { label: 'Auto: m = ' + de(mt) + ' t, F = ' + de(FkN) + ' kN. Gesucht: Beschleunigung a', unit: 'm/s²', ans: T(a2), tol: 10,
              errors: [{ v: T(FkN / (mt * 1000)), msg: 'kN in N umrechnen: 1 kN = 1000 N.', tol: 2 },
                       { v: T(FkN * 1000 / mt), msg: 't in kg umrechnen: 1 t = 1000 kg.', tol: relTol(FkN * 1000 / mt, 0.01) }] },
            { label: 'Schlitten: F = ' + F3 + ' N, a = ' + de(a3) + ' m/s². Gesucht: Masse m', unit: 'kg', ans: T(m3), tol: 10,
              errors: [{ v: T(F3 * a3), msg: 'm = F / a: teilen, nicht malnehmen.', tol: relTol(F3 * a3, 0.01) }] }
        ]);
        return {
            type: 'num', q: 'Rechnen mit F = m · a.',
            note: 'Runden Sie auf zwei Nachkommastellen. Komma oder Punkt ist egal.',
            fields,
            hint: 'F = m · a, a = F / m, m = F / a. Rechnen Sie t in kg und kN in N um.',
            explanation: fields.map(f => f.label.split('. Gesucht')[0] + ' → <strong>' + de(f.ans / 1000, 2) + ' ' + f.unit + '</strong>').join('<br>')
        };
    },
    function () {
        const sz = [
            { t: 'Die Kraft F wird verdoppelt.', f: 2, e: [{ v: 0.5, msg: 'Mehr Kraft bedeutet mehr Beschleunigung.' }] },
            { t: 'Die Kraft F wird verdreifacht.', f: 3, e: [] },
            { t: 'Die Masse m wird verdoppelt.', f: 0.5, e: [{ v: 2, msg: 'Mehr Masse bedeutet weniger Beschleunigung. a = F / m.' }] },
            { t: 'Die Masse m wird halbiert.', f: 2, e: [{ v: 0.5, msg: 'Weniger Masse bedeutet mehr Beschleunigung.' }] },
            { t: 'Die Masse m wird verdreifacht.', f: 1 / 3, e: [{ v: 3, msg: 'Die Masse steht im Nenner: a = F / m.' }] },
            { t: 'Kraft und Masse werden beide verdoppelt.', f: 1, e: [{ v: 4, msg: 'Die Masse steht im Nenner: 2 : 2 = 1.' }, { v: 2, msg: 'Die doppelte Masse halbiert die Beschleunigung wieder.' }] },
            { t: 'Die Kraft wird verdoppelt, die Masse vervierfacht.', f: 0.5, e: [{ v: 8, msg: 'Die Masse steht im Nenner: 2 : 4.' }, { v: 2, msg: 'Die Masse steht im Nenner: 2 : 4.' }] }
        ];
        let sel;
        do { sel = pickN(sz, 3); } while (!sel.some(s => s.t.indexOf('Masse') >= 0) || sel.every(s => s.t.indexOf('Masse') >= 0));
        return {
            type: 'num', q: 'Wie ändert sich die Beschleunigung a? Geben Sie den Faktor an.',
            note: 'Beispiel: Wird a halb so groß, tragen Sie 0,5 ein. Wird a doppelt so groß, tragen Sie 2 ein.',
            fields: sel.map(s => ({ label: s.t, prefix: 'a<sub>neu</sub> =', unit: '· a<sub>alt</sub>', ans: T(s.f), tol: 4, small: true,
                                    errors: s.e.map(e => ({ v: T(e.v), msg: e.msg, tol: 4 })) })),
            hint: 'a = F / m. Die Kraft steht im Zähler (proportional). Die Masse steht im Nenner (umgekehrt proportional).',
            explanation: sel.map(s => s.t + ' → a<sub>neu</sub> = <strong>' + de(Math.round(s.f * 1000) / 1000) + ' · a<sub>alt</sub></strong>').join('<br>')
        };
    },
    {
        type: 'mc', shuffle: true,
        q: 'Was bedeutet die Einheit <strong>1 Newton</strong>?',
        options: ['1 N ist die Kraft, die einen Körper mit 1 kg mit 1 m/s² beschleunigt.',
                  '1 N ist die Gewichtskraft von 1 kg.',
                  '1 N ist die Kraft, die einen Körper mit 1 kg auf 1 m/s bringt.',
                  '1 N ist die Masse von 100 g.'],
        correct: 0,
        wrongHints: {
            '1 N ist die Gewichtskraft von 1 kg.': 'Die Gewichtskraft von 1 kg ist 9,81 N.',
            '1 N ist die Masse von 100 g.': 'Newton ist die Einheit der Kraft, nicht der Masse.'
        },
        hint: 'Setzen Sie in F = m · a für m und a jeweils „1“ mit Einheit ein.',
        explanation: '1 N = 1 kg · 1 m/s². Eine Kraft von 1 N beschleunigt 1 kg mit <strong>1 m/s²</strong>. Die Geschwindigkeit steigt also pro Sekunde um 1 m/s.'
    },
    function () {
        const mt = rnd([1.6, 1.8, 2.2, 2.4]), a = rnd([1.5, 2, 2.5, 3]);
        const m = mt * 1000, F = m * a;
        const art = rnd(['tonne', 'formel', 'rechnung', 'einheit']);
        const L = ['F = m · a', 'F = ' + de(m) + ' kg · ' + de(a) + ' m/s²', 'F = ' + de(F) + ' kg · m/s²', 'F = ' + de(F) + ' N'];
        let falsch, expl;
        if (art === 'tonne') {
            L[1] = 'F = ' + de(mt) + ' kg · ' + de(a) + ' m/s²'; L[2] = 'F = ' + de(mt * a) + ' kg · m/s²'; L[3] = 'F = ' + de(mt * a) + ' N';
            falsch = 2; expl = 'In Zeile 2 wurde die Masse nicht umgerechnet: ' + de(mt) + ' t = ' + de(m) + ' kg.';
        } else if (art === 'formel') {
            L[0] = 'F = m / a'; L[1] = 'F = ' + de(m) + ' kg / ' + de(a) + ' m/s²'; L[2] = 'F = ' + de(Math.round(m / a * 100) / 100) + ' kg · s²/m'; L[3] = 'F = ' + de(Math.round(m / a * 100) / 100) + ' N';
            falsch = 1; expl = 'Schon in Zeile 1 ist die Formel falsch: F = m <strong>·</strong> a.';
        } else if (art === 'rechnung') {
            L[2] = 'F = ' + de(F * 10) + ' kg · m/s²'; L[3] = 'F = ' + de(F * 10) + ' N';
            falsch = 3; expl = 'In Zeile 3 ist die Rechnung falsch: ' + de(m) + ' · ' + de(a) + ' = ' + de(F) + '.';
        } else {
            L[3] = 'F = ' + de(F) + ' kg';
            falsch = 4; expl = 'In Zeile 4 ist die Einheit falsch. kg · m/s² ist <strong>N</strong>, nicht kg.';
        }
        return fehlerTask('Fehler finden: Ein Transporter (m = ' + de(mt) + ' t) soll mit a = ' + de(a) + ' m/s² beschleunigen. Ein Mitschüler berechnet die nötige Kraft. In welcher Zeile steht der <strong>erste</strong> Fehler?',
            L, falsch, expl + ' Richtig ist F = <strong>' + de(F) + ' N</strong>.');
    },
    function () {
        const ml = rnd([1800, 2000, 2200]), al = rnd([2, 2.5, 3]), zu = rnd([800, 1000, 1200, 1500]);
        const mb = ml + zu, F = ml * al, ab = F / mb;
        return {
            type: 'num', level: 'Knobelaufgabe',
            q: 'Ein leerer Transporter (' + de(ml) + ' kg) beschleunigt mit a = ' + de(al) + ' m/s². Dann wird er mit ' + de(zu) + ' kg beladen. Die Antriebskraft bleibt gleich. Wie stark beschleunigt er jetzt?',
            note: 'Widerstandskräfte bleiben unberücksichtigt. Runden Sie a auf zwei Nachkommastellen.',
            fields: [
                { label: 'Antriebskraft F', unit: 'N', ans: T(F), tol: 10 },
                { label: 'Gesamtmasse beladen', unit: 'kg', ans: T(mb), errors: [{ v: T(zu), msg: 'Der Transporter fährt mit: Leermasse + Ladung.' }] },
                { label: 'Beschleunigung beladen', unit: 'm/s²', ans: T(ab), tol: 10,
                  errors: [{ v: T(al * mb / ml), msg: 'Mehr Masse bedeutet weniger Beschleunigung.', tol: 10 }, { v: T(F / zu), msg: 'Teilen Sie durch die Gesamtmasse, nicht nur durch die Ladung.', tol: 10 }] }
            ],
            hint: 'Erst F = m<sub>leer</sub> · a<sub>leer</sub>. Dann a<sub>beladen</sub> = F / m<sub>gesamt</sub>.',
            explanation: 'F = ' + de(ml) + ' kg · ' + de(al) + ' m/s² = <strong>' + de(F) + ' N</strong>. m = ' + de(ml) + ' kg + ' + de(zu) + ' kg = <strong>' + de(mb) + ' kg</strong>. a = ' + de(F) + ' N / ' + de(mb) + ' kg ≈ <strong>' + de(ab, 2) + ' m/s²</strong>.'
        };
    }
],
// ---------------------------------------------------------------- Modul 3
3: [
    function () {
        const all = [
            ['Ihre Hand drückt gegen eine Wand.', 'Die Wand drückt gegen Ihre Hand.'],
            ['Die Erde zieht einen Apfel an.', 'Der Apfel zieht die Erde an.'],
            ['Eine Rakete stößt Gas nach hinten aus.', 'Das Gas drückt die Rakete nach vorn.'],
            ['Ein Schwimmer drückt das Wasser nach hinten.', 'Das Wasser drückt den Schwimmer nach vorn.'],
            ['Ihr Fuß drückt beim Gehen den Boden nach hinten.', 'Der Boden drückt Ihren Fuß nach vorn.'],
            ['Ein Hammer schlägt auf einen Nagel.', 'Der Nagel drückt gegen den Hammer.'],
            ['Ein Auto zieht einen Anhänger nach vorn.', 'Der Anhänger zieht das Auto nach hinten.']
        ].map(x => ({ left: x[0], answer: x[1] }));
        const sel = pickN(all, 4);
        return {
            type: 'match', q: 'Kraft und Gegenkraft: Welche Gegenkraft gehört zu welcher Kraft?',
            options: shuffle(sel.map(x => x.answer).concat(['Die Gewichtskraft zieht nach unten.'])),
            items: sel,
            hint: 'Die Gegenkraft wirkt auf den <strong>anderen</strong> Körper und zeigt in die <strong>entgegengesetzte</strong> Richtung.',
            explanation: 'Kraft: A wirkt auf B. Gegenkraft: B wirkt auf A, gleich groß, entgegengesetzt. Eine Antwort blieb übrig: Die Gewichtskraft ist keine Gegenkraft zu diesen Kräften.'
        };
    },
    {
        type: 'mc', shuffle: true,
        q: 'Ein Pkw prallt frontal auf einen viel schwereren Lkw. Welche Aussage stimmt?',
        options: ['Der Pkw erfährt die größere Kraft, weil er leichter ist.',
                  'Der Lkw erfährt die größere Kraft, weil er schwerer ist.',
                  'Beide erfahren gleich große Kräfte. Der Pkw wird aber viel stärker abgebremst.',
                  'Beide erfahren gleich große Kräfte und werden gleich stark abgebremst.'],
        correct: 2,
        wrongHints: { 'Beide erfahren gleich große Kräfte und werden gleich stark abgebremst.': 'Gleiche Kraft, aber verschiedene Massen. Was sagt a = F / m?' },
        hint: 'Kraft: 3. Gesetz. Beschleunigung: 2. Gesetz (a = F / m).',
        explanation: 'Nach dem 3. Gesetz sind die Kräfte <strong>gleich groß</strong>. Nach dem 2. Gesetz ist a = F / m. Der Pkw hat die kleinere Masse. Er wird deshalb <strong>viel stärker</strong> abgebremst. Darum sind die Insassen im Pkw stärker gefährdet.'
    },
    function () {
        const FkN = rnd([18, 24, 30, 36]), mp = rnd([1000, 1200, 1500]), ml = rnd([7500, 12000, 15000]);
        const F = FkN * 1000;
        return {
            type: 'num',
            q: 'Ein Pkw (' + de(mp) + ' kg) und ein Lkw (' + de(ml) + ' kg) stoßen zusammen. Der Lkw drückt mit <strong>' + FkN + ' kN</strong> auf den Pkw.',
            note: 'Runden Sie auf zwei Nachkommastellen.',
            fields: [
                { label: 'Kraft, mit der der Pkw auf den Lkw drückt', unit: 'kN', ans: T(FkN),
                  errors: [{ v: T(FkN * mp / ml), msg: 'Kraft und Gegenkraft sind immer gleich groß, egal wie schwer die Körper sind.', tol: 50 }] },
                { label: 'Beschleunigung (Abbremsung) des Pkw', unit: 'm/s²', ans: T(F / mp), tol: 10,
                  errors: [{ v: T(FkN / mp), msg: 'kN in N umrechnen: 1 kN = 1000 N.', tol: 2 }] },
                { label: 'Beschleunigung (Abbremsung) des Lkw', unit: 'm/s²', ans: T(F / ml), tol: 10,
                  errors: [{ v: T(F / mp), msg: 'Der Lkw hat eine andere Masse.', tol: 10 }] }
            ],
            hint: 'Kraft und Gegenkraft sind gleich groß. Dann jeweils a = F / m.',
            explanation: 'Beide Kräfte sind <strong>' + FkN + ' kN</strong>. Pkw: a = ' + de(F) + ' N / ' + de(mp) + ' kg = <strong>' + de(F / mp, 2) + ' m/s²</strong>. Lkw: a = ' + de(F) + ' N / ' + de(ml) + ' kg = <strong>' + de(F / ml, 2) + ' m/s²</strong>. Gleiche Kraft, aber der Pkw wird ' + de(ml / mp, 1) + '-mal so stark abgebremst.'
        };
    },
    {
        type: 'mc', shuffle: true, level: 'Begründen',
        q: 'Ein Buch liegt ruhig auf dem Tisch. Die Gewichtskraft zieht es nach unten. Der Tisch drückt es mit gleich großer Kraft nach oben. Sind das Kraft und Gegenkraft im Sinne des 3. Newtonschen Gesetzes?',
        options: ['Ja, denn die beiden Kräfte sind gleich groß und entgegengesetzt.',
                  'Nein. Beide Kräfte wirken auf das Buch. Sie bilden ein Kräftegleichgewicht.',
                  'Nein, denn die Kraft des Tisches ist größer als die Gewichtskraft.',
                  'Ja, denn das Buch bleibt in Ruhe.'],
        correct: 1,
        wrongHints: {
            'Ja, denn die beiden Kräfte sind gleich groß und entgegengesetzt.': 'Gleich groß und entgegengesetzt reicht nicht. Auf welchen Körper wirken die beiden Kräfte?',
            'Ja, denn das Buch bleibt in Ruhe.': 'Dass das Buch in Ruhe bleibt, zeigt ein Kräftegleichgewicht. Kraft und Gegenkraft wirken aber auf zwei verschiedene Körper.'
        },
        hint: 'Kraft und Gegenkraft wirken immer auf <strong>zwei verschiedene</strong> Körper.',
        explanation: 'Beide Kräfte greifen am <strong>Buch</strong> an. Das ist ein <strong>Kräftegleichgewicht</strong> (1. Gesetz). Die Gegenkraft zur Gewichtskraft ist die Kraft, mit der das Buch die <strong>Erde</strong> anzieht. Die Gegenkraft zur Tischkraft ist die Kraft, mit der das Buch auf den <strong>Tisch</strong> drückt.'
    },
    richtigFalsch([
        { left: 'Kraft und Gegenkraft sind immer gleich groß.', answer: 'richtig' },
        { left: 'Kraft und Gegenkraft wirken auf denselben Körper.', answer: 'falsch' },
        { left: 'Kraft und Gegenkraft heben sich gegenseitig auf.', answer: 'falsch' },
        { left: 'Bei einem Zusammenstoß erfährt das leichtere Fahrzeug die größere Kraft.', answer: 'falsch' },
        { left: 'Kraft und Gegenkraft zeigen in entgegengesetzte Richtungen.', answer: 'richtig' },
        { left: 'Eine Rakete funktioniert auch im luftleeren Weltraum.', answer: 'richtig' },
        { left: 'Wenn Sie auf einer Waage stehen, drückt die Waage mit gleich großer Kraft auf Sie zurück.', answer: 'richtig' }
    ], 5, 'Kraft und Gegenkraft: gleich groß, entgegengesetzt, auf <strong>verschiedene</strong> Körper. Deshalb heben sie sich nicht auf. Eine Rakete stößt sich am eigenen Gas ab, dafür braucht sie keine Luft.')
],
// ---------------------------------------------------------------- Modul 4
4: [
    function () {
        const [l, s] = fallPaar('fg');
        const Fl = l.g / 1000 * g0, Fs = s.kg * g0;
        return {
            type: 'num',
            q: 'Berechnen Sie die Gewichtskraft einer <strong>' + l.n + '</strong> (m = ' + de(l.g) + ' g) und einer <strong>' + s.n + '</strong> (m = ' + de(s.kg) + ' kg).',
            note: 'g = 9,81 m/s². Runden Sie die kleine Kraft auf drei, die große auf zwei Nachkommastellen.',
            fields: [
                { label: 'Gewichtskraft ' + l.n, unit: 'N', ans: T(Fl), tol: 1,
                  errors: [{ v: T(l.g * g0), msg: 'Rechnen Sie zuerst g in kg um: 1 g = 0,001 kg.', tol: relTol(l.g * g0, 0.01) }] },
                { label: 'Gewichtskraft ' + s.n, unit: 'N', ans: T(Fs), tol: 60,
                  errors: [{ v: T(s.kg), msg: 'Gesucht ist die Kraft in N: F<sub>G</sub> = m · g.', tol: 0 }] }
            ],
            hint: 'F<sub>G</sub> = m · g. Die Masse muss in kg eingesetzt werden.',
            explanation: l.n + ': F<sub>G</sub> = ' + de(l.g / 1000) + ' kg · 9,81 m/s² ≈ <strong>' + de(Fl, 3) + ' N</strong>.<br>' +
                         s.n + ': F<sub>G</sub> = ' + de(s.kg) + ' kg · 9,81 m/s² ≈ <strong>' + de(Fs, 2) + ' N</strong>.<br>' +
                         'Die ' + s.n + ' wird ' + de(Math.round(s.kg * 1000 / l.g)) + '-mal so stark angezogen.'
        };
    },
    function () {
        const [l, s] = fallPaar('a');
        const Fl = l.g / 1000 * g0, Fs = s.kg * g0;
        return {
            type: 'num',
            q: 'Berechnen Sie mithilfe der Gewichtskraft die Beschleunigung a beim freien Fall.<br><span style="color:#cbd5e1">' +
               l.n + ': m = ' + de(l.g) + ' g, F<sub>G</sub> = ' + de(Fl, 5) + ' N &nbsp;·&nbsp; ' + s.n + ': m = ' + de(s.kg) + ' kg, F<sub>G</sub> = ' + de(Fs, 3) + ' N</span>',
            note: 'Im freien Fall wirkt nur die Gewichtskraft. Stellen Sie F = m · a nach a um. Zwei Nachkommastellen.',
            fields: [
                { label: 'Beschleunigung ' + l.n, unit: 'm/s²', ans: T(g0), tol: 20,
                  errors: [{ v: T(Fl / l.g), msg: 'Die Masse muss in kg eingesetzt werden: ' + de(l.g) + ' g = ' + de(l.g / 1000) + ' kg.', tol: 1 }] },
                { label: 'Beschleunigung ' + s.n, unit: 'm/s²', ans: T(g0), tol: 20,
                  errors: [{ v: T(Fs * s.kg), msg: 'a = F / m: teilen, nicht malnehmen.', tol: relTol(Fs * s.kg, 0.01) }] }
            ],
            hint: 'a = F<sub>G</sub> / m. Masse in kg!',
            explanation: l.n + ': a = ' + de(Fl, 5) + ' N / ' + de(l.g / 1000) + ' kg = <strong>9,81 m/s²</strong>.<br>' +
                         s.n + ': a = ' + de(Fs, 3) + ' N / ' + de(s.kg) + ' kg = <strong>9,81 m/s²</strong>.<br>Beide haben dieselbe Fallbeschleunigung g.'
        };
    },
    {
        type: 'mc', shuffle: true, level: 'Begründen',
        q: 'Wieso fällt eine Feder im Vakuum genauso schnell wie eine Bowlingkugel?',
        options: ['Im Vakuum gibt es keine Gravitation. Deshalb schweben beide gleich langsam.',
                  'Die Bowlingkugel wird stärker angezogen. Sie ist aber auch träger. Kraft und Masse wachsen im gleichen Verhältnis, deshalb ist a = F<sub>G</sub> / m für beide gleich.',
                  'Im Vakuum haben beide die gleiche Gewichtskraft.',
                  'Die Feder ist leichter und wird deshalb im Vakuum stärker beschleunigt.'],
        correct: 1,
        wrongHints: {
            'Im Vakuum haben beide die gleiche Gewichtskraft.': 'Die Gewichtskraft hängt von der Masse ab, nicht von der Luft. Sie haben es selbst berechnet.',
            'Im Vakuum gibt es keine Gravitation. Deshalb schweben beide gleich langsam.': 'Gravitation braucht keine Luft. In einer Vakuumröhre fallen beide nach unten.'
        },
        hint: 'Vergleichen Sie: Wie viel mal größer ist die Gewichtskraft der Kugel? Wie viel mal größer ist ihre Masse?',
        explanation: 'Die Kugel hat 2800-mal so viel Masse. Ihre Gewichtskraft ist auch 2800-mal so groß. Für beide gilt: a = F<sub>G</sub> / m = m · g / m = <strong>g</strong>. Die Masse kürzt sich heraus. Ohne Luftwiderstand fallen deshalb alle Körper gleich schnell.'
    },
    {
        type: 'order', q: 'Bringen Sie die Begründung in die richtige Reihenfolge.',
        steps: ['Die Bowlingkugel hat 2800-mal so viel Masse wie die Feder.',
                'Deshalb ist auch ihre Gewichtskraft 2800-mal so groß.',
                'Wegen der großen Masse ist sie aber auch 2800-mal so träge.',
                'Mit a = F<sub>G</sub> / m ergibt sich für beide a = 9,81 m/s².',
                'Ohne Luftwiderstand (im Vakuum) fallen beide deshalb gleich schnell.'],
        hint: 'Starten Sie bei der Masse. Dann Gewichtskraft, dann Trägheit, dann die Rechnung. Die Folgerung steht am Ende.',
        explanation: 'Masse → Gewichtskraft → Trägheit → a = F<sub>G</sub> / m = g → gleiche Fallbewegung im Vakuum.'
    },
    richtigFalsch([
        { left: 'Im Vakuum fallen eine Feder und eine Bowlingkugel gleich schnell.', answer: 'richtig' },
        { left: 'In der Luft fällt die Feder langsamer, weil der Luftwiderstand sie stark bremst.', answer: 'richtig' },
        { left: 'Die Bowlingkugel hat eine größere Gewichtskraft als die Feder.', answer: 'richtig' },
        { left: 'Weil die Bowlingkugel schwerer ist, hat sie im Vakuum eine größere Fallbeschleunigung.', answer: 'falsch' },
        { left: 'g = 9,81 m/s² bedeutet: Die Fallgeschwindigkeit steigt pro Sekunde um 9,81 m/s.', answer: 'richtig' },
        { left: 'Die Fallbeschleunigung hängt von der Masse des Körpers ab.', answer: 'falsch' },
        { left: 'Im freien Fall wirkt nur die Gewichtskraft.', answer: 'richtig' },
        { left: 'Auf dem Mond fallen Hammer und Feder gleich schnell, weil es dort keine Luft gibt.', answer: 'richtig' }
    ], 5, 'Größere Masse heißt: größere Gewichtskraft, aber auch größere Trägheit. Die Fallbeschleunigung ist deshalb für alle Körper gleich: g = 9,81 m/s². Nur der Luftwiderstand macht in der Luft einen Unterschied.')
],
// ---------------------------------------------------------------- Modul 5
5: [
    function () {
        const kmh = pickN([18, 36, 50, 72, 90, 108, 130], 2), ms = rnd([5, 10, 15, 20, 25, 35]);
        return {
            type: 'num', q: 'Rechnen Sie die Geschwindigkeiten um.',
            note: 'Runden Sie auf zwei Nachkommastellen.',
            fields: kmh.map(v => ({ label: de(v) + ' km/h =', unit: 'm/s', ans: T(v / 3.6), tol: 10,
                                    errors: [{ v: T(v * 3.6), msg: 'Von km/h nach m/s wird <strong>geteilt</strong>: durch 3,6.', tol: relTol(v * 3.6, 0.01) }] }))
                .concat([{ label: de(ms) + ' m/s =', unit: 'km/h', ans: T(ms * 3.6), tol: 10,
                           errors: [{ v: T(ms / 3.6), msg: 'Von m/s nach km/h wird <strong>multipliziert</strong>: mal 3,6.', tol: 10 }] }]),
            hint: 'km/h → m/s: durch 3,6. m/s → km/h: mal 3,6. Kontrolle: Die Zahl in m/s ist immer kleiner.',
            explanation: kmh.map(v => de(v) + ' km/h : 3,6 = <strong>' + de(v / 3.6, 2) + ' m/s</strong>').join('<br>') + '<br>' + de(ms) + ' m/s · 3,6 = <strong>' + de(ms * 3.6, 1) + ' km/h</strong>'
        };
    },
    {
        type: 'match', q: 'Welche Formel ist welches Gesetz?',
        options: ['Zeit-Ort-Gesetz', 'Zeit-Geschwindigkeit-Gesetz', 'Definition der Beschleunigung', '2. Newtonsches Gesetz', 'gleichförmige Bewegung'],
        items: [
            { left: 'x(t) = v₀ · t + ½ · a · t²', answer: 'Zeit-Ort-Gesetz' },
            { left: 'v(t) = v₀ + a · t', answer: 'Zeit-Geschwindigkeit-Gesetz' },
            { left: 'a = Δv / Δt', answer: 'Definition der Beschleunigung' },
            { left: 'F = m · a', answer: '2. Newtonsches Gesetz' },
            { left: 'x = v · t (a = 0)', answer: 'gleichförmige Bewegung' }
        ],
        hint: 'Schauen Sie, was links vom Gleichheitszeichen steht: ein Ort x, eine Geschwindigkeit v, eine Beschleunigung a oder eine Kraft F?',
        explanation: 'x(t): Zeit-Ort-Gesetz. v(t): Zeit-Geschwindigkeit-Gesetz. a = Δv / Δt: Definition der Beschleunigung. F = m · a: 2. Newtonsches Gesetz. x = v · t gilt nur ohne Beschleunigung.'
    },
    function () {
        const z = rnd([
            { t: 'Ein Zug', er: 'Er', v0: 36, a: 0.5, s: [20, 30, 40] },
            { t: 'Ein Radfahrer', er: 'Er', v0: 18, a: 0.8, s: [4, 5, 6] },
            { t: 'Ein Auto', er: 'Es', v0: 54, a: 1.5, s: [4, 6, 8] },
            { t: 'Ein Motorrad', er: 'Es', v0: 36, a: 3, s: [3, 4, 5] },
            { t: 'Ein Auto', er: 'Es', v0: 72, a: 2, s: [3, 4, 5] }
        ]);
        const t = rnd(z.s), v0 = z.v0 / 3.6, v = v0 + z.a * t, x = v0 * t + 0.5 * z.a * t * t;
        return {
            type: 'num',
            q: z.t + ' fährt mit v₀ = ' + z.v0 + ' km/h. ' + z.er + ' beschleunigt gleichmäßig mit a = ' + de(z.a) + ' m/s² für t = ' + t + ' s. Wie schnell ist ' + z.er.toLowerCase() + ' danach? Welche Strecke legt ' + z.er.toLowerCase() + ' dabei zurück?',
            note: 'Rechnen Sie zuerst v₀ in m/s um. Zwei Nachkommastellen.',
            fields: [
                { label: 'v₀', unit: 'm/s', ans: T(v0), tol: 10 },
                { label: 'v(t) = v₀ + a · t', unit: 'm/s', ans: T(v), tol: 20,
                  errors: [{ v: T(z.v0 + z.a * t), msg: 'v₀ muss in m/s eingesetzt werden.', tol: 20 }, { v: T(z.a * t), msg: 'Vergessen Sie v₀ nicht.', tol: 20 }] },
                { label: 'x(t) = v₀ · t + ½ · a · t²', unit: 'm', ans: T(x), tol: Math.max(50, relTol(x, 0.005)),
                  errors: [{ v: T(v0 * t + z.a * t * t), msg: 'Haben Sie das ½ vergessen?', tol: relTol(v0 * t + z.a * t * t, 0.005) },
                           { v: T(z.v0 * t + 0.5 * z.a * t * t), msg: 'v₀ muss in m/s eingesetzt werden.', tol: relTol(z.v0 * t + 0.5 * z.a * t * t, 0.005) },
                           { v: T(0.5 * z.a * t * t), msg: 'Der Teil v₀ · t fehlt.', tol: relTol(0.5 * z.a * t * t, 0.005) },
                           { v: T(v0 * t + 0.5 * z.a * t), msg: 'Die Zeit steht bei ½ · a · t² im Quadrat.', tol: relTol(v0 * t + 0.5 * z.a * t, 0.005) }] }
            ],
            hint: 'v₀ = ' + z.v0 + ' km/h : 3,6. Dann die beiden Formeln aus dem Kasten. Achten Sie auf ½ und t².',
            explanation: 'v₀ = ' + z.v0 + ' km/h : 3,6 ≈ <strong>' + de(v0, 2) + ' m/s</strong>.<br>v = ' + de(v0, 2) + ' m/s + ' + de(z.a) + ' m/s² · ' + t + ' s ≈ <strong>' + de(v, 2) + ' m/s</strong> (≈ ' + de(v * 3.6, 0) + ' km/h).<br>' +
                         'x = ' + de(v0, 2) + ' m/s · ' + t + ' s + ½ · ' + de(z.a) + ' m/s² · (' + t + ' s)² ≈ <strong>' + de(x, 2) + ' m</strong>.'
        };
    },
    function () {
        const z = rnd([
            { t: 'Ein E-Scooter fährt an: von 0 auf 20 km/h in 4 s.', v1: 0, v2: 20 / 3.6, dt: 4, kmh: true },
            { t: 'Ein Zug fährt an: von 0 auf 72 km/h in 40 s.', v1: 0, v2: 20, dt: 40, kmh: true },
            { t: 'Eine Sprinterin startet: von 0 auf 9 m/s in 2,5 s.', v1: 0, v2: 9, dt: 2.5, kmh: false },
            { t: 'Ein Auto bremst: von 50 km/h auf 0 in 2,5 s.', v1: 50 / 3.6, v2: 0, dt: 2.5, kmh: true },
            { t: 'Ein Bus bremst: von 54 km/h auf 18 km/h in 4 s.', v1: 15, v2: 5, dt: 4, kmh: true }
        ]);
        const dv = z.v2 - z.v1, a = dv / z.dt;
        return {
            type: 'num', q: z.t + ' Berechnen Sie Δv und die Beschleunigung a.',
            note: 'Δv = v<sub>Ende</sub> − v<sub>Anfang</sub>, in m/s. Beim Bremsen ist Δv negativ, also auch a. Zwei Nachkommastellen.',
            fields: [
                { label: 'Δv', unit: 'm/s', ans: T(dv), tol: 10,
                  errors: [{ v: T(dv * 3.6), msg: 'Rechnen Sie in m/s um: durch 3,6.', tol: 10 }, { v: T(-dv), msg: 'Ende minus Anfang. Achten Sie auf das Vorzeichen.', tol: 10 }] },
                { label: 'a = Δv / Δt', unit: 'm/s²', ans: T(a), tol: 10,
                  errors: [{ v: T(dv * 3.6 / z.dt), msg: 'Die Geschwindigkeit muss in m/s eingesetzt werden.', tol: 10 }, { v: T(-a), msg: 'Achten Sie auf das Vorzeichen.', tol: 10 }] }
            ],
            hint: 'Erst in m/s umrechnen. Dann Δv = Ende − Anfang. Dann durch die Zeit teilen.',
            explanation: 'Δv = ' + de(z.v2, 2) + ' m/s − ' + de(z.v1, 2) + ' m/s = <strong>' + de(dv, 2) + ' m/s</strong>. a = ' + de(dv, 2) + ' m/s / ' + de(z.dt) + ' s ≈ <strong>' + de(a, 2) + ' m/s²</strong>.' +
                         (a < 0 ? ' Das Minus zeigt: Der Körper wird langsamer.' : '')
        };
    },
    function () {
        const a = rnd([0.4, 0.5, 0.6, 0.8]), t = rnd([10, 20, 30]);
        const x = 0.5 * a * t * t;
        const art = rnd(['formel', 'quadrat', 'halb', 'einheit']);
        const L = ['x = ½ · a · t²', 'x = 0,5 · ' + de(a) + ' m/s² · (' + t + ' s)²', 'x = ' + de(0.5 * a) + ' m/s² · ' + de(t * t) + ' s²', 'x = ' + de(x) + ' m'];
        let falsch, expl;
        if (art === 'formel') {
            L[0] = 'x = ½ · a · t'; L[1] = 'x = 0,5 · ' + de(a) + ' m/s² · ' + t + ' s'; L[2] = 'x = ' + de(0.5 * a) + ' m/s² · ' + t + ' s'; L[3] = 'x = ' + de(0.5 * a * t) + ' m';
            falsch = 1; expl = 'Schon in Zeile 1 fehlt das Quadrat: x = ½ · a · t<strong>²</strong>.';
        } else if (art === 'quadrat') {
            L[2] = 'x = ' + de(0.5 * a) + ' m/s² · ' + de(2 * t) + ' s²'; L[3] = 'x = ' + de(a * t) + ' m';
            falsch = 3; expl = 'In Zeile 3 wurde (' + t + ' s)² falsch gerechnet: ' + t + ' · ' + t + ' = ' + de(t * t) + ', nicht ' + (2 * t) + '.';
        } else if (art === 'halb') {
            L[2] = 'x = ' + de(a) + ' m/s² · ' + de(t * t) + ' s²'; L[3] = 'x = ' + de(a * t * t) + ' m';
            falsch = 3; expl = 'In Zeile 3 ist das ½ verschwunden. 0,5 · ' + de(a) + ' = ' + de(0.5 * a) + '.';
        } else {
            L[3] = 'x = ' + de(x) + ' m/s';
            falsch = 4; expl = 'In Zeile 4 ist die Einheit falsch: m/s² · s² = <strong>m</strong>.';
        }
        return fehlerTask('Fehler finden: Ein Zug fährt aus dem Stand an (v₀ = 0). a = ' + de(a) + ' m/s². Welche Strecke legt er in ' + t + ' s zurück? In welcher Zeile steht der <strong>erste</strong> Fehler?',
            L, falsch, expl + ' Richtig: x = <strong>' + de(x) + ' m</strong>.');
    }
],
// ---------------------------------------------------------------- Modul 6
6: [
    function () {
        const f = erstesMal('auto') ? FAHRZEUGE[0] : rnd(FAHRZEUGE);
        const a = V100 / f.t;
        return {
            type: 'num',
            q: 'Ein <strong>' + f.name + '</strong> (m = ' + de(f.m) + ' kg) beschleunigt in <strong>' + de(f.t) + ' s</strong> von 0 auf 100 km/h. Vergleichen Sie seine Beschleunigung a<sub>S</sub> mit der eines frei fallenden Körpers.',
            note: 'g = 9,81 m/s². Zwei Nachkommastellen.',
            fields: [
                { label: 'Endgeschwindigkeit', unit: 'm/s', ans: T(V100), tol: 10, errors: [{ v: T(100), msg: 'Rechnen Sie km/h in m/s um: durch 3,6.', tol: 0 }] },
                { label: 'Beschleunigung a<sub>S</sub>', unit: 'm/s²', ans: T(a), tol: 20,
                  errors: [{ v: T(100 / f.t), msg: 'Sie haben mit km/h gerechnet. Erst in m/s umrechnen!', tol: 20 }, { v: T(f.t / V100), msg: 'a = Δv / Δt: Geschwindigkeit durch Zeit.', tol: 5 }] },
                { label: 'a<sub>S</sub> / g (a<sub>S</sub> ist das …-fache von g)', unit: '', ans: T(a / g0), tol: 10,
                  errors: [{ v: T(g0 / a), msg: 'Umgekehrt: a<sub>S</sub> geteilt durch g.', tol: 10 }] }
            ],
            hint: 'v = 100 km/h : 3,6. Dann a = Δv / Δt. Dann a<sub>S</sub> durch 9,81 teilen.',
            explanation: 'v = 100 km/h : 3,6 ≈ <strong>27,78 m/s</strong>. a<sub>S</sub> = 27,78 m/s / ' + de(f.t) + ' s ≈ <strong>' + de(a, 2) + ' m/s²</strong>. ' +
                         'a<sub>S</sub> / g = ' + de(a, 2) + ' / 9,81 ≈ <strong>' + de(a / g0, 2) + '</strong>. ' +
                         (a / g0 > 0.95 && a / g0 < 1.05 ? 'Der ' + f.name + ' beschleunigt fast so stark wie ein fallender Körper!' :
                          a / g0 < 1 ? 'Der fallende Körper beschleunigt etwa ' + de(g0 / a, 1) + '-mal so stark.' : 'Der ' + f.name + ' beschleunigt stärker als ein fallender Körper!')
        };
    },
    function () {
        const f = erstesMal('strecke') ? FAHRZEUGE[0] : rnd(FAHRZEUGE);
        const a = V100 / f.t, xs = 0.5 * a * f.t * f.t, xk = 0.5 * g0 * f.t * f.t;
        return {
            type: 'num',
            q: 'Der <strong>' + f.name + '</strong> braucht ' + de(f.t) + ' s von 0 auf 100 km/h (a<sub>S</sub> ≈ ' + de(a, 2) + ' m/s²). Berechnen Sie die Strecken x<sub>S</sub> und x<sub>K</sub>, die das Fahrzeug und ein frei fallender Körper in dieser Zeit zurücklegen.',
            note: 'Beide starten aus der Ruhe (v₀ = 0). g = 9,81 m/s². Eine Nachkommastelle.',
            fields: [
                { label: 'x<sub>S</sub> (Fahrzeug)', unit: 'm', ans: T(xs), tol: relTol(xs, 0.01),
                  errors: [{ v: T(2 * xs), msg: 'Haben Sie das ½ vergessen?', tol: relTol(2 * xs, 0.01) }, { v: T(0.5 * a * f.t), msg: 'Die Zeit steht im Quadrat.', tol: relTol(0.5 * a * f.t, 0.01) }] },
                { label: 'x<sub>K</sub> (freier Fall)', unit: 'm', ans: T(xk), tol: relTol(xk, 0.01),
                  errors: [{ v: T(2 * xk), msg: 'Haben Sie das ½ vergessen?', tol: relTol(2 * xk, 0.01) }, { v: T(0.5 * g0 * f.t), msg: 'Die Zeit steht im Quadrat.', tol: relTol(0.5 * g0 * f.t, 0.01) }] }
            ],
            hint: 'x = ½ · a · t². Für den freien Fall ist a = g.',
            explanation: 'x<sub>S</sub> = ½ · ' + de(a, 2) + ' m/s² · (' + de(f.t) + ' s)² ≈ <strong>' + de(xs, 1) + ' m</strong>.<br>' +
                         'x<sub>K</sub> = ½ · 9,81 m/s² · (' + de(f.t) + ' s)² ≈ <strong>' + de(xk, 1) + ' m</strong>.<br>' +
                         'Kontrolle: x<sub>K</sub> / x<sub>S</sub> = g / a<sub>S</sub> ≈ ' + de(g0 / a, 2) + '.'
        };
    },
    function () {
        const f = erstesMal('kraft') ? FAHRZEUGE[0] : rnd(FAHRZEUGE);
        const a = V100 / f.t, F = f.m * a, tk = V100 / g0;
        return {
            type: 'num',
            q: 'Der <strong>' + f.name + '</strong> (m = ' + de(f.m) + ' kg) beschleunigt mit a<sub>S</sub> ≈ ' + de(a, 2) + ' m/s². Welche Kraft ist dafür nötig? Und wie lange bräuchte ein frei fallender Körper, um 100 km/h zu erreichen?',
            note: 'Widerstandskräfte bleiben unberücksichtigt. Kraft auf ganze N, Zeit auf zwei Nachkommastellen.',
            fields: [
                { label: 'Kraft F = m · a', unit: 'N', ans: T(F), tol: relTol(F, 0.005) },
                { label: 'Zeit des freien Körpers bis 100 km/h', unit: 's', ans: T(tk), tol: 20,
                  errors: [{ v: T(100 / g0), msg: 'Rechnen Sie 100 km/h zuerst in m/s um.', tol: 20 }, { v: T(g0 / V100), msg: 'Umstellen: t = v / a.', tol: 5 }] }
            ],
            hint: 'F = m · a. Für die Zeit: v = a · t umstellen: t = v / a, hier mit a = g.',
            explanation: 'F = ' + de(f.m) + ' kg · ' + de(a, 2) + ' m/s² ≈ <strong>' + de(Math.round(F)) + ' N</strong>.<br>' +
                         't = 27,78 m/s / 9,81 m/s² ≈ <strong>' + de(tk, 2) + ' s</strong>. Ein frei fallender Körper wäre nach ' + de(tk, 2) + ' s schon 100 km/h schnell.'
        };
    },
    {
        type: 'mc', shuffle: true, level: 'Begründen',
        q: 'Sportwagen und fallender Körper starten beide aus der Ruhe. In derselben Zeit legt der fallende Körper fast <strong>doppelt</strong> so viel Strecke zurück. Warum?',
        options: ['Weil die Strecke proportional zu t² ist.',
                  'Weil bei v₀ = 0 gilt: x = ½ · a · t². Bei gleicher Zeit ist die Strecke proportional zu a. Und g ist etwa doppelt so groß wie a<sub>S</sub>.',
                  'Weil die Gewichtskraft des Körpers größer ist als die Antriebskraft des Autos.',
                  'Weil der fallende Körper leichter ist als das Auto.'],
        correct: 1,
        wrongHints: {
            'Weil die Strecke proportional zu t² ist.': 'Das stimmt zwar. Aber die Zeit ist für beide gleich. Was ist dann noch verschieden?',
            'Weil die Gewichtskraft des Körpers größer ist als die Antriebskraft des Autos.': 'Kräfte allein sagen nichts. Entscheidend ist a = F / m.',
            'Weil der fallende Körper leichter ist als das Auto.': 'Die Masse spielt beim freien Fall keine Rolle. Alle Körper fallen mit g.'
        },
        hint: 'Vergleichen Sie die beiden Formeln x<sub>S</sub> = ½ · a<sub>S</sub> · t² und x<sub>K</sub> = ½ · g · t².',
        explanation: '½ und t² sind bei beiden gleich. Es bleibt: x<sub>K</sub> / x<sub>S</sub> = g / a<sub>S</sub> = 9,81 / 4,96 ≈ <strong>1,98</strong>. Fast doppelte Beschleunigung, also fast doppelte Strecke.'
    },
    function () {
        let sel;
        do { sel = pickN(FAHRZEUGE, 3); } while (sel.some((x, k) => sel.some((y, j) => j !== k && Math.abs(x.t - y.t) < 0.6)) ||
                                                  sel.some(x => Math.abs(V100 / x.t - g0) < 0.8));
        const all = sel.map(x => ({ n: x.name + ' (0–100 km/h in ' + de(x.t) + ' s)', a: V100 / x.t }))
            .concat([{ n: 'frei fallender Körper', a: g0 }]).sort((p, q) => q.a - p.a);
        return {
            type: 'order', q: 'Sortieren Sie nach der Beschleunigung. Die größte kommt nach oben.',
            top: 'größte Beschleunigung', bottom: 'kleinste Beschleunigung',
            steps: all.map(x => x.n),
            hint: 'a = Δv / Δt. Alle erreichen 100 km/h ≈ 27,78 m/s. Kürzere Zeit heißt größere Beschleunigung. Der freie Fall hat a = 9,81 m/s².',
            explanation: all.map(x => x.n + ': a ≈ <strong>' + de(x.a, 2) + ' m/s²</strong>').join('<br>')
        };
    }
],
// ---------------------------------------------------------------- Modul 7
7: [
    function () {
        const vc = rnd([15, 40]), vb = rnd([30, 45]), tb = rnd([4, 5]);
        const mot = shuffle([
            { name: 'freier Fall', pts: [[0, 0], [5, 49.05]] },
            { name: 'Sportwagen beim Beschleunigen', pts: [[0, 0], [5, 24.8]] },
            { name: 'Fahrt mit konstanter Geschwindigkeit', pts: [[0, vc], [5, vc]] },
            { name: 'Abbremsen bis zum Stillstand', pts: tb === 5 ? [[0, vb], [5, 0]] : [[0, vb], [tb, 0], [5, 0]], at: 0 }
        ]);
        const L = ['A', 'B', 'C', 'D'];
        const svg = vtSvg(mot.map((m, k) => ({ lab: L[k], col: COL[k], pts: m.pts, at: m.at })));
        return {
            type: 'match', svg, shuffle: false,
            q: 'Das v-t-Diagramm zeigt vier Bewegungen. Welche Gerade gehört zu welcher Bewegung?',
            options: ['freier Fall', 'Sportwagen beim Beschleunigen', 'Fahrt mit konstanter Geschwindigkeit', 'Abbremsen bis zum Stillstand'],
            items: mot.map((m, k) => ({ left: 'Gerade ' + L[k], answer: m.name })),
            hint: 'Waagerecht: v bleibt gleich. Fallend: Der Körper wird langsamer. Steigend: Je steiler, desto größer a. Der freie Fall hat a ≈ 10 m/s².',
            explanation: mot.map((m, k) => 'Gerade ' + L[k] + ': <strong>' + m.name + '</strong>').join('<br>') +
                         '<br>Der freie Fall ist steiler (a = 9,81 m/s²) als der Sportwagen (a ≈ 4,96 m/s²).'
        };
    },
    function () {
        let v0, a, v1;
        do { v0 = rnd([0, 0, 5, 10]); a = rnd([2, 3, 4, 5, 6, 7, 8]); v1 = v0 + 5 * a; } while (v1 > 50);
        const x = (v0 + v1) / 2 * 5;
        const svg = vtSvg([{ col: COL[0], pts: [[0, v0], [5, v1]], dots: true }]);
        return {
            type: 'num', svg,
            q: 'Lesen Sie aus dem Diagramm ab. Berechnen Sie die Beschleunigung und die Strecke, die der Körper in den 5 Sekunden zurücklegt.',
            note: 'Die Punkte liegen genau auf den Gitterlinien (Abstand 5 m/s). Strecke auf eine Nachkommastelle.',
            fields: [
                { label: 'Geschwindigkeit bei t = 0', unit: 'm/s', ans: T(v0) },
                { label: 'Geschwindigkeit bei t = 5 s', unit: 'm/s', ans: T(v1) },
                { label: 'Beschleunigung a (Steigung)', unit: 'm/s²', ans: T(a), tol: 50,
                  errors: [{ v: T(v1 / 5), msg: 'Δv = v<sub>Ende</sub> − v<sub>Anfang</sub>. Die Gerade startet nicht bei null.', tol: 50 }] },
                { label: 'Strecke x (Fläche unter der Geraden)', unit: 'm', ans: T(x), tol: relTol(x, 0.01),
                  errors: [{ v: T(v1 * 5), msg: 'Das wäre ein Rechteck. Die Fläche unter einer schrägen Geraden ist ein Dreieck (bzw. Trapez).', tol: relTol(v1 * 5, 0.01) },
                           { v: T(v1 * 5 / 2), msg: 'Bei v₀ ≠ 0 kommt unter dem Dreieck noch ein Rechteck dazu: v₀ · t.', tol: relTol(v1 * 5 / 2, 0.01) }] }
            ],
            hint: 'Steigung: a = Δv / Δt. Fläche: Rechteck v₀ · t plus Dreieck ½ · Δv · t.',
            explanation: 'a = (' + v1 + ' m/s − ' + v0 + ' m/s) / 5 s = <strong>' + a + ' m/s²</strong>.<br>' +
                         'x = ' + (v0 ? v0 + ' m/s · 5 s + ' : '') + '½ · ' + (v1 - v0) + ' m/s · 5 s = <strong>' + de(x) + ' m</strong>.'
        };
    },
    function () {
        const a = V100 / 5.6;
        const kandidaten = shuffle([
            { pts: [[0, 0], [5, 5 * a]], ok: true },
            { pts: [[0, 0], [2.8, 50]], hint: 'Diese Gerade hätte a ≈ 17,86 m/s². So kommt man heraus, wenn man 100 km/h nicht in m/s umrechnet.' },
            { pts: [[0, V100], [5, V100]], at: 0, hint: 'Eine waagerechte Gerade bedeutet konstante Geschwindigkeit. Der Wagen startet aber aus dem Stand.' },
            { pts: [[0, 0], [5, 49.05]], hint: 'Diese Gerade hat die Steigung 9,81 m/s². Das ist der freie Fall.' }
        ]);
        const L = ['A', 'B', 'C', 'D'];
        const svg = vtSvg(kandidaten.map((k, i) => ({ lab: L[i], col: COL[i], pts: k.pts, at: k.at })));
        const options = L.map(x => 'Gerade ' + x);
        const wrongHints = {};
        kandidaten.forEach((k, i) => { if (!k.ok) wrongHints[options[i]] = k.hint; });
        return {
            type: 'mc', svg, q: 'Der Sportwagen beschleunigt in 5,6 s von 0 auf 100 km/h. Welche Gerade zeigt seine Bewegung richtig?',
            options, correct: kandidaten.findIndex(k => k.ok), wrongHints,
            hint: 'Berechnen Sie a<sub>S</sub> = 27,78 m/s / 5,6 s. Welche Geschwindigkeit hat der Wagen nach 5 s?',
            explanation: 'a<sub>S</sub> ≈ 4,96 m/s². Nach 5 s gilt v = 4,96 m/s² · 5 s ≈ <strong>24,8 m/s</strong>. Die Gerade startet im Ursprung und steigt bis etwa 25 m/s bei 5 s.'
        };
    },
    {
        type: 'mc', shuffle: true,
        q: 'Was bedeutet die <strong>Fläche</strong> unter der Geraden im v-t-Diagramm?',
        options: ['die zurückgelegte Strecke', 'die Beschleunigung', 'die Endgeschwindigkeit', 'die benötigte Kraft'],
        correct: 0,
        wrongHints: { 'die Beschleunigung': 'Die Beschleunigung ist die Steigung der Geraden.' },
        hint: 'Rechnen Sie die Einheiten: Fläche = Geschwindigkeit · Zeit = m/s · s = …?',
        explanation: 'Fläche = v · t, Einheit m/s · s = <strong>m</strong>. Die Fläche ist die zurückgelegte <strong>Strecke</strong>. Beim Start aus der Ruhe ist sie ein Dreieck: x = ½ · v · t. Das passt zu x = ½ · a · t², denn v = a · t.'
    },
    richtigFalsch([
        { left: 'Eine waagerechte Linie im v-t-Diagramm bedeutet: Der Körper steht still.', answer: 'falsch' },
        { left: 'Je steiler die Gerade, desto größer die Beschleunigung.', answer: 'richtig' },
        { left: 'Die Fläche unter der Geraden ist die zurückgelegte Strecke.', answer: 'richtig' },
        { left: 'Eine Gerade durch den Ursprung bedeutet: Der Körper startet aus der Ruhe.', answer: 'richtig' },
        { left: 'Eine fallende Gerade bedeutet: Der Körper wird langsamer.', answer: 'richtig' },
        { left: 'Die Steigung der Geraden ist die Geschwindigkeit.', answer: 'falsch' },
        { left: 'Bei gleichmäßiger Beschleunigung ist der Graph im v-t-Diagramm eine Gerade.', answer: 'richtig' }
    ], 5, 'Im v-t-Diagramm gilt: Steigung = Beschleunigung, Fläche = Strecke. Waagerecht heißt konstante Geschwindigkeit (nicht Stillstand). Stillstand ist die Linie bei v = 0.')
]
};
