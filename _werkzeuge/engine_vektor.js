// =====================================================================
// Vektor-Werkzeuge für die FOS-Lernmodule (Kräfte im Koordinatensystem)
// Wird VOR tasks.js eingebunden. engine_extra.js meldet den Typ "vector" an.
//   koord(o)      : Koordinatensystem als SVG-Anfang, liefert { s, X, Y }
//   pfeil(...)    : Kraftpfeil, lab(...): Beschriftung, bogen(...): Winkelbogen
//   Typ "vector"  : Pfeile vom Ursprung aus zeichnen (Klick = Pfeilspitze).
//                   t.g = {min, max, major, minor, lab, snap, ux, uy, unit}
//                   t.pens = [{key, lab, col, target: [x, y], tol}]
//                   t.fixed = [{x, y, lab, col}] (vorgegebene Pfeile), t.bg(X, Y) = Hintergrund
//                   t.readout = 'xy' | 'polar'
// Benötigt de() aus tasks.js (erst zur Laufzeit).
// =====================================================================

const SF = 'font-family="Segoe UI, Arial"';
const ARR = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>';
const RAD = Math.PI / 180;

function koord(o) {
    const W = o.size || 400, P = 34;
    const min = o.min, max = o.max, sc = (W - 2 * P) / (max - min);
    const X = v => P + (v - min) * sc, Y = v => W - P - (v - min) * sc;
    const near = (a, b) => Math.abs(a - b) < 1e-9;
    let s = '<svg viewBox="0 0 ' + W + ' ' + W + '" role="img" aria-label="' + (o.aria || 'Koordinatensystem mit Kraftpfeilen') + '">' + ARR;
    s += '<rect x="0" y="0" width="' + W + '" height="' + W + '" fill="transparent"/>';
    const minor = o.minor || o.major;
    for (let k = 0; min + k * minor <= max + 1e-9; k++) {
        const v = min + k * minor;
        const major = near(Math.round(v / o.major) * o.major, v);
        const col = major ? '#334155' : '#1f2b3e';
        s += '<line x1="' + X(v).toFixed(1) + '" y1="' + Y(min) + '" x2="' + X(v).toFixed(1) + '" y2="' + Y(max) + '" stroke="' + col + '" stroke-width="1"/>';
        s += '<line x1="' + X(min) + '" y1="' + Y(v).toFixed(1) + '" x2="' + X(max) + '" y2="' + Y(v).toFixed(1) + '" stroke="' + col + '" stroke-width="1"/>';
    }
    s += '<line x1="' + X(min) + '" y1="' + Y(0) + '" x2="' + (X(max) + 14) + '" y2="' + Y(0) + '" stroke="#94a3b8" stroke-width="2" marker-end="url(#ah)"/>';
    s += '<line x1="' + X(0) + '" y1="' + Y(min) + '" x2="' + X(0) + '" y2="' + (Y(max) - 14) + '" stroke="#94a3b8" stroke-width="2" marker-end="url(#ah)"/>';
    const ls = o.lab || o.major;
    for (let v = Math.ceil(min / ls) * ls; v <= max + 1e-9; v += ls) {
        if (near(v, 0)) continue;
        const t = (typeof de === 'function') ? de(v) : String(v);
        s += '<text x="' + X(v).toFixed(1) + '" y="' + (Y(0) + 17) + '" fill="#94a3b8" font-size="12" text-anchor="middle" ' + SF + '>' + t + '</text>';
        s += '<text x="' + (X(0) - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" fill="#94a3b8" font-size="12" text-anchor="end" ' + SF + '>' + t + '</text>';
    }
    s += '<text x="' + (X(0) - 6) + '" y="' + (Y(0) + 17) + '" fill="#94a3b8" font-size="12" text-anchor="end" ' + SF + '>0</text>';
    if (o.ux) s += '<text x="' + (W - 4) + '" y="' + (Y(0) - 8) + '" fill="#cbd5e1" font-size="13" text-anchor="end" ' + SF + '>' + o.ux + '</text>';
    if (o.uy) s += '<text x="' + (X(0) + 8) + '" y="16" fill="#cbd5e1" font-size="13" ' + SF + '>' + o.uy + '</text>';
    return { s, X, Y, W };
}
function pfeil(K, x0, y0, x1, y1, col, w, dash) {
    if (Math.abs(x1 - x0) + Math.abs(y1 - y0) < 1e-9) return '';
    return '<line x1="' + K.X(x0).toFixed(1) + '" y1="' + K.Y(y0).toFixed(1) + '" x2="' + K.X(x1).toFixed(1) + '" y2="' + K.Y(y1).toFixed(1) +
        '" stroke="' + col + '" stroke-width="' + (w || 4) + '"' + (dash ? ' stroke-dasharray="6 5"' : '') + ' marker-end="url(#ah)"/>';
}
function strich(K, x0, y0, x1, y1, col, w) {
    return '<line x1="' + K.X(x0).toFixed(1) + '" y1="' + K.Y(y0).toFixed(1) + '" x2="' + K.X(x1).toFixed(1) + '" y2="' + K.Y(y1).toFixed(1) +
        '" stroke="' + col + '" stroke-width="' + (w || 1.5) + '" stroke-dasharray="5 4"/>';
}
// Beschriftung neben der Pfeilspitze (in Pfeilrichtung etwas nach außen)
function lab(K, x, y, txt, col, size) {
    const r = Math.hypot(x, y) || 1;
    const px = K.X(x) + 16 * x / r, py = K.Y(y) - 16 * y / r + 5;
    const anchor = Math.abs(x / r) < 0.35 ? 'middle' : (x > 0 ? 'start' : 'end');
    return '<text x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" fill="' + col + '" font-size="' + (size || 16) + '" font-weight="bold" text-anchor="' + anchor + '" ' + SF + '>' + txt + '</text>';
}
// Index als tiefgestellte Schrift in SVG-Texten
function sub(b, i) { return b + '<tspan font-size="72%" dy="4">' + i + '</tspan>'; }
// Winkelbogen von 0° bis a (gegen den Uhrzeigersinn), r in Pixeln
function bogen(K, a, r, col, txt, a0) {
    a0 = a0 || 0;
    const cx = K.X(0), cy = K.Y(0);
    const p = d => [cx + r * Math.cos(d * RAD), cy - r * Math.sin(d * RAD)];
    const [x1, y1] = p(a0), [x2, y2] = p(a);
    const large = ((a - a0 + 360) % 360) > 180 ? 1 : 0;
    let s = '<path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + r + ',' + r + ' 0 ' + large + ' 0 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + '" fill="none" stroke="' + col + '" stroke-width="2.5"/>';
    if (txt) {
        const m = (a0 + ((a - a0 + 360) % 360) / 2), [tx, ty] = [cx + (r + 16) * Math.cos(m * RAD), cy - (r + 16) * Math.sin(m * RAD)];
        s += '<text x="' + tx.toFixed(1) + '" y="' + (ty + 5).toFixed(1) + '" fill="' + col + '" font-size="15" font-weight="bold" text-anchor="middle" ' + SF + '>' + txt + '</text>';
    }
    return s;
}
function winkelVon(x, y) { let a = Math.atan2(y, x) / RAD; if (a < 0) a += 360; return a; }

// ---------------------------------------------------------------- Typ "vector"
function vecSvg(t) {
    const K = koord(Object.assign({ aria: 'Koordinatensystem zum Einzeichnen von Kraftpfeilen' }, t.g));
    let s = K.s;
    if (t.bg) s += t.bg(K);
    (t.fixed || []).forEach(f => {
        s += pfeil(K, f.x0 || 0, f.y0 || 0, f.x, f.y, f.col, 4);
        if (f.lab) s += lab(K, f.x, f.y, f.lab, f.col);
    });
    t.pens.forEach(p => {
        const q = t.pts[p.key];
        if (!q) return;
        s += pfeil(K, 0, 0, q[0], q[1], p.col, 4.5);
        s += '<circle cx="' + K.X(q[0]).toFixed(1) + '" cy="' + K.Y(q[1]).toFixed(1) + '" r="4" fill="' + p.col + '"/>';
    });
    s += '<circle cx="' + K.X(0) + '" cy="' + K.Y(0) + '" r="4" fill="#f8fafc"/>';
    return s + '</svg>';
}
function vecRead(t) {
    const u = t.g.unit;
    return t.pens.filter(p => t.pts[p.key]).map(p => {
        const q = t.pts[p.key];
        const txt = t.readout === 'polar'
            ? 'Betrag ' + de(Math.hypot(q[0], q[1]), 0) + ' ' + u + ', Winkel ' + de(winkelVon(q[0], q[1]), 0) + '°'
            : 'x = ' + de(q[0]) + ' ' + u + ', y = ' + de(q[1]) + ' ' + u;
        return '<li style="color:' + p.col + '">' + p.lab + ': ' + txt + '</li>';
    }).join('');
}
const VECTOR_TYPE = {
    label: '✏️ Einzeichnen',
    note: 'Klicken Sie ins Koordinatensystem: Dort liegt die Pfeilspitze. Der Pfeil beginnt im Ursprung. Ein neuer Klick versetzt die Spitze.',
    checkButton: true,
    render(t, n, i, id) {
        t.pts = t.pts || {};
        t.pen = t.pen || 0;
        let h = '';
        if (t.pens.length > 1) {
            h += '<div class="pens">';
            t.pens.forEach((p, k) => {
                h += '<button type="button" class="pen' + (k === t.pen ? ' active' : '') + '" style="--pc:' + p.col + '" onclick="vecPen(' + n + ',' + i + ',' + k + ')">✏️ ' + p.lab + '</button>';
            });
            h += '</div>';
        }
        h += '<div class="sketch draw-area vec-area" onclick="vecClick(event,' + n + ',' + i + ')">' + vecSvg(t) + '</div>';
        h += '<ul class="draw-msgs vec-read">' + vecRead(t) + '</ul><ul class="draw-msgs vec-msgs"></ul>';
        return h;
    },
    check(t, n, i) {
        const qd = qDiv(n, i), u = t.g.unit;
        let ok = true;
        const msgs = t.pens.map(p => {
            const q = t.pts[p.key];
            if (!q) { ok = false; return '<li class="bad">' + p.lab + ': noch nicht eingezeichnet.</li>'; }
            const d = Math.hypot(q[0] - p.target[0], q[1] - p.target[1]);
            if (d <= p.tol) return '<li class="ok">' + p.lab + ': passt!</li>';
            ok = false;
            const b = Math.hypot(q[0], q[1]), bt = Math.hypot(p.target[0], p.target[1]);
            let w = Math.abs(winkelVon(q[0], q[1]) - winkelVon(p.target[0], p.target[1]));
            w = Math.min(w, 360 - w);
            const tipp = [];
            if (w > 4) tipp.push('Die Richtung stimmt noch nicht.');
            if (Math.abs(b - bt) > p.tol * 0.8) tipp.push(b > bt ? 'Der Pfeil ist zu lang.' : 'Der Pfeil ist zu kurz.');
            if (!tipp.length) tipp.push('Fast! Setzen Sie die Spitze noch etwas genauer.');
            return '<li class="bad">' + p.lab + ': ' + tipp.join(' ') + '</li>';
        });
        qd.querySelector('.vec-msgs').innerHTML = msgs.join('');
        setResult(n, i, ok);
    }
};
function vecPen(n, i, k) {
    const t = current[n][i];
    t.pen = k;
    qDiv(n, i).querySelectorAll('.pen').forEach((b, j) => b.classList.toggle('active', j === k));
}
function vecClick(ev, n, i) {
    const t = current[n][i];
    const qd = qDiv(n, i);
    if (qd.classList.contains('correct')) return;
    const svg = qd.querySelector('.vec-area svg');
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const K = koord(t.g), g = t.g;
    const sc = (K.X(1) - K.X(0));
    let x = (p.x - K.X(0)) / sc, y = (K.Y(0) - p.y) / sc;
    x = Math.round(x / g.snap) * g.snap; y = Math.round(y / g.snap) * g.snap;
    x = Number(x.toFixed(6)); y = Number(y.toFixed(6));
    if (x < g.min || x > g.max || y < g.min || y > g.max) return;
    vecSet(n, i, t.pen, x, y);
}
function vecSet(n, i, k, x, y) {                    // auch für automatische Tests
    const t = current[n][i];
    t.pts[t.pens[k].key] = [x, y];
    const qd = qDiv(n, i);
    qd.querySelector('.vec-area').innerHTML = vecSvg(t);
    qd.querySelector('.vec-read').innerHTML = vecRead(t);
}
