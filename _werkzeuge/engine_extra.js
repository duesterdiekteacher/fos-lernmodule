// =====================================================================
// Zusätzliche Aufgabentypen für die FOS-Lernmodule (Verständnis, kreativ)
// Wird NACH engine.js eingebunden. Typen:
//   predict : erst vorhersagen, dann Animation (SIMS[t.sim]), dann Begründungsfrage (t.follow)
//   lab     : Schieberegler, Aufträge (t.missions) werden live abgehakt, danach t.follow
//   draw    : Geraden ins Diagramm zeichnen (Klick setzt den Endpunkt), Prüfen vergleicht die Steigung
//   text    : in eigenen Worten erklären, danach Musterlösung mit Checkliste (zählt als "erledigt")
// Gemeinsam: t.follow = { q, options, correct, wrongHints }, t.hint/t.explanation gehören zur Folgefrage.
// =====================================================================

function followHtml(t, n, i, id) {
    const f = t.follow;
    let h = '<div class="follow" style="display:none"><p class="follow-q">' + f.q + '</p>';
    f.options.forEach((opt, j) => {
        h += '<div class="quiz-option" onclick="answerFollow(' + n + ',' + i + ',' + j + ')">' +
             '<input type="radio" name="f' + id + '" id="f' + id + '_' + j + '">' +
             '<label for="f' + id + '_' + j + '">' + opt + '</label></div>';
    });
    return h + '</div>';
}
function prepFollow(t) {
    if (t.follow && t.follow.shuffle !== false && !t.follow._done) {
        const idx = shuffle(t.follow.options.map((o, k) => k));
        t.follow.options = idx.map(k => t.follow.options[k]);
        t.follow.correct = idx.indexOf(t.follow.correct);
        t.follow._done = true;
    }
}
function showFollow(n, i) {
    const qd = qDiv(n, i);
    const f = qd && qd.querySelector('.follow');
    if (f) f.style.display = 'block';
}
function answerFollow(n, i, j) {
    const t = current[n][i];
    const qd = qDiv(n, i);
    qd.querySelectorAll('.follow input[type="radio"]').forEach((r, k) => { r.checked = (k === j); });
    const e = (j !== t.follow.correct) && t.follow.wrongHints && t.follow.wrongHints[t.follow.options[j]];
    setResult(n, i, j === t.follow.correct, e ? e + ' ' : '');
}

// ---------- Animation ----------
function animate(ms, frame, done) {
    const t0 = performance.now();
    function step(now) {
        const p = Math.min(1, (now - t0) / ms);
        frame(p);
        if (p < 1) requestAnimationFrame(step); else if (done) done();
    }
    requestAnimationFrame(step);
}

