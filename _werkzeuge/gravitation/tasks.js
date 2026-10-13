// =====================================================================
// Aufgaben für das Modul "Gravitation und Gewichtskraft" (FOS 12)
// Hilfsfunktionen aus engine.js. num-Felder: ans in Tausendsteln der Einheit
// (9,81 -> 9810). tol = erlaubter Spielraum in Tausendsteln.
// Konstanten wie im Arbeitsblatt: G = 6,674 · 10⁻¹¹ N·m²/kg², M_Erde = 5,971 · 10²⁴ kg
// =====================================================================

const BASIC = [1, 2, 3, 4];
const ADVANCED = [5, 6, 7];
const UNLOCK_TEXT = {
    5: 'Mond, Mars und Jupiter: Warum wiegt man dort unterschiedlich viel?',
    6: 'Formeln umstellen: Angelschnur, Aufzug und die Frage, wo g nur noch halb so groß ist.',
    7: 'Pol, Äquator, Mount Everest und ISS: Wie stark hängt g vom Ort ab?'
};

// ---------- Konstanten ----------
const G = 6.674e-11, ME = 5.971e24, RE = 6371, g0 = 9.81;
const KONST = 'G = 6,674 · 10⁻¹¹ N·m²/kg², M<sub>Erde</sub> = 5,971 · 10²⁴ kg';

// ---------- Zahlen ----------
const T = x => Math.round(x * 1000);                       // Wert -> Tausendstel
function de(x, dec) {                                        // 9.811 -> "9,811", 11772 -> "11 772"
    let s = (dec === undefined) ? String(Number(x.toFixed(6))) : x.toFixed(dec);
    let [g, k] = s.replace('-', '').split('.');
    if (g.length > 4) g = g.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (x < 0 ? '−' : '') + g + (k ? ',' + k : '');
}
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const p10 = n => '10' + String(n).split('').map(c => SUP[c]).join('');
function sci(x, dec) {                                       // -> {a, n} mit 1 <= a < 10
    if (dec === undefined) dec = 2;
    let n = Math.floor(Math.log10(Math.abs(x)));
    let a = Number((x / Math.pow(10, n)).toFixed(dec));
    if (Math.abs(a) >= 10) { n += 1; a = Number((x / Math.pow(10, n)).toFixed(dec)); }
    return { a, n };
}
const sciStr = (x, dec) => { const s = sci(x, dec); return de(s.a, dec === undefined ? 2 : dec) + ' · ' + p10(s.n); };
const relTol = (x, p) => Math.max(1, Math.round(Math.abs(T(x)) * p));    // p = 0.01 -> 1 %

// Ergebnis in der Form a · 10ⁿ abfragen: zwei Felder
function sciFields(x, name, unit, expErrors) {
    const s = sci(x, 2);
    return [
        { label: name + ': Zahl a', unit: '· 10<sup>n</sup> ' + unit, ans: T(s.a), tol: Math.max(20, relTol(s.a, 0.01)) },
        { label: name + ': Hochzahl n', unit: '', ans: T(s.n), small: true, errors: (expErrors || []).map(e => ({ v: T(e.n), msg: e.msg, tol: 0 })) }
    ];
}
const SCI_NOTE = 'Geben Sie das Ergebnis in der Form <strong>a · 10ⁿ</strong> ein. a liegt zwischen 1 und 10, gerundet auf zwei Nachkommastellen.';

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

// Orte auf der Erde (Abstand zum Erdmittelpunkt wie im Arbeitsblatt)
const ORTE = [
    { name: 'Nürnberg', r: 6373, wo: 'in Nürnberg' },
    { name: 'Nordpol', r: 6367, wo: 'am Nordpol' },
    { name: 'Jakarta', r: 6377, wo: 'in Jakarta' },
    { name: 'Mount Everest (Gipfel)', r: 6382, wo: 'auf dem Gipfel des Mount Everest' }
];
const gAt = rkm => G * ME / Math.pow(rkm * 1000, 2);

// Himmelskörper
const KOERPER = [
    { name: 'Mond', M: 7.342e22, R: 1737, gTab: 1.62 },
    { name: 'Mars', M: 6.417e23, R: 3390, gTab: 3.73 },
    { name: 'Venus', M: 4.867e24, R: 6052, gTab: 8.87 },
    { name: 'Jupiter', M: 1.898e27, R: 69911, gTab: null }
];

