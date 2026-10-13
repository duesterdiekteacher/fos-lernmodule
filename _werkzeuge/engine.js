// =====================================================================
// Aufgaben-Engine für die FOS-Lernmodule (Aufbau wie die C#-Vorlage)
// Aufgabentypen: mc (Auswahl), num (Zahlen eingeben, auch mit Auswahlfeldern),
//                match (Zuordnen), order (Reihenfolge)
// Eine Aufgabe ist ein Objekt oder eine Funktion, die ein Objekt liefert.
// Funktionen erzeugen bei jedem Öffnen neue Zahlen ("Neue Zahlen"-Knopf).
// num-Felder: ans in Tausendsteln der Einheit (9,81 -> 9810), tol = Spielraum.
// Pro Modul legt tasks.js fest: BASIC (Grundlagen) und ADVANCED (gesperrt).
// =====================================================================

let completedModules = new Set();
let basicQuizPassed = false;
let current = {};

// ---------- Hilfsfunktionen ----------
function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function pickN(arr, n) { return shuffle(arr).slice(0, n); }

function parseNum(s) {
    s = (s || '').trim().replace(/\s+/g, '')
        .replace(/(N\/kg|m\/s²|m\/s\^2|kN|km|kg|N|m|g|%)$/, '')   // angehängte Einheit ignorieren
        .replace(/[−–]/g, '-').replace(',', '.');
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
    return parseFloat(s);
}

const TYPE_LABEL = {
    mc: '✅ Auswählen',
    num: '🔢 Rechnen',
    match: '🔗 Zuordnen',
    order: '↕️ Reihenfolge'
};
const TYPE_NOTE = {
    mc: 'Klicken Sie die richtige Antwort an.',
    num: 'Tippen Sie Ihre Ergebnisse ein. Komma oder Punkt ist egal.',
    match: 'Wählen Sie bei jeder Zeile die passende Antwort aus.',
    order: 'Bringen Sie die Einträge mit ▲ und ▼ in die richtige Reihenfolge.'
};

// ---------- Aufgabe vorbereiten ----------
function resolveTask(def) {
    const generated = (typeof def === 'function');
    const t = generated ? def() : JSON.parse(JSON.stringify(def));
    t.regen = generated;
    if (t.type === 'match') {
        const items = (t.shuffle === false) ? t.items : shuffle(t.items);
        t.fields = items.map(it => ({ label: it.left, kind: 'select', options: t.options, ans: it.answer, errors: it.errors }));
    }
    // typische Fehlerwerte, die zufällig gleich der Lösung sind, entfernen
    (t.fields || []).forEach(f => { if (f.errors) f.errors = f.errors.filter(e => e.v !== f.ans); });
    if (t.type === 'order') {
        let cur;
        do { cur = shuffle(t.steps.map((s, k) => k)); } while (cur.every((v, k) => v === k));
        t.cur = cur;
    }
    if (t.type === 'mc' && t.shuffle) {
        const idx = shuffle(t.options.map((o, k) => k));
        t.options = idx.map(k => t.options[k]);
        t.correct = idx.indexOf(t.correct);
    }
    return t;
}

function qDiv(n, i) { return document.querySelector('.quiz-question[data-module="' + n + '"][data-question="' + i + '"]'); }

