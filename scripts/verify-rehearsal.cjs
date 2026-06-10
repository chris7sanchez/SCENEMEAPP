// Harness: transpila scene-script.ts y rehearsal-reducer.ts y verifica lógica pura.
const fs = require('fs');
const path = require('path');
const Module = require('module');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules', 'typescript'));

function load(rel, name) {
    const src = fs.readFileSync(path.join(root, rel), 'utf8');
    const js = ts.transpileModule(src, { compilerOptions: { module: 'commonjs', target: 'es2019' } }).outputText;
    const m = new Module(name);
    m._compile(js, name + '.js');
    return m.exports;
}

const { parseScriptTurns, speakersOf, cueOf } = load('src/lib/scene-script.ts', 'scene-script');
const { initRehearsal, rehearsalReducer } = load('src/lib/rehearsal-reducer.ts', 'rehearsal-reducer');

let pass = 0, fail = 0;
function eq(name, got, want) {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (ok) { pass++; console.log('PASS', name); }
    else { fail++; console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want)); }
}

// --- parseScriptTurns: formato NOMBRE en línea propia ---
const scriptB = `INT. CASA - DÍA

ANA
¿De verdad pensabas que no me iba a enterar?

LUIS
(nervioso)
No quería hacerte daño.
Solo intentaba protegerte.`;
eq('parse B', parseScriptTurns(scriptB).map(t => [t.speaker, t.text]), [
    ['ANA', '¿De verdad pensabas que no me iba a enterar?'],
    ['LUIS', 'No quería hacerte daño. Solo intentaba protegerte.'],
]);

// --- parseScriptTurns: formato NOMBRE: diálogo ---
const scriptA = `Ana: Hola, ¿qué tal?
Luis: Bien, gracias.
Ana: Me alegro.`;
eq('parse A', parseScriptTurns(scriptA).map(t => [t.speaker, t.text]), [
    ['ANA', 'Hola, ¿qué tal?'],
    ['LUIS', 'Bien, gracias.'],
    ['ANA', 'Me alegro.'],
]);

eq('speakersOf', speakersOf(parseScriptTurns(scriptA)), ['ANA', 'LUIS']);
eq('cueOf largo', cueOf('No quería hacerte daño', 3), 'No quería hacerte…');
eq('cueOf corto', cueOf('Hola', 3), 'Hola');

// --- reducer ---
const turns = parseScriptTurns(`ANA
a
LUIS
b
ANA
c
LUIS
d`); // ANA,LUIS,ANA,LUIS
let s = initRehearsal(turns, 'LUIS');
eq('init', [s.phase, s.index], ['idle', 0]);
s = rehearsalReducer(s, { type: 'START' });
eq('START -> speaking ANA', [s.phase, s.index], ['speaking', 0]);
s = rehearsalReducer(s, { type: 'PARTNER_DONE' });
eq('PARTNER_DONE -> awaiting LUIS', [s.phase, s.index], ['awaiting-user', 1]);
const guard = rehearsalReducer(s, { type: 'PARTNER_DONE' });
eq('PARTNER_DONE ignorado en awaiting', [guard.phase, guard.index], ['awaiting-user', 1]);
s = rehearsalReducer(s, { type: 'USER_ADVANCE' });
eq('USER_ADVANCE -> speaking ANA', [s.phase, s.index], ['speaking', 2]);
const rep = rehearsalReducer(s, { type: 'REPEAT' });
eq('REPEAT no mueve índice', [rep.phase, rep.index], ['speaking', 2]);
const prev = rehearsalReducer(s, { type: 'PREV' });
eq('PREV -> awaiting LUIS', [prev.phase, prev.index], ['awaiting-user', 1]);
s = rehearsalReducer(s, { type: 'PARTNER_DONE' });
eq('PARTNER_DONE -> awaiting LUIS (idx3)', [s.phase, s.index], ['awaiting-user', 3]);
s = rehearsalReducer(s, { type: 'USER_ADVANCE' });
eq('USER_ADVANCE -> finished', [s.phase, s.index], ['finished', 4]);
const noop = rehearsalReducer(s, { type: 'REPEAT' });
eq('REPEAT en finished no rompe', [noop.phase, noop.index], ['finished', 4]);
s = rehearsalReducer(s, { type: 'RESTART' });
eq('RESTART -> speaking 0', [s.phase, s.index], ['speaking', 0]);
const sk = rehearsalReducer(s, { type: 'SKIP' });
eq('SKIP avanza', [sk.phase, sk.index], ['awaiting-user', 1]);

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
