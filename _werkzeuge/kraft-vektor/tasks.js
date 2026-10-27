// =====================================================================
// Aufgaben für das Modul "Die Kraft – eine gerichtete Größe" (FOS 12)
// Hilfsfunktionen aus engine.js und engine_vektor.js.
// num-Felder: ans in Tausendsteln der Einheit (2,8 -> 2800), tol = Spielraum.
// Rakete wie im Arbeitsblatt: F_W = 0,8 MN (nach rechts), F_G = 2,8 MN (nach unten), g = 9,81 m/s².
// Drei-Kräfte-Beispiel mit eigenen Werten: 500 N / 115°, 260 N / 195°, 390 N / 320°.
// =====================================================================

const BASIC = [1, 2, 3];
const ADVANCED = [4, 5, 6];
const UNLOCK_TEXT = {
    4: 'Mehrere Kräfte greifen an einem Punkt an. Wie groß ist die resultierende Kraft?',
    5: 'Wann heben sich Kräfte auf? Die Gleichgewichtskraft bestimmen.',
    6: 'Die Challenge: Wie muss das Triebwerk einer landenden Rakete eingestellt werden?'
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
const d2 = x => de(x, 2), d1 = x => de(x, 1);
const relTol = (x, p, min) => Math.max(min || 1, Math.round(Math.abs(T(x)) * p));

const _seen = {};
function erstesMal(key) { if (_seen[key]) return false; _seen[key] = true; return true; }

// ---------- Vektor-Rechnung ----------
const cosd = a => Math.cos(a * RAD), sind = a => Math.sin(a * RAD);
const komp = (F, a) => [F * cosd(a), F * sind(a)];
function quadrant(x, y) { return x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3); }
const QN = ['', 'I.', 'II.', 'III.', 'IV.'];
const hilfswinkel = (x, y) => Math.atan(Math.abs(y) / Math.abs(x)) / RAD;
const rechnerWinkel = (x, y) => Math.atan(y / x) / RAD;      // was der Taschenrechner direkt liefert
const BASIS = [15, 20, 25, 30, 35, 40, 50, 55, 60, 65, 70, 75];
function zufallsWinkel(q) { return (q - 1) * 90 + rnd(BASIS); }
const FV = n => '<em>F</em><sub>' + n + '</sub>';               // F mit Index im HTML-Text

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
function calcBox(lines) {
    return '<div class="calc">' + lines.map((s, k) => '<div><span class="calc-nr">Zeile ' + (k + 1) + '</span>' + s + '</div>').join('') + '</div>';
}
function fehlerTask(q, lines, falsch, expl, hint) {
    return {
        type: 'mc', svg: calcBox(lines), q,
        options: lines.map((s, k) => 'Zeile ' + (k + 1)), correct: falsch - 1,
        hint: hint || 'Prüfen Sie jede Zeile: Stimmt die Formel? Stimmt das Vorzeichen? Stimmt die Rechnung?',
        explanation: expl
    };
}
function debateTask(o) {
    return function () {
        const reasons = shuffle(o.reasons.map(r => r[0]));
        const right = o.reasons[0][0];
        const bubbles = '<div class="debate">' + o.people.map((p, k) =>
            '<div class="bubble ' + (k ? 'r' : 'l') + '"><span class="who">' + p[0] + '</span>„' + p[1] + '“</div>').join('') + '</div>';
        return {
            type: 'debate', svg: bubbles, level: o.level, q: o.q,
            fields: [
                { label: 'Wer hat recht?', kind: 'select', options: o.people.map(p => p[0]).concat(['beide', 'keiner von beiden']), ans: o.winner,
                  errors: o.whoErrors || [] },
                { label: 'Die beste Begründung:', kind: 'select', options: reasons, ans: right,
                  errors: o.reasons.slice(1).filter(r => r[1]).map(r => ({ v: r[0], msg: r[1] })) }
            ],
            hint: o.hint, explanation: o.explanation
        };
    };
}

// Kräfte als Text, z. B. "F₁ = 500 N, α₁ = 115°"
const IDX = ['₁', '₂', '₃', '₄'];
function kraftListe(kr) {
    return '<ul>' + kr.map((k, j) => '<li>' + FV(j + 1) + ' = ' + de(k.F) + ' N, &nbsp;α<sub>' + (j + 1) + '</sub> = ' + k.a + '°</li>').join('') + '</ul>';
}
// Skizze: mehrere Kräfte vom Ursprung aus (maßstäblich)
const KCOL = ['#38bdf8', '#f59e0b', '#4ade80', '#f472b6'];
function kraefteSvg(kr, extra) {
    const mx = Math.max.apply(null, kr.map(k => k.F)) * 1.15;
    const step = mx > 450 ? 200 : 100;
    const lim = Math.ceil(mx / step) * step;
    const K = koord({ min: -lim, max: lim, major: step, minor: step / 2, ux: sub('F', 'x') + ' in N', uy: sub('F', 'y') + ' in N', size: 360 });
    let s = K.s;
    kr.forEach((k, j) => {
        const [x, y] = komp(k.F, k.a);
        s += pfeil(K, 0, 0, x, y, KCOL[j], 4) + lab(K, x, y, 'F' + IDX[j], KCOL[j]);
    });
    if (extra) s += extra(K);
    return s + '<circle cx="' + K.X(0) + '" cy="' + K.Y(0) + '" r="4" fill="#f8fafc"/></svg>';
}
// Zufällige Kräfte in verschiedenen Quadranten
function zufallsKraefte(n) {
    const qs = pickN([1, 2, 3, 4], n);
    return qs.map(q => ({ F: rint(20, 60) * 10, a: zufallsWinkel(q) }));
}
function summe(kr) {
    let x = 0, y = 0;
    kr.forEach(k => { const c = komp(k.F, k.a); x += Number(c[0].toFixed(2)); y += Number(c[1].toFixed(2)); });
    return [x, y];
}

