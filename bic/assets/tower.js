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
var anc = window.innerWidth < 900 ? 0.8 : 0.62;
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
