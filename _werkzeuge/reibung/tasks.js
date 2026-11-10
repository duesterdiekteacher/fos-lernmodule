// =====================================================================
// Aufgaben für das Modul "Die Reibung" (FOS 12)
// Hilfsfunktionen aus engine.js. num-Felder: ans in Tausendsteln der Einheit
// (9,81 -> 9810). tol = erlaubter Spielraum in Tausendsteln.
// Eigene Zahlenwerte (nicht die Werte der Arbeitsblätter). g = 9,81 m/s².
// Reibungszahlen stehen immer direkt in der Aufgabe.
// =====================================================================

const BASIC = [1, 2, 3, 4];
const ADVANCED = [5, 6, 7];
const UNLOCK_TEXT = {
    5: 'Zentripetalkraft und Abtrieb: Warum ein Formel-1-Wagen in der Kurve nicht wegrutscht.',
    6: 'Normalkraft und Hangabtriebskraft auf der schiefen Ebene.',
    7: 'Reibung auf der schiefen Ebene: Wie groß muss die Zugkraft mindestens sein?'
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
const rad = d => d * Math.PI / 180;
const sinD = d => Math.sin(rad(d)), cosD = d => Math.cos(rad(d)), tanD = d => Math.tan(rad(d));
const degOf = r => r * 180 / Math.PI;

// Beim ersten Öffnen kommen feste Werte, danach neue Zahlen
const _seen = {};
function erstesMal(key) { if (_seen[key]) return false; _seen[key] = true; return true; }

const RF = ['richtig', 'falsch'];
function richtigFalsch(all, n, expl, q, opts) {
    return function () {
        const sel = pickN(all, n);
        if (sel.every(x => x.answer === sel[0].answer)) return richtigFalsch(all, n, expl, q, opts)();
        return {
            type: 'match', q: q || 'Richtig oder falsch?', options: opts || RF, items: sel,
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
        type: 'mc', svg: calcBox(lines), q, level: 'Fehler finden',
        options: lines.map((s, k) => 'Zeile ' + (k + 1)), correct: falsch - 1,
        hint: hint || 'Prüfen Sie jede Zeile: Stimmt die Formel? Stimmen die Einheiten? Stimmt die Rechnung?',
        explanation: expl
    };
}

// ---------- "Wer hat recht?" ----------
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

// ---------- Kleine Reibungszahlen-Tabelle (eigene, gerundete Richtwerte) ----------
const MU_TAB = '<div class="table-wrap"><table><tr><th>Werkstoffpaarung</th><th>Haftreibung μ<sub>H</sub></th><th>Gleitreibung μ<sub>G</sub></th></tr>' +
    [['Gummi auf Asphalt, trocken', '0,9', '0,8'], ['Gummi auf Asphalt, nass', '0,5', '0,35'], ['Holz auf Holz', '0,5', '0,3'],
     ['Stahl auf Stahl, trocken', '0,2', '0,15'], ['Stahl auf Stahl, geschmiert', '0,1', '0,05'], ['Stahl auf Eis (Schlittschuh)', '0,03', '0,01'],
     ['Wälzlager (Rollreibung)', '–', 'etwa 0,002']]
    .map(r => '<tr><td>' + r.join('</td><td>') + '</td></tr>').join('') + '</table></div>';

// =====================================================================
// Skizzen
// =====================================================================
const SF = 'font-family="Segoe UI, Arial"';
const ARR = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>';
const C = { G: '#94a3b8', N: '#38bdf8', H: '#f87171', R: '#fbbf24', Z: '#4ade80', C: '#f472b6' };

function pf(x1, y1, x2, y2, col, w) {
    return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + col + '" stroke-width="' + (w || 4) + '" marker-end="url(#ah)"/>';
}
function tx(x, y, s, col, size, anchor) {
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" fill="' + col + '" font-size="' + (size || 16) + '" font-weight="bold" text-anchor="' + (anchor || 'middle') + '" ' + SF + '>' + s + '</text>';
}
function idx(b, i) { return b + '<tspan font-size="72%" dy="4">' + i + '</tspan>'; }

// Schiefe Ebene. o: {a: Winkel, m: Masse, zug: true/false, labels: true/false, k: px pro N}
function rampSvg(o) {
    const a = o.a, ar = rad(a), base = 330, x0 = 50, k = o.k || 0.75;
    const L = a > 1 ? Math.min(400, 290 / Math.sin(ar)) : 400;
    const ux = Math.cos(ar), uy = -Math.sin(ar);            // hangaufwärts
    const nx = -Math.sin(ar), ny = -Math.cos(ar);            // nach außen (von der Fläche weg)
    const topX = x0 + L * ux, topY = base + L * uy;
    const sx = x0 + 0.5 * L * ux, sy = base + 0.5 * L * uy; // Mittelpunkt der Auflage
    const bw = 64, bh = 40;
    const cx = sx + nx * bh / 2, cy = sy + ny * bh / 2;      // Kistenmitte
    const FG = o.m * g0, FN = FG * Math.cos(ar), FH = FG * Math.sin(ar);
    let s = '<svg viewBox="0 30 540 500" role="img" aria-label="Kiste auf einer schiefen Ebene mit Gewichtskraft, Normalkraft und Hangabtriebskraft">' + ARR;
    s += '<polygon points="' + x0 + ',' + base + ' ' + topX.toFixed(1) + ',' + topY.toFixed(1) + ' ' + topX.toFixed(1) + ',' + base + '" fill="#3b2a0a" stroke="#f59e0b" stroke-width="2"/>';
    s += '<line x1="10" y1="' + base + '" x2="530" y2="' + base + '" stroke="#64748b" stroke-width="2"/>';
    if (a >= 4) {
        const r = 46;
        s += '<path d="M' + (x0 + r) + ',' + base + ' A' + r + ',' + r + ' 0 0 0 ' + (x0 + r * ux).toFixed(1) + ',' + (base + r * uy).toFixed(1) + '" fill="none" stroke="#e2e8f0" stroke-width="2"/>';
        s += tx(x0 + (r + 16) * Math.cos(ar / 2), base - (r + 16) * Math.sin(ar / 2) + 5, 'α', '#e2e8f0', 16);
    }
    s += '<g transform="translate(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ') rotate(' + (-a) + ')"><rect x="' + (-bw / 2) + '" y="' + (-bh / 2) + '" width="' + bw + '" height="' + bh + '" rx="4" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/></g>';
    const gx = cx, gy = cy + FG * k;
    const nX = cx - nx * FN * k, nY = cy - ny * FN * k;     // in die Fläche hinein
    const hX = cx - ux * FH * k, hY = cy - uy * FH * k;     // hangabwärts
    if (o.labels !== false) {
        s += '<line x1="' + nX.toFixed(1) + '" y1="' + nY.toFixed(1) + '" x2="' + gx.toFixed(1) + '" y2="' + gy.toFixed(1) + '" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>';
        s += '<line x1="' + hX.toFixed(1) + '" y1="' + hY.toFixed(1) + '" x2="' + gx.toFixed(1) + '" y2="' + gy.toFixed(1) + '" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>';
    }
    s += pf(cx, cy, gx, gy, C.G, 4) + tx(gx - 10, gy + 4, idx('F', 'G'), C.G, 17, 'end');
    if (FN * k > 8) s += pf(cx, cy, nX, nY, C.N, 4) + tx(nX + 24, nY + 6, idx('F', 'N'), C.N, 17);
    if (FH * k > 8) s += pf(cx, cy, hX, hY, C.H, 4) + tx(hX - 8, hY - 10, idx('F', 'H'), C.H, 17, 'end');
    if (o.zug) {
        const zl = o.zl || 120, rl = o.rl || 70;
        const zX = cx + ux * (bw / 2) + ux * zl, zY = cy + uy * (bw / 2) + uy * zl;
        s += pf(cx + ux * bw / 2, cy + uy * bw / 2, zX, zY, C.Z, 4) + tx(zX + 4, zY - 8, idx('F', 'Z'), C.Z, 17, 'start');
        s += pf(sx - ux * 34, sy - uy * 34 + 3, sx - ux * (34 + rl), sy - uy * (34 + rl) + 3, C.R, 4) + tx(sx - ux * (34 + rl) - 4, sy - uy * (34 + rl) + 24, idx('F', 'R'), C.R, 17, 'end');
    }
    s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="4" fill="#f8fafc"/>';
    return s + '</svg>';
}

// Mehrere Pfeile an einer Kiste auf der Rampe: Welcher ist F_N?
function pfeilWahlSvg(map) {
    const a = 28, ar = rad(a), base = 260, x0 = 60, L = 380;
    const ux = Math.cos(ar), uy = -Math.sin(ar), nx = -Math.sin(ar), ny = -Math.cos(ar);
    const sx = x0 + 0.5 * L * ux, sy = base + 0.5 * L * uy, cx = sx + nx * 20, cy = sy + ny * 20;
    const topX = x0 + L * ux, topY = base + L * uy;
    const dirs = {
        senk: [-nx, -ny], lot: [0, 1], hang: [-ux, -uy], waag: [1, 0]
    };
    let s = '<svg viewBox="0 0 540 300" role="img" aria-label="Kiste auf einer Rampe mit vier Pfeilen A bis D">' + ARR;
    s += '<polygon points="' + x0 + ',' + base + ' ' + topX.toFixed(1) + ',' + topY.toFixed(1) + ' ' + topX.toFixed(1) + ',' + base + '" fill="#3b2a0a" stroke="#f59e0b" stroke-width="2"/>';
    s += '<g transform="translate(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ') rotate(' + (-a) + ')"><rect x="-32" y="-20" width="64" height="40" rx="4" fill="#1e3a5f" stroke="#38bdf8" stroke-width="2"/></g>';
    const cols = ['#f87171', '#4ade80', '#fbbf24', '#c084fc'];
    map.forEach((d, k) => {
        const v = dirs[d], l = 85;
        const ex = cx + v[0] * l, ey = cy + v[1] * l;
        s += pf(cx, cy, ex, ey, cols[k], 4) + tx(ex + v[0] * 16 + (v[0] === 0 ? 14 : 0), ey + v[1] * 16 + 6, 'ABCD'[k], cols[k], 18);
    });
    return s + '</svg>';
}

// =====================================================================
// Animationen (predict)
// =====================================================================
function moveG(el, cls, x, y, rot) { const g = el.querySelector('.' + cls); if (g) g.setAttribute('transform', 'translate(' + x + ',' + y + ')' + (rot !== undefined ? ' rotate(' + rot + ')' : '')); }
function setTxt(el, cls, s) { const g = el.querySelector('.' + cls); if (g) g.textContent = s; }

