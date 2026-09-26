import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:9002/';

const AUDITORIA = `(() => {
  const lum = (c) => {
    const [r,g,b] = c;
    const f = (v) => { v/=255; return v<=0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
  };
  const parse = (s) => {
    const m = s.match(/rgba?\\(([^)]+)\\)/); if(!m) return null;
    const p = m[1].split(',').map(Number);
    return { rgb:[p[0],p[1],p[2]], a: p.length>3 ? p[3] : 1 };
  };
  const mezcla = (frente, fondo, a) => frente.map((v,i)=> v*a + fondo[i]*(1-a));
  const fondoDe = (el) => {
    let n = el, capas = [];
    while (n && n !== document.documentElement) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0) { capas.push(bg); if (bg.a === 1) break; }
      n = n.parentElement;
    }
    let base = [14,15,16];
    for (let i = capas.length-1; i>=0; i--) base = mezcla(capas[i].rgb, base, capas[i].a);
    return base;
  };
  const fallos = [];
  const vistos = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const texto = Array.from(el.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('');
    if (!texto) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const col = parse(cs.color); if (!col) continue;
    const fondo = fondoDe(el);
    const efectivo = col.a < 1 ? mezcla(col.rgb, fondo, col.a) : col.rgb;
    const L1 = lum(efectivo), L2 = lum(fondo);
    const ratio = (Math.max(L1,L2)+0.05) / (Math.min(L1,L2)+0.05);
    const px = parseFloat(cs.fontSize);
    const peso = parseInt(cs.fontWeight,10) || 400;
    const grande = px >= 24 || (px >= 18.66 && peso >= 700);
    const minimo = grande ? 3 : 4.5;
    if (ratio < minimo) {
      const clave = el.tagName + '|' + texto.slice(0,30) + '|' + Math.round(ratio*10);
      if (vistos.has(clave)) continue; vistos.add(clave);
      fallos.push({ etiqueta: el.tagName.toLowerCase(), clase: (el.className||'').toString().slice(0,60),
        texto: texto.slice(0,46), px: Math.round(px), peso, ratio: Math.round(ratio*100)/100, minimo });
    }
  }

  // Caracteres por línea: se mide de verdad, recorriendo el texto con un Range
  // hasta que la primera línea se rompe. El suelo de calidad pide 65-75.
  const medidas = [];
  for (const el of document.querySelectorAll('.pel-cuerpo')) {
    const n = el.firstChild;
    if (!n || n.nodeType !== 3) continue;
    const t = n.textContent;
    if (t.length < 40) continue;
    const r = document.createRange();
    r.setStart(n, 0); r.setEnd(n, 1);
    const arriba = r.getBoundingClientRect().top;
    let corte = t.length;
    for (let i = 1; i < t.length; i++) {
      r.setStart(n, i); r.setEnd(n, i + 1);
      const b = r.getBoundingClientRect();
      if (b.height && b.top > arriba + 2) { corte = i; break; }
    }
    if (corte < t.length) medidas.push({ chars: corte, texto: t.slice(0, 34) });
  }
  const fuera = medidas.filter(m => m.chars > 78 || m.chars < 45);

  const anchoDoc = document.documentElement.scrollWidth;
  const desbordes = [];
  if (anchoDoc > window.innerWidth + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1 || r.left < -1) {
        desbordes.push({ etiqueta: el.tagName.toLowerCase(), clase:(el.className||'').toString().slice(0,50),
          izq: Math.round(r.left), der: Math.round(r.right) });
      }
    }
  }
  return { fallos, medidas, fuera, anchoDoc, anchoVentana: window.innerWidth, desbordes: desbordes.slice(0,8) };
})()`;

const navegador = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});

for (const [nombre, ancho, alto] of [['escritorio', 1440, 900], ['movil', 390, 844]]) {
  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: ancho, height: alto, deviceScaleFactor: 1 });
  await pagina.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));
  // Recorrer la página entera para que entre todo lo diferido.
  await pagina.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += window.innerHeight * 0.8) { window.scrollTo(0, y); await new Promise(r=>setTimeout(r,180)); }
    window.scrollTo(0, 0); await new Promise(r=>setTimeout(r,400));
  });
  const informe = await pagina.evaluate(AUDITORIA);
  console.log('\\n===== ' + nombre.toUpperCase() + ' (' + ancho + 'x' + alto + ') =====');
  console.log('ancho documento ' + informe.anchoDoc + ' / ventana ' + informe.anchoVentana);
  if (informe.desbordes.length) { console.log('DESBORDES HORIZONTALES:'); console.log(JSON.stringify(informe.desbordes, null, 1)); }
  else console.log('sin desborde horizontal');
  const peor = informe.medidas.length ? Math.max(...informe.medidas.map(m=>m.chars)) : 0;
  console.log('medida de linea: ' + informe.medidas.length + ' parrafos, maximo ' + peor + ' caracteres, fuera de 45-78: ' + informe.fuera.length);
  if (informe.fuera.length) console.log(JSON.stringify(informe.fuera, null, 1));
  if (informe.fallos.length) { console.log('FALLOS DE CONTRASTE (' + informe.fallos.length + '):'); console.log(JSON.stringify(informe.fallos, null, 1)); }
  else console.log('contraste: todo pasa');
  await pagina.screenshot({ path: process.argv[2] + '/tiro-' + nombre + '.png', fullPage: true });
  await pagina.close();
}
await navegador.close();
console.log('\\ncapturas guardadas');