const CUSTOM = {
    // ------------------------------------------------------------ predict
    predict: {
        label: '🔮 Vorhersagen',
        note: 'Legen Sie sich zuerst fest. Dann sehen Sie, was wirklich passiert.',
        checkButton: false,
        render(t, n, i, id) {
            prepFollow(t);
            let h = '<div class="predict-opts">';
            t.options.forEach((opt, j) => {
                h += '<div class="quiz-option" onclick="predictPick(' + n + ',' + i + ',' + j + ')">' +
                     '<input type="radio" name="p' + id + '" id="p' + id + '_' + j + '">' +
                     '<label for="p' + id + '_' + j + '">' + opt + '</label></div>';
            });
            h += '</div><div class="predict-msg"></div>';
            h += '<div class="sim-box" style="display:none"><div class="sim"></div>' +
                 '<button type="button" class="btn-new" onclick="simPlay(' + n + ',' + i + ')">▶ Noch einmal abspielen</button></div>';
            return h + followHtml(t, n, i, id);
        }
    },
    // ------------------------------------------------------------ lab
    lab: {
        label: '🧪 Labor',
        note: 'Bewegen Sie die Regler. Erfüllte Aufträge werden automatisch grün abgehakt.',
        checkButton: false,
        render(t, n, i, id) {
            prepFollow(t);
            t.state = t.state || {};
            t.sliders.forEach(s => { if (t.state[s.key] === undefined) t.state[s.key] = s.val; });
            t.done = t.done || t.missions.map(() => false);
            let h = '<div class="lab"><div class="lab-view">' + t.view(t.state) + '</div><div class="lab-out">' + t.out(t.state) + '</div>';
            t.sliders.forEach(s => {
                h += '<div class="lab-slider"><label for="sl' + id + s.key + '">' + s.label + ': <strong class="lab-val">' + de(t.state[s.key]) + ' ' + s.unit + '</strong></label>' +
                     '<input type="range" id="sl' + id + s.key + '" data-key="' + s.key + '" min="' + s.min + '" max="' + s.max + '" step="' + s.step + '" value="' + t.state[s.key] + '"' +
                     ' oninput="labMove(' + n + ',' + i + ')"></div>';
            });
            h += '<ul class="missions">' + t.missions.map((m, k) => '<li class="' + (t.done[k] ? 'done' : '') + '">' + m.text + '</li>').join('') + '</ul></div>';
            return h + followHtml(t, n, i, id);
        }
    },
    // ------------------------------------------------------------ draw
    draw: {
        label: '✏️ Zeichnen',
        note: 'Wählen Sie einen Stift. Klicken Sie dann ins Diagramm: Dort endet Ihre Gerade. Sie startet im Ursprung.',
        checkButton: true,
        render(t, n, i, id) {
            t.pts = t.pts || {};
            t.pen = t.pen || 0;
            let h = '<div class="pens">';
            t.pens.forEach((p, k) => {
                h += '<button type="button" class="pen' + (k === t.pen ? ' active' : '') + '" style="--pc:' + p.col + '" onclick="drawPen(' + n + ',' + i + ',' + k + ')">✏️ ' + p.lab + '</button>';
            });
            h += '</div><div class="sketch draw-area" onclick="drawClick(event,' + n + ',' + i + ')">' + drawSvg(t) + '</div>';
            h += '<ul class="draw-msgs"></ul>';
            return h;
        },
        check(t, n, i) {
            const qd = qDiv(n, i);
            let ok = true, extra = '';
            const msgs = t.pens.map(p => {
                const q = t.pts[p.key];
                if (!q) { ok = false; return '<li class="bad">' + p.lab + ': noch nicht gezeichnet.</li>'; }
                if (q[0] < 2) { ok = false; return '<li class="bad">' + p.lab + ': Setzen Sie den Punkt weiter rechts (ab t = 2 s). Dann wird die Gerade genauer.</li>'; }
                const s = q[1] / q[0];
                if (Math.abs(s - p.slope) / p.slope <= p.tol) return '<li class="ok">' + p.lab + ': passt! Steigung ≈ ' + de(s, 2) + ' m/s².</li>';
                ok = false;
                return '<li class="bad">' + p.lab + ': Ihre Gerade hat die Steigung ' + de(s, 2) + ' m/s². ' + (s > p.slope ? 'Das ist zu steil.' : 'Das ist zu flach.') + '</li>';
            });
            qd.querySelector('.draw-msgs').innerHTML = msgs.join('');
            setResult(n, i, ok, extra);
        }
    },
    // ------------------------------------------------------------ text
    text: {
        label: '✍️ Erklären',
        note: 'Schreiben Sie Ihre Antwort in eigenen Worten (mindestens zwei Sätze). Danach vergleichen Sie mit der Musterlösung.',
        checkButton: false,
        render(t, n, i, id) {
            t.doneOnly = true;
            let h = '<textarea class="text-answer" rows="5" placeholder="Ihre Erklärung …"></textarea><div class="field-msg text-msg"></div>';
            h += '<div class="task-buttons"><button type="button" class="btn-check" onclick="textReveal(' + n + ',' + i + ')">Fertig – Musterlösung zeigen</button></div>';
            h += '<div class="model" style="display:none"><h4>📘 Musterlösung</h4><p>' + t.model + '</p>' +
                 '<p class="model-q">Was steckt schon in Ihrer Antwort? Haken Sie ab:</p><ul class="checklist">' +
                 t.checklist.map((c, k) => '<li><label><input type="checkbox"> ' + c + '</label></li>').join('') + '</ul></div>';
            return h;
        }
    }
};