// =====================================================================
// Modul 1: Kraft als Vektor
// =====================================================================
const M1 = {
    skalar: function () {
        const all = [
            ['Masse', 'Skalar'], ['Zeit', 'Skalar'], ['Temperatur', 'Skalar'], ['Volumen', 'Skalar'], ['Dichte', 'Skalar'],
            ['Kraft', 'Vektor'], ['Gewichtskraft', 'Vektor'], ['Geschwindigkeit', 'Vektor'], ['Beschleunigung', 'Vektor'], ['Windkraft', 'Vektor']
        ].map(x => ({ left: x[0], answer: x[1],
            errors: x[1] === 'Skalar' ? [{ v: 'Vektor', msg: 'Hat diese Größe eine Richtung? Eine Masse von 5 kg zeigt nirgendwohin.' }]
                                      : [{ v: 'Skalar', msg: 'Hier ist die Richtung wichtig: nach oben, nach links, …' }] }));
        let sel;
        do { sel = pickN(all, 5); } while (sel.every(x => x.answer === sel[0].answer));
        return {
            type: 'match', q: 'Skalar oder Vektor? Ordnen Sie zu.', options: ['Skalar', 'Vektor'], items: sel,
            hint: 'Fragen Sie sich: Reicht eine Zahl mit Einheit? Dann ist es ein Skalar. Braucht man auch eine Richtung? Dann ist es ein Vektor.',
            explanation: 'Skalare haben nur einen Betrag (Masse, Zeit, Temperatur, Volumen, Dichte). <strong>Vektoren</strong> haben Betrag <strong>und</strong> Richtung (alle Kräfte, Geschwindigkeit, Beschleunigung).'
        };
    },
    ablesen: function () {
        const POOL = [15, 30, 45, 60, 75, 105, 120, 135, 150, 165, 195, 210, 225, 240, 255, 285, 300, 315, 330, 345];
        let a, opts;
        do {
            a = rnd(POOL);
            opts = [a, (360 - a) % 360, (180 - a + 360) % 360, (a + 180) % 360];
        } while (new Set(opts).size < 4);
        const K = koord({ min: -5, max: 5, major: 1, lab: 10, size: 340, aria: 'Kraftpfeil mit Winkelskala' });
        let s = K.s;
        for (let w = 0; w < 360; w += 15) {
            const r1 = w % 45 === 0 ? 3.7 : 4.0;
            s += '<line x1="' + K.X(r1 * cosd(w)).toFixed(1) + '" y1="' + K.Y(r1 * sind(w)).toFixed(1) + '" x2="' + K.X(4.3 * cosd(w)).toFixed(1) + '" y2="' + K.Y(4.3 * sind(w)).toFixed(1) + '" stroke="#64748b" stroke-width="' + (w % 45 === 0 ? 2.5 : 1.5) + '"/>';
            if (w % 45 === 0) s += '<text x="' + K.X(4.75 * cosd(w)).toFixed(1) + '" y="' + (K.Y(4.75 * sind(w)) + 5).toFixed(1) + '" fill="#cbd5e1" font-size="13" text-anchor="middle" ' + SF + '>' + w + '°</text>';
        }
        s += '<circle cx="' + K.X(0) + '" cy="' + K.Y(0) + '" r="' + (K.X(4.3) - K.X(0)).toFixed(1) + '" fill="none" stroke="#475569" stroke-width="1.5"/>';
        s += pfeil(K, 0, 0, 3.4 * cosd(a), 3.4 * sind(a), '#f87171', 5);
        s += '</svg>';
        const options = opts.map(w => 'α = ' + w + '°');
        const wh = {};
        wh[options[1]] = 'Sie haben im Uhrzeigersinn gemessen. Dann wäre der Winkel negativ. Hier ist ein positiver Winkel gefragt (gegen den Uhrzeigersinn).';
        wh[options[2]] = 'Sie haben ab der negativen x-Achse gemessen. Start ist immer die positive x-Achse (rechts).';
        wh[options[3]] = 'Das ist die genau entgegengesetzte Richtung. Schauen Sie, wohin die Pfeilspitze zeigt.';
        return {
            type: 'mc', shuffle: true, svg: s, q: 'Welchen Winkel α zur positiven x-Achse hat dieser Kraftpfeil? (Skala in 15°-Schritten)',
            options, correct: 0, wrongHints: wh,
            hint: 'Starten Sie bei 0° (positive x-Achse, rechts). Drehen Sie gegen den Uhrzeigersinn, bis Sie bei der Pfeilspitze sind.',
            explanation: 'Der Pfeil hat den Winkel <strong>α = ' + a + '°</strong>. Er liegt im ' + QN[quadrant(cosd(a), sind(a))] + ' Quadranten.'
        };
    },
    labor: function () {
        return {
            type: 'lab', noRegen: true, level: 'Forscher-Auftrag',
            q: 'Pfeil-Labor: Stellen Sie Betrag und Winkel einer Kraft ein. Beobachten Sie, wie sich der Kraftpfeil verändert.',
            sliders: [{ key: 'F', label: 'Betrag F', unit: 'N', min: 0, max: 600, step: 50, val: 200 },
                      { key: 'a', label: 'Winkel α', unit: '°', min: 0, max: 360, step: 15, val: 30 }],
            view: s => {
                const K = koord({ min: -600, max: 600, major: 200, minor: 100, size: 340, ux: 'x', uy: 'y', aria: 'Kraftpfeil mit einstellbarem Betrag und Winkel' });
                let v = K.s;
                v += '<text x="' + K.X(380) + '" y="' + K.Y(480) + '" fill="#475569" font-size="22" font-weight="bold" text-anchor="middle" ' + SF + '>I</text>';
                v += '<text x="' + K.X(-380) + '" y="' + K.Y(480) + '" fill="#475569" font-size="22" font-weight="bold" text-anchor="middle" ' + SF + '>II</text>';
                v += '<text x="' + K.X(-380) + '" y="' + K.Y(-500) + '" fill="#475569" font-size="22" font-weight="bold" text-anchor="middle" ' + SF + '>III</text>';
                v += '<text x="' + K.X(380) + '" y="' + K.Y(-500) + '" fill="#475569" font-size="22" font-weight="bold" text-anchor="middle" ' + SF + '>IV</text>';
                if (s.a > 0 && s.a < 360) v += bogen(K, s.a, 34, '#fbbf24');
                const [x, y] = komp(s.F, s.a);
                v += pfeil(K, 0, 0, x, y, '#f87171', 5);
                return v + '<circle cx="' + K.X(0) + '" cy="' + K.Y(0) + '" r="4" fill="#f8fafc"/></svg>';
            },
            out: s => 'F = <strong>' + de(s.F) + ' N</strong>, &nbsp;α = <strong>' + de(s.a) + '°</strong>',
            missions: [
                { text: 'Der Pfeil soll <strong>senkrecht nach unten</strong> zeigen.', check: s => s.F > 0 && s.a === 270, sol: { F: 200, a: 270 } },
                { text: 'Stellen Sie eine Kraft von <strong>400 N nach links</strong> ein.', check: s => s.F === 400 && s.a === 180, sol: { F: 400, a: 180 } },
                { text: 'Stellen Sie <strong>300 N schräg nach rechts unten</strong> ein, genau in der Mitte zwischen den Achsen.', check: s => s.F === 300 && s.a === 315, sol: { F: 300, a: 315 } },
                { text: 'Bringen Sie einen Pfeil mit <strong>500 N</strong> in den <strong>II. Quadranten</strong>.', check: s => s.F === 500 && s.a > 90 && s.a < 180, sol: { F: 500, a: 135 } }
            ],
            follow: {
                q: 'Auswertung: Ein Kraftpfeil zeigt nach links unten. Welcher Winkel ist möglich?',
                options: ['α = 210°', 'α = 120°', 'α = 330°', 'α = 30°'],
                correct: 0,
                wrongHints: { 'α = 120°': '120° liegt im II. Quadranten: links oben.', 'α = 330°': '330° liegt im IV. Quadranten: rechts unten.' }
            },
            hint: 'Links unten ist der III. Quadrant. Dort liegt α zwischen 180° und 270°.',
            explanation: 'Links unten ist der <strong>III. Quadrant</strong>: 180° &lt; α &lt; 270°. Also passt <strong>α = 210°</strong>.'
        };
    },
    massstab: function () {
        const s = rnd([50, 100, 200, 250]);
        const F1 = s * rnd([2.5, 3, 3.5, 4, 4.5, 6]);
        const L2 = rnd([2.5, 3.5, 4.5, 5, 6.5, 7]);
        const fields = [
            { label: 'Eine Kraft von ' + de(F1) + ' N. Wie lang wird der Pfeil?', unit: 'cm', ans: T(F1 / s), tol: 20,
              errors: [{ v: T(F1 * s), msg: 'Teilen Sie die Kraft durch den Maßstab: Wie oft passen ' + s + ' N in ' + de(F1) + ' N?', tol: 1000 }] },
            { label: 'Ein Pfeil ist ' + de(L2) + ' cm lang. Wie groß ist die Kraft?', unit: 'N', ans: T(L2 * s), tol: 1000,
              errors: [{ v: T(L2 / s), msg: 'Jeder Zentimeter steht für ' + s + ' N. Malnehmen!', tol: 20 }] }
        ];
        return {
            type: 'num', q: 'Kräftemaßstab: <strong>1 cm ≙ ' + s + ' N</strong>.',
            fields,
            hint: 'Pfeillänge = Kraft : Maßstab. Kraft = Pfeillänge · Maßstab.',
            explanation: de(F1) + ' N : ' + s + ' N/cm = <strong>' + de(F1 / s) + ' cm</strong>. &nbsp;' + de(L2) + ' cm · ' + s + ' N/cm = <strong>' + de(L2 * s) + ' N</strong>.'
        };
    },
    tuer: debateTask({
        q: 'Zwei Mitschüler diskutieren über Kräfte von je 300 N.',
        people: [['Mia', 'Zwei Kräfte von je 300 N haben immer dieselbe Wirkung. Die Zahl ist ja gleich.'],
                 ['Jan', 'Nein. Es kommt auch darauf an, in welche Richtung und wo die Kraft angreift.']],
        winner: 'Jan',
        whoErrors: [{ v: 'Mia', msg: 'Drücken Sie eine Tür einmal am Griff und einmal direkt am Scharnier. Gleiche Kraft, gleiche Wirkung?' }],
        reasons: [['Eine Kraft ist erst mit Betrag, Richtung und Angriffspunkt vollständig beschrieben.'],
                  ['Kräfte sind Skalare. Deshalb zählt nur die Zahl.', 'Kräfte sind Vektoren. Sie haben auch eine Richtung.'],
                  ['300 N nach oben sind mehr als 300 N nach unten.', 'Der Betrag ist gleich. Nur die Richtung ist verschieden.'],
                  ['Nur die Masse des Körpers entscheidet über die Wirkung.']],
        hint: 'Denken Sie an die drei Bestimmungsstücke einer Kraft.',
        explanation: 'Jan hat recht. Eine Kraft ist durch <strong>Betrag, Richtung und Angriffspunkt</strong> festgelegt. 300 N am Türgriff öffnen die Tür. 300 N direkt am Scharnier bewirken fast nichts.'
    }),
    zeichnen: function () {
        let F1, a1, F2, a2;
        if (erstesMal('m1zeichnen')) { F1 = 400; a1 = 135; F2 = 300; a2 = 240; }
        else {
            const qs = pickN([1, 2, 3, 4], 2);
            F1 = rint(4, 10) * 50; a1 = (qs[0] - 1) * 90 + rnd([30, 45, 60]);
            F2 = rint(4, 10) * 50; a2 = (qs[1] - 1) * 90 + rnd([30, 45, 60]);
        }
        return {
            type: 'vector', readout: 'polar',
            q: 'Zeichnen Sie beide Kräfte ein. Unter dem Bild sehen Sie Betrag und Winkel Ihres Pfeils.',
            g: { min: -600, max: 600, major: 100, lab: 200, snap: 10, unit: 'N', size: 400, ux: sub('F', 'x') + ' in N', uy: sub('F', 'y') + ' in N' },
            pens: [{ key: 'A', lab: 'F₁ = ' + F1 + ' N, α₁ = ' + a1 + '°', col: '#38bdf8', target: komp(F1, a1), tol: 30 },
                   { key: 'B', lab: 'F₂ = ' + F2 + ' N, α₂ = ' + a2 + '°', col: '#f59e0b', target: komp(F2, a2), tol: 30 }],
            hint: 'Erst die Richtung: von der positiven x-Achse gegen den Uhrzeigersinn drehen. Dann die Länge: Ein Kästchen sind 100 N.',
            explanation: 'Beide Pfeile stimmen in Länge und Richtung. Länge = Betrag, Richtung = Winkel α.'
        };
    }
};