const SIMS = {
    // Kiste wird mit langsam steigender Kraft gezogen: Kraftmesser-Verlauf
    zugkraft(el, done) {
        const gx0 = 290, gy0 = 200, gw = 230, gh = 150, Fh = 0.92, Fg = 0.62, tp = 0.45;
        const F = p => p < tp ? Fh * p / tp : Fg;
        el.innerHTML = '<svg viewBox="0 0 540 250" role="img" aria-label="Animation: Eine Kiste wird mit einem Kraftmesser gezogen. Daneben der Verlauf der Kraft.">' + ARR +
            '<line x1="10" y1="140" x2="270" y2="140" stroke="#64748b" stroke-width="2"/>' +
            '<g class="kiste" transform="translate(40,0)"><rect x="0" y="90" width="70" height="50" rx="4" fill="#3b2a0a" stroke="#f59e0b" stroke-width="2"/>' +
            '<line x1="70" y1="115" x2="110" y2="115" stroke="#e2e8f0" stroke-width="2"/>' +
            '<rect x="110" y="106" width="56" height="18" rx="4" fill="#0f172a" stroke="#4ade80" stroke-width="2"/>' +
            '<line class="zeiger" x1="116" y1="115" x2="130" y2="115" stroke="#4ade80" stroke-width="4"/>' +
            '<line x1="166" y1="115" x2="196" y2="115" stroke="#e2e8f0" stroke-width="2"/></g>' +
            '<text x="140" y="180" fill="#cbd5e1" font-size="14" text-anchor="middle" ' + SF + '>Kraftmesser</text>' +
            '<line x1="' + gx0 + '" y1="' + gy0 + '" x2="' + (gx0 + gw + 10) + '" y2="' + gy0 + '" stroke="#94a3b8" stroke-width="2"/>' +
            '<line x1="' + gx0 + '" y1="' + gy0 + '" x2="' + gx0 + '" y2="' + (gy0 - gh - 15) + '" stroke="#94a3b8" stroke-width="2"/>' +
            '<text x="' + (gx0 + gw + 10) + '" y="' + (gy0 + 18) + '" fill="#cbd5e1" font-size="14" text-anchor="end" ' + SF + '>Zeit</text>' +
            '<text x="' + (gx0 + 8) + '" y="' + (gy0 - gh - 2) + '" fill="#cbd5e1" font-size="14" ' + SF + '>Zugkraft</text>' +
            '<polyline class="kurve" points="" fill="none" stroke="#4ade80" stroke-width="3.5" stroke-linejoin="round"/>' +
            '<text class="msg" x="270" y="240" fill="#4ade80" font-size="15" font-weight="bold" text-anchor="middle" ' + SF + '></text></svg>';
        let pts = [];
        animate(3200, p => {
            pts.push((gx0 + p * gw).toFixed(1) + ',' + (gy0 - F(p) * gh).toFixed(1));
            el.querySelector('.kurve').setAttribute('points', pts.join(' '));
            const z = el.querySelector('.zeiger'); if (z) z.setAttribute('x2', (116 + 44 * F(p)).toFixed(1));
            moveG(el, 'kiste', 40 + (p > tp ? (p - tp) * 110 : 0), 0);
            if (p > tp) setTxt(el, 'msg', 'Die Kiste rutscht los. Danach reicht eine kleinere Kraft.');
        }, done);
    },
    // Rennwagen in der Kurve fährt auf eine Ölspur
    kurve(el, done) {
        const cx = 270, cy = 260, R = 190, phiOil = 125;
        const P = phi => [cx + R * Math.cos(rad(phi)), cy - R * Math.sin(rad(phi))];
        const o = P(phiOil);
        el.innerHTML = '<svg viewBox="0 0 540 290" role="img" aria-label="Animation: Ein Rennwagen fährt durch eine Rechtskurve auf eine Ölspur">' + ARR +
            '<path d="M' + P(175).map(v => v.toFixed(1)).join(',') + ' A' + (R + 22) + ',' + (R + 22) + ' 0 0 1 ' + P(5).map(v => v.toFixed(1)).join(',') + '" fill="none" stroke="#1e293b" stroke-width="0"/>' +
            '<path d="M' + (cx - R - 22) + ',' + cy + ' A' + (R + 22) + ',' + (R + 22) + ' 0 0 1 ' + (cx + R + 22) + ',' + cy + '" fill="none" stroke="#64748b" stroke-width="2"/>' +
            '<path d="M' + (cx - R + 22) + ',' + cy + ' A' + (R - 22) + ',' + (R - 22) + ' 0 0 1 ' + (cx + R - 22) + ',' + cy + '" fill="none" stroke="#64748b" stroke-width="2"/>' +
            '<ellipse cx="' + o[0].toFixed(1) + '" cy="' + o[1].toFixed(1) + '" rx="26" ry="12" fill="#0b0b0b" stroke="#475569" transform="rotate(' + (90 - phiOil) + ' ' + o[0].toFixed(1) + ' ' + o[1].toFixed(1) + ')"/>' +
            '<text x="' + (o[0] - 34).toFixed(1) + '" y="' + (o[1] + 34).toFixed(1) + '" fill="#94a3b8" font-size="13" text-anchor="middle" ' + SF + '>Ölspur</text>' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#f472b6"/><text x="' + cx + '" y="' + (cy - 10) + '" fill="#f472b6" font-size="13" text-anchor="middle" ' + SF + '>Kurvenmitte</text>' +
            '<polyline class="spur" points="" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 4"/>' +
            '<g class="car"><rect x="-16" y="-8" width="32" height="16" rx="5" fill="#f59e0b"/><rect x="4" y="-6" width="8" height="12" rx="2" fill="#0f172a"/></g>' +
            '<text class="msg" x="270" y="284" fill="#4ade80" font-size="15" font-weight="bold" text-anchor="middle" ' + SF + '></text></svg>';
        const phi0 = 172, pts = [];
        // Tangente am Ölpunkt (Fahrtrichtung im Uhrzeigersinn)
        const tdx = Math.sin(rad(phiOil)), tdy = Math.cos(rad(phiOil));
        animate(3000, p => {
            let x, y, rot;
            const q = p / 0.55;
            if (q <= 1) {
                const phi = phi0 + (phiOil - phi0) * q;
                [x, y] = P(phi); rot = 90 - phi;                 // Fahrtrichtung im Uhrzeigersinn
            } else {
                const d = (p - 0.55) / 0.45 * 210;
                x = o[0] + tdx * d; y = o[1] + tdy * d; rot = 90 - phiOil;
            }
            pts.push(x.toFixed(1) + ',' + y.toFixed(1));
            el.querySelector('.spur').setAttribute('points', pts.join(' '));
            moveG(el, 'car', x, y, rot);
            if (q > 1) setTxt(el, 'msg', 'Ohne Reibung fährt der Wagen tangential geradeaus weiter.');
        }, done);
    }
};

// =====================================================================
// Labor: schiefe Ebene
// =====================================================================
function labView(s) { return rampSvg({ a: s.a, m: s.m, k: 0.9 }); }
function labOut(s) {
    const FG = s.m * g0, FN = FG * cosD(s.a), FH = FG * sinD(s.a);
    return '<span style="color:' + C.G + '">F<sub>G</sub> = ' + de(FG, 1) + ' N</span> &nbsp; · &nbsp; ' +
           '<span style="color:' + C.N + '">F<sub>N</sub> = ' + de(FN, 1) + ' N</span> &nbsp; · &nbsp; ' +
           '<span style="color:' + C.H + '">F<sub>H</sub> = ' + de(FH, 1) + ' N</span>';
}

