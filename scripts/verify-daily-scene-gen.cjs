// Integración: genera la escena del día llamando a Gemini de verdad.
const fs = require('fs');
const path = require('path');
const Module = require('module');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules', 'typescript'));

// Cargar .env / .env.local sin imprimir secretos
for (const f of ['.env', '.env.local']) {
    const p = path.join(root, f);
    if (fs.existsSync(p)) {
        for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
            if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
    }
}

function loadTS(relPath, name) {
    const src = fs.readFileSync(path.join(root, relPath), 'utf8');
    const js = ts.transpileModule(src, { compilerOptions: { module: 'commonjs', target: 'es2019' } }).outputText;
    const m = new Module(name);
    m.filename = path.join(root, relPath);
    m.paths = Module._nodeModulePaths(path.dirname(m.filename));
    // Resolver el alias '@/lib/daily-scene'
    const origReq = m.require.bind(m);
    m.require = (req) => req === '@/lib/daily-scene' ? dailyScene : origReq(req);
    m._compile(js, m.filename);
    return m.exports;
}

const dailyScene = loadTS('src/lib/daily-scene.ts', 'daily-scene');
const { generateDailyScene } = loadTS('src/ai/generate-daily-scene.ts', 'generate-daily-scene');

(async () => {
    const scene = await generateDailyScene('2026-06-10');
    const valid = dailyScene.isValidScene(scene);
    console.log('VALID:', valid);
    console.log('TITLE:', scene.title);
    console.log('CHARACTERS:', scene.characters);
    console.log('LINES:', scene.lines.length);
    console.log('SAMPLE:', scene.lines.slice(0, 3).map(l => `${l.character}: ${l.text}`).join(' | '));
    console.log('IS_FALLBACK:', scene.title === 'La llamada');
    process.exit(valid ? 0 : 1);
})();