// =====================================================================
// Modul 2: Kraft zerlegen
// =====================================================================
function kompLabView(s) {
    const K = koord({ min: -500, max: 500, major: 100, lab: 200, size: 340, ux: 'x', uy: 'y', aria: 'Kraftpfeil mit x- und y-Komponente' });
    const [x, y] = komp(s.F, s.a);
    let v = K.s;
    v += strich(K, x, 0, x, y, '#94a3b8') + strich(K, 0, y, x, y, '#94a3b8');
    v += pfeil(K, 0, 0, x, 0, '#f87171', 5) + pfeil(K, 0, 0, 0, y, '#4ade80', 5);
    v += pfeil(K, 0, 0, x, y, '#f8fafc', 4);
    if (Math.abs(x) > 1) v += '<text x="' + K.X(x / 2) + '" y="' + (K.Y(0) + (y >= 0 ? 34 : -12)) + '" fill="#f87171" font-size="15" font-weight="bold" text-anchor="middle" ' + SF + '>' + sub('F', 'x') + '</text>';
    if (Math.abs(y) > 1) v += '<text x="' + (K.X(0) + (x >= 0 ? -10 : 10)) + '" y="' + (K.Y(y / 2) + 5) + '" fill="#4ade80" font-size="15" font-weight="bold" text-anchor="' + (x >= 0 ? 'end' : 'start') + '" ' + SF + '>' + sub('F', 'y') + '</text>';
    return v + '<circle cx="' + K.X(0) + '" cy="' + K.Y(0) + '" r="4" fill="#f8fafc"/></svg>';
}
const near0 = x => Math.abs(x) < 1e-6;
const M2 = {
    labor: function () {
        return {
            type: 'lab', noRegen: true, level: 'Forscher-Auftrag',
            q: 'Komponenten-Labor: Der weiße Pfeil ist die Kraft F. Rot ist ihre x-Komponente, grün ihre y-Komponente.',
            sliders: [{ key: 'F', label: 'Betrag F', unit: 'N', min: 0, max: 500, step: 50, val: 300 },
                      { key: 'a', label: 'Winkel α', unit: '°', min: 0, max: 360, step: 5, val: 30 }],
            view: kompLabView,
            out: s => {
                const [x, y] = komp(s.F, s.a);
                return '<span style="color:#f87171">F<sub>x</sub> = ' + de(s.F) + ' N · cos ' + de(s.a) + '° = <strong>' + d2(near0(x) ? 0 : x) + ' N</strong></span><br>' +
                       '<span style="color:#4ade80">F<sub>y</sub> = ' + de(s.F) + ' N · sin ' + de(s.a) + '° = <strong>' + d2(near0(y) ? 0 : y) + ' N</strong></span>';
            },
            missions: [
                { text: 'Machen Sie <strong>F<sub>x</sub> = 0</strong>. Die Kraft selbst soll nicht null sein.', check: s => s.F > 0 && near0(cosd(s.a)), sol: { F: 300, a: 90 } },
                { text: 'Stellen Sie ein: <strong>F<sub>x</sub> negativ</strong> und <strong>F<sub>y</sub> positiv</strong>.', check: s => s.F > 0 && cosd(s.a) < -1e-6 && sind(s.a) > 1e-6, sol: { F: 300, a: 120 } },
                { text: 'Machen Sie F<sub>x</sub> und F<sub>y</sub> <strong>gleich groß</strong> und beide <strong>negativ</strong>.', check: s => s.F > 0 && s.a === 225, sol: { F: 300, a: 225 } },
                { text: 'Stellen Sie <strong>F<sub>y</sub> = −100 N</strong> mit <strong>F = 200 N</strong> ein.', check: s => s.F === 200 && Math.abs(200 * sind(s.a) + 100) < 1e-6, sol: { F: 200, a: 330 } }
            ],
            follow: {
                q: 'Auswertung: Sie drehen den Pfeil von α = 0° bis α = 90°. Was passiert mit F<sub>x</sub>?',
                options: ['F<sub>x</sub> wird immer kleiner. Bei 90° ist F<sub>x</sub> = 0.',
                          'F<sub>x</sub> wird immer größer. Bei 90° ist F<sub>x</sub> = F.',
                          'F<sub>x</sub> bleibt gleich, nur F<sub>y</sub> ändert sich.',
                          'F<sub>x</sub> wird negativ.'],
                correct: 0,
                wrongHints: { 'F<sub>x</sub> wird immer größer. Bei 90° ist F<sub>x</sub> = F.': 'Das passiert mit F<sub>y</sub>. Schauen Sie auf den roten Pfeil.' }
            },
            hint: 'F<sub>x</sub> = F · cos α. Bei 0° ist cos α = 1, bei 90° ist cos α = 0.',
            explanation: 'Bei 0° zeigt die Kraft ganz nach rechts: F<sub>x</sub> = F. Je steiler der Pfeil, desto kleiner F<sub>x</sub>. Bei 90° ist <strong>F<sub>x</sub> = 0</strong> und F<sub>y</sub> = F.'
        };
    },
    vorzeichen: function () {
        const opts = ['Fx +, Fy +', 'Fx −, Fy +', 'Fx −, Fy −', 'Fx +, Fy −'];
        const items = [1, 2, 3, 4].map(q => {
            const a = zufallsWinkel(q);
            return { left: 'α = ' + a + '°', answer: opts[q - 1] };
        });
        return {
            type: 'match', q: 'Welche Vorzeichen haben F<sub>x</sub> und F<sub>y</sub>? Ordnen Sie zu.', options: opts, items,
            hint: 'Bestimmen Sie zuerst den Quadranten. Rechts heißt F<sub>x</sub> positiv, oben heißt F<sub>y</sub> positiv.',
            explanation: 'I. Quadrant (0° bis 90°): + / +. II. (90° bis 180°): − / +. III. (180° bis 270°): − / −. IV. (270° bis 360°): + / −.'
        };
    },
    rechnen: function () {
        const kr = erstesMal('m2rechnen') ? [{ F: 500, a: 115 }, { F: 260, a: 195 }] : zufallsKraefte(2);
        const fields = [];
        kr.forEach((k, j) => {
            const [x, y] = komp(k.F, k.a);
            const nr = j + 1;
            fields.push({ label: 'F<sub>' + nr + ',x</sub> =', unit: 'N', ans: T(x), tol: relTol(x, 0.003, 20),
                errors: [{ v: T(-x), msg: 'Vorzeichen prüfen: In welchem Quadranten liegt F' + IDX[j] + '?', tol: relTol(x, 0.003, 20) },
                         { v: T(k.F * sind(k.a)), msg: 'Sie haben sin genommen. Für die x-Komponente gilt cos.', tol: relTol(y, 0.003, 20) },
                         { v: T(k.F * Math.cos(k.a)), msg: 'Ihr Taschenrechner steht auf RAD. Stellen Sie ihn auf DEG (Grad) um.', tol: 20 }] });
            fields.push({ label: 'F<sub>' + nr + ',y</sub> =', unit: 'N', ans: T(y), tol: relTol(y, 0.003, 20),
                errors: [{ v: T(-y), msg: 'Vorzeichen prüfen: In welchem Quadranten liegt F' + IDX[j] + '?', tol: relTol(y, 0.003, 20) },
                         { v: T(k.F * cosd(k.a)), msg: 'Sie haben cos genommen. Für die y-Komponente gilt sin.', tol: relTol(x, 0.003, 20) },
                         { v: T(k.F * Math.sin(k.a)), msg: 'Ihr Taschenrechner steht auf RAD. Stellen Sie ihn auf DEG (Grad) um.', tol: 20 }] });
        });
        return {
            type: 'num', svg: kraefteSvg(kr), q: 'Zerlegen Sie beide Kräfte in ihre Komponenten.' + kraftListe(kr),
            note: 'Runden Sie auf zwei Nachkommastellen. Komma oder Punkt ist egal.',
            fields,
            hint: 'F<sub>x</sub> = F · cos α und F<sub>y</sub> = F · sin α. Taschenrechner auf DEG. Kontrolle: Passen die Vorzeichen zum Quadranten?',
            explanation: kr.map((k, j) => {
                const [x, y] = komp(k.F, k.a);
                return 'F' + IDX[j] + ': F<sub>x</sub> = ' + k.F + ' N · cos ' + k.a + '° = <strong>' + d2(x) + ' N</strong>, F<sub>y</sub> = ' + k.F + ' N · sin ' + k.a + '° = <strong>' + d2(y) + ' N</strong>';
            }).join('<br>')
        };
    },
    fehler: function () {
        if (Math.random() < 0.5) return fehlerTask('Finden Sie den Fehler in diesem Rechenweg.', [
            'Gegeben: F = 350 N, α = 160°. Das ist der II. Quadrant.',
            'F<sub>x</sub> = 350 N · cos 160° = −328,89 N',
            'F<sub>y</sub> = 350 N · sin 160° = −119,71 N',
            'Kontrolle: II. Quadrant → F<sub>x</sub> negativ, F<sub>y</sub> positiv'
        ], 3, 'In Zeile 3 ist das Vorzeichen falsch: sin 160° ist positiv. Richtig ist <strong>F<sub>y</sub> = +119,71 N</strong>. Die Kontrolle in Zeile 4 zeigt den Fehler.');
        return fehlerTask('Finden Sie den Fehler in diesem Rechenweg.', [
            'Gegeben: F = 280 N, α = 250°. Das ist der III. Quadrant.',
            'F<sub>x</sub> = 280 N · sin 250° = −263,11 N',
            'F<sub>y</sub> = 280 N · sin 250° = −263,11 N',
            'Kontrolle: III. Quadrant → beide Komponenten negativ ✓'
        ], 2, 'In Zeile 2 steht sin statt cos. Richtig ist <strong>F<sub>x</sub> = 280 N · cos 250° = −95,77 N</strong>. Die Kontrolle hat den Fehler nicht gefunden: Die Vorzeichen stimmen zufällig.');
    },
    links: function () {
        const F = rnd([300, 400, 450, 500, 650]);
        const r = rnd([['nach links', 180, -F, 0], ['senkrecht nach unten', 270, 0, -F], ['senkrecht nach oben', 90, 0, F]]);
        const opts = [[r[2], r[3]], [-r[2], -r[3]], [r[3], r[2]], [r[2] / 2 || -F / 2, r[3] / 2 || -F / 2]];
        const fmt = o => 'F<sub>x</sub> = ' + de(o[0] + 0) + ' N, F<sub>y</sub> = ' + de(o[1] + 0) + ' N';
        const options = opts.map(fmt);
        return {
            type: 'mc', shuffle: true, level: 'Begründen',
            q: 'Eine Kraft von ' + F + ' N zeigt ' + r[0] + ' (α = ' + r[1] + '°). Welche Komponenten hat sie?',
            options, correct: 0,
            hint: 'Zeigt eine Kraft genau entlang einer Achse, hat sie nur eine Komponente. Die andere ist null.',
            explanation: 'cos ' + r[1] + '° = ' + de(Math.round(cosd(r[1]))) + ' und sin ' + r[1] + '° = ' + de(Math.round(sind(r[1]))) + '. Also <strong>' + fmt(opts[0]) + '</strong>. Die Kraft liegt ganz auf einer Achse.'
        };
    }
};

