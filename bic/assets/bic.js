// BIC: contadores que suben al entrar en pantalla
(function () {
var els = document.querySelectorAll('.cnt[data-to]');
if (!els.length) { return; }
var fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduce || !window.IntersectionObserver) { return; }
var run = function (el) {
var to = parseFloat(el.getAttribute('data-to')), t0 = performance.now(), D = 1600;
var step = function (now) {
var k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
el.textContent = fmt(to * e);
if (k < 1) { requestAnimationFrame(step); }
};
requestAnimationFrame(step);
};
var io = new IntersectionObserver(function (es) {
es.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); run(en.target); } });
}, { threshold: 0.6 });
for (var i = 0; i < els.length; i++) { els[i].textContent = '0'; io.observe(els[i]); }
})();


// BIC: portada con anillos tangentes en 3D atravesados por un eje, que giran con el mouse y el scroll
(function () {
var cvs = document.querySelectorAll('.rings');
if (!cvs.length) { return; }
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// radios relativos: 3 anillos principales (como en el brochure) y anillos de apoyo más tenues
var RINGS = [
{ r: 1, a: 0.62, s: 0 }, { r: 0.73, a: 0.62, s: 1, tq: 1 }, { r: 0.445, a: 0.62, s: 2 },
{ r: 1.18, a: 0.14, s: -0.6 }, { r: 0.87, a: 0.16, s: 0.5 }, { r: 0.6, a: 0.16, s: 1.5 }, { r: 0.3, a: 0.18, s: 2.6 }
];
var SEG = 150;
var U = [0.64, -0.77], TT = [0.77, 0.64]; // eje (hacia arriba a la derecha) y tangente común en pantalla
function setup(cv) {
var ctx = cv.getContext('2d');
var st = { W: 0, H: 0, dpr: 1, R: 200, Tx: 0, Ty: 0, mx: null, my: null, last: 0, yaw: 0, pitch: 0, spread: 0, ty: 0, tp: 0, ts: 0, visible: true };
function size() {
var b = cv.getBoundingClientRect();
st.dpr = Math.min(window.devicePixelRatio || 1, 2);
st.W = b.width; st.H = b.height;
cv.width = Math.round(st.W * st.dpr); cv.height = Math.round(st.H * st.dpr);
ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
var narrow = st.W < 900;
st.R = narrow ? Math.min(st.W * 0.42, 230) : Math.min(st.H * 0.34, st.W * 0.19, 300);
st.Tx = narrow ? st.W * 0.92 : st.W * 0.86;
st.Ty = narrow ? st.H * 0.16 : st.H * 0.2;
}
// rota un vector 3D: primero inclinación de cada anillo alrededor de la tangente, luego giro global
function rotAxis(v, k, ang) {
var c = Math.cos(ang), s = Math.sin(ang), d = v[0] * k[0] + v[1] * k[1] + v[2] * k[2];
var cx = k[1] * v[2] - k[2] * v[1], cy = k[2] * v[0] - k[0] * v[2], cz = k[0] * v[1] - k[1] * v[0];
return [v[0] * c + cx * s + k[0] * d * (1 - c), v[1] * c + cy * s + k[1] * d * (1 - c), v[2] * c + cz * s + k[2] * d * (1 - c)];
}
function glob(v) {
var cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
var x = v[0] * cy + v[2] * sy, z = -v[0] * sy + v[2] * cy;
var y = v[1] * cp - z * sp; z = v[1] * sp + z * cp;
return [x, y, z];
}
function proj(v) {
var D = 5.2, k = D / (D + v[2]);
return [st.Tx + v[0] * st.R * k, st.Ty + v[1] * st.R * k, v[2]];
}
function draw(now) {
var t = now / 1000, i, j;
var W = st.W, H = st.H;
ctx.clearRect(0, 0, W, H);
var u = [U[0], U[1], 0], tg = [TT[0], TT[1], 0];
// eje que atraviesa los anillos
var e0 = proj(glob([u[0] * 0.75, u[1] * 0.75, 0])), e1 = proj(glob([-u[0] * 7, -u[1] * 7, 0]));
ctx.lineWidth = 1;
ctx.strokeStyle = 'rgba(245,246,245,0.5)';
ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.stroke();
var mx = st.mx, my = st.my, act = mx !== null && now - st.last < 2500;
var far = null, scan = null;
for (j = 0; j < RINGS.length; j++) {
var R = RINGS[j];
var phi = R.s * st.spread + (reduce ? 0 : 0.06 * Math.sin(t * 0.4 + j));
var uk = rotAxis(u, tg, phi);
var pts = [];
for (i = 0; i <= SEG; i++) {
var th = i / SEG * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
// punto del anillo: centro = -r·uk, tangente común en el origen
var p = [-R.r * uk[0] + R.r * (c * uk[0] + s * tg[0]), -R.r * uk[1] + R.r * (c * uk[1] + s * tg[1]), -R.r * uk[2] + R.r * (c * uk[2] + s * tg[2])];
pts.push(proj(glob(p)));
}
if (j === 2) { far = pts[Math.round(SEG / 2)]; }
if (j === 0) { scan = pts[Math.floor(((t * 0.05) % 1) * SEG)]; }
for (i = 0; i < SEG; i++) {
var a = pts[i], b = pts[i + 1];
var depth = 0.55 + 0.45 * Math.max(-1, Math.min(1, -(a[2] + b[2]) * 0.6));
var al = R.a * depth, col = '245,246,245';
if (R.tq) { col = '98,191,180'; al = Math.min(1, al * 1.25); }
if (act) {
var dx = (a[0] + b[0]) / 2 - mx, dy = (a[1] + b[1]) / 2 - my, d2 = dx * dx + dy * dy;
if (d2 < 22000) { var g = 1 - d2 / 22000; col = '98,191,180'; al = Math.max(al, 0.35 + 0.6 * g); }
}
ctx.strokeStyle = 'rgba(' + col + ',' + al.toFixed(3) + ')';
ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
}
}
// punto de tangencia, punto blanco del eje y punto turquesa que recorre el anillo mayor
var o = proj(glob([0, 0, 0]));
ctx.fillStyle = '#62BFB4';
ctx.beginPath(); ctx.arc(o[0], o[1], 3.5, 0, Math.PI * 2); ctx.fill();
if (scan) { ctx.beginPath(); ctx.arc(scan[0], scan[1], 3, 0, Math.PI * 2); ctx.fill(); }
if (far) {
ctx.fillStyle = '#F5F6F5';
ctx.beginPath(); ctx.arc(far[0], far[1], Math.max(7, st.R * 0.05), 0, Math.PI * 2); ctx.fill();
}
}
function frame(now) {
requestAnimationFrame(frame);
if (!st.visible) { return; }
var sc = (window.scrollY || 0) / Math.max(1, st.H);
if (st.mx !== null && now - st.last < 2500) {
st.ty = (st.mx / st.W - 0.5) * 1.3;
st.tp = (st.my / st.H - 0.5) * -0.9;
st.ts = 0.25 + Math.abs(st.mx / st.W - 0.6) * 0.9;
} else {
var s = now / 1000;
st.ty = Math.sin(s * 0.21) * 0.45; st.tp = Math.sin(s * 0.15) * 0.25; st.ts = 0.32 + Math.sin(s * 0.12) * 0.18;
}
st.ty += sc * 0.9; st.ts += sc * 0.5;
st.yaw += (st.ty - st.yaw) * 0.05; st.pitch += (st.tp - st.pitch) * 0.05; st.spread += (st.ts - st.spread) * 0.05;
draw(now);
}
window.addEventListener('mousemove', function (e) {
var b = cv.getBoundingClientRect();
if (e.clientY < b.top || e.clientY > b.bottom) { return; }
st.mx = e.clientX - b.left; st.my = e.clientY - b.top; st.last = performance.now();
});
window.addEventListener('resize', function () { size(); if (reduce) { draw(0); } });
if (window.IntersectionObserver) { new IntersectionObserver(function (es) { st.visible = es[0].isIntersecting; }).observe(cv); }
size();
if (reduce) { st.yaw = 0.35; st.pitch = 0.15; st.spread = 0.4; draw(0); } else { requestAnimationFrame(frame); }
}
for (var n = 0; n < cvs.length; n++) { if (cvs[n].getContext) { setup(cvs[n]); } }
})();