// ---------- predict ----------
function predictPick(n, i, j) {
    const t = current[n][i];
    if (t.pick !== undefined) return;
    t.pick = j;
    const qd = qDiv(n, i);
    qd.querySelectorAll('.predict-opts input').forEach((r, k) => { r.checked = (k === j); r.disabled = true; });
    qd.querySelectorAll('.predict-opts .quiz-option').forEach(o => o.classList.add('locked-opt'));
    qd.querySelector('.predict-msg').innerHTML = '🔒 Ihre Vorhersage steht. Jetzt schauen Sie, was passiert …';
    qd.querySelector('.sim-box').style.display = 'block';
    simPlay(n, i);
}
function simPlay(n, i) {
    const t = current[n][i];
    const qd = qDiv(n, i);
    SIMS[t.sim](qd.querySelector('.sim'), () => {
        const q = qDiv(n, i);
        if (!q || t.pick === undefined) return;
        q.querySelector('.predict-msg').innerHTML = (t.pick === t.correct)
            ? '👍 Ihre Vorhersage war richtig! ' + t.reveal
            : '😮 Überraschung! Es kam anders, als Sie vermutet haben. Genau daraus lernt man. ' + t.reveal;
        showFollow(n, i);
    });
}

// ---------- lab ----------
function labMove(n, i) {
    const t = current[n][i];
    const qd = qDiv(n, i);
    qd.querySelectorAll('.lab-slider input').forEach(inp => {
        t.state[inp.dataset.key] = Number(inp.value);
        inp.parentNode.querySelector('.lab-val').textContent = de(Number(inp.value)) + ' ' + t.sliders.find(s => s.key === inp.dataset.key).unit;
    });
    qd.querySelector('.lab-view').innerHTML = t.view(t.state);
    qd.querySelector('.lab-out').innerHTML = t.out(t.state);
    const lis = qd.querySelectorAll('.missions li');
    t.missions.forEach((m, k) => { if (!t.done[k] && m.check(t.state)) { t.done[k] = true; lis[k].classList.add('done'); } });
    if (t.done.every(x => x)) showFollow(n, i);
}
function labSet(n, i, vals) {                       // für automatische Tests
    const qd = qDiv(n, i);
    Object.keys(vals).forEach(k => { qd.querySelector('.lab-slider input[data-key="' + k + '"]').value = vals[k]; });
    labMove(n, i);
}

// ---------- draw ----------
function drawSvg(t) {
    return t.plot(t.pens.filter(p => t.pts[p.key]).map(p => ({ lab: p.lab, col: p.col, pts: [[0, 0], t.pts[p.key]], dots: true })));
}
function drawPen(n, i, k) {
    const t = current[n][i];
    t.pen = k;
    qDiv(n, i).querySelectorAll('.pen').forEach((b, j) => b.classList.toggle('active', j === k));
}
function drawClick(ev, n, i) {
    const t = current[n][i];
    const qd = qDiv(n, i);
    if (qd.classList.contains('correct')) return;
    const svg = qd.querySelector('.draw-area svg');
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const G = t.geom;
    let tt = (p.x - G.x0) / G.w * G.tmax, vv = (G.y0 - p.y) / G.h * G.vmax;
    tt = Math.round(tt / G.snapT) * G.snapT; vv = Math.round(vv / G.snapV) * G.snapV;
    if (tt <= 0 || tt > G.tmax || vv < 0 || vv > G.vmax) return;
    drawSet(n, i, t.pen, tt, vv);
}
function drawSet(n, i, k, tt, vv) {
    const t = current[n][i];
    t.pts[t.pens[k].key] = [tt, vv];
    qDiv(n, i).querySelector('.draw-area').innerHTML = drawSvg(t);
}

// ---------- text ----------
function textReveal(n, i) {
    const qd = qDiv(n, i);
    const txt = qd.querySelector('.text-answer').value.trim();
    const msg = qd.querySelector('.text-msg');
    if (txt.length < 40 || txt.split(/\s+/).length < 8) {
        msg.textContent = 'Schreiben Sie zuerst etwas mehr: mindestens zwei vollständige Sätze.';
        return;
    }
    msg.textContent = '';
    qd.querySelector('.model').style.display = 'block';
    setResult(n, i, true);
}

// Vektor-Zeichnen (engine_vektor.js, vor tasks.js eingebunden) anmelden
if (typeof VECTOR_TYPE !== 'undefined') CUSTOM.vector = VECTOR_TYPE;