// =====================================================================
// Modul 3: Betrag und Winkel aus den Komponenten
// =====================================================================
function zufallsKomp(q) {
    let x, y;
    do { x = rint(4, 48) * 10; y = rint(4, 48) * 10; } while (Math.abs(x - y) < 30);
    return [q === 1 || q === 4 ? x : -x, q === 1 || q === 2 ? y : -y];
}
const M3 = {
    rechnen: function () {
        let ps;
        if (erstesMal('m3rechnen')) ps = [[-90, 210], [250, -180]];
        else { const qs = pickN([2, 3, 4], 2); ps = qs.map(zufallsKomp); }
        const fields = [];
        ps.forEach((p, j) => {
            const F = Math.hypot(p[0], p[1]), a = winkelVon(p[0], p[1]), h = hilfswinkel(p[0], p[1]);
            fields.push({ label: 'Kraft ' + (j + 1) + ': Betrag F =', unit: 'N', ans: T(F), tol: 60,
                errors: [{ v: T(Math.abs(p[0]) + Math.abs(p[1])), msg: 'Die Komponenten nicht einfach addieren. Satz des Pythagoras!', tol: 60 }] });
            fields.push({ label: 'Kraft ' + (j + 1) + ': Winkel α =', unit: '°', ans: T(a), alt: [T(a - 360)], tol: 150,
                errors: [{ v: T(h), msg: 'Das ist nur der Hilfswinkel α′. In welchem Quadranten liegt die Kraft?', tol: 150 },
                         { v: T(rechnerWinkel(p[0], p[1])), msg: 'Das liefert der Taschenrechner direkt. Er kennt den Quadranten nicht.', tol: 150 },
                         { v: T(360 - a), msg: 'Im Uhrzeigersinn gemessen? Dann ist der Winkel negativ. Achten Sie auf das Minuszeichen.', tol: 150 }] });
        });
        return {
            type: 'num', q: 'Berechnen Sie Betrag und Winkel.<ul>' + ps.map((p, j) => '<li>Kraft ' + (j + 1) + ': F<sub>x</sub> = ' + de(p[0]) + ' N, F<sub>y</sub> = ' + de(p[1]) + ' N</li>').join('') + '</ul>',
            note: 'Betrag auf zwei, Winkel auf eine Nachkommastelle runden. Negative Winkel (im Uhrzeigersinn) sind erlaubt.',
            fields,
            hint: 'F = √(F<sub>x</sub>² + F<sub>y</sub>²). Dann Quadrant aus den Vorzeichen, Hilfswinkel α′ = arctan(|F<sub>y</sub>| / |F<sub>x</sub>|) und Quadranten-Regel.',
            explanation: ps.map((p, j) => {
                const q = quadrant(p[0], p[1]), h = hilfswinkel(p[0], p[1]), a = winkelVon(p[0], p[1]);
                const regel = ['', d1(h) + '°', '180° − ' + d1(h) + '°', '180° + ' + d1(h) + '°', '360° − ' + d1(h) + '°'][q];
                return 'Kraft ' + (j + 1) + ': F = <strong>' + d2(Math.hypot(p[0], p[1])) + ' N</strong>. ' + QN[q] + ' Quadrant, α′ = ' + d1(h) + '° → α = ' + regel + ' = <strong>' + d1(a) + '°</strong>' +
                    ((q === 3 || q === 4) ? ' (im Uhrzeigersinn: <strong>' + d1(a - 360) + '°</strong>)' : '');
            }).join('<br>')
        };
    },
    regel: {
        type: 'match', q: 'Welche Regel gilt für welchen Quadranten? (α′ = Hilfswinkel)',
        options: ['α = α′', 'α = 180° − α′', 'α = 180° + α′', 'α = 360° − α′ oder α = −α′'],
        items: [{ left: 'Fx positiv, Fy positiv (I.)', answer: 'α = α′' },
                { left: 'Fx negativ, Fy positiv (II.)', answer: 'α = 180° − α′' },
                { left: 'Fx negativ, Fy negativ (III.)', answer: 'α = 180° + α′' },
                { left: 'Fx positiv, Fy negativ (IV.)', answer: 'α = 360° − α′ oder α = −α′' }],
        hint: 'Skizzieren Sie den Pfeil. α′ liegt immer zwischen dem Pfeil und der x-Achse. α beginnt immer bei der positiven x-Achse.',
        explanation: 'I.: α = α′. &nbsp;II.: α = 180° − α′. &nbsp;III.: α = 180° + α′. &nbsp;IV.: α = 360° − α′ oder, im Uhrzeigersinn, α = −α′.'
    },
    reihenfolge: {
        type: 'order', q: 'Sie kennen F<sub>x</sub> und F<sub>y</sub>. Bringen Sie die Schritte zur Bestimmung von α in die richtige Reihenfolge.',
        steps: ['Vorzeichen von F<sub>x</sub> und F<sub>y</sub> ansehen.',
                'Daraus den Quadranten bestimmen.',
                'Hilfswinkel berechnen: α′ = arctan(|F<sub>y</sub>| / |F<sub>x</sub>|).',
                'Mit der Quadranten-Regel α berechnen.',
                'Kontrolle: Liegt α im richtigen Bereich des Quadranten?'],
        top: 'zuerst', bottom: 'zuletzt',
        hint: 'Erst die Vorzeichen, dann rechnen, zum Schluss kontrollieren.',
        explanation: 'Vorzeichen → Quadrant → Hilfswinkel → Quadranten-Regel → Kontrolle.'
    },
    debatte: debateTask({
        q: 'Gegeben: F<sub>x</sub> = −120 N und F<sub>y</sub> = 90 N. Zwei Mitschüler rechnen den Winkel aus.',
        people: [['Lena', 'Mein Taschenrechner zeigt bei arctan(90 / −120) den Wert −36,87°. Also ist α = −36,87°.'],
                 ['Emre', 'Das kann nicht stimmen. Der richtige Winkel ist α = 143,13°.']],
        winner: 'Emre',
        whoErrors: [{ v: 'Lena', msg: 'Wo läge ein Pfeil mit −36,87°? Und wohin zeigt eine Kraft mit negativem F_x und positivem F_y?' }],
        reasons: [['F_x ist negativ, F_y positiv: II. Quadrant. Also α = 180° − 36,87° = 143,13°.'],
                  ['Negative Winkel gibt es nicht.', 'Negative Winkel gibt es: Sie werden im Uhrzeigersinn eingetragen. −36,87° zeigt aber nach rechts unten, also in den IV. Quadranten.'],
                  ['Man muss zum Ergebnis des Taschenrechners immer 180° addieren.', 'Hier passt es zufällig. Im I. Quadranten wäre das aber falsch.'],
                  ['Der Taschenrechner steht im falschen Modus.', 'DEG ist richtig eingestellt. Das Problem ist der Quadrant.']],
        hint: 'Bestimmen Sie den Quadranten aus den Vorzeichen. Passt −36,87° dazu?',
        explanation: 'Emre hat recht. Der Taschenrechner liefert bei arctan nur Werte zwischen −90° und +90°. −36,87° würde man im Uhrzeigersinn eintragen: Der Pfeil zeigte nach rechts unten. Die Kraft liegt aber im <strong>II. Quadranten</strong>: α = 180° − 36,87° = <strong>143,13°</strong>.'
    }),
    erklaeren: {
        type: 'text', level: 'In eigenen Worten',
        q: 'Ein Mitschüler fragt: „Warum kann ich den Winkel nicht einfach mit arctan(F<sub>y</sub> / F<sub>x</sub>) ausrechnen und fertig?“ Erklären Sie es ihm. Nutzen Sie ein Beispiel.',
        model: 'Der Taschenrechner liefert bei arctan nur Winkel zwischen −90° und +90°. Er sieht nur den Quotienten F<sub>y</sub> / F<sub>x</sub>. Ob F<sub>x</sub> oder F<sub>y</sub> negativ war, weiß er nicht. Beispiel: (−120 N | 90 N) und (120 N | −90 N) ergeben beide −0,75. Die Pfeile zeigen aber in entgegengesetzte Richtungen. Deshalb bestimme ich zuerst den Quadranten aus den Vorzeichen. Dann rechne ich den Hilfswinkel aus und wende die Quadranten-Regel an.',
        checklist: ['Der Taschenrechner liefert nur Winkel zwischen −90° und +90°.', 'Er kennt die Vorzeichen der Komponenten nicht einzeln.', 'Man muss zuerst den Quadranten bestimmen.', 'Ein Beispiel mit zwei verschiedenen Kräften und gleichem Quotienten.'],
        explanation: 'Vergleichen Sie Ihre Antwort mit der Musterlösung und haken Sie ab, was Sie schon drin haben.',
        hint: ''
    }
};