// =====================================================================
const TASKS = {
// ---------------------------------------------------------------- Modul 1
1: [
    function () {
        const all = [
            ['Ein Auto parkt am Hang und rollt nicht weg (Handbremse angezogen).', 'Haftreibung'],
            ['Ein Schrank wird über den Boden geschoben.', 'Gleitreibung'],
            ['Ein Fahrrad rollt auf der Straße.', 'Rollreibung'],
            ['Ein Buch liegt auf einem schrägen Pult und rutscht nicht.', 'Haftreibung'],
            ['Ein Schlitten gleitet den Hang hinunter.', 'Gleitreibung'],
            ['Die Kugeln in einem Kugellager drehen sich.', 'Rollreibung'],
            ['Ein Nagel hält fest in einem Holzbrett.', 'Haftreibung'],
            ['Ein Reifen blockiert bei einer Vollbremsung und rutscht.', 'Gleitreibung'],
            ['Ein Zug fährt auf den Schienen.', 'Rollreibung'],
            ['Eine Bremsbacke schleift an der Bremsscheibe.', 'Gleitreibung']
        ].map(x => ({ left: x[0], answer: x[1] }));
        let sel;
        do { sel = pickN(all, 4); } while (new Set(sel.map(x => x.answer)).size < 3);
        return {
            type: 'match', q: 'Welche Reibungsart liegt vor?',
            options: ['Haftreibung', 'Gleitreibung', 'Rollreibung'], items: sel,
            hint: 'Haftreibung: Der Körper ruht. Gleitreibung: Der Körper rutscht. Rollreibung: Der Körper rollt.',
            explanation: 'Ruht der Körper, wirkt <strong>Haftreibung</strong>. Rutscht er, wirkt <strong>Gleitreibung</strong>. Rollt er, wirkt <strong>Rollreibung</strong>.'
        };
    },
    {
        type: 'predict', sim: 'zugkraft', shuffle: true,
        q: 'Eine schwere Kiste steht auf dem Boden. Sie ziehen mit einem Kraftmesser und erhöhen die Kraft langsam. Wie verläuft die angezeigte Kraft?',
        options: ['Die Kraft steigt, bis die Kiste losrutscht. Danach fällt sie auf einen kleineren Wert.',
                  'Die Kraft steigt, bis die Kiste losrutscht. Danach bleibt sie genauso groß.',
                  'Die Kraft steigt immer weiter, auch wenn die Kiste schon rutscht.',
                  'Die Kraft ist von Anfang an konstant.'],
        correct: 0,
        reveal: 'Zum Losreißen braucht man die größte Kraft. Rutscht die Kiste, genügt eine kleinere Kraft.',
        follow: {
            q: 'Warum braucht man beim Rutschen weniger Kraft als beim Losreißen?',
            options: ['Die Haftreibung ist größer als die Gleitreibung: μ<sub>H</sub> > μ<sub>G</sub>.',
                      'Die Kiste wird beim Rutschen leichter.',
                      'Beim Rutschen wirkt keine Reibung mehr.',
                      'Die Normalkraft wird beim Rutschen größer.'],
            correct: 0,
            wrongHints: { 'Die Kiste wird beim Rutschen leichter.': 'Die Masse und die Gewichtskraft ändern sich nicht.',
                          'Beim Rutschen wirkt keine Reibung mehr.': 'Dann würde die Kiste immer schneller werden. Es wirkt die Gleitreibung.' }
        },
        hint: 'Vergleichen Sie Haftreibungszahl und Gleitreibungszahl.',
        explanation: 'Ruht die Kiste, verhaken sich die Unebenheiten stärker. Die <strong>Haftreibung</strong> ist deshalb größer als die <strong>Gleitreibung</strong>. Das sieht man auch an den Reibungszahlen: μ<sub>H</sub> > μ<sub>G</sub>.'
    },
    function () {
        const all = [
            ['Die Bremse eines Fahrrads', 'nützlich'], ['Die Reifen eines Autos auf der Straße', 'nützlich'],
            ['Die Schuhsohle beim Gehen', 'nützlich'], ['Eine Schraube hält zwei Bauteile zusammen', 'nützlich'],
            ['Ein Streichholz wird angezündet', 'nützlich'], ['Die Kupplung im Auto überträgt die Kraft', 'nützlich'],
            ['Verschleiß in einem Gleitlager', 'störend'], ['Der Kolben reibt an der Zylinderwand im Motor', 'störend'],
            ['Eine trockene, quietschende Fahrradkette', 'störend'], ['Eine schwere Schublade klemmt', 'störend'],
            ['Wärme in einem Getriebe', 'störend']
        ].map(x => ({ left: x[0], answer: x[1] }));
        let sel;
        do { sel = pickN(all, 5); } while (sel.every(x => x.answer === sel[0].answer));
        return {
            type: 'match', q: 'Ist die Reibung hier nützlich oder störend?', options: ['nützlich', 'störend'], items: sel,
            hint: 'Fragen Sie sich: Würde es ohne Reibung besser oder schlechter funktionieren?',
            explanation: 'Reibung ist <strong>nützlich</strong>, wenn sie etwas festhält, bremst oder Kraft überträgt. Sie ist <strong>störend</strong>, wenn sie Energie in Wärme umwandelt und Bauteile verschleißt.'
        };
    },
    richtigFalsch([
        { left: 'Reibung entsteht, weil sich die Unebenheiten der Oberflächen ineinander verhaken.', answer: 'richtig' },
        { left: 'Die Reibungskraft wirkt immer entgegen der Bewegung (oder der geplanten Bewegung).', answer: 'richtig' },
        { left: 'Die Haftreibung ist meist größer als die Gleitreibung.', answer: 'richtig' },
        { left: 'Die Rollreibung ist meist größer als die Gleitreibung.', answer: 'falsch' },
        { left: 'Reibung ist immer unerwünscht.', answer: 'falsch' },
        { left: 'Auch sehr glatte, polierte Flächen haben noch Reibung.', answer: 'richtig' },
        { left: 'Ohne Reibung könnten wir nicht gehen.', answer: 'richtig' },
        { left: 'Auf eine ruhende Kiste wirkt immer die größtmögliche Haftreibungskraft, auch wenn niemand zieht.', answer: 'falsch' }
    ], 5, 'Reibung entsteht durch verhakte Unebenheiten. Sie wirkt gegen die Bewegung. Es gilt meist: Haftreibung > Gleitreibung > Rollreibung. Die Haftreibung ist nur so groß, wie nötig: Zieht niemand, ist sie null.'),
    {
        type: 'text', level: 'Kreativ',
        q: 'Stellen Sie sich vor: Ab morgen gibt es auf der Erde keine Reibung mehr. Beschreiben Sie mindestens drei Folgen für Ihren Alltag.',
        model: 'Man könnte nicht mehr gehen. Die Füße würden einfach wegrutschen. Autos könnten weder anfahren noch bremsen noch lenken, die Räder würden durchdrehen. Schrauben und Nägel würden nicht mehr halten, Möbel würden zusammenfallen. Knoten würden aufgehen. Gegenstände würden bei der kleinsten Neigung vom Tisch rutschen. Vorteil: In Motoren und Lagern gäbe es keinen Verschleiß mehr.',
        checklist: ['Gehen oder Stehen wird unmöglich', 'Fahrzeuge können nicht anfahren, bremsen oder lenken', 'Verbindungen (Schrauben, Nägel, Knoten) halten nicht mehr', 'Gegenstände rutschen weg', 'Auch einen Vorteil genannt (kein Verschleiß)'],
        explanation: 'Vergleichen Sie Ihre Antwort mit der Musterlösung und haken Sie ab, was Sie schon drin haben.',
        hint: ''
    }
],
// ---------------------------------------------------------------- Modul 2
2: [
    function () {
        const map = shuffle(['senk', 'lot', 'hang', 'waag']);
        return {
            type: 'mc', svg: pfeilWahlSvg(map),
            q: 'Eine Kiste steht auf einer Rampe. Welcher Pfeil zeigt die Richtung der Normalkraft F<sub>N</sub>?',
            options: ['Pfeil A', 'Pfeil B', 'Pfeil C', 'Pfeil D'], correct: map.indexOf('senk'),
            wrongHints: {},
            hint: 'Die Normalkraft steht immer <strong>senkrecht zur Oberfläche</strong>, auf der der Körper liegt. Nicht senkrecht zum Boden!',
            explanation: 'Die Normalkraft steht <strong>senkrecht zur Auflagefläche</strong>. Auf der Rampe ist sie deshalb schräg. Der senkrechte Pfeil nach unten ist die Gewichtskraft. Der Pfeil entlang der Rampe ist die Hangabtriebskraft.'
        };
    },
    function () {
        const first = erstesMal('fn');
        const m1 = first ? 45 : rnd([25, 32, 45, 60, 78]);
        const mt = first ? 1.4 : rnd([0.6, 0.85, 1.4, 2.2]);
        const mp = first ? 72 : rint(55, 95), mr = first ? 18 : rint(8, 25);
        const fields = shuffle([
            { label: 'Werkzeugkiste: m = ' + m1 + ' kg', unit: 'N', ans: T(m1 * g0), tol: relTol(m1 * g0, 0.005),
              errors: [{ v: T(m1), msg: 'Die Masse ist keine Kraft. Rechnen Sie F_N = F_G = m · g.' }] },
            { label: 'Maschinenbett: m = ' + de(mt) + ' t', unit: 'N', ans: T(mt * 1000 * g0), tol: relTol(mt * 1000 * g0, 0.005),
              errors: [{ v: T(mt * g0), msg: 'Tonnen in kg umrechnen: 1 t = 1000 kg.', tol: relTol(mt * g0, 0.01) }] },
            { label: 'Person (' + mp + ' kg) trägt einen Rucksack (' + mr + ' kg)', unit: 'N', ans: T((mp + mr) * g0), tol: relTol((mp + mr) * g0, 0.005),
              errors: [{ v: T(mp * g0), msg: 'Der Rucksack drückt auch auf den Boden. Addieren Sie die Massen.', tol: relTol(mp * g0, 0.01) }] }
        ]);
        return {
            type: 'num', q: 'Die Körper stehen auf ebenem Boden. Berechnen Sie jeweils die Normalkraft F<sub>N</sub> (g = 9,81 m/s²).',
            fields, hint: 'Auf ebenem Boden gilt F<sub>N</sub> = F<sub>G</sub> = m · g. Masse immer in kg einsetzen.',
            explanation: 'Auf ebenem Boden ist die Normalkraft gleich der Gewichtskraft: F<sub>N</sub> = m · g. ' +
                m1 + ' kg → ' + de(m1 * g0, 1) + ' N; ' + de(mt) + ' t = ' + de(mt * 1000) + ' kg → ' + de(mt * 1000 * g0, 0) + ' N; ' + (mp + mr) + ' kg → ' + de((mp + mr) * g0, 1) + ' N.'
        };
    },
    function () {
        const all = [
            ['Eine Kiste steht auf ebenem Boden.', 'gleich F_G'],
            ['Eine Person setzt sich auf die Kiste.', 'größer als F_G'],
            ['Ein Kind drückt von oben auf die Kiste.', 'größer als F_G'],
            ['Die Kiste wird an einem Seil schräg nach oben gezogen.', 'kleiner als F_G'],
            ['Die Kiste steht auf einer schrägen Rampe.', 'kleiner als F_G'],
            ['Ein Formel-1-Wagen fährt schnell, die Flügel drücken ihn auf die Straße.', 'größer als F_G'],
            ['Ein Flugzeug rollt schnell über die Startbahn, die Flügel erzeugen Auftrieb.', 'kleiner als F_G'],
            ['Ein Paket liegt still auf einem waagerechten Förderband.', 'gleich F_G']
        ].map(x => ({ left: x[0], answer: x[1] }));
        let sel;
        do { sel = pickN(all, 4); } while (new Set(sel.map(x => x.answer)).size < 3);
        return {
            type: 'match', level: 'Begründen',
            q: 'Vergleichen Sie: Ist die Normalkraft hier gleich, größer oder kleiner als die Gewichtskraft F<sub>G</sub> des Körpers?',
            options: ['gleich F_G', 'größer als F_G', 'kleiner als F_G'], items: sel,
            hint: 'Fragen Sie: Drückt etwas zusätzlich auf die Fläche? Zieht etwas nach oben? Ist die Fläche schräg?',
            explanation: 'Nur auf ebenem Boden ohne weitere Kräfte gilt F<sub>N</sub> = F<sub>G</sub>. Drückt etwas zusätzlich nach unten (Person, Abtrieb), wird F<sub>N</sub> größer. Zieht etwas nach oben (Seil, Auftrieb) oder ist die Fläche schräg, wird F<sub>N</sub> kleiner.'
        };
    },
    function () {
        const first = erstesMal('abtrieb');
        const m = first ? 790 : rnd([780, 790, 800, 810]);
        const FA = first ? 12 : rnd([6, 9, 12, 15, 18]);
        const FG = m * g0, FN = FG + FA * 1000;
        return {
            type: 'num', q: 'Ein Formel-1-Wagen (m = ' + m + ' kg, mit Fahrer) fährt schnell geradeaus. Die Flügel erzeugen eine Abtriebskraft von F<sub>Ab</sub> = ' + FA + ' kN. Sie drückt den Wagen auf die Straße.',
            fields: [
                { label: 'Gewichtskraft F<sub>G</sub>', unit: 'N', ans: T(FG), tol: relTol(FG, 0.005) },
                { label: 'Normalkraft F<sub>N</sub>', unit: 'N', ans: T(FN), tol: relTol(FN, 0.005),
                  errors: [{ v: T(FG), msg: 'Die Abtriebskraft drückt zusätzlich auf die Straße. Addieren Sie sie.' },
                           { v: T(FG + FA), msg: 'kN in N umrechnen: 1 kN = 1000 N.', tol: 2000 }] }
            ],
            hint: 'F<sub>N</sub> = F<sub>G</sub> + F<sub>Ab</sub>. Achten Sie auf die Einheit kN.',
            explanation: 'F<sub>G</sub> = ' + m + ' kg · 9,81 m/s² = ' + de(FG, 1) + ' N. F<sub>N</sub> = ' + de(FG, 1) + ' N + ' + de(FA * 1000) + ' N = <strong>' + de(FN, 1) + ' N</strong>. Der Abtrieb macht die Normalkraft viel größer als die Gewichtskraft.'
        };
    },
    debateTask({
        q: 'Zwei Mitschüler diskutieren über die Normalkraft.',
        people: [['Jana', 'Die Normalkraft ist nur ein anderes Wort für die Gewichtskraft. Beide sind immer gleich groß.'],
                 ['Deniz', 'Die Normalkraft kann größer oder kleiner sein als die Gewichtskraft. Das hängt von der Lage und den anderen Kräften ab.']],
        winner: 'Deniz',
        whoErrors: [{ v: 'Jana', msg: 'Denken Sie an die Rampe oder an den Formel-1-Wagen mit Flügeln.' }],
        reasons: [['Die Normalkraft steht senkrecht zur Fläche. Auf einer Schräge oder mit zusätzlichen Kräften ist sie nicht gleich F_G.'],
                  ['Die Normalkraft wirkt immer senkrecht nach unten, genau wie die Gewichtskraft.', 'Die Normalkraft steht senkrecht zur Fläche, nicht zum Erdboden.'],
                  ['Die Gewichtskraft ändert sich je nach Untergrund.', 'Die Gewichtskraft ist m · g. Sie hängt nicht vom Untergrund ab.'],
                  ['Die Normalkraft ist immer doppelt so groß wie die Gewichtskraft.']],
        hint: 'Gilt F<sub>N</sub> = F<sub>G</sub> auch auf einer schrägen Rampe?',
        explanation: 'Deniz hat recht. F<sub>N</sub> = F<sub>G</sub> gilt nur auf ebenem Boden ohne weitere Kräfte. Auf der Schräge ist F<sub>N</sub> kleiner. Mit Abtrieb oder Zusatzlast ist sie größer.'
    })
],
// ---------------------------------------------------------------- Modul 3
3: [
    function () {
        const first = erstesMal('fr');
        const mu1 = first ? 0.3 : rnd([0.15, 0.25, 0.3, 0.4, 0.6]), FN1 = first ? 800 : rnd([400, 650, 800, 1200, 2500]);
        const mu2 = first ? 0.12 : rnd([0.05, 0.1, 0.12, 0.2]), m2 = first ? 35 : rnd([18, 24, 35, 50, 65]);
        const FR3 = first ? 270 : rnd([120, 180, 270, 336]), FN3 = first ? 600 : rnd([400, 600, 800, 960]);
        const f = [
            { label: 'Gegeben: μ = ' + de(mu1) + ', F<sub>N</sub> = ' + de(FN1) + ' N. Gesucht: F<sub>R</sub>', unit: 'N', ans: T(mu1 * FN1), tol: relTol(mu1 * FN1, 0.005),
              errors: [{ v: T(FN1 / mu1), msg: 'F_R = μ · F_N: malnehmen, nicht teilen.', tol: relTol(FN1 / mu1, 0.01) }] },
            { label: 'Gegeben: μ = ' + de(mu2) + ', m = ' + m2 + ' kg (ebener Boden). Gesucht: F<sub>R</sub>', unit: 'N', ans: T(mu2 * m2 * g0), tol: relTol(mu2 * m2 * g0, 0.01),
              errors: [{ v: T(mu2 * m2), msg: 'Zuerst die Normalkraft berechnen: F_N = m · g.', tol: relTol(mu2 * m2, 0.02) }] },
            { label: 'Gegeben: F<sub>R</sub> = ' + FR3 + ' N, F<sub>N</sub> = ' + FN3 + ' N. Gesucht: Reibungszahl μ', unit: '', ans: T(FR3 / FN3), tol: 2,
              errors: [{ v: T(FN3 / FR3), msg: 'μ = F_R / F_N. Die Reibungszahl ist hier kleiner als 1.', tol: 5 }] }
        ];
        return {
            type: 'num', q: 'Rechnen Sie mit F<sub>R</sub> = μ · F<sub>N</sub> (g = 9,81 m/s²).', fields: shuffle(f),
            hint: 'Umgestellt: μ = F<sub>R</sub> / F<sub>N</sub>. Ist nur die Masse gegeben, brauchen Sie zuerst F<sub>N</sub> = m · g.',
            explanation: 'F<sub>R</sub> = ' + de(mu1) + ' · ' + de(FN1) + ' N = ' + de(mu1 * FN1, 1) + ' N. ' +
                'F<sub>R</sub> = ' + de(mu2) + ' · ' + m2 + ' kg · 9,81 m/s² = ' + de(mu2 * m2 * g0, 1) + ' N. ' +
                'μ = ' + FR3 + ' N / ' + FN3 + ' N = ' + de(FR3 / FN3, 2) + '.'
        };
    },
    function () {
        const t = richtigFalsch([
            { left: 'Bei jeder Paarung ist die Haftreibungszahl mindestens so groß wie die Gleitreibungszahl.', answer: 'richtig' },
            { left: 'Schmieren macht die Reibungszahl kleiner.', answer: 'richtig' },
            { left: 'Ein Wälzlager hat eine viel kleinere Reibungszahl als ein geschmiertes Gleitlager (Stahl auf Stahl).', answer: 'richtig' },
            { left: 'Auf nasser Straße ist die Reibungszahl von Reifen größer als auf trockener.', answer: 'falsch' },
            { left: 'Die Reibungszahl hat die Einheit Newton.', answer: 'falsch' },
            { left: 'Ein Schlittschuh gleitet leicht, weil Stahl auf Eis eine sehr kleine Reibungszahl hat.', answer: 'richtig' },
            { left: 'Holz auf Holz hat eine größere Haftreibungszahl als Stahl auf Stahl (trocken).', answer: 'richtig' }
        ], 5, 'Es gilt: μ<sub>H</sub> ≥ μ<sub>G</sub>. Schmieren und Rollen machen μ kleiner. Nässe macht die Straße rutschiger. Die Reibungszahl hat <strong>keine Einheit</strong>.', 'Vergleichen Sie die Reibungszahlen in der Tabelle. Richtig oder falsch?')();
        t.svg = MU_TAB;
        return t;
    },
    function () {
        const first = erstesMal('fehler3');
        const m = first ? 40 : rnd([30, 40, 55, 70]), mu = first ? 0.15 : rnd([0.12, 0.15, 0.2, 0.25]);
        const FG = m * g0, FR = mu * FG;
        const art = first ? 0 : rint(0, 2);
        const L = ['Gegeben: m = ' + m + ' kg, μ<sub>H</sub> = ' + de(mu) + ' (ebener Boden)'];
        let falsch, expl;
        if (art === 0) {
            L.push('F<sub>N</sub> = F<sub>G</sub> = m · g = ' + m + ' kg · 9,81 m/s² = ' + de(FG, 1) + ' N');
            L.push('F<sub>R</sub> = μ<sub>H</sub> · m = ' + de(mu) + ' · ' + m + ' kg = ' + de(mu * m, 1) + ' N');
            L.push('Die Zugkraft muss größer als ' + de(mu * m, 1) + ' N sein.');
            falsch = 3; expl = 'In Zeile 3 steht μ · m. Richtig ist μ · F<sub>N</sub> = ' + de(mu) + ' · ' + de(FG, 1) + ' N = <strong>' + de(FR, 1) + ' N</strong>. Eine Masse ist keine Kraft.';
        } else if (art === 1) {
            L.push('F<sub>N</sub> = F<sub>G</sub> = m · g = ' + m + ' kg · 9,81 m/s² = ' + de(FG, 1) + ' N');
            L.push('F<sub>R</sub> = F<sub>N</sub> / μ<sub>H</sub> = ' + de(FG, 1) + ' N / ' + de(mu) + ' = ' + de(FG / mu, 1) + ' N');
            L.push('Die Zugkraft muss größer als ' + de(FG / mu, 1) + ' N sein.');
            falsch = 3; expl = 'In Zeile 3 wurde geteilt. Richtig ist F<sub>R</sub> = μ · F<sub>N</sub> = <strong>' + de(FR, 1) + ' N</strong>. Die Reibungskraft ist immer kleiner als F<sub>N</sub>, wenn μ < 1.';
        } else {
            L.push('F<sub>N</sub> = F<sub>G</sub> = m · g = ' + m + ' kg · 9,81 m/s² = ' + de(m * 9.81 * 10, 1) + ' N');
            L.push('F<sub>R</sub> = μ<sub>H</sub> · F<sub>N</sub> = ' + de(mu) + ' · ' + de(m * 98.1, 1) + ' N = ' + de(mu * m * 98.1, 1) + ' N');
            L.push('Die Zugkraft muss größer als ' + de(mu * m * 98.1, 1) + ' N sein.');
            falsch = 2; expl = 'In Zeile 2 ist ein Rechenfehler: ' + m + ' · 9,81 = <strong>' + de(FG, 1) + '</strong>, nicht ' + de(m * 98.1, 1) + '. Der Fehler zieht sich dann durch.';
        }
        return fehlerTask('Ein Schüler berechnet die Kraft, um einen Schraubstock (' + m + ' kg) auf der Werkbank zu verschieben. In welcher Zeile steckt der <strong>erste</strong> Fehler?', L, falsch, expl);
    },
    function () {
        const first = erstesMal('schlitten');
        const m = first ? 26 : rnd([18, 22, 26, 34, 48]), mu = first ? 0.12 : rnd([0.08, 0.1, 0.12, 0.15]);
        const FN = m * g0, FR = mu * FN;
        return {
            type: 'num', level: 'Werkstatt',
            q: 'Der Schlitten einer Werkzeugmaschine (m = ' + m + ' kg) liegt auf waagerechten, geschmierten Führungsbahnen aus Stahl. Haftreibungszahl: μ<sub>H</sub> = ' + de(mu) + '. Welchen Grenzwert muss die Zugkraft F<sub>Z</sub> überschreiten, damit sich der Schlitten bewegt?',
            fields: [
                { label: 'Normalkraft F<sub>N</sub>', unit: 'N', ans: T(FN), tol: relTol(FN, 0.005) },
                { label: 'Grenzwert der Zugkraft F<sub>Z</sub>', unit: 'N', ans: T(FR), tol: relTol(FR, 0.01),
                  errors: [{ v: T(mu * m), msg: 'Rechnen Sie mit F_N in Newton, nicht mit der Masse.', tol: relTol(mu * m, 0.02) }] }
            ],
            hint: 'Erst F<sub>N</sub> = m · g. Dann F<sub>R,H</sub> = μ<sub>H</sub> · F<sub>N</sub>. Die Zugkraft muss größer sein als die Haftreibungskraft.',
            explanation: 'F<sub>N</sub> = ' + m + ' kg · 9,81 m/s² = ' + de(FN, 1) + ' N. F<sub>R,H</sub> = ' + de(mu) + ' · ' + de(FN, 1) + ' N = ' + de(FR, 2) + ' N. Die Zugkraft muss also größer als <strong>' + de(FR, 2) + ' N</strong> sein.'
        };
    },
    debateTask({
        q: 'Eine Holzkiste hat eine große und eine kleine Seitenfläche. Zwei Mitschüler streiten.',
        people: [['Mia', 'Wenn ich die Kiste auf die kleine Seite stelle, ist die Reibung kleiner. Es liegt ja weniger Fläche auf.'],
                 ['Ben', 'Die Auflagefläche ist egal. Die Reibungskraft hängt nur von der Normalkraft und der Werkstoffpaarung ab.']],
        winner: 'Ben',
        whoErrors: [{ v: 'Mia', msg: 'In der Formel F_R = μ · F_N kommt keine Fläche vor.' }],
        reasons: [['In F_R = μ · F_N kommt keine Fläche vor. Die Normalkraft und μ bleiben gleich.'],
                  ['Auf der kleinen Fläche ist die Kiste leichter.', 'Die Masse und F_G ändern sich nicht.'],
                  ['Eine große Fläche hat immer mehr Unebenheiten, also mehr Reibung.', 'Auf der kleinen Fläche drückt die Kiste dafür stärker pro Fläche. Das gleicht sich aus.'],
                  ['Die Reibung hängt nur von der Geschwindigkeit ab.']],
        hint: 'Schauen Sie sich die Formel F<sub>R</sub> = μ · F<sub>N</sub> an. Welche Größe ändert sich beim Umdrehen der Kiste?',
        explanation: 'Ben hat recht. F<sub>R</sub> = μ · F<sub>N</sub>: Die Fläche kommt nicht vor. Auf der kleinen Fläche drückt die Kiste stärker auf jeden Quadratzentimeter. Das gleicht die kleinere Fläche aus. (Bei Reifen ist es komplizierter, weil Gummi sich verformt.)'
    }),
    function () {
        const all = [
            ['Bremsbelag auf Bremsscheibe', 'groß (etwa 0,4 bis 0,6)'],
            ['Autoreifen auf trockenem Asphalt', 'sehr groß (etwa 0,8 bis 1)'],
            ['Geschmiertes Gleitlager', 'klein (etwa 0,05)'],
            ['Kugellager', 'sehr klein (etwa 0,002)'],
            ['Schlittschuh auf Eis', 'klein (etwa 0,01)'],
            ['Zahnriemen auf Riemenscheibe', 'groß (etwa 0,4 bis 0,6)']
        ];
        const sel = pickN(all, 4).map(x => ({ left: x[0], answer: x[1] }));
        return {
            type: 'match', level: 'Begründen',
            q: 'Welche Reibungszahl passt zur Anwendung? Überlegen Sie: Soll die Reibung groß oder klein sein?',
            options: ['sehr groß (etwa 0,8 bis 1)', 'groß (etwa 0,4 bis 0,6)', 'klein (etwa 0,05)', 'klein (etwa 0,01)', 'sehr klein (etwa 0,002)'], items: sel,
            hint: 'Bremsen und Kraftübertragung brauchen große Reibung. Lager sollen leicht laufen. Rollen ist leichter als Gleiten.',
            explanation: 'Bremsen, Reifen und Riemen brauchen eine <strong>große</strong> Reibungszahl. Lager sollen leicht laufen: geschmiert klein, Wälzlager am kleinsten. Stahl auf Eis gleitet sehr leicht.'
        };
    }
],
// ---------------------------------------------------------------- Modul 4
4: [
    function () {
        const first = erstesMal('kiste');
        let m, muH, muG, FP, nH, nG;
        do {
            m = first ? 280 : rnd([180, 220, 250, 280, 320, 360]);
            const p = first ? [0.6, 0.45] : rnd([[0.6, 0.45], [0.5, 0.35], [0.55, 0.4], [0.7, 0.5]]);
            muH = p[0]; muG = p[1];
            FP = first ? 450 : rnd([400, 450, 500, 550, 600]);
            nH = muH * m * g0 / FP; nG = muG * m * g0 / FP;
        } while (!first && (nH % 1 < 0.08 || nH % 1 > 0.95 || nG % 1 < 0.08 || nG % 1 > 0.95 || Math.ceil(nH) === Math.ceil(nG)));
        const FG = m * g0, FRH = muH * FG;
        return {
            type: 'num',
            q: 'Eine Holzkiste mit Werkzeug (m = ' + m + ' kg) steht auf einem Betonboden. Reibungszahlen Holz auf Beton: μ<sub>H</sub> = ' + de(muH) + ', μ<sub>G</sub> = ' + de(muG) + '. Eine Person kann mit ' + FP + ' N ziehen. Die Kiste soll in Bewegung gesetzt werden.',
            fields: [
                { label: 'Normalkraft F<sub>N</sub>', unit: 'N', ans: T(FG), tol: relTol(FG, 0.005) },
                { label: 'Haftreibungskraft F<sub>R,H</sub>', unit: 'N', ans: T(FRH), tol: relTol(FRH, 0.01),
                  errors: [{ v: T(muG * FG), msg: 'Zum Anziehen brauchen Sie die Haftreibung μ_H, nicht die Gleitreibung.', tol: relTol(muG * FG, 0.01) }] },
                { label: 'Anzahl der Personen zum Anziehen', unit: 'Personen', small: true, ans: T(Math.ceil(nH)),
                  errors: [{ v: T(Math.floor(nH)), msg: 'Mit dieser Zahl reicht die Kraft noch nicht. Immer aufrunden!' }] }
            ],
            hint: 'F<sub>N</sub> = m · g. F<sub>R,H</sub> = μ<sub>H</sub> · F<sub>N</sub>. Anzahl = F<sub>R,H</sub> / Kraft einer Person, dann aufrunden.',
            explanation: 'F<sub>N</sub> = ' + m + ' kg · 9,81 m/s² = ' + de(FG, 1) + ' N. F<sub>R,H</sub> = ' + de(muH) + ' · ' + de(FG, 1) + ' N = ' + de(FRH, 1) + ' N. ' +
                de(FRH, 1) + ' N / ' + FP + ' N = ' + de(nH, 2) + ' → aufgerundet <strong>' + Math.ceil(nH) + ' Personen</strong>.',
            _m: m, _muG: muG, _FP: FP
        };
    },
    function () {
        const first = erstesMal('kiste2');
        let m, muG, FP, n;
        do {
            m = first ? 280 : rnd([180, 220, 250, 280, 320, 360]);
            muG = first ? 0.45 : rnd([0.35, 0.4, 0.45, 0.5]);
            FP = first ? 450 : rnd([400, 450, 500, 550, 600]);
            n = muG * m * g0 / FP;
        } while (!first && (n % 1 < 0.08 || n % 1 > 0.95));
        const FRG = muG * m * g0;
        return {
            type: 'num',
            q: 'Die Holzkiste (m = ' + m + ' kg) rutscht jetzt über den Betonboden. Gleitreibungszahl: μ<sub>G</sub> = ' + de(muG) + '. Eine Person zieht mit ' + FP + ' N. Welche Kraft ist nötig, um die Kiste in Bewegung zu <strong>halten</strong>? Wie viele Personen braucht man dafür?',
            fields: [
                { label: 'Gleitreibungskraft F<sub>R,G</sub>', unit: 'N', ans: T(FRG), tol: relTol(FRG, 0.01),
                  errors: [{ v: T(muG * m), msg: 'Rechnen Sie zuerst F_N = m · g.', tol: relTol(muG * m, 0.02) }] },
                { label: 'Anzahl der Personen', unit: 'Personen', small: true, ans: T(Math.ceil(n)),
                  errors: [{ v: T(Math.floor(n)), msg: 'Mit dieser Zahl reicht die Kraft nicht. Aufrunden!' }] }
            ],
            hint: 'F<sub>R,G</sub> = μ<sub>G</sub> · m · g. Dann durch die Kraft einer Person teilen und aufrunden.',
            explanation: 'F<sub>R,G</sub> = ' + de(muG) + ' · ' + m + ' kg · 9,81 m/s² = ' + de(FRG, 1) + ' N. ' + de(FRG, 1) + ' N / ' + FP + ' N = ' + de(n, 2) + ' → <strong>' + Math.ceil(n) + ' Personen</strong>. Zum Weiterziehen braucht man weniger Kraft als zum Anziehen.'
        };
    },
    {
        type: 'order', q: 'Wie berechnet man, wie viele Personen eine Kiste auf ebenem Boden in Bewegung setzen können? Bringen Sie die Schritte in die richtige Reihenfolge.',
        top: 'zuerst', bottom: 'zuletzt',
        steps: ['Masse in kg umrechnen (falls nötig)', 'Gewichtskraft berechnen: F<sub>G</sub> = m · g', 'Normalkraft bestimmen: auf ebenem Boden F<sub>N</sub> = F<sub>G</sub>',
                'Haftreibungskraft berechnen: F<sub>R,H</sub> = μ<sub>H</sub> · F<sub>N</sub>', 'F<sub>R,H</sub> durch die Kraft einer Person teilen', 'Ergebnis aufrunden'],
        hint: 'Sie brauchen zuerst eine Kraft in Newton, bevor Sie μ einsetzen können.',
        explanation: 'Masse → Gewichtskraft → Normalkraft → Haftreibungskraft → teilen → aufrunden.'
    },
    debateTask({
        q: 'Die Kiste rutscht endlich. Zwei Helfer diskutieren, ob jemand loslassen darf.',
        people: [['Lukas', 'Wir müssen alle weiterziehen. Zum Weiterziehen braucht man genauso viel Kraft wie zum Anziehen.'],
                 ['Emma', 'Jetzt reichen weniger Leute. Sobald die Kiste rutscht, ist die Reibung kleiner.']],
        winner: 'Emma',
        whoErrors: [{ v: 'Lukas', msg: 'Vergleichen Sie μ_H und μ_G.' }],
        reasons: [['Die Gleitreibungszahl ist kleiner als die Haftreibungszahl. Also ist die Gleitreibungskraft kleiner.'],
                  ['Die Kiste wird beim Rutschen leichter.', 'Die Masse ändert sich nicht.'],
                  ['Eine rutschende Kiste braucht gar keine Kraft mehr.', 'Ohne Kraft bremst die Gleitreibung die Kiste ab.'],
                  ['Die Normalkraft wird beim Rutschen kleiner.', 'F_N bleibt gleich. Es ändert sich die Reibungszahl.']],
        hint: 'Welche Reibungszahl gilt, wenn die Kiste ruht? Welche, wenn sie rutscht?',
        explanation: 'Emma hat recht. Beim Rutschen gilt μ<sub>G</sub> < μ<sub>H</sub>. Die Gleitreibungskraft ist kleiner. Aber Achtung: Ganz loslassen geht nicht, sonst bremst die Gleitreibung die Kiste ab.'
    }),
    {
        type: 'text', level: 'In eigenen Worten',
        q: 'Sie sollen eine schwere Maschine allein ein Stück verschieben. Nennen Sie zwei Möglichkeiten, die nötige Kraft zu verkleinern. Begründen Sie mit F<sub>R</sub> = μ · F<sub>N</sub>.',
        model: 'Erstens: Rollen oder Rohre unterlegen. Dann wirkt Rollreibung statt Gleitreibung. Die Reibungszahl μ wird viel kleiner. Zweitens: Die Maschine leichter machen, zum Beispiel Werkzeuge herausnehmen. Dann wird die Normalkraft F<sub>N</sub> kleiner. Drittens: Die Auflage schmieren oder auf glatte Bleche stellen. Auch das verkleinert μ.',
        checklist: ['Eine Möglichkeit, die μ verkleinert (Rollen, schmieren, glatte Unterlage)', 'Eine Möglichkeit, die F_N verkleinert (leichter machen)', 'Mit der Formel F_R = μ · F_N begründet'],
        explanation: 'Vergleichen Sie Ihre Antwort mit der Musterlösung und haken Sie ab, was Sie schon drin haben.',
        hint: ''
    }
],
// ---------------------------------------------------------------- Modul 5
5: [
    function () {
        const first = erstesMal('fc');
        const m = first ? 790 : rnd([780, 790, 800, 810]);
        const v = first ? 65 : rnd([50, 55, 60, 65, 70, 75]);
        const r = first ? 60 : rnd([45, 60, 75, 90, 110, 130]);
        const kmh = v * 3.6, FC = m * v * v / r;
        return {
            type: 'num',
            q: 'Ein Formel-1-Wagen (m = ' + m + ' kg) fährt mit ' + de(kmh) + ' km/h durch eine Kurve mit dem Radius r = ' + r + ' m. Berechnen Sie die Zentripetalkraft.',
            fields: [
                { label: 'Geschwindigkeit v', unit: 'm/s', ans: T(v), tol: 50,
                  errors: [{ v: T(kmh * 3.6), msg: 'Von km/h nach m/s wird durch 3,6 geteilt, nicht malgenommen.', tol: relTol(kmh * 3.6, 0.01) }] },
                { label: 'Zentripetalkraft F<sub>C</sub>', unit: 'N', ans: T(FC), tol: relTol(FC, 0.01),
                  errors: [{ v: T(m * kmh * kmh / r), msg: 'Setzen Sie v in m/s ein, nicht in km/h.', tol: relTol(m * kmh * kmh / r, 0.01) },
                           { v: T(m * v / r), msg: 'Die Geschwindigkeit wird quadriert: v².', tol: relTol(m * v / r, 0.01) }] }
            ],
            hint: 'v in m/s = v in km/h / 3,6. Dann F<sub>C</sub> = m · v² / r.',
            explanation: 'v = ' + de(kmh) + ' km/h / 3,6 = ' + v + ' m/s. F<sub>C</sub> = ' + m + ' kg · (' + v + ' m/s)² / ' + r + ' m = <strong>' + de(FC, 0) + ' N</strong> ≈ ' + de(FC / 1000, 1) + ' kN.'
        };
    },
    function () {
        const first = erstesMal('fn5');
        const m = first ? 790 : rnd([780, 790, 800, 810]);
        const FCk = first ? 56 : rnd([42, 48, 56, 63, 70]);
        const mu = first ? 0.9 : rnd([0.8, 0.85, 0.9, 1.0]);
        const FN = FCk * 1000 / mu, FG = m * g0, FA = FN - FG;
        return {
            type: 'num', level: 'Anwendung',
            q: 'Ein Formel-1-Wagen (m = ' + m + ' kg) braucht in einer Kurve die Zentripetalkraft F<sub>C</sub> = ' + FCk + ' kN. Diese Kraft muss die Haftreibung zwischen Reifen und Asphalt liefern (μ<sub>H</sub> = ' + de(mu) + '). Wie groß muss die Normalkraft sein? Welcher Teil davon muss durch Abtrieb entstehen?',
            fields: [
                { label: 'nötige Normalkraft F<sub>N</sub>', unit: 'N', ans: T(FN), tol: relTol(FN, 0.01),
                  errors: [{ v: T(FCk * 1000 * mu), msg: 'Aus F_R = μ · F_N folgt F_N = F_R / μ. Teilen, nicht malnehmen.', tol: relTol(FCk * 1000 * mu, 0.01) }] },
                { label: 'Gewichtskraft F<sub>G</sub>', unit: 'N', ans: T(FG), tol: relTol(FG, 0.005) },
                { label: 'nötige Abtriebskraft F<sub>Ab</sub>', unit: 'N', ans: T(FA), tol: relTol(FA, 0.015),
                  errors: [{ v: T(FN), msg: 'Ein Teil der Normalkraft kommt schon von der Gewichtskraft. Ziehen Sie F_G ab.', tol: relTol(FN, 0.01) }] }
            ],
            hint: 'Reibungskraft = Zentripetalkraft. F<sub>N</sub> = F<sub>C</sub> / μ<sub>H</sub>. Dann F<sub>Ab</sub> = F<sub>N</sub> − F<sub>G</sub>.',
            explanation: 'F<sub>N</sub> = ' + de(FCk * 1000) + ' N / ' + de(mu) + ' = ' + de(FN, 0) + ' N. F<sub>G</sub> = ' + de(FG, 1) + ' N. F<sub>Ab</sub> = ' + de(FN, 0) + ' N − ' + de(FG, 1) + ' N = <strong>' + de(FA, 0) + ' N</strong>. Die Gewichtskraft allein reicht bei weitem nicht. Den Großteil müssen die Flügel liefern.'
        };
    },
    {
        type: 'predict', sim: 'kurve', shuffle: true,
        q: 'Ein Rennwagen fährt durch eine Kurve. Plötzlich fährt er auf eine Ölspur. Die Reifen haben keine Haftung mehr. Wie bewegt sich der Wagen weiter?',
        options: ['Er fährt geradeaus weiter, in Richtung der Tangente an die Kurve.',
                  'Er fährt weiter auf der Kurve.',
                  'Er wird nach außen geschleudert, genau weg von der Kurvenmitte.',
                  'Er rutscht zur Kurvenmitte hin.'],
        correct: 0,
        reveal: 'Der Wagen fährt tangential geradeaus weiter. Er verlässt die Kurve nach außen.',
        follow: {
            q: 'Warum fährt der Wagen geradeaus weiter?',
            options: ['Ohne Reibung fehlt die Zentripetalkraft. Wegen seiner Trägheit behält der Wagen Betrag und Richtung der Geschwindigkeit.',
                      'Eine Fliehkraft schleudert ihn nach außen.',
                      'Das Öl schiebt den Wagen nach vorn.',
                      'Die Gewichtskraft zieht ihn geradeaus.'],
            correct: 0,
            wrongHints: { 'Eine Fliehkraft schleudert ihn nach außen.': 'Dann würde er genau von der Kurvenmitte weg fliegen. Das tut er nicht. Er fährt einfach geradeaus weiter.' }
        },
        hint: 'Denken Sie an das Trägheitsgesetz. Welche Kraft hat den Wagen bisher auf die Kurve gezwungen?',
        explanation: 'Die Zentripetalkraft kam von der <strong>Haftreibung</strong> der Reifen. Fällt sie weg, wirkt keine Kraft zur Kurvenmitte mehr. Nach dem Trägheitsgesetz fährt der Wagen <strong>geradeaus</strong> weiter, entlang der Tangente.'
    },
    function () {
        const all = [
            ['Die Geschwindigkeit wird verdoppelt.', '4-fache Kraft'],
            ['Die Geschwindigkeit wird halbiert.', 'ein Viertel der Kraft'],
            ['Der Kurvenradius wird verdoppelt.', 'halbe Kraft'],
            ['Der Kurvenradius wird halbiert.', 'doppelte Kraft'],
            ['Die Masse wird verdoppelt.', 'doppelte Kraft'],
            ['Die Geschwindigkeit wird verdreifacht.', '9-fache Kraft']
        ];
        const sel = pickN(all, 4).map(x => ({ left: x[0], answer: x[1] }));
        return {
            type: 'match', q: 'Wie ändert sich die nötige Zentripetalkraft F<sub>C</sub> = m · v² / r? Die anderen Größen bleiben gleich.',
            options: ['doppelte Kraft', 'halbe Kraft', '4-fache Kraft', 'ein Viertel der Kraft', '9-fache Kraft', 'gleiche Kraft'], items: sel,
            hint: 'v steht im Quadrat im Zähler. r steht im Nenner. m steht im Zähler.',
            explanation: 'v<sup>2</sup>: doppelte Geschwindigkeit → <strong>4-fache</strong> Kraft, dreifache → 9-fache. r im Nenner: doppelter Radius → halbe Kraft. m im Zähler: doppelte Masse → doppelte Kraft.'
        };
    },
    richtigFalsch([
        { left: 'der Kurvenradius', answer: 'hat Einfluss' },
        { left: 'die Reibungszahl zwischen Reifen und Straße', answer: 'hat Einfluss' },
        { left: 'eine nasse oder trockene Fahrbahn', answer: 'hat Einfluss' },
        { left: 'der Abtrieb durch die Flügel', answer: 'hat Einfluss' },
        { left: 'der Zustand und die Temperatur der Reifen', answer: 'hat Einfluss' },
        { left: 'die Farbe der Lackierung', answer: 'hat keinen Einfluss' },
        { left: 'die Startnummer des Wagens', answer: 'hat keinen Einfluss' }
    ], 5, 'Die größtmögliche Haftreibungskraft μ<sub>H</sub> · F<sub>N</sub> muss die Zentripetalkraft liefern. Also zählen: <strong>Reibungszahl</strong> (Reifen, Nässe, Temperatur), <strong>Normalkraft</strong> (Abtrieb) und der <strong>Radius</strong>.',
    'Wovon hängt die größtmögliche Kurvengeschwindigkeit ab?', ['hat Einfluss', 'hat keinen Einfluss']),
    function () {
        const first = erstesMal('vmax');
        const r = first ? 60 : rnd([45, 60, 75, 90, 110]), mu = first ? 0.9 : rnd([0.8, 0.9, 1.0]);
        const v = Math.sqrt(mu * g0 * r);
        return {
            type: 'num', level: 'Knobeln',
            q: 'Ein Auto <strong>ohne</strong> Abtrieb fährt durch eine Kurve (r = ' + r + ' m, μ<sub>H</sub> = ' + de(mu) + '). Dann ist F<sub>N</sub> = F<sub>G</sub> = m · g. Setzen Sie μ<sub>H</sub> · m · g = m · v² / r. Wie schnell darf es höchstens fahren?',
            fields: [
                { label: 'v<sub>max</sub>', unit: 'm/s', ans: T(v), tol: relTol(v, 0.01),
                  errors: [{ v: T(mu * g0 * r), msg: 'Am Ende noch die Wurzel ziehen.', tol: relTol(mu * g0 * r, 0.01) }] },
                { label: 'v<sub>max</sub>', unit: 'km/h', ans: T(v * 3.6), tol: relTol(v * 3.6, 0.01),
                  errors: [{ v: T(v / 3.6), msg: 'Von m/s nach km/h wird mit 3,6 malgenommen.', tol: relTol(v / 3.6, 0.02) }] }
            ],
            hint: 'Die Masse kürzt sich heraus: μ<sub>H</sub> · g = v² / r. Also v = √(μ<sub>H</sub> · g · r).',
            explanation: 'v = √(' + de(mu) + ' · 9,81 m/s² · ' + r + ' m) = <strong>' + de(v, 1) + ' m/s</strong> = ' + de(v * 3.6, 0) + ' km/h. Die Masse kürzt sich heraus! Ein Formel-1-Wagen fährt solche Kurven viel schneller. Das geht nur mit Abtrieb.'
        };
    },
    {
        type: 'text', level: 'In eigenen Worten',
        q: 'Erklären Sie einem Freund: Warum hat ein Formel-1-Wagen große Flügel? Verwenden Sie die Begriffe Zentripetalkraft, Reibungskraft und Normalkraft.',
        model: 'In der Kurve braucht der Wagen eine Zentripetalkraft zur Kurvenmitte. Diese Kraft liefert die Haftreibung zwischen Reifen und Straße. Die Reibungskraft ist F<sub>R</sub> = μ · F<sub>N</sub>. Die Flügel drücken den Wagen auf die Straße (Abtrieb). Dadurch wird die Normalkraft viel größer als die Gewichtskraft. Also wird auch die mögliche Reibungskraft größer. Der Wagen kann schneller durch die Kurve fahren.',
        checklist: ['Zentripetalkraft zur Kurvenmitte ist nötig', 'Die Haftreibung liefert diese Kraft', 'Flügel erzeugen Abtrieb, F_N wird größer', 'Größere F_N bedeutet größere Reibungskraft, also höhere Kurvengeschwindigkeit'],
        explanation: 'Vergleichen Sie Ihre Antwort mit der Musterlösung und haken Sie ab, was Sie schon drin haben.',
        hint: ''
    }
],
// ---------------------------------------------------------------- Modul 6
6: [
    function () { return {
        type: 'lab', noRegen: true, level: 'Forscher-Auftrag',
        q: 'Rampen-Labor: Verändern Sie den Neigungswinkel α und die Masse m. Beobachten Sie die Normalkraft F<sub>N</sub> und die Hangabtriebskraft F<sub>H</sub>.',
        sliders: [{ key: 'a', label: 'Neigungswinkel α', unit: '°', min: 0, max: 70, step: 1, val: 15 },
                  { key: 'm', label: 'Masse m', unit: 'kg', min: 2, max: 20, step: 1, val: 10 }],
        view: labView, out: labOut,
        missions: [
            { text: 'Stellen Sie die Rampe so ein, dass <strong>gar keine</strong> Hangabtriebskraft wirkt.', check: s => s.a === 0, sol: { a: 0 } },
            { text: 'Finden Sie den Winkel, bei dem F<sub>H</sub> und F<sub>N</sub> <strong>gleich groß</strong> sind.', check: s => s.a === 45, sol: { a: 45 } },
            { text: 'Finden Sie den Winkel, bei dem F<sub>H</sub> genau die <strong>Hälfte</strong> von F<sub>G</sub> ist.', check: s => s.a === 30, sol: { a: 30 } },
            { text: 'Stellen Sie bei α = 30° die Masse so ein, dass F<sub>H</sub> ≈ 49 N ist.', check: s => s.a === 30 && s.m === 10, sol: { a: 30, m: 10 } }
        ],
        follow: {
            q: 'Auswertung: Was passiert, wenn die Rampe steiler wird?',
            options: ['F<sub>H</sub> wird größer, F<sub>N</sub> wird kleiner.', 'F<sub>H</sub> und F<sub>N</sub> werden beide größer.',
                      'F<sub>H</sub> wird kleiner, F<sub>N</sub> wird größer.', 'Beide bleiben gleich, nur F<sub>G</sub> ändert sich.'],
            correct: 0,
            wrongHints: { 'Beide bleiben gleich, nur F<sub>G</sub> ändert sich.': 'F_G = m · g hängt nicht vom Winkel ab. Schauen Sie noch einmal auf die Pfeile.' }
        },
        hint: 'F<sub>H</sub> = F<sub>G</sub> · sin α und F<sub>N</sub> = F<sub>G</sub> · cos α.',
        explanation: 'Je steiler, desto größer <strong>F<sub>H</sub></strong> (sin α wächst) und desto kleiner <strong>F<sub>N</sub></strong> (cos α sinkt). Bei 45° sind beide gleich. Bei 30° ist F<sub>H</sub> = ½ · F<sub>G</sub>, weil sin 30° = 0,5.'

    }; },
    function () {
        const first = erstesMal('rampe');
        const m = first ? 12 : rnd([6, 8, 12, 15, 18, 25]), a = first ? 20 : rnd([12, 15, 20, 25, 35, 40]);
        const FG = m * g0, FN = FG * cosD(a), FH = FG * sinD(a);
        return {
            type: 'num', svg: rampSvg({ a: a, m: m, k: 150 / FG }),
            q: 'Eine Kiste (m = ' + m + ' kg) steht auf einer Rampe mit dem Neigungswinkel α = ' + a + '°. Berechnen Sie die Kräfte (Taschenrechner im Modus DEG).',
            fields: [
                { label: 'Gewichtskraft F<sub>G</sub>', unit: 'N', ans: T(FG), tol: relTol(FG, 0.005) },
                { label: 'Normalkraft F<sub>N</sub>', unit: 'N', ans: T(FN), tol: relTol(FN, 0.01),
                  errors: [{ v: T(FH), msg: 'Sinus und Kosinus vertauscht. F_N = F_G · cos α.', tol: relTol(FH, 0.01) },
                           { v: T(FG), msg: 'Auf der Rampe ist F_N kleiner als F_G.' }] },
                { label: 'Hangabtriebskraft F<sub>H</sub>', unit: 'N', ans: T(FH), tol: relTol(FH, 0.01),
                  errors: [{ v: T(FN), msg: 'Sinus und Kosinus vertauscht. F_H = F_G · sin α.', tol: relTol(FN, 0.01) }] }
            ],
            hint: 'F<sub>G</sub> = m · g, F<sub>N</sub> = F<sub>G</sub> · cos α, F<sub>H</sub> = F<sub>G</sub> · sin α. Prüfen Sie: Steht Ihr Taschenrechner auf DEG?',
            explanation: 'F<sub>G</sub> = ' + m + ' kg · 9,81 m/s² = ' + de(FG, 2) + ' N. F<sub>N</sub> = ' + de(FG, 2) + ' N · cos ' + a + '° = <strong>' + de(FN, 2) + ' N</strong>. F<sub>H</sub> = ' + de(FG, 2) + ' N · sin ' + a + '° = <strong>' + de(FH, 2) + ' N</strong>.'
        };
    },
    function () {
        const first = erstesMal('fehler6');
        const m = first ? 9 : rnd([5, 9, 14, 20]), a = first ? 22 : rnd([15, 22, 28, 35]);
        const FG = m * g0, art = first ? 0 : rint(0, 2);
        const L = ['Gegeben: m = ' + m + ' kg, α = ' + a + '°', 'F<sub>G</sub> = m · g = ' + m + ' kg · 9,81 m/s² = ' + de(FG, 2) + ' N'];
        let falsch, expl;
        if (art === 0) {
            L.push('F<sub>N</sub> = F<sub>G</sub> · sin α = ' + de(FG, 2) + ' N · sin ' + a + '° = ' + de(FG * sinD(a), 2) + ' N');
            L.push('F<sub>H</sub> = F<sub>G</sub> · cos α = ' + de(FG, 2) + ' N · cos ' + a + '° = ' + de(FG * cosD(a), 2) + ' N');
            falsch = 3; expl = 'In Zeile 3 sind Sinus und Kosinus vertauscht. Richtig: F<sub>N</sub> = F<sub>G</sub> · <strong>cos</strong> α = ' + de(FG * cosD(a), 2) + ' N und F<sub>H</sub> = F<sub>G</sub> · <strong>sin</strong> α = ' + de(FG * sinD(a), 2) + ' N. Probe: Bei kleinem Winkel muss F<sub>N</sub> fast so groß wie F<sub>G</sub> sein.';
        } else if (art === 1) {
            L.push('F<sub>N</sub> = F<sub>G</sub> · cos α = ' + de(FG, 2) + ' N · cos ' + a + '° = ' + de(FG * Math.cos(a), 2) + ' N');
            L.push('F<sub>H</sub> = F<sub>G</sub> · sin α = ' + de(FG, 2) + ' N · sin ' + a + '° = ' + de(FG * Math.sin(a), 2) + ' N');
            falsch = 3; expl = 'In Zeile 3 stand der Taschenrechner im Modus RAD (Bogenmaß). Darum kommt ein unsinniges Ergebnis heraus. Im Modus DEG: F<sub>N</sub> = <strong>' + de(FG * cosD(a), 2) + ' N</strong>.';
        } else {
            L.push('F<sub>N</sub> = F<sub>G</sub> · cos α = ' + de(FG, 2) + ' N · cos ' + a + '° = ' + de(FG * cosD(a), 2) + ' N');
            L.push('F<sub>H</sub> = F<sub>G</sub> · sin α = ' + de(FG, 2) + ' N · sin ' + a + '° = ' + de(FG * cosD(a) * sinD(a), 2) + ' N');
            falsch = 4; expl = 'In Zeile 4 wurde F<sub>N</sub> statt F<sub>G</sub> mit sin α multipliziert. Richtig: F<sub>H</sub> = F<sub>G</sub> · sin α = <strong>' + de(FG * sinD(a), 2) + ' N</strong>.';
        }
        return fehlerTask('Eine Schülerin berechnet die Kräfte an einer Rampe. In welcher Zeile steckt der <strong>erste</strong> Fehler?', L, falsch, expl,
            'Prüfen Sie: Gehört cos zu F<sub>N</sub> und sin zu F<sub>H</sub>? Passen die Zahlen zum Winkel? Wurde mit F<sub>G</sub> gerechnet?');
    },
    {
        type: 'match', level: 'Begründen',
        q: 'Was gilt bei diesem Neigungswinkel?',
        options: ['F_H = 0 und F_N = F_G', 'F_H = ½ · F_G', 'F_H = F_N', 'F_H ist größer als F_N', 'F_N = 0 und F_H = F_G'],
        items: [{ left: 'α = 0° (waagerecht)', answer: 'F_H = 0 und F_N = F_G' }, { left: 'α = 30°', answer: 'F_H = ½ · F_G' },
                { left: 'α = 45°', answer: 'F_H = F_N' }, { left: 'α = 60°', answer: 'F_H ist größer als F_N' },
                { left: 'α = 90° (senkrechte Wand)', answer: 'F_N = 0 und F_H = F_G' }],
        hint: 'sin 0° = 0, cos 0° = 1. sin 30° = 0,5. sin 45° = cos 45°. sin 90° = 1, cos 90° = 0.',
        explanation: 'Waagerecht: keine Hangabtriebskraft. 30°: F<sub>H</sub> = ½ F<sub>G</sub>. 45°: beide gleich. Über 45°: F<sub>H</sub> > F<sub>N</sub>. Senkrecht: Der Körper fällt frei, F<sub>H</sub> = F<sub>G</sub>.'
    },
    function () {
        const first = erstesMal('winkel');
        const m = first ? 20 : rnd([8, 12, 20, 30]), a = first ? 14 : rnd([8, 10, 14, 18, 24, 32]);
        const FG = m * g0, FH = Math.round(FG * sinD(a) * 10) / 10, aa = degOf(Math.asin(FH / FG));
        return {
            type: 'num', level: 'Knobeln',
            q: 'Eine Schubkarre mit Erde (m = ' + m + ' kg) steht auf einer Rampe. Die Hangabtriebskraft beträgt F<sub>H</sub> = ' + de(FH) + ' N. Wie steil ist die Rampe?',
            fields: [
                { label: 'Neigungswinkel α', unit: '°', ans: T(aa), tol: 150,
                  errors: [{ v: T(degOf(Math.acos(FH / FG))), msg: 'F_H gehört zum Sinus: sin α = F_H / F_G.', tol: 300 },
                           { v: T(FH / FG), msg: 'Das ist sin α. Jetzt noch die Umkehrfunktion sin⁻¹ verwenden.', tol: 5 }] }
            ],
            hint: 'sin α = F<sub>H</sub> / F<sub>G</sub>. Dann α = sin⁻¹(F<sub>H</sub> / F<sub>G</sub>).',
            explanation: 'F<sub>G</sub> = ' + de(FG, 1) + ' N. sin α = ' + de(FH) + ' N / ' + de(FG, 1) + ' N = ' + de(FH / FG, 3) + '. α = sin⁻¹(' + de(FH / FG, 3) + ') ≈ <strong>' + de(aa, 1) + '°</strong>.'
        };
    },
    {
        type: 'text', level: 'In eigenen Worten',
        q: 'Welchen Einfluss hat der Neigungswinkel auf die Hangabtriebskraft und auf die Normalkraft? Beschreiben Sie mit eigenen Worten und nennen Sie ein Beispiel aus dem Alltag.',
        model: 'Je größer der Neigungswinkel, desto größer wird die Hangabtriebskraft. Die Normalkraft wird dagegen kleiner. Bei 0° gibt es keine Hangabtriebskraft und die Normalkraft ist gleich der Gewichtskraft. Bei 90° ist es umgekehrt. Beispiel: Einen Einkaufswagen muss man an einer steilen Rampe viel stärker festhalten als an einer flachen.',
        checklist: ['Steiler → Hangabtriebskraft größer', 'Steiler → Normalkraft kleiner', 'Grenzfall 0° oder 90° genannt', 'Ein Beispiel aus dem Alltag'],
        explanation: 'Vergleichen Sie Ihre Antwort mit der Musterlösung und haken Sie ab, was Sie schon drin haben.',
        hint: ''
    }
],
// ---------------------------------------------------------------- Modul 7
7: [
    {
        type: 'order', q: 'Eine Kiste soll eine Rampe <strong>hinaufgezogen</strong> werden. Wie bestimmt man den Grenzwert der Zugkraft? Bringen Sie die Schritte in die richtige Reihenfolge.',
        top: 'zuerst', bottom: 'zuletzt',
        steps: ['Gewichtskraft berechnen: F<sub>G</sub> = m · g', 'Normalkraft berechnen: F<sub>N</sub> = F<sub>G</sub> · cos α',
                'Hangabtriebskraft berechnen: F<sub>H</sub> = F<sub>G</sub> · sin α', 'Haftreibungskraft berechnen: F<sub>R,H</sub> = μ<sub>H</sub> · F<sub>N</sub>',
                'Beide hangabwärts wirkenden Kräfte addieren: F<sub>Z</sub> > F<sub>H</sub> + F<sub>R,H</sub>'],
        hint: 'Für die Reibungskraft brauchen Sie zuerst die Normalkraft.',
        explanation: 'F<sub>G</sub> → F<sub>N</sub> → (F<sub>H</sub>) → F<sub>R,H</sub> → F<sub>Z</sub> > F<sub>H</sub> + F<sub>R,H</sub>. Die Schritte F<sub>N</sub> und F<sub>H</sub> kann man auch tauschen, hier gilt die Reihenfolge aus dem Lerntext.'
    },
    function () {
        const first = erstesMal('zug');
        const m = first ? 15 : rnd([8, 12, 15, 20, 24]), a = first ? 18 : rnd([10, 12, 15, 18, 22]), mu = first ? 0.5 : rnd([0.4, 0.45, 0.5, 0.55]);
        const FG = m * g0, FN = FG * cosD(a), FH = FG * sinD(a), FR = mu * FN, FZ = FH + FR;
        return {
            type: 'num', svg: rampSvg({ a: a, m: m, k: 150 / FG, zug: true, zl: 120, rl: 70 }),
            q: 'Eine Holzkiste (m = ' + m + ' kg) steht auf einer Holzrampe (α = ' + a + '°). Haftreibungszahl Holz auf Holz: μ<sub>H</sub> = ' + de(mu) + '. Die Kiste soll an einem Seil parallel zur Rampe <strong>nach oben</strong> gezogen werden. Welchen Grenzwert muss die Zugkraft überschreiten?',
            fields: [
                { label: 'Normalkraft F<sub>N</sub>', unit: 'N', ans: T(FN), tol: relTol(FN, 0.01),
                  errors: [{ v: T(FG), msg: 'Auf der Rampe gilt F_N = F_G · cos α.' }, { v: T(FH), msg: 'Sinus und Kosinus vertauscht.', tol: relTol(FH, 0.01) }] },
                { label: 'Hangabtriebskraft F<sub>H</sub>', unit: 'N', ans: T(FH), tol: relTol(FH, 0.01),
                  errors: [{ v: T(FN), msg: 'Sinus und Kosinus vertauscht.', tol: relTol(FN, 0.01) }] },
                { label: 'Haftreibungskraft F<sub>R,H</sub>', unit: 'N', ans: T(FR), tol: relTol(FR, 0.015),
                  errors: [{ v: T(mu * FG), msg: 'Rechnen Sie mit F_N auf der Rampe, nicht mit F_G.', tol: relTol(mu * FG, 0.01) }] },
                { label: 'Grenzwert der Zugkraft F<sub>Z</sub>', unit: 'N', ans: T(FZ), tol: relTol(FZ, 0.015),
                  errors: [{ v: T(FR), msg: 'Die Hangabtriebskraft zieht auch nach unten. Sie muss mit überwunden werden.', tol: relTol(FR, 0.015) },
                           { v: T(FR - FH), msg: 'Beim Hinaufziehen wirken F_H und F_R beide hangabwärts. Addieren, nicht abziehen.', tol: relTol(Math.abs(FR - FH), 0.02) }] }
            ],
            hint: 'Beim Hinaufziehen zeigen Hangabtriebskraft und Reibungskraft beide nach unten. F<sub>Z</sub> > F<sub>H</sub> + μ<sub>H</sub> · F<sub>N</sub>.',
            explanation: 'F<sub>G</sub> = ' + de(FG, 2) + ' N. F<sub>N</sub> = F<sub>G</sub> · cos ' + a + '° = ' + de(FN, 2) + ' N. F<sub>H</sub> = F<sub>G</sub> · sin ' + a + '° = ' + de(FH, 2) + ' N. F<sub>R,H</sub> = ' + de(mu) + ' · ' + de(FN, 2) + ' N = ' + de(FR, 2) + ' N. F<sub>Z</sub> > ' + de(FH, 2) + ' N + ' + de(FR, 2) + ' N = <strong>' + de(FZ, 2) + ' N</strong>.'
        };
    },
    debateTask({
        q: 'Eine Kiste soll die Rampe hinaufgezogen werden. Zwei Mitschüler rechnen unterschiedlich.',
        people: [['Leon', 'Es reicht, wenn die Zugkraft größer als die Reibungskraft ist. Die Hangabtriebskraft spielt keine Rolle.'],
                 ['Sara', 'Die Zugkraft muss größer sein als die Reibungskraft plus die Hangabtriebskraft.']],
        winner: 'Sara',
        whoErrors: [{ v: 'Leon', msg: 'Was macht die Kiste, wenn man nur so stark zieht, wie die Reibung ist?' }],
        reasons: [['Beim Hinaufziehen wirken Reibungskraft und Hangabtriebskraft beide hangabwärts. Beide müssen überwunden werden.'],
                  ['Die Hangabtriebskraft hilft beim Hinaufziehen.', 'Die Hangabtriebskraft zeigt nach unten. Sie hilft nur beim Hinunterziehen.'],
                  ['Die Reibungskraft wirkt auf der Rampe nicht.', 'Auf der Rampe gibt es auch Reibung: F_R = μ · F_N.'],
                  ['Die Gewichtskraft muss komplett überwunden werden.', 'Man zieht entlang der Rampe. Dabei zählt nur der Anteil F_H der Gewichtskraft.']],
        hint: 'Zeichnen Sie alle Kräfte entlang der Rampe ein. Welche zeigen nach oben, welche nach unten?',
        explanation: 'Sara hat recht. Die Reibung wirkt gegen die geplante Bewegung, also nach <strong>unten</strong>. Die Hangabtriebskraft zeigt auch nach unten. Deshalb gilt: F<sub>Z</sub> > F<sub>H</sub> + F<sub>R,H</sub>.'
    }),
    function () {
        const first = erstesMal('rutscht');
        let m, a, mu;
        do {
            m = first ? 15 : rnd([10, 15, 20]);
            a = first ? 18 : rnd([10, 15, 18, 25, 30, 35, 40]);
            mu = first ? 0.5 : rnd([0.3, 0.4, 0.5, 0.6]);
        } while (Math.abs(tanD(a) - mu) < 0.05);
        const FG = m * g0, FN = FG * cosD(a), FH = FG * sinD(a), FR = mu * FN;
        const rutscht = FH > FR;
        return {
            type: 'mc', level: 'Begründen',
            q: 'Eine Kiste (m = ' + m + ' kg) steht ohne Seil auf einer Rampe (α = ' + a + '°, μ<sub>H</sub> = ' + de(mu) + '). Rutscht sie von allein hinunter?',
            options: ['Ja, denn F<sub>H</sub> ist größer als die größtmögliche Haftreibungskraft.',
                      'Nein, denn F<sub>H</sub> ist kleiner als die größtmögliche Haftreibungskraft.',
                      'Ja, auf einer Rampe rutscht jede Kiste.',
                      'Das hängt nur von der Masse ab.'],
            correct: rutscht ? 0 : 1,
            wrongHints: { 'Das hängt nur von der Masse ab.': 'Die Masse steckt in F_H und in F_R. Sie kürzt sich heraus.' },
            hint: 'Berechnen Sie F<sub>H</sub> = F<sub>G</sub> · sin α und F<sub>R,H</sub> = μ<sub>H</sub> · F<sub>G</sub> · cos α. Vergleichen Sie.',
            explanation: 'F<sub>H</sub> = ' + de(FH, 1) + ' N, F<sub>R,H,max</sub> = ' + de(FR, 1) + ' N. ' + (rutscht ? 'F<sub>H</sub> ist größer: Die Kiste <strong>rutscht</strong>.' : 'F<sub>H</sub> ist kleiner: Die Haftreibung hält die Kiste fest. Sie <strong>rutscht nicht</strong>.')
        };
    },
    function () {
        const first = erstesMal('grenzwinkel');
        const mu = first ? 0.5 : rnd([0.3, 0.4, 0.45, 0.6, 0.7]);
        const a = degOf(Math.atan(mu));
        return {
            type: 'num', level: 'Knobeln',
            q: 'Sie kippen eine Holzrampe langsam immer steiler. Bei welchem Winkel beginnt eine Holzkiste von allein zu rutschen (μ<sub>H</sub> = ' + de(mu) + ')? Tipp: An der Grenze gilt F<sub>H</sub> = F<sub>R,H</sub>.',
            fields: [
                { label: 'Grenzwinkel α', unit: '°', ans: T(a), tol: 200,
                  errors: [{ v: T(degOf(Math.asin(mu))), msg: 'Nicht sin α = μ. Setzen Sie F_G · sin α = μ · F_G · cos α. Daraus folgt tan α = μ.', tol: 300 },
                           { v: T(degOf(Math.acos(mu))), msg: 'Aus F_G · sin α = μ · F_G · cos α folgt tan α = μ.', tol: 300 }] }
            ],
            hint: 'F<sub>G</sub> · sin α = μ<sub>H</sub> · F<sub>G</sub> · cos α. Teilen Sie durch F<sub>G</sub> · cos α. Dann bleibt tan α = μ<sub>H</sub>.',
            explanation: 'tan α = μ<sub>H</sub> = ' + de(mu) + ' → α = tan⁻¹(' + de(mu) + ') ≈ <strong>' + de(a, 1) + '°</strong>. Die Masse kürzt sich heraus. So kann man die Haftreibungszahl sogar messen: Rampe kippen, Winkel ablesen, tan α berechnen.'
        };
    },
    {
        type: 'mc', shuffle: true, level: 'Knobeln',
        q: 'Jetzt soll eine Kiste die Rampe <strong>hinunter</strong>gezogen werden. Sie rutscht nicht von allein. Welcher Grenzwert gilt für die Zugkraft?',
        options: ['F<sub>Z</sub> > F<sub>R,H</sub> − F<sub>H</sub>', 'F<sub>Z</sub> > F<sub>R,H</sub> + F<sub>H</sub>', 'F<sub>Z</sub> > F<sub>H</sub>', 'F<sub>Z</sub> > F<sub>G</sub>'],
        correct: 0,
        wrongHints: { 'F<sub>Z</sub> > F<sub>R,H</sub> + F<sub>H</sub>': 'Das gilt beim Hinaufziehen. Beim Hinunterziehen zeigt F_H in Zugrichtung.' },
        hint: 'Beim Hinunterziehen zeigt die Reibung nach oben. In welche Richtung zeigt die Hangabtriebskraft?',
        explanation: 'Beim Hinunterziehen hilft die Hangabtriebskraft mit. Die Reibung wirkt nach oben. Also: F<sub>Z</sub> + F<sub>H</sub> > F<sub>R,H</sub>, umgestellt <strong>F<sub>Z</sub> > F<sub>R,H</sub> − F<sub>H</sub></strong>.'
    }
]
};