// ---------- Darstellung ----------
function renderTask(n, i) {
    const t = current[n][i];
    const id = n + '_' + i;
    let h = '<div class="quiz-question task-' + t.type + '" data-module="' + n + '" data-question="' + i + '">';
    h += '<div class="task-head"><span class="task-type">' + TYPE_LABEL[t.type] + '</span>' +
         (t.level ? '<span class="task-level">⭐ ' + t.level + '</span>' : '') + '</div>';
    h += '<p>' + (i + 1) + '. ' + t.q + '</p>';
    if (t.svg) h += '<div class="sketch">' + t.svg + '</div>';
    h += '<div class="task-note">' + (t.note || TYPE_NOTE[t.type]) + '</div>';

    if (t.type === 'mc') {
        t.options.forEach((opt, j) => {
            h += '<div class="quiz-option" onclick="answerMC(' + n + ',' + i + ',' + j + ')">' +
                 '<input type="radio" name="q' + id + '" id="q' + id + '_' + j + '">' +
                 '<label for="q' + id + '_' + j + '">' + opt + '</label></div>';
        });
    } else if (t.type === 'order') {
        if (t.top) h += '<div class="order-end">▲ ' + t.top + '</div>';
        h += '<ol class="order-list">';
        t.cur.forEach((si, pos) => {
            h += '<li class="order-item"><span class="order-text">' + t.steps[si] + '</span>' +
                 '<span class="order-btns">' +
                 '<button type="button" onclick="moveStep(' + n + ',' + i + ',' + pos + ',-1)" aria-label="nach oben"' + (pos === 0 ? ' disabled' : '') + '>▲</button>' +
                 '<button type="button" onclick="moveStep(' + n + ',' + i + ',' + pos + ',1)" aria-label="nach unten"' + (pos === t.cur.length - 1 ? ' disabled' : '') + '>▼</button>' +
                 '</span></li>';
        });
        h += '</ol>';
        if (t.bottom) h += '<div class="order-end">▼ ' + t.bottom + '</div>';
    } else {
        h += '<div class="fields">';
        t.fields.forEach((f, k) => {
            const fid = 'in' + id + '_' + k;
            h += '<div class="field-row" id="row' + id + '_' + k + '">' +
                 '<label class="field-label" for="' + fid + '">' + f.label + '</label><div class="field-input">';
            if (f.kind === 'select') {
                h += '<select id="' + fid + '"><option value="">– bitte wählen –</option>' +
                     f.options.map(o => '<option>' + o + '</option>').join('') + '</select>';
            } else {
                if (f.prefix) h += '<span class="field-pre">' + f.prefix + '</span>';
                h += '<input type="text" inputmode="decimal" autocomplete="off" id="' + fid + '"' +
                     (f.small ? ' class="small"' : '') +
                     ' onkeydown="if(event.key===\'Enter\')checkTask(' + n + ',' + i + ')">';
                h += '<span class="field-unit">' + (f.unit || '') + '</span>';
            }
            h += '</div><div class="field-msg"></div></div>';
        });
        h += '</div>';
    }

    h += '<div class="task-buttons">';
    if (t.type !== 'mc') h += '<button type="button" class="btn-check" onclick="checkTask(' + n + ',' + i + ')">Prüfen</button>';
    if (t.regen) h += '<button type="button" class="btn-new" onclick="newTask(' + n + ',' + i + ')">🎲 ' + (t.type === 'num' ? 'Neue Zahlen' : 'Neue Aufgabe') + '</button>';
    h += '</div>';
    h += '<div class="quiz-feedback" data-feedback="' + n + '-' + i + '"></div></div>';
    return h;
}

function setResult(n, i, ok, extra) {
    const t = current[n][i];
    const qd = qDiv(n, i);
    const fb = qd.querySelector('.quiz-feedback');
    fb.classList.add('show');
    fb.classList.toggle('correct', ok);
    fb.classList.toggle('wrong', !ok);
    qd.classList.toggle('correct', ok);
    qd.classList.toggle('wrong', !ok);
    fb.innerHTML = ok ? '✓ Richtig! ' + t.explanation
                      : '✗ Noch nicht ganz richtig. ' + (extra || '') + 'Hinweis: ' + t.hint;
    if (ok) qd.querySelectorAll('input[type=text], select').forEach(el => el.disabled = true);
}

// ---------- Antworten prüfen ----------
function answerMC(n, i, j) {
    const t = current[n][i];
    const qd = qDiv(n, i);
    qd.querySelectorAll('input[type="radio"]').forEach((r, k) => { r.checked = (k === j); });
    const e = (j !== t.correct) && t.wrongHints && t.wrongHints[t.options[j]];
    setResult(n, i, j === t.correct, e ? e + ' ' : '');
}

function checkTask(n, i) {
    const t = current[n][i];
    const qd = qDiv(n, i);
    let ok = true, empty = false;

    if (t.type === 'order') {
        ok = t.cur.every((v, k) => v === k);
        qd.querySelectorAll('.order-item').forEach((li, pos) => {
            li.classList.toggle('ok', t.cur[pos] === pos);
            li.classList.toggle('bad', t.cur[pos] !== pos);
        });
        setResult(n, i, ok);
        return;
    }

    t.fields.forEach((f, k) => {
        const row = document.getElementById('row' + n + '_' + i + '_' + k);
        const el = row.querySelector('input, select');
        const msgEl = row.querySelector('.field-msg');
        let good = false, msg = '';
        if (f.kind === 'select') {
            if (!el.value) { msg = 'Bitte wählen Sie etwas aus.'; empty = true; }
            else {
                good = (el.value === f.ans);
                const e = !good && f.errors && f.errors.find(e => e.v === el.value);
                if (e) msg = e.msg;
            }
        } else {
            const v = parseNum(el.value);
            if (el.value.trim() === '') { msg = 'Bitte tragen Sie eine Zahl ein.'; empty = true; }
            else if (isNaN(v)) { msg = 'Das ist keine Zahl. Beispiel: 9,81 (ohne Zehnerpotenz, die steht schon da).'; }
            else {
                const x = Math.round(v * 1000);
                good = f.tol ? Math.abs(x - f.ans) <= f.tol : (x === f.ans);
                if (!good) {
                    // Fehlerwerte: ebenfalls mit Spielraum (etol) vergleichen
                    const e = f.errors && f.errors.find(e => Math.abs(e.v - x) <= (e.tol !== undefined ? e.tol : (f.tol || 0)));
                    if (e) msg = e.msg;
                }
            }
        }
        row.classList.toggle('ok', good);
        row.classList.toggle('bad', !good);
        msgEl.textContent = msg;
        if (!good) ok = false;
    });
    setResult(n, i, ok, empty ? 'Es fehlen noch Eingaben. ' : '');
}