// =====================================================================
// Modul 4: Kräfte addieren
// =====================================================================
const SIMS = {
    rechteck(el, done) {
        const K = koord({ min: -100, max: 600, major: 100, size: 320, ux: 'x in N', uy: 'y in N', aria: 'Animation: Zwei Kräfte werden aneinandergehängt' });
        const ring = '<circle cx="' + K.X(0) + '" cy="' + K.Y(0) + '" r="6" fill="none" stroke="#f8fafc" stroke-width="3"/>';
        el.innerHTML = K.s + '<g class="f1">' + pfeil(K, 0, 0, 300, 0, '#38bdf8', 5) + '</g><g class="f2"></g><g class="fr"></g>' + ring +
            '<text class="msg" x="' + K.W / 2 + '" y="' + (K.W - 4) + '" fill="#4ade80" font-size="15" font-weight="bold" text-anchor="middle" ' + SF + '></text></svg>';
        const g2 = el.querySelector('.f2'), gr = el.querySelector('.fr');
        animate(2600, p => {
            const s = Math.min(1, Math.max(0, (p - 0.25) / 0.4));          // F2 wandert an die Spitze von F1
            g2.innerHTML = pfeil(K, 300 * s, 0, 300 * s, 400, '#f59e0b', 5);
            if (p > 0.7) {
                const r = Math.min(1, (p - 0.7) / 0.3);
                gr.innerHTML = pfeil(K, 0, 0, 300 * r, 400 * r, '#c084fc', 6);
            }
            if (p >= 1) {
                gr.innerHTML += lab(K, 300, 400, 'F = 500 N', '#c084fc');
                el.querySelector('.msg').textContent = 'Resultierende: √(300² + 400²) N = 500 N';
            }
        }, done);
    }
};
function zweiLabView(s) {
    const K = koord({ min: -300, max: 600, major: 100, lab: 200, size: 340, ux: 'x', uy: 'y', aria: 'Zwei Kräfte und ihre Resultierende' });
    const [x2, y2] = komp(300, s.b);
    let v = K.s;
    v += strich(K, 300, 0, 300 + x2, y2, '#f59e0b55', 2);
    v += pfeil(K, 0, 0, 300, 0, '#38bdf8', 5) + pfeil(K, 0, 0, x2, y2, '#f59e0b', 5);
    v += pfeil(K, 0, 0, 300 + x2, y2, '#c084fc', 6);
    if (s.b > 0) v += bogen(K, s.b, 30, '#fbbf24', 'β');
    return v + '<circle cx="' + K.X(0) + '" cy="' + K.Y(0) + '" r="4" fill="#f8fafc"/></svg>';
}
function resZweier(b) { const [x2, y2] = komp(300, b); return Math.hypot(300 + x2, y2); }
const M4 = {
    vorhersage: {
        type: 'predict', sim: 'rechteck', shuffle: true,
        q: 'An einem Ring ziehen zwei Seile: eines mit 300 N nach rechts, eines mit 400 N nach oben. Wie groß ist die resultierende Kraft?',
        options: ['700 N', '500 N', '100 N', '350 N'],
        correct: 1,
        reveal: 'Die resultierende Kraft ist 500 N, nicht 700 N.',
        follow: {
            q: 'Warum ist die Resultierende nicht 300 N + 400 N = 700 N?',
            options: ['Die Kräfte zeigen in verschiedene Richtungen. Hängt man die Pfeile aneinander, entsteht ein rechtwinkliges Dreieck: √(300² + 400²) = 500 N.',
                      'Ein Teil der Kraft geht im Seil verloren.',
                      'Die größere Kraft gewinnt, die kleinere wird abgezogen.',
                      'Kräfte darf man grundsätzlich nur subtrahieren.'],
            correct: 0,
            wrongHints: { 'Ein Teil der Kraft geht im Seil verloren.': 'Es geht nichts verloren. Es liegt an der Richtung.',
                          'Die größere Kraft gewinnt, die kleinere wird abgezogen.': 'Das gilt nur bei genau entgegengesetzten Kräften.' }
        },
        hint: 'Kräfte sind Vektoren. Beträge darf man nur bei gleicher Richtung einfach addieren.',
        explanation: 'Die Kräfte stehen senkrecht zueinander. F<sub>res,x</sub> = 300 N, F<sub>res,y</sub> = 400 N. Also F<sub>res</sub> = √(300² + 400²) N = <strong>500 N</strong>.'
    },
    labor: function () {
        return {
            type: 'lab', noRegen: true, level: 'Forscher-Auftrag',
            q: 'Zwei-Kräfte-Labor: Blau (300 N) zieht nach rechts. Orange (300 N) zieht unter dem Winkel β. Lila ist die Resultierende.',
            sliders: [{ key: 'b', label: 'Winkel β zwischen den Kräften', unit: '°', min: 0, max: 180, step: 10, val: 60 }],
            view: zweiLabView,
            out: s => 'F<sub>res</sub> = <strong>' + d1(resZweier(s.b)) + ' N</strong>',
            missions: [
                { text: 'Machen Sie die Resultierende so <strong>groß</strong> wie möglich.', check: s => s.b === 0, sol: { b: 0 } },
                { text: 'Machen Sie die Resultierende <strong>null</strong>.', check: s => s.b === 180, sol: { b: 180 } },
                { text: 'Stellen Sie β so ein, dass F<sub>res</sub> genau <strong>300 N</strong> ist, also so groß wie eine Einzelkraft.', check: s => s.b === 120, sol: { b: 120 } }
            ],
            follow: {
                q: 'Was zeigt das Labor?',
                options: ['Je größer der Winkel zwischen den Kräften, desto kleiner die Resultierende.',
                          'Die Resultierende ist immer 600 N.',
                          'Die Resultierende ist immer größer als jede Einzelkraft.',
                          'Der Winkel hat keinen Einfluss.'],
                correct: 0,
                wrongHints: { 'Die Resultierende ist immer größer als jede Einzelkraft.': 'Bei β = 120° war sie gleich groß, bei 180° sogar null.' }
            },
            hint: 'Vergleichen Sie Ihre Einstellungen: 0°, 120° und 180°.',
            explanation: 'β = 0°: 600 N (gleiche Richtung, Beträge addieren). β = 120°: 300 N. β = 180°: 0 N (die Kräfte heben sich auf). <strong>Je größer β, desto kleiner F<sub>res</sub>.</strong>'
        };
    },
    rechnen: function () {
        let kr;
        if (erstesMal('m4rechnen')) kr = [{ F: 500, a: 115 }, { F: 260, a: 195 }, { F: 390, a: 320 }];
        else {
            let ok;
            do {
                kr = zufallsKraefte(3);
                const [x, y] = summe(kr), h = hilfswinkel(x, y);
                ok = Math.hypot(x, y) > 80 && h > 10 && h < 80 && quadrant(x, y) !== 1;
            } while (!ok);
        }
        const [x, y] = summe(kr), F = Math.hypot(x, y), a = winkelVon(x, y), h = hilfswinkel(x, y);
        const fields = [
            { label: 'F<sub>res,x</sub> =', unit: 'N', ans: T(x), tol: 100,
              errors: [{ v: T(-x), msg: 'Vorzeichen prüfen. Addieren Sie die x-Komponenten mit ihren Vorzeichen.', tol: 100 }] },
            { label: 'F<sub>res,y</sub> =', unit: 'N', ans: T(y), tol: 100,
              errors: [{ v: T(-y), msg: 'Vorzeichen prüfen. Addieren Sie die y-Komponenten mit ihren Vorzeichen.', tol: 100 }] },
            { label: 'Betrag F<sub>res</sub> =', unit: 'N', ans: T(F), tol: 100,
              errors: [{ v: T(kr.reduce((s, k) => s + k.F, 0)), msg: 'Die Beträge darf man nicht einfach addieren. Rechnen Sie mit den Komponenten.', tol: 100 }] },
            { label: 'Winkel α<sub>res</sub> =', unit: '°', ans: T(a), alt: [T(a - 360)], tol: 200,
              errors: [{ v: T(h), msg: 'Das ist nur der Hilfswinkel α′. In welchem Quadranten liegt F_res?', tol: 200 },
                       { v: T(rechnerWinkel(x, y)), msg: 'Das liefert der Taschenrechner direkt. Beachten Sie den Quadranten.', tol: 200 }] }
        ];
        return {
            type: 'num', svg: kraefteSvg(kr), q: 'Drei Kräfte greifen an einem Punkt an. Berechnen Sie die resultierende Kraft.' + kraftListe(kr),
            note: 'Komponenten und Betrag auf zwei, Winkel auf eine Nachkommastelle runden.',
            fields,
            hint: 'Jede Kraft zerlegen. Alle x-Komponenten addieren, alle y-Komponenten addieren. Dann Betrag mit Pythagoras und Winkel mit der Quadranten-Regel.',
            explanation: kr.map((k, j) => { const c = komp(k.F, k.a); return 'F' + IDX[j] + ': (' + d2(c[0]) + ' N | ' + d2(c[1]) + ' N)'; }).join('<br>') +
                '<br>F<sub>res,x</sub> = <strong>' + d2(x) + ' N</strong>, F<sub>res,y</sub> = <strong>' + d2(y) + ' N</strong>' +
                '<br>F<sub>res</sub> = <strong>' + d2(F) + ' N</strong>, ' + QN[quadrant(x, y)] + ' Quadrant, α′ = ' + d1(h) + '° → α<sub>res</sub> = <strong>' + d1(a) + '°</strong>'
        };
    },
    fehler: function () {
        const base = ['F<sub>1</sub>: F<sub>x</sub> = 250 N · cos 30° = 216,51 N; &nbsp;F<sub>y</sub> = 250 N · sin 30° = 125,00 N',
                      'F<sub>2</sub>: F<sub>x</sub> = 400 N · cos 150° = −346,41 N; &nbsp;F<sub>y</sub> = 400 N · sin 150° = 200,00 N'];
        if (Math.random() < 0.5) return fehlerTask('Zwei Kräfte: F₁ = 250 N (α₁ = 30°) und F₂ = 400 N (α₂ = 150°). Finden Sie den Fehler.', base.concat([
            'F<sub>res,x</sub> = 216,51 N + 346,41 N = 562,92 N',
            'F<sub>res,y</sub> = 125,00 N + 200,00 N = 325,00 N',
            'F<sub>res</sub> = √(562,92² + 325,00²) N = 650,00 N'
        ]), 3, 'In Zeile 3 fehlt das Minuszeichen: F<sub>res,x</sub> = 216,51 N + (−346,41 N) = <strong>−129,90 N</strong>. Damit wird F<sub>res</sub> = √(129,90² + 325,00²) N ≈ <strong>350,00 N</strong>.');
        return fehlerTask('Zwei Kräfte: F₁ = 250 N (α₁ = 30°) und F₂ = 400 N (α₂ = 150°). Finden Sie den Fehler.', base.concat([
            'F<sub>res,x</sub> = 216,51 N + (−346,41 N) = −129,90 N',
            'F<sub>res,y</sub> = 125,00 N + 200,00 N = 325,00 N',
            'F<sub>res</sub> = 250 N + 400 N = 650 N'
        ]), 5, 'In Zeile 5 wurden die Beträge addiert. Das geht nur bei gleicher Richtung. Richtig: F<sub>res</sub> = √((−129,90)² + 325,00²) N ≈ <strong>350,00 N</strong>.');
    },
    zeichnen: function () {
        let a, b;
        if (erstesMal('m4zeichnen')) { a = [300, 100]; b = [-100, 250]; }
        else {
            do {
                a = [rint(-6, 6) * 50, rint(-6, 6) * 50]; b = [rint(-6, 6) * 50, rint(-6, 6) * 50];
            } while (Math.hypot(a[0], a[1]) < 150 || Math.hypot(b[0], b[1]) < 150 ||
                     Math.abs(a[0] + b[0]) > 450 || Math.abs(a[1] + b[1]) > 450 || Math.hypot(a[0] + b[0], a[1] + b[1]) < 100 ||
                     Math.abs(a[0] * b[1] - a[1] * b[0]) < 20000);
        }
        return {
            type: 'vector', readout: 'xy',
            q: 'Zeichnen Sie die resultierende Kraft F<sub>res</sub> von F<sub>1</sub> und F<sub>2</sub> ein.',
            g: { min: -500, max: 500, major: 100, lab: 200, minor: 50, snap: 10, unit: 'N', size: 400, ux: sub('F', 'x') + ' in N', uy: sub('F', 'y') + ' in N' },
            fixed: [{ x: a[0], y: a[1], lab: 'F₁', col: '#38bdf8' }, { x: b[0], y: b[1], lab: 'F₂', col: '#f59e0b' }],
            pens: [{ key: 'R', lab: 'F<sub>res</sub>', col: '#c084fc', target: [a[0] + b[0], a[1] + b[1]], tol: 25 }],
            hint: 'Lesen Sie die Komponenten ab (ein Kästchen = 50 N) und addieren Sie. Oder: Hängen Sie F₂ in Gedanken an die Spitze von F₁.',
            explanation: 'F<sub>res</sub> = (' + de(a[0]) + ' + ' + de(b[0]) + ' | ' + de(a[1]) + ' + ' + de(b[1]) + ') N = <strong>(' + de(a[0] + b[0]) + ' N | ' + de(a[1] + b[1]) + ' N)</strong>. Das ist die Diagonale im Kräfteparallelogramm.'
        };
    }
};