// =====================================================================
const TASKS = {
// ---------------------------------------------------------------- Modul 1
1: [
    function () {
        const all = [
            ['wird in Kilogramm (kg) angegeben', 'Masse'],
            ['wird in Newton (N) angegeben', 'Gewichtskraft'],
            ['ist auf dem Mond kleiner als auf der Erde', 'Gewichtskraft'],
            ['ist auf dem Mond genauso groß wie auf der Erde', 'Masse'],
            ['wird mit einem Federkraftmesser gemessen', 'Gewichtskraft'],
            ['wird mit einer Balkenwaage durch Vergleich bestimmt', 'Masse'],
            ['hat eine Richtung: zum Erdmittelpunkt', 'Gewichtskraft'],
            ['beschreibt, wie träge ein Körper ist', 'Masse'],
            ['wäre weit weg von allen Himmelskörpern fast null', 'Gewichtskraft'],
            ['hängt vom Ort ab', 'Gewichtskraft']
        ].map(x => ({ left: x[0], answer: x[1] }));
        const m = rnd(all.filter(x => x.answer === 'Masse')), f = rnd(all.filter(x => x.answer === 'Gewichtskraft'));
        return {
            type: 'match', q: 'Masse oder Gewichtskraft? Ordnen Sie zu.', options: ['Masse', 'Gewichtskraft'],
            items: shuffle([m, f].concat(pickN(all.filter(x => x !== m && x !== f), 3))),
            hint: 'Die Masse ist eine Eigenschaft des Körpers. Sie ist überall gleich. Die Gewichtskraft entsteht erst durch die Anziehung eines Himmelskörpers.',
            explanation: 'Masse: kg, überall gleich, Balkenwaage, Trägheit. Gewichtskraft: N, hängt vom Ort ab, Federkraftmesser, zeigt zum Erdmittelpunkt.'
        };
    },
    {
        type: 'mc', shuffle: true,
        q: 'Die Erde zieht einen Apfel (m = 0,2 kg) mit etwa 2 N an. Wie stark zieht der Apfel die Erde an?',
        options: ['Gar nicht. Nur die Erde zieht, weil sie so groß ist.', 'Mit etwa 2 N, also genauso stark.',
                  'Viel schwächer, weil der Apfel so wenig Masse hat.', 'Viel stärker, weil der Apfel näher am Boden ist.'],
        correct: 1,
        wrongHints: { 'Viel schwächer, weil der Apfel so wenig Masse hat.': 'In der Formel stehen m₁ und m₂ gleichberechtigt nebeneinander.' },
        hint: 'Gravitation ist eine Wechselwirkung. Denken Sie an das Prinzip „actio = reactio“.',
        explanation: 'Beide Körper ziehen sich mit <strong>gleich großen</strong>, entgegengesetzten Kräften an (actio = reactio). Die Erde bewegt sich trotzdem kaum: Bei ihrer riesigen Masse bewirken 2 N praktisch keine Beschleunigung.'
    },
    richtigFalsch([
        { left: 'Newton erkannte: Dieselbe Kraft lässt den Apfel fallen und hält den Mond auf seiner Bahn.', answer: 'richtig' },
        { left: 'Nach Newton ziehen sich nur Himmelskörper an, nicht aber kleine Gegenstände.', answer: 'falsch' },
        { left: 'Die Anziehungskraft hängt von den Massen und vom Abstand ab.', answer: 'richtig' },
        { left: 'Im Weltraum gibt es keine Gravitation.', answer: 'falsch' },
        { left: 'Newton veröffentlichte das Gesetz 1687 in seinem Werk „Principia“.', answer: 'richtig' },
        { left: 'Je weiter zwei Körper voneinander entfernt sind, desto stärker ziehen sie sich an.', answer: 'falsch' },
        { left: 'Der Mond fällt eigentlich ständig in Richtung Erde.', answer: 'richtig' }
    ], 5, 'Alle Körper ziehen sich an, auch im Weltraum. Die Kraft wird größer mit den Massen und kleiner mit dem Abstand. Der Mond „fällt“ ständig um die Erde herum.'),
    {
        type: 'mc', shuffle: true,
        q: 'Im Alltag sagt man: „Der Mann wiegt 75 kg.“ Was ist physikalisch korrekt?',
        options: ['Die Gewichtskraft des Mannes beträgt 75 kg.',
                  'Die Masse des Mannes beträgt 75 kg. Seine Gewichtskraft auf der Erde beträgt etwa 736 N.',
                  'Masse und Gewichtskraft sind dasselbe. Es ist nur eine andere Einheit.',
                  'Die Masse des Mannes beträgt 736 N.'],
        correct: 1,
        hint: 'Kilogramm ist die Einheit der Masse. Kräfte misst man in Newton.',
        explanation: '75 kg ist die <strong>Masse</strong>. Die Gewichtskraft ist F<sub>G</sub> = m · g = 75 kg · 9,81 N/kg ≈ <strong>736 N</strong>. Auf dem Mond wäre die Masse gleich, die Gewichtskraft aber viel kleiner.'
    },
    function () {
        const pool = [
            ['eine Tafel Schokolade (100 g)', 0.1 * g0], ['ein Paket Mehl (0,5 kg)', 0.5 * g0], ['eine Kraft von 3 N', 3],
            ['eine Flasche Wasser (1,5 kg)', 1.5 * g0], ['ein Stück Butter (250 g)', 0.25 * g0], ['eine Kraft von 20 N', 20],
            ['ein Laptop (2,2 kg)', 2.2 * g0], ['eine Kraft von 0,5 N', 0.5], ['eine Kraft von 12 N', 12],
            ['ein Smartphone (180 g)', 0.18 * g0], ['eine Kraft von 7 N', 7]
        ];
        let sel;
        do {
            sel = pickN(pool, 4).sort((a, b) => a[1] - b[1]);
        } while (sel.some((x, k) => k > 0 && x[1] - sel[k - 1][1] < 0.4) || sel.every(x => x[0].indexOf('Kraft') < 0));
        return {
            type: 'order', q: 'Sortieren Sie nach der <strong>Gewichtskraft auf der Erde</strong>. (g = 9,81 N/kg)',
            top: 'kleinste Kraft', bottom: 'größte Kraft',
            steps: sel.map(x => x[0]),
            hint: 'Rechnen Sie alle Massen in Newton um: F = m · g. Faustregel: 100 g ≈ 1 N. Achten Sie auf g und kg!',
            explanation: sel.map(x => x[0] + ': <strong>' + de(x[1], 2) + ' N</strong>').join('<br>')
        };
    }
],
// ---------------------------------------------------------------- Modul 2
2: [
    {
        type: 'match', q: 'Was bedeuten die Formelzeichen im Gravitationsgesetz?',
        options: ['Gravitationskraft in N', 'Gravitationskonstante in N·m²/kg²', 'Massen der beiden Körper in kg', 'Abstand der Massenmittelpunkte in m', 'Radius der Erde in km'],
        items: [
            { left: 'F<sub>G</sub>', answer: 'Gravitationskraft in N' },
            { left: 'G', answer: 'Gravitationskonstante in N·m²/kg²' },
            { left: 'm₁ und m₂', answer: 'Massen der beiden Körper in kg' },
            { left: 'r', answer: 'Abstand der Massenmittelpunkte in m', errors: [{ v: 'Radius der Erde in km', msg: 'r ist allgemein der Abstand der Mittelpunkte, und zwar in Metern.' }] }
        ],
        hint: 'Eine Antwort bleibt übrig. Achten Sie bei r auf die Einheit.',
        explanation: 'F<sub>G</sub>: Kraft in N. G: Gravitationskonstante. m₁, m₂: Massen in kg. r: Abstand der Mittelpunkte in <strong>m</strong> (nicht km!).'
    },
    function () {
        const sz = [
            { t: 'm₁ wird verdoppelt.', f: 2, e: [] },
            { t: 'm₁ wird verdreifacht.', f: 3, e: [] },
            { t: 'Der Abstand r wird verdoppelt.', f: 0.25, e: [{ v: 0.5, msg: 'r steht im Quadrat: (2)² = 4.' }, { v: 4, msg: 'r steht im Nenner: Mehr Abstand bedeutet weniger Kraft.' }, { v: 2, msg: 'Mehr Abstand bedeutet weniger Kraft.' }] },
            { t: 'Der Abstand r wird halbiert.', f: 4, e: [{ v: 2, msg: 'r steht im Quadrat: (1/2)² = 1/4. Und 1 : 1/4 = 4.' }, { v: 0.25, msg: 'Weniger Abstand bedeutet mehr Kraft.' }] },
            { t: 'Der Abstand r wird verzehnfacht.', f: 0.01, e: [{ v: 0.1, msg: 'r steht im Quadrat: 10² = 100.' }] },
            { t: 'm₁ und m₂ werden beide verdoppelt.', f: 4, e: [{ v: 2, msg: 'Beide Massen stehen im Zähler: 2 · 2 = 4.' }] },
            { t: 'm₁ wird verdoppelt und r wird verdoppelt.', f: 0.5, e: [{ v: 1, msg: 'Der Abstand wirkt im Quadrat: 2 : 2² = 0,5.' }] },
            { t: 'm₁ wird vervierfacht und r wird verdoppelt.', f: 1, e: [{ v: 2, msg: 'Der Abstand wirkt im Quadrat: 4 : 2² = 1.' }] }
        ];
        let sel;
        do { sel = pickN(sz, 3); } while (!sel.some(s => s.t.indexOf('Abstand') >= 0));
        return {
            type: 'num', q: 'Wie ändert sich die Gravitationskraft? Geben Sie den Faktor an.',
            note: 'Beispiel: Wird die Kraft halb so groß, tragen Sie 0,5 ein. Wird sie viermal so groß, tragen Sie 4 ein.',
            fields: sel.map(s => ({ label: s.t, prefix: 'F<sub>neu</sub> =', unit: '· F<sub>alt</sub>', ans: T(s.f), small: true,
                                    errors: s.e.map(e => ({ v: T(e.v), msg: e.msg })) })),
            hint: 'Die Massen stehen im Zähler: doppelte Masse → doppelte Kraft. Der Abstand steht im Quadrat im Nenner: doppelter Abstand → ein Viertel.',
            explanation: sel.map(s => s.t + ' → F<sub>neu</sub> = <strong>' + de(s.f) + ' · F<sub>alt</sub></strong>').join('<br>')
        };
    },
    {
        type: 'mc', shuffle: true,
        q: 'Sie stehen in Nürnberg auf dem Boden. Welchen Wert setzen Sie für r ein, wenn Sie die Anziehung zwischen Ihnen und der Erde berechnen?',
        options: ['r = 0 m, weil Sie die Erde berühren', 'r ≈ 6373 km, also den Abstand zum Erdmittelpunkt',
                  'r ≈ 1,8 m, also Ihre Körpergröße', 'r ≈ 1 m, also den Abstand Ihres Schwerpunkts zum Boden'],
        correct: 1,
        wrongHints: { 'r = 0 m, weil Sie die Erde berühren': 'Mit r = 0 würde man durch null teilen. Gemeint ist der Abstand der Mittelpunkte.' },
        hint: 'r ist der Abstand der <strong>Massenmittelpunkte</strong>. Wo liegt der Mittelpunkt der Erde?',
        explanation: 'Die Masse der Erde wirkt so, als säße sie im Erdmittelpunkt. Deshalb ist r der Abstand zum Erdmittelpunkt, in Nürnberg etwa <strong>6373 km = 6,373 · 10⁶ m</strong>.'
    },
    {
        type: 'order', q: 'Sie berechnen eine Gravitationskraft. Bringen Sie den Rechenweg in die richtige Reihenfolge.',
        steps: ['Gegebene und gesuchte Größen notieren', 'Alle Werte in SI-Einheiten umrechnen (km → m)', 'Formel aufschreiben und Werte mit Einheiten einsetzen',
                'Zahlen und Zehnerpotenzen getrennt ausrechnen', 'Ergebnis in N angeben und prüfen: Ist das plausibel?'],
        hint: 'Erst sammeln, dann umrechnen, dann rechnen. Die Kontrolle kommt am Schluss.',
        explanation: 'Gegeben/gesucht → SI-Einheiten → Formel und Einsetzen → Rechnen → Ergebnis prüfen.'
    },
    function () {
        const m1 = rint(55, 95), m2 = rint(55, 95), r = rnd([0.5, 0.8, 1, 1.5]);
        const F = G * m1 * m2 / (r * r);
        return {
            type: 'mc', shuffle: true, level: 'Abschätzen',
            q: 'Zwei Personen (' + m1 + ' kg und ' + m2 + ' kg) sitzen ' + de(r) + ' m auseinander. Warum merken sie nichts von ihrer gegenseitigen Anziehung?',
            options: ['Menschen erzeugen keine Gravitation.',
                      'G ist extrem klein. Die Kraft ist nur etwa ' + sciStr(F, 1) + ' N.',
                      'Die Erde schirmt die Anziehung zwischen den Personen ab.',
                      'Gravitation wirkt nur über große Entfernungen.'],
            correct: 1,
            hint: 'Schauen Sie sich den Wert von G an: 6,674 · 10⁻¹¹.',
            explanation: 'F = G · m₁ · m₂ / r² ≈ <strong>' + sciStr(F) + ' N</strong>. Das ist weniger als das Gewicht eines Staubkorns. Spürbar wird Gravitation erst, wenn mindestens ein Körper riesig ist, z. B. die Erde.'
        };
    }
],
// ---------------------------------------------------------------- Modul 3
3: [
    function () {
        const km = rnd([6371, 6357, 6378, 1737, 3390, 6052]);
        const b = rnd([22, 23, 24, 30]);
        const c = rnd([6, 7, 8, 11]);
        const p = rnd([20, 24, 13]), q = rnd([12, 13, 6]);
        const fields = [
            { label: km + ' km =', unit: '· 10⁶ m', ans: T(km / 1000),
              errors: [{ v: T(km), msg: 'a soll zwischen 1 und 10 liegen.' }, { v: T(km / 100), msg: '1 km = 10³ m. Zusammen mit der Zahl: ' + km + ' · 10³ m.' }] },
            { label: '10⁻¹¹ · ' + p10(b) + ' = 10 hoch …', unit: '', small: true, ans: T(b - 11),
              errors: [{ v: T(-11 * b), msg: 'Beim Multiplizieren werden die Hochzahlen addiert, nicht multipliziert.' }, { v: T(b + 11), msg: 'Achten Sie auf das Minus: −11 + ' + b + '.' }] },
            rnd([
                { label: '(' + p10(c) + ')² = 10 hoch …', unit: '', small: true, ans: T(2 * c),
                  errors: [{ v: T(c + 2), msg: 'Potenz einer Potenz: Die Hochzahlen werden multipliziert.' }, { v: T(c * c), msg: 'Nur mit 2 multiplizieren: (10ⁿ)² = 10²ⁿ.' }] },
                { label: p10(p) + ' : ' + p10(q) + ' = 10 hoch …', unit: '', small: true, ans: T(p - q),
                  errors: [{ v: T(p + q), msg: 'Beim Dividieren werden die Hochzahlen subtrahiert.' }] }
            ])
        ];
        return {
            type: 'num', q: 'Rechnen mit Zehnerpotenzen. Ergänzen Sie.',
            fields,
            hint: '1 km = 10³ m. 10ᵃ · 10ᵇ = 10ᵃ⁺ᵇ. 10ᵃ : 10ᵇ = 10ᵃ⁻ᵇ. (10ᵃ)² = 10²ᵃ.',
            explanation: km + ' km = <strong>' + de(km / 1000) + ' · 10⁶ m</strong><br>10⁻¹¹ · ' + p10(b) + ' = <strong>' + p10(b - 11) + '</strong><br>' +
                         fields[2].label.replace(' = 10 hoch …', '') + ' = <strong>' + p10(fields[2].ans / 1000) + '</strong>'
        };
    },
    function () {
        const m = rnd([1, 1, 2, 5, 10]);
        const orte = pickN(ORTE, 2);
        const fields = orte.map(o => {
            const F = gAt(o.r) * m;
            return { label: o.name + ' (r = ' + o.r + ' km)', unit: 'N', ans: T(F), tol: 2 * m + 1,
                     errors: [{ v: T(F * 1e6), msg: 'r muss in Metern eingesetzt werden: 1 km = 10³ m.', tol: relTol(F * 1e6, 0.01) },
                              { v: T(G * ME * m / (o.r * 1000)), msg: 'Haben Sie r quadriert?', tol: relTol(G * ME * m / (o.r * 1000), 0.01) }] };
        });
        return {
            type: 'num',
            q: 'Berechnen Sie die Gravitationskraft der Erde auf eine Masse von <strong>' + m + ' kg</strong> an zwei Orten.',
            note: KONST + '. Runden Sie auf <strong>drei</strong> Nachkommastellen. Die Unterschiede sind klein!',
            fields,
            hint: 'F = G · M<sub>Erde</sub> · m / r². Rechnen Sie r zuerst in m um: ' + orte[0].r + ' km = ' + de(orte[0].r / 1000) + ' · 10⁶ m.',
            explanation: orte.map((o, k) => o.name + ': F = 6,674 · 10⁻¹¹ · 5,971 · 10²⁴ · ' + m + ' / (' + de(o.r / 1000) + ' · 10⁶)² N ≈ <strong>' + de(fields[k].ans / 1000, 3) + ' N</strong>').join('<br>') +
                         '<br>Je weiter weg vom Erdmittelpunkt, desto kleiner die Kraft.'
        };
    },
    function () {
        const o = rnd(ORTE);
        const rm = o.r / 1000, rm2 = Number((rm * rm).toFixed(2));
        const zahl = 39.85;                                       // 6,674 · 5,971
        const F = zahl * 10 / rm2;                                // 39,85 · 10¹³ / (rm2 · 10¹²)
        const art = rnd(['km', 'exp', 'quad', 'einheit', 'formel']);
        const L = [
            'F = G · m₁ · m₂ / r²',
            'F = 6,674 · 10⁻¹¹ · 5,971 · 10²⁴ · 1 / (' + de(rm, 3) + ' · 10⁶)²',
            'F = 39,85 · 10¹³ / (' + de(rm2, 2) + ' · 10¹²)',
            'F = ' + de(F, 2) + ' N'
        ];
        let falsch, expl;
        if (art === 'km') {
            L[1] = 'F = 6,674 · 10⁻¹¹ · 5,971 · 10²⁴ · 1 / ' + o.r + '²';
            L[2] = 'F = 39,85 · 10¹³ / (' + de(rm2, 2) + ' · 10⁶)';
            L[3] = 'F = ' + de(F, 2) + ' · 10⁶ N';
            falsch = 2; expl = 'In Zeile 2 wurde r in km eingesetzt. Richtig: ' + o.r + ' km = ' + de(rm, 3) + ' · 10⁶ m. Das Ergebnis ist um den Faktor 10⁶ zu groß.';
        } else if (art === 'exp') {
            L[2] = 'F = 39,85 · 10⁻²⁶⁴ / (' + de(rm2, 2) + ' · 10¹²)';
            L[3] = 'F = ' + de(F / 10, 2) + ' · 10⁻²⁷⁶ N';
            falsch = 3; expl = 'In Zeile 3 wurden die Hochzahlen multipliziert. Richtig: 10⁻¹¹ · 10²⁴ = 10⁻¹¹⁺²⁴ = 10¹³.';
        } else if (art === 'quad') {
            L[2] = 'F = 39,85 · 10¹³ / (' + de(rm, 3) + ' · 10⁶)';
            L[3] = 'F = ' + de(39.85 / rm, 2) + ' · 10⁷ N';
            falsch = 3; expl = 'In Zeile 3 wurde das Quadrat vergessen. (' + de(rm, 3) + ' · 10⁶)² = ' + de(rm2, 2) + ' · 10¹².';
        } else if (art === 'einheit') {
            L[3] = 'F = ' + de(F, 2) + ' kg';
            falsch = 4; expl = 'In Zeile 4 ist die Einheit falsch. Eine Kraft hat die Einheit <strong>N</strong>, nicht kg.';
        } else {
            L[0] = 'F = G · m₁ · m₂ / r';
            L[1] = 'F = 6,674 · 10⁻¹¹ · 5,971 · 10²⁴ · 1 / (' + de(rm, 3) + ' · 10⁶)';
            L[2] = 'F = 39,85 · 10¹³ / (' + de(rm, 3) + ' · 10⁶)';
            L[3] = 'F = ' + de(39.85 / rm, 2) + ' · 10⁷ N';
            falsch = 1; expl = 'Schon in Zeile 1 ist die Formel falsch: Im Nenner steht <strong>r²</strong>, nicht r.';
        }
        return fehlerTask(
            'Fehler finden: Ein Mitschüler berechnet die Gravitationskraft auf 1 kg ' + o.wo + ' (r = ' + o.r + ' km). In welcher Zeile steht der <strong>erste</strong> Fehler?',
            L, falsch, expl + ' Richtig ist F ≈ <strong>' + de(F, 2) + ' N</strong>.');
    },
    function () {
        const sz = rnd([
            { t: 'Erde und Mond', d: 'M<sub>Erde</sub> = 5,971 · 10²⁴ kg, M<sub>Mond</sub> = 7,342 · 10²² kg, Abstand r = 384 400 km', F: G * ME * 7.342e22 / Math.pow(3.844e8, 2) },
            { t: 'Sonne und Erde', d: 'M<sub>Sonne</sub> = 1,989 · 10³⁰ kg, M<sub>Erde</sub> = 5,971 · 10²⁴ kg, Abstand r = 149,6 Mio. km', F: G * 1.989e30 * ME / Math.pow(1.496e11, 2) },
            { t: 'Erde und Internationale Raumstation ISS', d: 'M<sub>Erde</sub> = 5,971 · 10²⁴ kg, m<sub>ISS</sub> = 4,2 · 10⁵ kg, Abstand zum Erdmittelpunkt r = 6779 km', F: G * ME * 4.2e5 / Math.pow(6.779e6, 2) },
            { t: 'Erde und einem Lkw', d: 'M<sub>Erde</sub> = 5,971 · 10²⁴ kg, m<sub>Lkw</sub> = 4 · 10⁴ kg, Abstand zum Erdmittelpunkt r = 6373 km', F: G * ME * 4e4 / Math.pow(6.373e6, 2) }
        ]);
        const s = sci(sz.F, 2);
        return {
            type: 'num', level: 'Zehnerpotenzen',
            q: 'Berechnen Sie die Gravitationskraft zwischen <strong>' + sz.t + '</strong>.<br><span style="color:#cbd5e1">' + sz.d + '</span>',
            note: SCI_NOTE + ' G = 6,674 · 10⁻¹¹ N·m²/kg².',
            fields: sciFields(sz.F, 'F', 'N', [{ n: s.n + 6, msg: 'Die Hochzahl ist um 6 zu groß. Haben Sie km in m umgerechnet?' }]),
            hint: 'Erst den Abstand in m umrechnen (1 km = 10³ m, 1 Mio. km = 10⁹ m). Dann Zahlen und Zehnerpotenzen getrennt rechnen.',
            explanation: 'F = G · m₁ · m₂ / r² ≈ <strong>' + de(s.a, 2) + ' · ' + p10(s.n) + ' N</strong>.'
        };
    },
    {
        type: 'mc', shuffle: true, level: 'Einheiten',
        q: 'Prüfen Sie die Einheiten im Gravitationsgesetz: <strong>N·m²/kg² · kg · kg / m²</strong> ergibt …',
        options: ['N', 'N · m²', 'kg', 'N/kg'],
        correct: 0,
        hint: 'Kürzen Sie: kg · kg = kg². Was bleibt übrig, wenn kg² und m² wegfallen?',
        explanation: 'N · m²/kg² · kg² / m² = <strong>N</strong>. Die Einheiten kürzen sich. Genau dafür hat G die seltsame Einheit N·m²/kg².'
    }
],
// ---------------------------------------------------------------- Modul 4
4: [
    function () {
        const p = rint(52, 98), t = rnd([0.9, 1.2, 1.5, 2.1, 3.5]), gr = rnd([150, 250, 400, 750]);
        const fields = shuffle([
            { label: 'Person mit ' + p + ' kg', unit: 'N', ans: T(p * g0), tol: 10 },
            { label: 'Auto mit ' + de(t) + ' t', unit: 'N', ans: T(t * 1000 * g0), tol: 10, errors: [{ v: T(t * g0), msg: '1 t = 1000 kg. Rechnen Sie zuerst in kg um.' }] },
            { label: 'Paket mit ' + gr + ' g', unit: 'N', ans: T(gr / 1000 * g0), tol: 10, errors: [{ v: T(gr * g0), msg: '1 kg = 1000 g. Rechnen Sie zuerst in kg um.', tol: relTol(gr * g0, 0.01) }] }
        ]);
        return {
            type: 'num', q: 'Berechnen Sie die Gewichtskraft auf der Erde. (g = 9,81 N/kg)',
            note: 'Runden Sie auf zwei Nachkommastellen.',
            fields,
            hint: 'F<sub>G</sub> = m · g. Die Masse muss in kg eingesetzt werden.',
            explanation: fields.map(f => f.label + ': F<sub>G</sub> = <strong>' + de(f.ans / 1000, 2) + ' N</strong>').join('<br>')
        };
    },
    {
        type: 'match', q: 'Welche Einheit gehört zu welcher Größe?',
        options: ['N', 'kg', 'N/kg (= m/s²)', 'N·m²/kg²', 'm'],
        items: [
            { left: 'Gewichtskraft F<sub>G</sub>', answer: 'N' },
            { left: 'Masse m', answer: 'kg' },
            { left: 'Ortsfaktor g', answer: 'N/kg (= m/s²)' },
            { left: 'Gravitationskonstante G', answer: 'N·m²/kg²' },
            { left: 'Abstand r', answer: 'm' }
        ],
        hint: 'g = F<sub>G</sub> / m. Also ist die Einheit von g: N geteilt durch kg.',
        explanation: 'F<sub>G</sub> in N, m in kg, g in N/kg (das ist dasselbe wie m/s²), G in N·m²/kg², r in m.'
    },
    function () {
        const F = rnd([2.5, 4.9, 7.4, 12, 15.5, 19.6, 29.4]);
        const m = F / g0, mg = Math.round(m * 1000);
        return {
            type: 'num',
            q: 'Ein Federkraftmesser zeigt <strong>' + de(F) + ' N</strong> an. Welche Masse hängt daran? (g = 9,81 N/kg)',
            note: 'Stellen Sie F<sub>G</sub> = m · g nach m um. Geben Sie die Masse in kg (drei Nachkommastellen) und in g (ganze Zahl) an.',
            fields: [
                { label: 'Masse m', unit: 'kg', ans: T(m), tol: 2, errors: [{ v: T(F * g0), msg: 'Teilen statt malnehmen: m = F / g.', tol: relTol(F * g0, 0.01) }] },
                { label: 'Masse m', unit: 'g', ans: T(mg), tol: 2000 }
            ],
            hint: 'm = F<sub>G</sub> / g. Danach: 1 kg = 1000 g.',
            explanation: 'm = ' + de(F) + ' N / 9,81 N/kg ≈ <strong>' + de(m, 3) + ' kg</strong> = <strong>' + mg + ' g</strong>.'
        };
    },
    richtigFalsch([
        { left: 'g = 9,81 N/kg bedeutet: Auf jedes Kilogramm wirken 9,81 N.', answer: 'richtig' },
        { left: '1 N/kg ist dasselbe wie 1 m/s².', answer: 'richtig' },
        { left: 'Ein Körper mit doppelter Masse hat die doppelte Gewichtskraft.', answer: 'richtig' },
        { left: 'Die Gewichtskraft zeigt zum Erdmittelpunkt.', answer: 'richtig' },
        { left: 'g ist an jedem Ort der Erde exakt gleich groß.', answer: 'falsch' },
        { left: 'Im Vakuum fällt ein schwerer Körper schneller als ein leichter.', answer: 'falsch' },
        { left: 'F<sub>G</sub> = m · g ist ein Sonderfall des Gravitationsgesetzes.', answer: 'richtig' },
        { left: 'Die Einheit der Gewichtskraft ist kg.', answer: 'falsch' }
    ], 5, 'g ist der Ortsfaktor: Kraft pro Kilogramm, auch Fallbeschleunigung genannt. Er ist nicht überall gleich. Im Vakuum fallen alle Körper gleich schnell, weil jedes Kilogramm dieselbe Beschleunigung g erfährt.'),
    {
        type: 'order', q: 'Wie kommt man vom Gravitationsgesetz zur Formel F<sub>G</sub> = m · g? Bringen Sie die Schritte in die richtige Reihenfolge.',
        steps: ['Gravitationsgesetz für Erde und Körper: F<sub>G</sub> = G · M<sub>Erde</sub> · m / r²',
                'An einem festen Ort sind G, M<sub>Erde</sub> und r konstant.',
                'Diese Konstanten fasst man zusammen: g = G · M<sub>Erde</sub> / r²',
                'Damit gilt: F<sub>G</sub> = m · g'],
        hint: 'Starten Sie beim allgemeinen Gesetz. Am Ende steht die kurze Formel.',
        explanation: 'g = G · M<sub>Erde</sub> / r² ist für jeden Ort eine feste Zahl. In Mitteleuropa ist g ≈ 9,81 N/kg. Deshalb reicht im Alltag F<sub>G</sub> = m · g.'
    }
],
// ---------------------------------------------------------------- Modul 5
5: [
    function () {
        const m = rint(55, 95), k = rnd(KOERPER.filter(x => x.gTab));
        return {
            type: 'num',
            q: 'Ein Astronaut hat mit Ausrüstung eine Masse von <strong>' + m + ' kg</strong>. Berechnen Sie seine Gewichtskraft auf der Erde und auf dem <strong>' + k.name + '</strong>.',
            note: 'g<sub>Erde</sub> = 9,81 N/kg, g<sub>' + k.name + '</sub> = ' + de(k.gTab) + ' N/kg. Runden Sie auf eine Nachkommastelle.',
            fields: [
                { label: 'auf der Erde', unit: 'N', ans: T(m * g0), tol: 60 },
                { label: 'auf dem ' + k.name, unit: 'N', ans: T(m * k.gTab), tol: 60, errors: [{ v: T(m), msg: 'Gesucht ist die Kraft in N, nicht die Masse.', tol: 0 }] },
                { label: 'Masse auf dem ' + k.name, unit: 'kg', ans: T(m), errors: [{ v: T(m * k.gTab / g0), msg: 'Die Masse ändert sich nicht. Sie ist überall gleich.', tol: 600 }] }
            ],
            hint: 'F<sub>G</sub> = m · g mit dem passenden Ortsfaktor. Und: Was passiert mit der Masse?',
            explanation: 'Erde: ' + m + ' kg · 9,81 N/kg ≈ <strong>' + de(m * g0, 1) + ' N</strong>. ' + k.name + ': ' + m + ' kg · ' + de(k.gTab) + ' N/kg ≈ <strong>' + de(m * k.gTab, 1) + ' N</strong>. Die Masse bleibt <strong>' + m + ' kg</strong>.'
        };
    },
    function () {
        const k = rnd(KOERPER);
        const s = sci(k.R * 1000, 4), gv = G * k.M / Math.pow(k.R * 1000, 2);
        return {
            type: 'num',
            q: 'Berechnen Sie den Ortsfaktor g an der Oberfläche von <strong>' + k.name + '</strong>.<br><span style="color:#cbd5e1">M = ' + sciStr(k.M, 3) + ' kg, Radius R = ' + de(k.R) + ' km</span>',
            note: 'Formel: g = G · M / R². G = 6,674 · 10⁻¹¹ N·m²/kg². Runden Sie g auf zwei Nachkommastellen.',
            fields: [
                { label: 'Radius in m', unit: '· ' + p10(s.n) + ' m', ans: T(s.a), tol: 1, errors: [{ v: T(k.R), msg: 'Die Zahl vor der Zehnerpotenz soll zwischen 1 und 10 liegen.', tol: 0 }] },
                { label: 'Ortsfaktor g', unit: 'N/kg', ans: T(gv), tol: Math.max(15, relTol(gv, 0.005)),
                  errors: [{ v: T(gv * 1e6), msg: 'Der Radius muss in m eingesetzt werden.', tol: relTol(gv * 1e6, 0.01) }, { v: T(G * k.M / (k.R * 1000)), msg: 'Haben Sie R quadriert?', tol: relTol(G * k.M / (k.R * 1000), 0.01) }] }
            ],
            hint: 'Erst R in m: 1 km = 10³ m. Dann g = G · M / R². Rechnen Sie Zahlen und Zehnerpotenzen getrennt.',
            explanation: 'R = ' + de(k.R) + ' km = ' + de(s.a, 4) + ' · ' + p10(s.n) + ' m.<br>g = 6,674 · 10⁻¹¹ · ' + sciStr(k.M, 3) + ' / (' + de(s.a, 4) + ' · ' + p10(s.n) + ')² ≈ <strong>' + de(gv, 2) + ' N/kg</strong>.' +
                         (k.name === 'Jupiter' ? ' Jupiter hat keine feste Oberfläche. Gemeint ist die Wolkenobergrenze.' : '')
        };
    },
    {
        type: 'mc', shuffle: true, level: 'Begründen',
        q: 'Der Mond hat einen viel kleineren Radius als die Erde (etwa 0,27-mal so groß). Trotzdem ist g auf dem Mond kleiner. Welche Begründung ist richtig?',
        options: ['Auf dem Mond gibt es keine Luft. Ohne Luft gibt es keine Schwerkraft.',
                  'Ein kleinerer Radius würde g vergrößern. Aber die Mondmasse ist etwa 81-mal kleiner. Dieser Effekt ist stärker.',
                  'Der Astronaut verliert auf dem Mond Masse.',
                  'Der Mond ist weiter von der Sonne entfernt.'],
        correct: 1,
        wrongHints: { 'Auf dem Mond gibt es keine Luft. Ohne Luft gibt es keine Schwerkraft.': 'Gravitation braucht keine Luft. Sie wirkt auch im leeren Weltraum.' },
        hint: 'Schauen Sie auf g = G · M / R². Was steht im Zähler, was im Nenner?',
        explanation: 'g<sub>Mond</sub> / g<sub>Erde</sub> = (M<sub>Mond</sub> / M<sub>Erde</sub>) / (R<sub>Mond</sub> / R<sub>Erde</sub>)² ≈ (1/81) / 0,27² ≈ 0,17. Also etwa <strong>ein Sechstel</strong>. Die viel kleinere Masse gewinnt gegen den kleineren Radius.'
    },
    function () {
        const all = [
            ['die Masse des Astronauten', 'bleibt gleich'],
            ['die Masse seines Rucksacks', 'bleibt gleich'],
            ['die Gewichtskraft des Astronauten', 'wird kleiner'],
            ['der Ortsfaktor g', 'wird kleiner'],
            ['die Kraft, die er zum Hochheben eines Steins braucht', 'wird kleiner'],
            ['die Höhe, die er springen kann', 'wird größer'],
            ['die Zeit, bis ein fallen gelassener Hammer am Boden ist', 'wird größer'],
            ['die Anzeige einer Balkenwaage', 'bleibt gleich']
        ].map(x => ({ left: x[0], answer: x[1] }));
        let sel;
        do { sel = pickN(all, 5); } while (['bleibt gleich', 'wird kleiner', 'wird größer'].some(a => !sel.some(x => x.answer === a)));
        return {
            type: 'match', q: 'Ein Astronaut fliegt von der Erde zum Mond. Was passiert?',
            options: ['bleibt gleich', 'wird kleiner', 'wird größer'], items: sel,
            hint: 'Die Masse ist überall gleich. Die Gewichtskraft hängt von g ab. Eine Balkenwaage vergleicht Massen.',
            explanation: 'Masse: gleich. Gewichtskraft und g: kleiner (etwa ein Sechstel). Weil alles leichter ist, springt man höher und Dinge fallen langsamer. Die Balkenwaage zeigt dasselbe, weil auf beiden Seiten dasselbe g wirkt.'
        };
    },
    function () {
        const P = rnd([[2, 2], [4, 2], [8, 2], [0.5, 0.5], [3, 1.5], [10, 3], [0.1, 0.5], [2, 0.5]]);
        const [a, b] = P, f = a / (b * b), gx = g0 * f;
        return {
            type: 'num', level: 'Knobelaufgabe',
            q: 'Planet X hat die <strong>' + de(a) + '-fache Masse</strong> und den <strong>' + de(b) + '-fachen Radius</strong> der Erde. Wie groß ist g auf Planet X?',
            note: 'Sie brauchen keine Zehnerpotenzen. Überlegen Sie mit g = G · M / R², welcher Faktor herauskommt. Runden Sie auf drei bzw. zwei Nachkommastellen.',
            fields: [
                { label: 'g<sub>X</sub> =', unit: '· g<sub>Erde</sub>', ans: T(f), tol: 2, small: true,
                  errors: [{ v: T(a / b), msg: 'Der Radius steht im Quadrat.', tol: 2 }, { v: T(a * b * b), msg: 'Der Radius steht im Nenner.', tol: 2 }] },
                { label: 'g<sub>X</sub> =', unit: 'N/kg', ans: T(gx), tol: 25 }
            ],
            hint: 'Masse im Zähler: Faktor ' + de(a) + '. Radius im Quadrat im Nenner: Faktor 1 / ' + de(b) + '².',
            explanation: 'g<sub>X</sub> = ' + de(a) + ' / ' + de(b) + '² · g<sub>Erde</sub> = <strong>' + de(Math.round(f * 1000) / 1000) + ' · g<sub>Erde</sub></strong> ≈ <strong>' + de(gx, 2) + ' N/kg</strong>.'
        };
    }
],
// ---------------------------------------------------------------- Modul 6
6: [
    function () {
        let F;
        do { F = rint(10, 50) * 10; } while ((F / g0) % 1 < 0.5);
        const m = F / g0;
        return {
            type: 'num',
            q: 'Eine Angelschnur hält eine Zugkraft von höchstens <strong>' + F + ' N</strong> aus. Welche Masse darf ein Fisch höchstens haben, damit die Schnur nicht reißt?',
            note: 'Wir rechnen nur mit der Gewichtskraft (Fisch hängt ruhig). g = 9,81 N/kg.',
            fields: [
                { label: 'm<sub>max</sub> (zwei Nachkommastellen)', unit: 'kg', ans: T(m), tol: 10, errors: [{ v: T(F * g0), msg: 'Umstellen: m = F / g. Teilen statt malnehmen.', tol: relTol(F * g0, 0.01) }] },
                { label: 'm<sub>max</sub> auf ganze kg, sicher gerundet', unit: 'kg', ans: T(Math.floor(m)), errors: [{ v: T(Math.ceil(m)), msg: 'Mit dieser Masse würde die Schnur reißen. Hier muss abgerundet werden.' }] }
            ],
            hint: 'F<sub>G</sub> = m · g nach m umstellen: m = F<sub>G</sub> / g. Überlegen Sie beim Runden: Was ist hier sicher?',
            explanation: 'm = ' + F + ' N / 9,81 N/kg ≈ <strong>' + de(m, 2) + ' kg</strong>. Sicher gerundet: <strong>' + Math.floor(m) + ' kg</strong>. Aufrunden wäre gefährlich. In der Praxis zieht ein zappelnder Fisch übrigens deutlich stärker.'
        };
    },
    function () {
        const FkN = rnd([6, 7.5, 8, 10, 12, 15]), mp = rnd([75, 80, 85]);
        const mmax = FkN * 1000 / g0, n = Math.floor(mmax / mp);
        return {
            type: 'num',
            q: 'Das Tragseil eines Aufzugs darf zusätzlich zur Kabine mit <strong>' + de(FkN) + ' kN</strong> belastet werden. Für eine Person rechnet man mit <strong>' + mp + ' kg</strong>. Wie viele Personen dürfen höchstens einsteigen?',
            note: '1 kN = 1000 N. g = 9,81 N/kg. Masse auf ganze kg runden.',
            fields: [
                { label: 'zulässige Masse', unit: 'kg', ans: T(mmax), tol: 1000, errors: [{ v: T(FkN / g0), msg: 'Rechnen Sie kN zuerst in N um.', tol: 50 }] },
                { label: 'Anzahl Personen', unit: 'Personen', ans: T(n), errors: [{ v: T(n + 1), msg: 'Mit einer Person mehr wäre der Aufzug überlastet. Abrunden!' }] }
            ],
            hint: 'Erst m = F / g. Dann durch die Masse einer Person teilen. Nur ganze Personen, und sicher runden.',
            explanation: 'm = ' + de(FkN * 1000) + ' N / 9,81 N/kg ≈ <strong>' + de(Math.round(mmax)) + ' kg</strong>. ' + de(Math.round(mmax)) + ' kg / ' + mp + ' kg ≈ ' + de(mmax / mp, 2) + ' → <strong>' + n + ' Personen</strong>.'
        };
    },
    function () {
        const all = [
            { left: 'F = m · g, gesucht: m', answer: 'm = F / g', wrong: 'm = F · g' },
            { left: 'F = m · g, gesucht: g', answer: 'g = F / m', wrong: 'g = m / F' },
            { left: 'F = G · m₁ · m₂ / r², gesucht: m₂', answer: 'm₂ = F · r² / (G · m₁)', wrong: 'm₂ = G · m₁ / (F · r²)' },
            { left: 'F = G · m₁ · m₂ / r², gesucht: r', answer: 'r = √(G · m₁ · m₂ / F)', wrong: 'r = G · m₁ · m₂ / F' },
            { left: 'g = G · M / r², gesucht: M', answer: 'M = g · r² / G', wrong: 'M = G · r² / g' },
            { left: 'g = G · M / r², gesucht: r', answer: 'r = √(G · M / g)', wrong: 'r = √(g / (G · M))' }
        ];
        const sel = pickN(all, 4);
        const options = shuffle(sel.map(x => x.answer).concat(sel.map(x => x.wrong)));
        return {
            type: 'match', q: 'Welche Formel ist richtig umgestellt?', options,
            items: sel.map(x => ({ left: x.left, answer: x.answer, errors: [{ v: x.wrong, msg: 'Probe: Setzen Sie die umgestellte Formel in die Ausgangsformel ein.' }] })),
            hint: 'Mal wird zu geteilt. Ein Quadrat wird mit der Wurzel aufgelöst. Machen Sie die Probe.',
            explanation: sel.map(x => x.left.split(',')[0] + ' → <strong>' + x.answer + '</strong>').join('<br>')
        };
    },
    function () {
        const z = rnd([
            { t: 'nur noch <strong>halb so groß</strong> wie an der Erdoberfläche (g = 4,905 N/kg)', g: g0 / 2 },
            { t: 'nur noch <strong>ein Viertel</strong> so groß wie an der Erdoberfläche (g = 2,4525 N/kg)', g: g0 / 4 },
            { t: 'nur noch <strong>1 N/kg</strong>', g: 1 }
        ]);
        const r = Math.sqrt(G * ME / z.g) / 1000, h = r - RE;
        return {
            type: 'num', level: 'Knobelaufgabe',
            q: 'In welchem Abstand vom Erdmittelpunkt ist g ' + z.t + '?',
            note: KONST + ', Erdradius R = 6371 km. Stellen Sie g = G · M / r² nach r um. Ergebnisse auf ganze km.',
            fields: [
                { label: 'Abstand r vom Erdmittelpunkt', unit: 'km', ans: T(r), tol: relTol(r, 0.01),
                  errors: [{ v: T(r * 1000), msg: 'Das Ergebnis der Wurzel ist in m. Rechnen Sie in km um.', tol: relTol(r * 1000, 0.01) }] },
                { label: 'Höhe über der Erdoberfläche', unit: 'km', ans: T(h), tol: relTol(r, 0.01), errors: [{ v: T(r), msg: 'Gefragt ist die Höhe über der Oberfläche: r − R.', tol: relTol(r, 0.01) }] }
            ],
            hint: 'r = √(G · M / g). Das Ergebnis kommt in m heraus. Für die Höhe ziehen Sie den Erdradius ab.',
            explanation: 'r = √(G · M / g) = √(6,674 · 10⁻¹¹ · 5,971 · 10²⁴ / ' + de(z.g, 4) + ') m ≈ <strong>' + de(Math.round(r)) + ' km</strong>. Höhe: ' + de(Math.round(r)) + ' km − 6371 km ≈ <strong>' + de(Math.round(h)) + ' km</strong>.' +
                         (z.g === g0 / 2 ? ' Kurzer Weg: g halbiert sich, wenn r um den Faktor √2 wächst: 6371 km · √2 ≈ 9010 km.' : z.g === g0 / 4 ? ' Kurzer Weg: Ein Viertel bei doppeltem Abstand, also r ≈ 2 · 6371 km.' : '')
        };
    },
    function () {
        let F;
        do { F = rint(15, 45) * 10; } while ((F / g0) % 1 < 0.5);
        const m = F / g0;
        const art = rnd(['formel', 'einheit', 'runden']);
        const L = ['F = m · g', 'm = F / g', 'm = ' + F + ' N / 9,81 N/kg', 'm = ' + de(m, 2) + ' kg', 'Der Fisch darf höchstens ' + Math.floor(m) + ' kg haben.'];
        let falsch, expl;
        if (art === 'formel') {
            L[1] = 'm = F · g'; L[2] = 'm = ' + F + ' N · 9,81 N/kg'; L[3] = 'm = ' + de(F * g0, 2) + ' kg'; L[4] = 'Der Fisch darf höchstens ' + Math.floor(F * g0) + ' kg haben.';
            falsch = 2; expl = 'In Zeile 2 wurde falsch umgestellt. Aus F = m · g folgt m = F / g.';
        } else if (art === 'einheit') {
            L[3] = 'm = ' + de(m, 2) + ' N';
            falsch = 4; expl = 'In Zeile 4 ist die Einheit falsch: N geteilt durch N/kg ergibt kg.';
        } else {
            L[4] = 'Der Fisch darf höchstens ' + Math.ceil(m) + ' kg haben.';
            falsch = 5; expl = 'In Zeile 5 wurde aufgerundet. Ein Fisch mit ' + Math.ceil(m) + ' kg würde die Schnur zerreißen.';
        }
        return fehlerTask('Fehler finden: Eine Angelschnur hält ' + F + ' N. Eine Mitschülerin rechnet die größte erlaubte Fischmasse aus. In welcher Zeile steht der <strong>erste</strong> Fehler?',
            L, falsch, expl + ' Richtig: m ≈ ' + de(m, 2) + ' kg, also höchstens <strong>' + Math.floor(m) + ' kg</strong>.');
    }
],
// ---------------------------------------------------------------- Modul 7
7: [
    function () {
        const pool = ORTE.concat([
            { name: 'Flugzeug, 10 km über Nürnberg', r: 6383 },
            { name: 'Raumstation ISS (408 km Höhe)', r: RE + 408 },
            { name: 'Wettersatellit (36 000 km Höhe)', r: RE + 36000 }
        ]);
        let sel;
        do {
            sel = pickN(pool, 4).sort((a, b) => a.r - b.r);
        } while (sel.some((x, k) => k > 0 && x.r - sel[k - 1].r < 4));
        return {
            type: 'order', q: 'Sortieren Sie die Orte nach dem Ortsfaktor g. Der größte Wert kommt nach oben.',
            note: 'Abstände zum Erdmittelpunkt: ' + sel.map(x => x.name + ': ' + de(x.r) + ' km').join('; ') + '.',
            top: 'größtes g', bottom: 'kleinstes g',
            steps: sel.map(x => x.name),
            hint: 'g = G · M / r². Je größer der Abstand r zum Erdmittelpunkt, desto kleiner g.',
            explanation: sel.map(x => x.name + ': g ≈ <strong>' + de(gAt(x.r), 3) + ' N/kg</strong>').join('<br>')
        };
    },
    function () {
        const h = rnd([400, 408, 415, 420]), r = RE + h, gi = gAt(r), gs = gAt(RE);
        const p = (1 - gi / gs) * 100;
        return {
            type: 'num',
            q: 'Die Raumstation ISS fliegt in etwa <strong>' + h + ' km</strong> Höhe. Wie groß ist g dort? Um wie viel Prozent ist g kleiner als an der Erdoberfläche?',
            note: KONST + ', Erdradius R = 6371 km. g auf zwei, Prozent auf eine Nachkommastelle.',
            fields: [
                { label: 'r = R + h', unit: 'km', ans: T(r), errors: [{ v: T(h), msg: 'r ist der Abstand zum Erdmittelpunkt: R + h.' }] },
                { label: 'g in der ISS', unit: 'N/kg', ans: T(gi), tol: 15, errors: [{ v: T(G * ME / Math.pow(h * 1000, 2)), msg: 'Sie haben nur die Höhe eingesetzt. Gemeint ist r = R + h.', tol: relTol(G * ME / Math.pow(h * 1000, 2), 0.01) }] },
                { label: 'g ist kleiner um', unit: '%', ans: T(p), tol: 400 }
            ],
            hint: 'Erst r = 6371 km + h. Dann g = G · M / r². Prozent: (1 − g<sub>ISS</sub> / g<sub>Oberfläche</sub>) · 100.',
            explanation: 'r = ' + de(r) + ' km. g = 6,674 · 10⁻¹¹ · 5,971 · 10²⁴ / (' + de(r / 1000, 3) + ' · 10⁶)² ≈ <strong>' + de(gi, 2) + ' N/kg</strong>.<br>' +
                         'An der Oberfläche (r = 6371 km): g ≈ ' + de(gs, 2) + ' N/kg. Also ist g in der ISS nur etwa <strong>' + de(p, 1) + ' %</strong> kleiner.'
        };
    },
    {
        type: 'mc', shuffle: true, level: 'Begründen',
        q: 'In der ISS ist g noch fast 9 N/kg. Warum schweben die Astronauten trotzdem?',
        options: ['Im Weltraum gibt es keine Gravitation.',
                  'Die ISS und die Astronauten fallen gemeinsam ständig um die Erde herum (freier Fall).',
                  'Die dünne Luft trägt die Astronauten.',
                  'Die Anziehung des Mondes hebt die Anziehung der Erde auf.'],
        correct: 1,
        wrongHints: { 'Im Weltraum gibt es keine Gravitation.': 'Sie haben es selbst berechnet: In 400 km Höhe ist g noch fast 9 N/kg.' },
        hint: 'Denken Sie an Newtons Mond: Er fällt ständig zur Erde, verfehlt sie aber, weil er so schnell seitwärts fliegt.',
        explanation: 'Die ISS fliegt mit etwa 28 000 km/h um die Erde. Sie fällt ständig, aber „verfehlt“ die Erde immer wieder. Astronauten und Station fallen gleich schnell. Deshalb drückt nichts gegen den Boden. Das nennt man <strong>Schwerelosigkeit</strong>, obwohl die Gravitation wirkt.'
    },
    function () {
        const m = rnd([10, 20, 50]);
        const a = ORTE[1], b = ORTE[2];                           // Nordpol, Jakarta
        const Fa = gAt(a.r) * m, Fb = gAt(b.r) * m;
        return {
            type: 'num', level: 'Anwendung',
            q: 'Ein Goldhändler wiegt einen Goldbarren mit <strong>m = ' + m + ' kg</strong> mit einem Federkraftmesser: einmal am <strong>Nordpol</strong> (r = 6367 km), einmal in <strong>Jakarta</strong> (r = 6377 km). Welche Kräfte zeigt das Gerät an?',
            note: KONST + '. Runden Sie auf drei Nachkommastellen, aber erst am Ende. Die Unterschiede sind klein!',
            fields: [
                { label: 'Gewichtskraft am Nordpol', unit: 'N', ans: T(Fa), tol: 2 * m },
                { label: 'Gewichtskraft in Jakarta', unit: 'N', ans: T(Fb), tol: 2 * m },
                { label: 'Unterschied', unit: 'N', ans: T(Fa - Fb), tol: Math.max(3, relTol(Fa - Fb, 0.05)) }
            ],
            hint: 'Zweimal F = G · M<sub>Erde</sub> · m / r², dann die Differenz.',
            explanation: 'Nordpol: <strong>' + de(Fa, 3) + ' N</strong>. Jakarta: <strong>' + de(Fb, 3) + ' N</strong>. Unterschied: <strong>' + de(Fa - Fb, 3) + ' N</strong>. Ein Federkraftmesser zeigt diesen Unterschied. Eine Balkenwaage nicht: Sie vergleicht Massen, und die sind überall gleich.'
        };
    },
    richtigFalsch([
        { left: 'Auf dem Gipfel des Mount Everest ist die Gewichtskraft kleiner als in Nürnberg.', answer: 'richtig' },
        { left: 'In der ISS ist g gleich null.', answer: 'falsch' },
        { left: 'Bei doppeltem Abstand vom Erdmittelpunkt ist g nur noch ein Viertel so groß.', answer: 'richtig' },
        { left: 'Eine Balkenwaage zeigt am Nordpol eine größere Masse an als in Jakarta.', answer: 'falsch' },
        { left: 'Die Erdrotation verringert die gemessene Gewichtskraft am Äquator zusätzlich.', answer: 'richtig' },
        { left: 'Die Erde ist eine perfekte Kugel. Deshalb ist r überall gleich.', answer: 'falsch' },
        { left: 'Ein Satellit in 36 000 km Höhe erfährt immer noch eine Anziehung der Erde.', answer: 'richtig' }
    ], 5, 'g nimmt mit dem Abstand ab (Faktor 1/r²), wird aber nie null. Die Erde ist an den Polen abgeplattet. Am Äquator wirkt zusätzlich die Drehung der Erde. Massen bleiben überall gleich.')
]
};
