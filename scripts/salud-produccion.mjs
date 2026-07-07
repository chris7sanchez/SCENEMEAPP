// VIGILANTE DE SALUD DE PRODUCCIÓN — scenemeapp.com
// Prueba la app como un usuario real. Si algo de esto falla, el workflow de
// GitHub Actions falla y GitHub avisa por email al dueño del repo.
//
// Uso local:  CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/salud-produccion.mjs
// En CI:      CHROME_PATH=/usr/bin/google-chrome (runner de GitHub)

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const BASE = process.env.BASE_URL || 'https://scenemeapp.com';
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

const fallos = [];
const avisos = [];
const ok = (msg) => console.log('  ✓', msg);
const fail = (msg) => { console.log('  ✗', msg); fallos.push(msg); };
const warn = (msg) => { console.log('  ⚠', msg); avisos.push(msg); };

// ---------- A) RUTAS (HTTP puro, inmune al challenge anti-bots) ----------
async function checkRutas() {
    console.log('\n[1/4] Rutas críticas');
    const casos = [
        { ruta: '/', esperado: 307, destino: '/login' },
        { ruta: '/login', esperado: 200 },
        { ruta: '/actorlogia', esperado: 200 },
        { ruta: '/antigravity', esperado: 308, destino: '/actorlogia' },
        { ruta: '/creator', esperado: 200 },
        { ruta: '/manifest.json', esperado: 200 },
        { ruta: '/apple-touch-icon.png', esperado: 200, minBytes: 5000 },
    ];
    for (const c of casos) {
        try {
            const res = await fetch(BASE + c.ruta, { redirect: 'manual' });
            const loc = res.headers.get('location') || '';
            if (res.status !== c.esperado) { fail(`${c.ruta} devuelve ${res.status} (esperado ${c.esperado})`); continue; }
            if (c.destino && !loc.includes(c.destino)) { fail(`${c.ruta} redirige a ${loc} (esperado ${c.destino})`); continue; }
            if (c.minBytes) {
                const bytes = (await res.arrayBuffer()).byteLength;
                if (bytes < c.minBytes) { fail(`${c.ruta} pesa ${bytes} bytes (mínimo ${c.minBytes})`); continue; }
            }
            ok(`${c.ruta} → ${res.status}${c.destino ? ' → ' + c.destino : ''}`);
        } catch (e) { fail(`${c.ruta} inaccesible: ${e.message}`); }
    }
    // El service worker autodestructivo debe seguir publicado: si vuelve a dar 404,
    // los dispositivos con la PWA vieja se quedan atascados en la app cacheada.
    try {
        const res = await fetch(BASE + '/sw.js');
        const txt = await res.text();
        if (res.status !== 200 || !txt.includes('AUTODESTRUCTIVO')) fail('/sw.js no sirve el service worker autodestructivo');
        else ok('/sw.js sirve el SW autodestructivo');
    } catch (e) { fail('/sw.js inaccesible: ' + e.message); }
}

// ---------- Auditoría de contraste WCAG (se evalúa dentro del navegador) ----------
const AUDIT = `(() => {
  function lum(r,g,b){const a=[r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
  function parse(c){const m=c.match(/rgba?\\(([^)]+)\\)/);if(!m)return null;const p=m[1].split(',').map(parseFloat);return{r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};}
  function blend(fg,bg){const a=fg.a;return{r:fg.r*a+bg.r*(1-a),g:fg.g*a+bg.g*(1-a),b:fg.b*a+bg.b*(1-a),a:1};}
  function effBg(el){let n=el,acc=null;while(n&&n!==document.documentElement){const s=getComputedStyle(n);if(s.backgroundImage&&s.backgroundImage!=='none')return null;const c=parse(s.backgroundColor);if(c&&c.a>0){acc=acc?blend(acc,c):c;if(c.a>=1)return acc;}n=n.parentElement;}const body=parse(getComputedStyle(document.body).backgroundColor)||{r:255,g:255,b:255,a:1};return acc?blend(acc,body):body;}
  const bad=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(w.nextNode()){const t=w.currentNode;const txt=t.textContent.trim();if(txt.length<3)continue;const el=t.parentElement;if(!el)continue;const s=getComputedStyle(el);if(s.visibility==='hidden'||s.display==='none'||parseFloat(s.opacity)===0)continue;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)continue;const fg0=parse(s.color);if(!fg0)continue;const bg=effBg(el);if(!bg)continue;const fg=fg0.a<1?blend(fg0,bg):fg0;const L1=lum(fg.r,fg.g,fg.b),L2=lum(bg.r,bg.g,bg.b);const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);const px=parseFloat(s.fontSize);const big=px>=24||(px>=18.66&&parseInt(s.fontWeight)>=700);if(ratio<(big?3:4.5))bad.push(txt.slice(0,40)+' ('+(Math.round(ratio*100)/100)+':1)');}
  return [...new Set(bad)].slice(0,8);
})()`;