// =====================================================================
// Modul 5: Kräftegleichgewicht
// =====================================================================
const M5 = {
    rechnen: function () {
        let kr;
        if (erstesMal('m5rechnen')) kr = [{ F: 300, a: 30 }, { F: 200, a: 150 }];
        else {
            let ok;
            do {
                kr = zufallsKraefte(2);
                const [x, y] = summe(kr), h = hilfswinkel(x, y);
                ok = Math.hypot(x, y) > 80 && h > 10 && h < 80;
            } while (!ok);
        }
        const [rx, ry] = summe(kr), x = -rx, y = -ry, F = Math.hypot(x, y), a = winkelVon(x, y);
        const fields = [
            { label: 'F<sub>3,x</sub> =', unit: 'N', ans: T(x), tol: 100,
              errors: [{ v: T(rx), msg: 'Das ist die x-Komponente der Resultierenden. Die Gleichgewichtskraft zeigt genau entgegengesetzt.', tol: 100 }] },
            { label: 'F<sub>3,y</sub> =', unit: 'N', ans: T(y), tol: 100,
              errors: [{ v: T(ry), msg: 'Das ist die y-Komponente der Resultierenden. Vorzeichen umdrehen!', tol: 100 }] },
            { label: 'Betrag F<sub>3</sub> =', unit: 'N', ans: T(F), tol: 100 },
            { label: 'Winkel α<sub>3</sub> =', unit: '°', ans: T(a), alt: [T(a - 360)], tol: 200,
              errors: [{ v: T(winkelVon(rx, ry)), msg: 'Das ist der Winkel der Resultierenden. F₃ zeigt genau entgegengesetzt: ±180°.', tol: 200 },
                       { v: T(hilfswinkel(x, y)), msg: 'Das ist nur der Hilfswinkel α′. In welchem Quadranten liegt F₃?', tol: 200 }] }
        ];
        return {
            type: 'num', svg: kraefteSvg(kr), q: 'Zwei Kräfte greifen an einem Punkt an. Eine dritte Kraft F<sub>3</sub> soll für Gleichgewicht sorgen. Berechnen Sie F<sub>3</sub>.' + kraftListe(kr),
            note: 'Komponenten und Betrag auf zwei, Winkel auf eine Nachkommastelle runden.',
            fields,
            hint: 'Erst die Resultierende von F₁ und F₂ bestimmen. Dann gilt: F₃ hat die Komponenten mit umgekehrtem Vorzeichen.',
            explanation: 'Resultierende von F₁ und F₂: (' + d2(rx) + ' N | ' + d2(ry) + ' N).<br>Gleichgewichtskraft: F<sub>3</sub> = <strong>(' + d2(x) + ' N | ' + d2(y) + ' N)</strong>, Betrag <strong>' + d2(F) + ' N</strong>, Winkel <strong>' + d1(a) + '°</strong>.'
        };
    },
    zeichnen: function () {
        let ks;
        if (erstesMal('m5zeichnen')) ks = [[250, 150], [-100, 200], [-50, -150]];
        else {
            do {
                ks = [0, 1, 2].map(() => [rint(-6, 6) * 50, rint(-6, 6) * 50]);
                var qx = ks.reduce((s, k) => s + k[0], 0), qy = ks.reduce((s, k) => s + k[1], 0);
            } while (ks.some(k => Math.hypot(k[0], k[1]) < 120) || Math.abs(qx) > 450 || Math.abs(qy) > 450 || Math.hypot(qx, qy) < 100);
        }
        const sx = ks.reduce((s, k) => s + k[0], 0), sy = ks.reduce((s, k) => s + k[1], 0);
        return {
            type: 'vector', readout: 'xy',
            q: 'Drei Kräfte greifen an einem Punkt an. Zeichnen Sie die Kraft F<sub>4</sub> ein, die für Gleichgewicht sorgt.',
            g: { min: -500, max: 500, major: 100, lab: 200, minor: 50, snap: 10, unit: 'N', size: 400, ux: sub('F', 'x') + ' in N', uy: sub('F', 'y') + ' in N' },
            fixed: ks.map((k, j) => ({ x: k[0], y: k[1], lab: 'F' + IDX[j], col: KCOL[j] })),
            pens: [{ key: 'G', lab: 'F₄', col: '#f472b6', target: [-sx, -sy], tol: 25 }],
            hint: 'Addieren Sie alle x-Komponenten und alle y-Komponenten (ein Kästchen = 50 N). F₄ hat dieselben Werte mit umgekehrtem Vorzeichen.',
            explanation: 'Summe von F₁ bis F₃: (' + de(sx) + ' N | ' + de(sy) + ' N). Also F<sub>4</sub> = <strong>(' + de(-sx) + ' N | ' + de(-sy) + ' N)</strong>. Jetzt ist die Summe aller Kräfte null.'
        };
    },
    debatte: debateTask({
        q: 'Auf einen Körper wirken mehrere Kräfte. Die resultierende Kraft ist null. Zwei Mitschüler diskutieren.',
        people: [['Sara', 'Wenn die resultierende Kraft null ist, dann steht der Körper still.'],
                 ['Ben', 'Er kann auch still stehen. Er kann sich aber auch mit konstanter Geschwindigkeit geradeaus bewegen.']],
        winner: 'Ben',
        whoErrors: [{ v: 'Sara', msg: 'Denken Sie an ein Auto, das mit konstant 100 km/h fährt. Welche Kräfte wirken da?' }],
        reasons: [['Ohne resultierende Kraft ändert sich der Bewegungszustand nicht (1. Newtonsches Gesetz). Ruhe und gleichförmige Bewegung sind beide möglich.'],
                  ['Ohne Kraft kann sich nichts bewegen.', 'Bewegung braucht keine Kraft. Nur die Änderung der Bewegung braucht eine Kraft.'],
                  ['F_res = 0 bedeutet, dass gar keine Kräfte wirken.', 'Es können viele Kräfte wirken. Sie heben sich nur gegenseitig auf.'],
                  ['Der Körper wird langsam immer schneller.', 'Schneller werden heißt beschleunigen. Dafür braucht man eine resultierende Kraft.']],
        hint: 'Erinnern Sie sich an das Trägheitsgesetz.',
        explanation: 'Ben hat recht. Bei F<sub>res</sub> = 0 bleibt der <strong>Bewegungszustand gleich</strong>: Ein ruhender Körper bleibt in Ruhe, ein bewegter fährt gleichförmig geradeaus weiter.'
    }),
    winkel: function () {
        let a, opts;
        do {
            a = rint(1, 35) * 10 + rnd([0, 5]);
            opts = [(a + 180) % 360, (180 - a + 360) % 360, (360 - a) % 360, a];
        } while (new Set(opts).size < 4 || a % 90 === 0);
        const options = opts.map(w => w + '°');
        const wh = {};
        wh[options[1]] = 'Das wäre eine Spiegelung an der y-Achse, nicht die entgegengesetzte Richtung.';
        wh[options[2]] = 'Das wäre eine Spiegelung an der x-Achse, nicht die entgegengesetzte Richtung.';
        wh[options[3]] = 'Das ist dieselbe Richtung wie die Resultierende.';
        return {
            type: 'mc', shuffle: true,
            q: 'Die Resultierende mehrerer Kräfte hat den Winkel α<sub>res</sub> = ' + a + '°. Welchen Winkel hat die Gleichgewichtskraft?',
            options, correct: 0, wrongHints: wh,
            hint: 'Die Gleichgewichtskraft zeigt genau in die Gegenrichtung. Wie viel Grad ist eine halbe Drehung?',
            explanation: 'Gegenrichtung heißt: eine halbe Drehung, also ±180°. ' + a + '° ' + (a < 180 ? '+' : '−') + ' 180° = <strong>' + ((a + 180) % 360) + '°</strong>.'
        };
    },
    rf: richtigFalsch([
        { left: 'Im Gleichgewicht ist die Summe aller x-Komponenten null.', answer: 'richtig' },
        { left: 'Im Gleichgewicht ist die Summe aller y-Komponenten null.', answer: 'richtig' },
        { left: 'Die Gleichgewichtskraft ist genauso groß wie die Resultierende, zeigt aber in die Gegenrichtung.', answer: 'richtig' },
        { left: 'Im Gleichgewicht wirken keine Kräfte auf den Körper.', answer: 'falsch' },
        { left: 'Im Gleichgewicht muss der Körper ruhen.', answer: 'falsch' },
        { left: 'Die Gleichgewichtskraft hat die Komponenten der Resultierenden mit umgekehrtem Vorzeichen.', answer: 'richtig' },
        { left: 'Zwei Kräfte können nur im Gleichgewicht sein, wenn sie gleich groß und entgegengesetzt sind.', answer: 'richtig' }
    ], 5, 'Gleichgewicht heißt: <strong>Σ F<sub>x</sub> = 0 und Σ F<sub>y</sub> = 0</strong>. Kräfte wirken trotzdem, sie heben sich nur auf. Der Körper ruht oder bewegt sich gleichförmig.')
};