// Transición a Contacto: un panel turquesa baja desde arriba, cubre la pantalla y luego revela la página
(function () {
var TQ = '#62BFB4', D = 650;
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function panel(from) {
var el = document.createElement('div');
el.setAttribute('aria-hidden', 'true');
el.style.cssText = 'position:fixed;inset:0;z-index:200;background:' + TQ + ';pointer-events:none;transform:translateY(' + from + ');transition:transform ' + D + 'ms cubic-bezier(.76,0,.24,1);will-change:transform';
document.body.appendChild(el);
return el;
}
var flag = false;
try { flag = sessionStorage.getItem('bic-to-contacto') === '1'; sessionStorage.removeItem('bic-to-contacto'); } catch (e) {}
if (flag && !reduce) {
var cover = panel('0');
requestAnimationFrame(function () { requestAnimationFrame(function () { cover.style.transform = 'translateY(100%)'; }); });
setTimeout(function () { if (cover.parentNode) { cover.parentNode.removeChild(cover); } }, D + 100);
}
var links = document.querySelectorAll('a[href="contacto.html"]');
for (var i = 0; i < links.length; i++) {
links[i].addEventListener('click', function (ev) {
if (this.getAttribute('data-go') === '1') { this.removeAttribute('data-go'); return; }
if (reduce || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button) { return; }
ev.preventDefault();
var a = this;
var el = panel('-100%');
requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.transform = 'translateY(0)'; }); });
try { sessionStorage.setItem('bic-to-contacto', '1'); } catch (e) {}
setTimeout(function () { a.setAttribute('data-go', '1'); a.click(); }, D);
setTimeout(function () { if (el.parentNode) { el.parentNode.removeChild(el); } try { sessionStorage.removeItem('bic-to-contacto'); } catch (e) {} }, D + 1500);
});
}
window.addEventListener('pageshow', function (e) {
if (!e.persisted) { return; }
var olds = document.querySelectorAll('div[aria-hidden="true"][style*="z-index:200"]');
for (var k = 0; k < olds.length; k++) { olds[k].parentNode.removeChild(olds[k]); }
});
})();
// BIC: torre BIM isométrica que se construye por etapas al bajar por "Nuestros servicios"
(function () {
var sec = document.querySelector('.tw');
if (!sec) { return; }
var cv = sec.querySelector('.tw-cv');
if (!cv || !cv.getContext) { return; }
var ctx = cv.getContext('2d');
var blocks = sec.querySelectorAll('.tw-b'), rail = sec.querySelectorAll('.tw-rail li');
var el = function (c) { return sec.querySelector(c); };
var hSt = el('.tw-st'), hLod = el('.tw-lod'), hPct = el('.tw-pct'), hPk = el('.tw-pk'), hTr = el('.tw-tr'), hBar = el('.tw-bar i');
var ROM = ['I', 'II', 'III', 'IV', 'V'];
var ST = [['LOD 100', 'Planificación'], ['LOD 200', 'Diseño y licitación'], ['LOD 300', 'Construcción'], ['LOD 500', 'Levantamiento as-built'], ['LOD 500 · 7D', 'Operación']];
var G = '28,29,31', TQ = '98,191,180';
var WB = 3, DB = 2, N = 15, FH = 0.34, H = N * FH, C = 0.866, S = 0.5;
var W = 0, Hh = 0, s = 40, ox = 0, oy = 0, t = 0, tt = 0, vis = true, last = -1;
// nube de puntos sobre fachadas y techo
var pts = [], seed = 7;
function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
for (var q = 0; q < 900; q++) {
var r = rnd(), z = rnd() * H;
if (r < 0.45) { pts.push([rnd() * WB, DB, z]); } else if (r < 0.85) { pts.push([WB, rnd() * DB, z]); } else { pts.push([rnd() * WB, rnd() * DB, H]); }
}
var TAGS = [[WB * 0.7, DB * 0.4, H + 0.3, 'HVAC-01'], [WB, DB * 0.5, H * 0.62, 'Ascensor A'], [WB * 0.3, DB, H * 0.18, 'Tablero E-3'], [WB, DB * 0.15, H * 0.33, 'Bomba P-2'], [WB * 0.55, DB, H * 0.86, 'Fachada F-12']];
function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function ease(v) { return 1 - Math.pow(1 - v, 3); }
function P(x, y, z) { return [ox + (x - y) * C * s, oy + (x + y) * S * s - z * s]; }
function line(a, b, col, w, dash) {
ctx.strokeStyle = col; ctx.lineWidth = w || 1; ctx.setLineDash(dash || []);
ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
}
function poly(ps, fill, stroke, w) {
ctx.setLineDash([]);
ctx.beginPath(); ctx.moveTo(ps[0][0], ps[0][1]);
for (var i = 1; i < ps.length; i++) { ctx.lineTo(ps[i][0], ps[i][1]); }
ctx.closePath();
if (fill) { ctx.fillStyle = fill; ctx.fill(); }
if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w || 1; ctx.stroke(); }
}
function box(x0, y0, z0, x1, y1, z1, fl, fr, ft, st) {
poly([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], fl, st);
poly([P(x1, y1, z0), P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1)], fr, st);
poly([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], ft, st);
}
function size() {
var hd = document.querySelector('header'); if (hd) { sec.style.setProperty('--hh', hd.offsetHeight + 'px'); }
var b = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
W = b.width; Hh = b.height;
cv.width = Math.round(W * d); cv.height = Math.round(Hh * d);
ctx.setTransform(d, 0, 0, d, 0, 0);
var m = 2.6;
s = Math.min(W * 0.78 / ((WB + DB + m) * C), Hh * 0.8 / ((WB + DB + m) * S + H + 0.4));
ox = W / 2 - ((WB - DB) / 2) * C * s;
oy = Hh / 2 - (((WB + DB) * S - H) / 2) * s + 6;
}
function target() {
if (!blocks.length) { return 0; }
var vh = window.innerHeight, b0 = blocks[0].getBoundingClientRect(), bh = b0.height || vh;
var anc = window.innerWidth < 900 ? 0.92 : 0.62;
return Math.max(0, Math.min(5, (vh * anc - b0.top) / bh));
}
function draw() {
ctx.clearRect(0, 0, W, Hh);
var p1 = cl(t), p2 = cl(t - 1), p3 = cl(t - 2), p4 = cl(t - 3), p5 = cl(t - 4);
var i, j, k, a, b;
// I. ejes del proyecto con burbujas (A–E, 1–4) y huella del edificio
var ext = 1.3;
for (i = 0; i <= WB; i++) {
var f = ease(cl(p1 * 1.8 - i * 0.12));
if (f <= 0) { continue; }
a = P(i, -ext, 0); b = P(i, -ext + (DB + 2 * ext) * f, 0);
line(a, b, 'rgba(' + G + ',0.32)', 1, [10, 4, 2, 4]);
if (f > 0.95) { bub(P(i, DB + ext + 0.28, 0), 'ABCDEF'[i]); }
}
for (j = 0; j <= DB; j++) {
var g = ease(cl(p1 * 1.8 - 0.3 - j * 0.12));
if (g <= 0) { continue; }
a = P(-ext, j, 0); b = P(-ext + (WB + 2 * ext) * g, j, 0);
line(a, b, 'rgba(' + G + ',0.32)', 1, [10, 4, 2, 4]);
if (g > 0.95) { bub(P(WB + ext + 0.28, j, 0), String(j + 1)); }
}
if (p1 > 0.4) {
var fa = cl((p1 - 0.4) / 0.6);
poly([P(0, 0, 0), P(WB, 0, 0), P(WB, DB, 0), P(0, DB, 0)], 'rgba(' + TQ + ',' + (0.14 * fa) + ')', null);
ctx.setLineDash([5, 4]); poly([P(0, 0, 0), P(WB, 0, 0), P(WB, DB, 0), P(0, DB, 0)], null, 'rgba(' + TQ + ',' + fa + ')', 1.4);
}
// II. volumen de diseño (envolvente) y estructura
if (p2 > 0) {
var ea = 0.45 * cl(p2 * 2) * (1 - 0.6 * p3);
var c8 = [[0, 0], [WB, 0], [WB, DB], [0, DB]];
for (i = 0; i < 4; i++) {
var c1 = c8[i], c2 = c8[(i + 1) % 4];
line(P(c1[0], c1[1], H), P(c2[0], c2[1], H), 'rgba(' + TQ + ',' + ea + ')', 1, [4, 4]);
line(P(c1[0], c1[1], 0), P(c1[0], c1[1], H), 'rgba(' + TQ + ',' + ea + ')', 1, [4, 4]);
}
for (i = 0; i <= WB; i++) {
for (j = 0; j <= DB; j++) {
var hc = H * ease(cl(p2 * 1.7 - (i + j) * 0.07));
if (hc > 0) { line(P(i, j, 0), P(i, j, hc), 'rgba(' + G + ',0.55)', 1.2); }
}
}
// losas en alambre a medida que sube la estructura
var nl = Math.floor(N * ease(cl(p2 * 1.4 - 0.3)));
for (k = 1; k <= nl; k++) { poly([P(0, 0, k * FH), P(WB, 0, k * FH), P(WB, DB, k * FH), P(0, DB, k * FH)], null, 'rgba(' + G + ',0.16)', 1); }
}
// III. construcción: pisos que se cierran uno a uno, con grúa
var built = 0;
if (p3 > 0) {
for (k = 0; k < N; k++) {
var fk = cl(p3 * N - k);
if (fk <= 0) { break; }
var z0 = k * FH, z1 = z0 + fk * FH; built = z1;
box(0, 0, z0, WB, DB, z1, '#E6EAEA', '#D4DADA', null, 'rgba(' + G + ',0.55)');
// montantes de fachada
for (var mx = 0.5; mx < WB; mx += 0.5) { line(P(mx, DB, z0), P(mx, DB, z1), 'rgba(' + G + ',0.18)', 1); }
for (var my = 0.5; my < DB; my += 0.5) { line(P(WB, my, z0), P(WB, my, z1), 'rgba(' + G + ',0.18)', 1); }
if (fk < 1 || k === N - 1) {
poly([P(0, 0, z1), P(WB, 0, z1), P(WB, DB, z1), P(0, DB, z1)], fk < 1 ? 'rgba(' + TQ + ',0.55)' : '#FBFBFB', 'rgba(' + G + ',0.55)');
}
}
// grúa torre
var ca = cl(p3 * 4) * (1 - cl(p4 * 3));
if (ca > 0) {
var gx = -0.7, gy = -0.6, gh = Math.max(built, H * 0.3) + 1.1;
var m0 = P(gx, gy, 0), m1 = P(gx, gy, gh);
line(m0, m1, 'rgba(' + G + ',' + (0.7 * ca) + ')', 2);
line(P(gx + 0.12, gy, 0), P(gx + 0.12, gy, gh), 'rgba(' + G + ',' + (0.35 * ca) + ')', 1);
var jb = P(gx + 3.4, gy, gh), cj = P(gx - 1, gy, gh);
line(cj, jb, 'rgba(' + G + ',' + (0.7 * ca) + ')', 2);
line(P(gx, gy, gh + 0.5), jb, 'rgba(' + G + ',' + (0.35 * ca) + ')', 1);
line(P(gx, gy, gh + 0.5), cj, 'rgba(' + G + ',' + (0.35 * ca) + ')', 1);
var hx = gx + 1.1 + 1.9 * (0.5 + 0.5 * Math.sin(p3 * 9));
var hk = P(hx, gy, gh), ld = P(hx, gy, built + 0.25);
line(hk, ld, 'rgba(' + TQ + ',' + ca + ')', 1);
poly([P(hx - 0.15, gy - 0.15, built + 0.25), P(hx + 0.15, gy - 0.15, built + 0.25), P(hx + 0.15, gy + 0.15, built + 0.25), P(hx - 0.15, gy + 0.15, built + 0.25)], 'rgba(' + TQ + ',' + ca + ')', null);
}
}
// IV. escaneo láser: plano que baja y deja la nube de puntos
if (p4 > 0) {
var zs = H + 0.2 - (H + 0.4) * p4;
var pa = p5 > 0 ? 0.55 - 0.25 * p5 : 0.85;
ctx.fillStyle = 'rgba(' + TQ + ',' + pa + ')';
for (i = 0; i < pts.length; i++) {
if (pts[i][2] < zs) { continue; }
var pp = P(pts[i][0], pts[i][1], pts[i][2]);
ctx.fillRect(pp[0] - 0.9, pp[1] - 0.9, 1.8, 1.8);
}
if (p4 < 1) {
var e = 0.5;
poly([P(-e, -e, zs), P(WB + e, -e, zs), P(WB + e, DB + e, zs), P(-e, DB + e, zs)], 'rgba(' + TQ + ',0.16)', 'rgba(' + TQ + ',0.9)', 1.2);
}
}
// V. operación: equipos en techo, contorno y etiquetas de activos
if (p5 > 0) {
var ra = cl(p5 * 3);
ctx.globalAlpha = ra;
box(WB * 0.55, DB * 0.25, H, WB * 0.85, DB * 0.55, H + 0.3, '#DCE1E1', '#C9D0D0', '#F2F4F4', 'rgba(' + G + ',0.6)');
box(WB * 0.15, DB * 0.55, H, WB * 0.35, DB * 0.85, H + 0.22, '#DCE1E1', '#C9D0D0', '#F2F4F4', 'rgba(' + G + ',0.6)');
ctx.globalAlpha = 1;
var oa = 0.9 * ra;
poly([P(0, DB, 0), P(WB, DB, 0), P(WB, 0, 0), P(WB, 0, H), P(0, 0, H), P(0, DB, H)], null, 'rgba(' + TQ + ',' + oa + ')', 1.6);
line(P(WB, DB, 0), P(WB, DB, H), 'rgba(' + TQ + ',' + oa + ')', 1.6);
line(P(WB, DB, H), P(WB, 0, H), 'rgba(' + TQ + ',' + oa + ')', 1.6);
line(P(WB, DB, H), P(0, DB, H), 'rgba(' + TQ + ',' + oa + ')', 1.6);
ctx.font = '500 10px "JetBrains Mono", monospace';
for (i = 0; i < TAGS.length; i++) {
var ta = cl(p5 * 6 - i * 0.9);
if (ta <= 0) { continue; }
var tg = TAGS[i], q0 = P(tg[0], tg[1], tg[2]);
var right = q0[0] > ox - 10, dx = right ? 56 : -56, dy = -26 - (i % 2) * 14;
var q1 = [q0[0] + dx * ease(ta), q0[1] + dy * ease(ta)];
ctx.globalAlpha = ta;
line(q0, q1, 'rgba(' + G + ',0.7)', 1);
ctx.fillStyle = '#62BFB4'; ctx.beginPath(); ctx.arc(q0[0], q0[1], 3.5, 0, Math.PI * 2); ctx.fill();
var tw = ctx.measureText(tg[3]).width + 16, bx = right ? q1[0] : q1[0] - tw;
ctx.fillStyle = '#1C1D1F'; ctx.fillRect(bx, q1[1] - 10, tw, 20);
ctx.fillStyle = '#62BFB4'; ctx.fillText(tg[3], bx + 8, q1[1] + 3.5);
ctx.globalAlpha = 1;
}
}
ctx.setLineDash([]);
}
function bub(p, txt) {
ctx.setLineDash([]);
ctx.fillStyle = '#F5F6F5'; ctx.strokeStyle = 'rgba(' + TQ + ',1)'; ctx.lineWidth = 1.2;
ctx.beginPath(); ctx.arc(p[0], p[1], 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
ctx.fillStyle = '#1C1D1F'; ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
ctx.fillText(txt, p[0], p[1] + 3.5); ctx.textAlign = 'left';
}
function hud() {
var k = Math.min(4, Math.floor(t + 0.0001));
if (k !== last) {
last = k;
for (var i = 0; i < blocks.length; i++) { blocks[i].classList.toggle('on', i === Math.min(4, Math.floor(tt))); }
for (var r = 0; r < rail.length; r++) { rail[r].classList.toggle('on', r === k); }
if (hSt) { hSt.textContent = 'Etapa ' + ROM[k] + ' · ' + ST[k][1]; }
if (hLod) { hLod.textContent = ST[k][0]; }
}
for (var b = 0; b < blocks.length; b++) { blocks[b].classList.toggle('on', b === Math.min(4, Math.floor(tt))); }
var pk = '', pv = '';
if (k <= 1) { pk = 'Ejes y estructura'; pv = Math.round(cl(t / 2) * 100) + '%'; }
else if (k === 2) { pk = 'Avance de obra'; pv = Math.round(cl(t - 2) * 100) + '%'; }
else if (k === 3) { pk = 'Puntos capturados'; pv = (Math.round(cl(t - 3) * 1240) / 100).toFixed(1).replace('.', ',') + ' M'; }
else { pk = 'Activos registrados'; pv = String(Math.round(cl(t - 4) * 248)); }
if (hPk) { hPk.textContent = pk; }
if (hPct) { hPct.textContent = pv; }
if (hBar) { hBar.style.width = (t / 5 * 100).toFixed(2) + '%'; }
}
function frame() {
requestAnimationFrame(frame);
if (!vis) { return; }
tt = target();
var nt = t + (tt - t) * 0.12;
if (Math.abs(nt - t) < 0.0005 && last !== -1 && W) { return; }
t = Math.abs(tt - nt) < 0.001 ? tt : nt;
draw(); hud();
}
window.addEventListener('resize', function () { size(); draw(); });
if (window.IntersectionObserver) { new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(sec); }
size(); t = tt = target(); draw(); hud();
requestAnimationFrame(frame);
if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { draw(); }); }
})();
// JACA·BOX: explorador de módulos (rota solo, se pausa al pasar el mouse) y flujo RDI que avanza con el scroll
(function () {
var ex = document.querySelector('.jb-ex');
if (ex) {
var tabs = ex.querySelectorAll('.jb-tab'), panes = ex.querySelectorAll('.jb-pane'), cur = 0, timer = null, paused = false;
var show = function (i) {
cur = i;
for (var k = 0; k < tabs.length; k++) {
var on = k === i;
tabs[k].classList.toggle('on', on); tabs[k].setAttribute('aria-selected', on ? 'true' : 'false');
if (panes[k]) { panes[k].classList.toggle('on', on); }
}
var bar = tabs[i].querySelector('i');
if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
};
var tick = function () { if (!paused) { show((cur + 1) % tabs.length); } };
for (var t = 0; t < tabs.length; t++) {
tabs[t].addEventListener('click', function () { show(+this.getAttribute('data-i')); clearInterval(timer); timer = setInterval(tick, 6000); });
}
ex.addEventListener('mouseenter', function () { paused = true; ex.classList.add('paused'); });
ex.addEventListener('mouseleave', function () { paused = false; ex.classList.remove('paused'); });
timer = setInterval(tick, 6000);
}
var st = document.querySelector('.jb-steps');
if (st) {
var lis = st.querySelectorAll('li');
var upd = function () {
var r = st.getBoundingClientRect(), vh = window.innerHeight;
var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.55)));
st.style.setProperty('--jp', (p * 100).toFixed(1) + '%');
for (var i = 0; i < lis.length; i++) { lis[i].classList.toggle('on', p >= i / (lis.length - 1) - 0.001); }
};
window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
}
})();