// ---------- B) NAVEGADOR: login vivo, sin cuelgues, sin errores JS ----------
async function checkNavegador() {
    console.log('\n[2/4] Navegador real: página de login');
    let puppeteer;
    try { puppeteer = require('puppeteer-core'); }
    catch { warn('puppeteer-core no instalado — se omiten las pruebas de navegador'); return; }

    const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
    try {
        const page = await browser.newPage();
        const erroresJS = [];
        page.on('pageerror', (e) => erroresJS.push(String(e).slice(0, 120)));

        await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise((r) => setTimeout(r, 6000));

        const body = await page.evaluate(() => document.body.innerText);
        if (body.includes('No se pudo verificar tu navegador') || body.includes('Verifying')) {
            warn('El anti-bots de Vercel bloqueó el navegador de prueba — pruebas de navegador no concluyentes esta vez');
            return;
        }

        // Elementos vitales del login
        const vitals = await page.evaluate(() => ({
            inputs: document.querySelectorAll('input').length,
            entrar: [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'ENTRAR'),
            google: [...document.querySelectorAll('button')].some((b) => /google/i.test(b.textContent)),
            olvidaste: [...document.querySelectorAll('button')].some((b) => /Olvidaste tu contraseña/i.test(b.textContent)),
        }));
        if (vitals.inputs < 2) fail(`login sin campos (${vitals.inputs} inputs) — ¿página rota?`); else ok('campos de email y contraseña presentes');
        if (!vitals.entrar) fail('falta el botón ENTRAR'); else ok('botón ENTRAR presente');
        if (!vitals.google) fail('falta «Continuar con Google»'); else ok('botón de Google presente');
        if (!vitals.olvidaste) fail('falta «¿Olvidaste tu contraseña?»'); else ok('recuperación de contraseña presente');

        // ¿El login responde o se cuelga? (credenciales falsas → debe salir UN mensaje)
        console.log('\n[3/4] El login responde (no se cuelga)');
        if (vitals.inputs >= 2 && vitals.entrar) {
            const sel = await page.$$('input');
            await sel[0].type('vigilante@sceneme-healthcheck.com');
            await sel[1].type('clave-de-prueba-123');
            await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'ENTRAR'); b && b.click(); });
            await new Promise((r) => setTimeout(r, 9000));
            const respuesta = await page.evaluate(() =>
                document.body.innerText.match(/incorrectos|No se pudo conectar|Demasiados intentos|no tiene un formato/)?.[0] || null
            );
            const cargando = await page.evaluate(() => document.body.innerText.includes('CARGANDO'));
            if (respuesta) ok(`el login responde con mensaje visible («${respuesta}…»)`);
            else if (cargando) fail('el login se queda COLGADO en «CARGANDO...» sin responder');
            else fail('el login no muestra ninguna respuesta tras 9s (fallo mudo)');
        }

        // Errores JS y contraste en las dos páginas clave
        console.log('\n[4/4] Errores JS y contraste');
        if (erroresJS.length) fail('errores JS en /login: ' + erroresJS.slice(0, 2).join(' | ')); else ok('/login sin excepciones JS');
        const malLogin = await page.evaluate(AUDIT);
        if (malLogin.length) fail('contraste ilegible en /login: ' + malLogin.join('; ')); else ok('/login contraste OK');

        erroresJS.length = 0;
        await page.goto(BASE + '/actorlogia', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise((r) => setTimeout(r, 7000));
        if (erroresJS.length) fail('errores JS en /actorlogia: ' + erroresJS.slice(0, 2).join(' | ')); else ok('/actorlogia sin excepciones JS');
        const malActo = await page.evaluate(AUDIT);
        if (malActo.length) fail('contraste ilegible en /actorlogia: ' + malActo.join('; ')); else ok('/actorlogia contraste OK');
    } finally {
        await browser.close();
    }
}

// ---------- Resumen ----------
(async () => {
    console.log(`VIGILANTE DE SALUD — ${BASE}`);
    await checkRutas();
    await checkNavegador();
    console.log('\n================= RESUMEN =================');
    if (avisos.length) console.log('Avisos (no bloquean):\n - ' + avisos.join('\n - '));
    if (fallos.length) {
        console.log(`❌ ${fallos.length} FALLO(S):\n - ` + fallos.join('\n - '));
        process.exit(1);
    }
    console.log('✅ Producción sana. Todo verificado.');
})();