// =====================================================================
// Modul 6: Challenge – Die selbstlandende Rakete
// =====================================================================
const RAKETE_WS = { W: 0.8, G: 2.8 };           // wie im Arbeitsblatt (W > 0: Wind drückt nach rechts)
function rakete(key) {
    if (erstesMal(key)) return RAKETE_WS;
    return { W: rnd([1, -1]) * rint(4, 12) / 10, G: rint(22, 32) / 10 };
}
function raketeText(r) {
    return 'Seitenwind: F<sub>W</sub> = ' + de(Math.abs(r.W)) + ' MN nach ' + (r.W > 0 ? 'rechts' : 'links') + '. Gewichtskraft: F<sub>G</sub> = ' + de(r.G) + ' MN nach unten.';
}
// Rakete in Weltkoordinaten (MN-Raster), Schwerpunkt im Ursprung
function raketeBg(K) {
    const P = pts => pts.map(p => K.X(p[0]).toFixed(1) + ',' + K.Y(p[1]).toFixed(1)).join(' ');
    let s = '<g fill="#0f172a" stroke="#e2e8f0" stroke-width="2.5" stroke-linejoin="round" opacity="0.9">';
    s += '<polygon points="' + P([[-0.18, -1.05], [0.18, -1.05], [0.1, -0.75], [-0.1, -0.75]]) + '"/>';
    s += '<polygon points="' + P([[-0.3, -0.35], [-0.55, -0.7], [-0.55, -0.95], [-0.3, -0.75]]) + '"/>';
    s += '<polygon points="' + P([[0.3, -0.35], [0.55, -0.7], [0.55, -0.95], [0.3, -0.75]]) + '"/>';
    s += '<path d="M' + K.X(0) + ',' + K.Y(0.92) + ' C' + K.X(0.32) + ',' + K.Y(0.55) + ' ' + K.X(0.36) + ',' + K.Y(-0.3) + ' ' + K.X(0.22) + ',' + K.Y(-0.75) +
         ' L' + K.X(-0.22) + ',' + K.Y(-0.75) + ' C' + K.X(-0.36) + ',' + K.Y(-0.3) + ' ' + K.X(-0.32) + ',' + K.Y(0.55) + ' ' + K.X(0) + ',' + K.Y(0.92) + ' Z"/>';
    s += '<circle cx="' + K.X(0) + '" cy="' + K.Y(0.3) + '" r="' + ((K.X(0.12) - K.X(0))).toFixed(1) + '"/></g>';
    return s;
}
const RG = { min: -3.5, max: 3.5, major: 1, minor: 0.25, lab: 1, snap: 0.1, unit: 'MN', size: 420, ux: sub('F', 'x') + ' in MN', uy: sub('F', 'y') + ' in MN' };
function raketeSvg(r, mitT) {
    const K = koord(Object.assign({ aria: 'Rakete im Koordinatensystem mit Windkraft und Gewichtskraft' }, RG));
    let s = K.s + raketeBg(K);
    s += pfeil(K, 0, 0, r.W, 0, '#f87171', 4) + lab(K, r.W, 0.35, sub('F', 'W'), '#f87171');
    s += pfeil(K, 0, 0, 0, -r.G, '#f87171', 4) + lab(K, 0.35, -r.G, sub('F', 'G'), '#f87171');
    if (mitT) s += pfeil(K, 0, 0, -r.W, r.G, '#4ade80', 4.5) + lab(K, -r.W, r.G, sub('F', 'T'), '#4ade80');
    return s + '<circle cx="' + K.X(0) + '" cy="' + K.Y(0) + '" r="4" fill="#f8fafc"/></svg>';
}
const M6 = {
    masse: function () {
        const r = rakete('r6masse'), m = r.G * 1e6 / g0;
        return {
            type: 'num', svg: raketeSvg(r),
            q: raketeText(r) + ' Berechnen Sie die Masse der Rakete. Sie startet in Mitteleuropa.',
            fields: [{ label: 'Masse m =', unit: 'kg', ans: T(m), tol: relTol(m, 0.002),
                errors: [{ v: T(r.G * 1e6 * g0), msg: 'm = F_G / g: teilen, nicht malnehmen.', tol: relTol(r.G * 1e6 * g0, 0.002) },
                         { v: T(r.G / g0), msg: 'MN in N umrechnen: 1 MN = 1 000 000 N.', tol: 5 },
                         { v: T(m / 1000), msg: 'Das ist die Masse in Tonnen. Gefragt ist kg.', tol: relTol(m / 1000, 0.002) }] }],
            note: 'Runden Sie auf ganze kg. Leerzeichen in großen Zahlen sind erlaubt.',
            hint: 'F<sub>G</sub> = m · g, also m = F<sub>G</sub> / g. Vorher MN in N umrechnen. In Mitteleuropa gilt g = 9,81 m/s².',
            explanation: 'm = ' + de(r.G * 1e6) + ' N / 9,81 m/s² ≈ <strong>' + de(Math.round(m)) + ' kg</strong>. Das sind etwa ' + d1(m / 1000) + ' t.'
        };
    },
    komponenten: function () {
        const r = rakete('r6komp');
        return {
            type: 'num', svg: raketeSvg(r),
            q: raketeText(r) + ' Für eine weiche Landung soll die resultierende Kraft null sein. Wie groß müssen die Komponenten der Triebwerkskraft F<sub>T</sub> sein?',
            fields: [{ label: 'F<sub>T,x</sub> =', unit: 'MN', ans: T(-r.W), tol: 5,
                       errors: [{ v: T(r.W), msg: 'Das Triebwerk muss gegen den Wind drücken. Vorzeichen umdrehen!', tol: 5 }] },
                     { label: 'F<sub>T,y</sub> =', unit: 'MN', ans: T(r.G), tol: 5,
                       errors: [{ v: T(-r.G), msg: 'Das Triebwerk muss die Gewichtskraft ausgleichen. Es drückt nach oben.', tol: 5 }] }],
            hint: 'Σ F<sub>x</sub> = F<sub>W</sub> + F<sub>T,x</sub> = 0 und Σ F<sub>y</sub> = −F<sub>G</sub> + F<sub>T,y</sub> = 0.',
            explanation: 'F<sub>T,x</sub> = <strong>' + de(-r.W) + ' MN</strong> (gegen den Wind), F<sub>T,y</sub> = <strong>' + de(r.G) + ' MN</strong> (nach oben, gegen die Gewichtskraft).'
        };
    },
    zeichnen: function () {
        const r = rakete('r6zeichnen');
        return {
            type: 'vector', readout: 'xy', bg: raketeBg,
            q: raketeText(r) + ' Zeichnen Sie die Kraft des Triebwerks F<sub>T</sub> ein. Sie greift im Schwerpunkt an (im Ursprung).',
            g: RG,
            fixed: [{ x: r.W, y: 0, lab: sub('F', 'W'), col: '#f87171' }, { x: 0, y: -r.G, lab: sub('F', 'G'), col: '#f87171' }],
            pens: [{ key: 'T', lab: 'F<sub>T</sub>', col: '#4ade80', target: [-r.W, r.G], tol: 0.12 }],
            hint: 'Nutzen Sie Ihre Komponenten aus der vorherigen Aufgabe. Ein kleines Kästchen sind 0,25 MN.',
            explanation: 'F<sub>T</sub> zeigt nach ' + (r.W > 0 ? 'links' : 'rechts') + ' oben: <strong>(' + de(-r.W) + ' MN | ' + de(r.G) + ' MN)</strong>. Zusammen mit F<sub>W</sub> und F<sub>G</sub> ergibt das null.'
        };
    },
    betrag: function () {
        const r = rakete('r6betrag'), F = Math.hypot(r.W, r.G);
        return {
            type: 'num', svg: raketeSvg(r, true),
            q: raketeText(r) + ' Berechnen Sie den Betrag der Triebwerkskraft F<sub>T</sub>.',
            fields: [{ label: 'F<sub>T</sub> =', unit: 'MN', ans: T(F), tol: 6,
                errors: [{ v: T(Math.abs(r.W) + r.G), msg: 'Die Komponenten nicht addieren: Pythagoras!', tol: 6 },
                         { v: T(r.W * r.W + r.G * r.G), msg: 'Die Wurzel fehlt noch.', tol: 6 }] }],
            note: 'Runden Sie auf zwei Nachkommastellen.',
            hint: 'F<sub>T</sub> = √(F<sub>T,x</sub>² + F<sub>T,y</sub>²).',
            explanation: 'F<sub>T</sub> = √((' + de(-r.W) + ')² + ' + de(r.G) + '²) MN = <strong>' + d2(F) + ' MN</strong>. Das Triebwerk muss also stärker drücken als die Gewichtskraft allein.'
        };
    },
    winkel: function () {
        const r = rakete('r6winkel'), x = -r.W, y = r.G, a = winkelVon(x, y), h = hilfswinkel(x, y);
        const K = koord({ min: -3, max: 3, major: 1, lab: 10, size: 260, aria: 'Skizze: Winkel alpha der Triebwerkskraft' });
        const skizze = K.s + bogen(K, a, 34, '#fbbf24', 'α') + pfeil(K, 0, 0, x * 0.8, y * 0.8, '#4ade80', 4) + '</svg>';
        return {
            type: 'num', svg: skizze,
            q: raketeText(r) + ' In welchem Winkel α muss die Düse des Triebwerks stehen? Gemeint ist der Winkel der Triebwerkskraft F<sub>T</sub> zur positiven x-Achse.',
            fields: [{ label: 'α =', unit: '°', ans: T(a), alt: [T(a - 360)], tol: 150,
                errors: [{ v: T(h), msg: 'Das ist nur der Hilfswinkel α′. In welchem Quadranten liegt F_T?', tol: 150 },
                         { v: T(rechnerWinkel(x, y)), msg: 'Das liefert der Taschenrechner direkt. Beachten Sie den Quadranten.', tol: 150 },
                         { v: T(90 - h), msg: 'Das ist der Winkel zur y-Achse. Gesucht ist der Winkel zur positiven x-Achse.', tol: 150 }] }],
            note: 'Runden Sie auf eine Nachkommastelle.',
            hint: 'Quadrant aus den Vorzeichen von F<sub>T,x</sub> und F<sub>T,y</sub>. Hilfswinkel α′ = arctan(|F<sub>T,y</sub>| / |F<sub>T,x</sub>|).',
            explanation: 'α′ = arctan(' + de(y) + ' / ' + de(Math.abs(x)) + ') = ' + d1(h) + '°. ' + QN[quadrant(x, y)] + ' Quadrant → α = ' +
                (quadrant(x, y) === 2 ? '180° − ' + d1(h) + '° = ' : '') + '<strong>' + d1(a) + '°</strong>.'
        };
    },
    schweben: {
        type: 'text', level: 'In eigenen Worten',
        q: 'Ein Mitschüler sagt: „Wenn die resultierende Kraft null ist, schwebt die Rakete still in der Luft. Dann landet sie ja nie!“ Erklären Sie, was wirklich passiert.',
        model: 'Die Rakete sinkt schon, wenn das Triebwerk eingestellt wird. Ist die resultierende Kraft null, ändert sich ihr Bewegungszustand nicht (1. Newtonsches Gesetz). Sie sinkt also mit konstanter Geschwindigkeit weiter nach unten. Sie wird weder schneller noch langsamer. Nur wenn sie vorher in Ruhe wäre, würde sie in der Luft stehen bleiben. Kurz vor dem Boden muss die Geschwindigkeit möglichst klein sein, damit die Landung weich wird.',
        checklist: ['F_res = 0 heißt: Der Bewegungszustand bleibt gleich.', '1. Newtonsches Gesetz (Trägheitsgesetz) genannt.', 'Die Rakete sinkt mit konstanter Geschwindigkeit weiter.', 'Stillstand nur, wenn sie vorher schon in Ruhe war.'],
        explanation: 'Vergleichen Sie Ihre Antwort mit der Musterlösung und haken Sie ab, was Sie schon drin haben.',
        hint: ''
    }
};

const TASKS = {
    1: [M1.skalar, M1.ablesen, M1.labor, M1.massstab, M1.tuer, M1.zeichnen],
    2: [M2.labor, M2.vorzeichen, M2.rechnen, M2.links, M2.fehler],
    3: [M3.rechnen, M3.regel, M3.reihenfolge, M3.debatte, M3.erklaeren],
    4: [M4.vorhersage, M4.labor, M4.zeichnen, M4.rechnen, M4.fehler],
    5: [M5.debatte, M5.winkel, M5.rechnen, M5.zeichnen, M5.rf],
    6: [M6.masse, M6.komponenten, M6.zeichnen, M6.betrag, M6.winkel, M6.schweben]
};