function moveStep(n, i, pos, dir) {
    const t = current[n][i];
    const p2 = pos + dir;
    if (p2 < 0 || p2 >= t.cur.length) return;
    [t.cur[pos], t.cur[p2]] = [t.cur[p2], t.cur[pos]];
    qDiv(n, i).outerHTML = renderTask(n, i);
}

function newTask(n, i) {
    current[n][i] = resolveTask(TASKS[n][i]);
    qDiv(n, i).outerHTML = renderTask(n, i);
}

// ---------- Module öffnen und abschließen ----------
function openModule(moduleNum) {
    if (ADVANCED.indexOf(moduleNum) >= 0 && !basicQuizPassed) {
        alert('🔒 Dieses Modul ist noch gesperrt. Schließen Sie zuerst die Module ' + BASIC[0] + ' bis ' + BASIC[BASIC.length - 1] + ' ab!');
        return;
    }
    document.getElementById('module-grid').style.display = 'none';
    const module = modules[moduleNum];
    current[moduleNum] = TASKS[moduleNum].map(resolveTask);

    let html = '<div class="module-content active">' +
               '<h2>' + module.title + '</h2>' + module.content +
               '<div class="quiz-section"><h3>📝 Verständnis-Check</h3>';
    for (let i = 0; i < current[moduleNum].length; i++) html += renderTask(moduleNum, i);
    html += '</div>' +
            '<button class="btn btn-back" onclick="backToOverview()">← Übersicht</button>' +
            '<button class="btn" onclick="completeModule(' + moduleNum + ')">Modul abschließen →</button>' +
            '</div>';
    document.getElementById('module-content-container').innerHTML = html;
    window.scrollTo(0, 0);
}

function completeModule(moduleNum) {
    for (let i = 0; i < current[moduleNum].length; i++) {
        const qd = qDiv(moduleNum, i);
        if (!qd || !qd.classList.contains('correct')) {
            alert('Aufgabe ' + (i + 1) + ' ist noch nicht richtig gelöst. Lösen Sie zuerst alle Aufgaben. Dann können Sie das Modul abschließen.');
            qd.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }
    completedModules.add(moduleNum);
    checkUnlocks();
    updateProgress();
    alert('🎉 Modul ' + moduleNum + ' geschafft!');
    backToOverview();
}

function backToOverview() {
    document.getElementById('module-grid').style.display = 'grid';
    document.getElementById('module-content-container').innerHTML = '';
    window.scrollTo(0, 0);
}

function checkUnlocks() {
    if (BASIC.every(m => completedModules.has(m)) && !basicQuizPassed) {
        basicQuizPassed = true;
        alert('🔓 Stark! Sie haben die Grundlagen geschafft. Die Fortgeschrittenen-Module ' + ADVANCED.join(', ').replace(/, (\d+)$/, ' und $1') + ' sind jetzt frei!');
        ADVANCED.forEach(m => {
            const card = document.getElementById('card-' + m);
            card.classList.remove('locked');
            card.querySelector('.module-description').textContent = UNLOCK_TEXT[m];
        });
    }
}

function updateProgress() {
    const total = Object.keys(modules).length;
    const bar = document.getElementById('progress');
    bar.style.width = (completedModules.size / total * 100) + '%';
    bar.textContent = completedModules.size + ' von ' + total + ' Modulen abgeschlossen';
    completedModules.forEach(m => {
        const card = document.getElementById('card-' + m);
        if (card) card.classList.add('completed');
    });
    if (completedModules.size === total) document.getElementById('badge').classList.add('show');
}
