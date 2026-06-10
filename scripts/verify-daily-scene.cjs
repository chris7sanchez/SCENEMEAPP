// Harness ligero: transpila daily-scene.ts y verifica la lógica pura sin vitest.
const fs = require('fs');
const path = require('path');
const Module = require('module');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules', 'typescript'));

const src = fs.readFileSync(path.join(root, 'src/lib/daily-scene.ts'), 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { module: 'commonjs', target: 'es2019' } }).outputText;
const m = new Module('daily-scene');
m._compile(js, 'daily-scene.js');
const { dailyKey, isValidScene, sanitizeFilename, buildSubmissionPath } = m.exports;

let pass = 0, fail = 0;
function eq(name, got, want) {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (ok) { pass++; console.log('PASS', name); }
    else { fail++; console.log('FAIL', name, '=> got', JSON.stringify(got), 'want', JSON.stringify(want)); }
}

eq('dailyKey formato', dailyKey(new Date('2026-06-10T10:00:00Z'), 'Europe/Madrid'), '2026-06-10');
eq('dailyKey estable', dailyKey(new Date('2026-06-10T08:00:00Z'), 'Europe/Madrid'), dailyKey(new Date('2026-06-10T20:00:00Z'), 'Europe/Madrid'));
eq('dailyKey medianoche Madrid', dailyKey(new Date('2026-06-10T23:30:00Z'), 'Europe/Madrid'), '2026-06-11');
eq('dailyKey medianoche UTC', dailyKey(new Date('2026-06-10T23:30:00Z'), 'UTC'), '2026-06-10');

const ok = { title: 'La discusión', characters: ['ANA', 'LUIS'], lines: [
    { character: 'ANA', text: '¿De verdad?' }, { character: 'LUIS', text: 'No quería.' } ] };
eq('isValidScene ok', isValidScene(ok), true);
eq('isValidScene sin titulo', isValidScene({ ...ok, title: '   ' }), false);
eq('isValidScene <2 lineas', isValidScene({ ...ok, lines: [ok.lines[0]] }), false);
eq('isValidScene texto vacio', isValidScene({ ...ok, lines: [ok.lines[0], { character: 'LUIS', text: '' }] }), false);
eq('isValidScene null', isValidScene(null), false);
eq('isValidScene {}', isValidScene({}), false);

eq('sanitize peligroso', sanitizeFilename('mi tarea/../x.mp4'), 'mi_tarea_.._x.mp4');
eq('sanitize colapsa', sanitizeFilename('a   b'), 'a_b');
eq('sanitize vacio', sanitizeFilename('///'), 'tarea');
eq('buildSubmissionPath', buildSubmissionPath('user123', '2026-06-10', 'toma.mp4', 1000), 'submissions/user123/2026-06-10/1000_toma.mp4');

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
