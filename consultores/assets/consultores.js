// JAS Consultores: contadores que suben al entrar en pantalla
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

// JAS Consultores: portada con malla de terreno que cambia de relieve con el mouse y el scroll
(function () {
var cv = document.querySelector('.terrain');
if (!cv || !cv.getContext) { return; }
var ctx = cv.getContext('2d');
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var W = 0, H = 0, dpr = 1, f = 1, cx = 0, hy = 0;
var CAMH = 3.4, ZN = 2.4, ZF = 17, COLS = 104, ROWS = 58, XMAX = 10;
var mx = null, my = null, tmx = 0, tmz = 5, hx = 0, hz = 5, amp = 0, tamp = 0, ph = 0, tph = 0, visible = true, last = 0;
var pts = [];
function size() {
var r = cv.getBoundingClientRect();
dpr = Math.min(window.devicePixelRatio || 1, 2);
W = r.width; H = r.height;
cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
f = H * 1.05; cx = W * 0.5; hy = H * 0.02;
XMAX = (W / 2) * ZF / f * 1.08;
}
function height(x, z, t) {
var y = 0.75 * Math.sin(x * 0.26 + t * 0.12 + ph) * Math.cos(z * 0.34 - t * 0.08 + ph * 0.6)
+ 0.38 * Math.sin(x * 0.55 - z * 0.27 + t * 0.1 + ph * 1.4)
+ 0.12 * Math.sin(x * 1.1 + z * 0.8 - t * 0.16);
var dx = x - hx, dz = z - hz;
y += amp * Math.exp(-(dx * dx + dz * dz) / 5.5);
return y;
}
function draw(now) {
var t = now / 1000, i, j, k;
ctx.clearRect(0, 0, W, H);
for (j = 0; j <= ROWS; j++) {
var zz = ZN + (ZF - ZN) * Math.pow(j / ROWS, 1.6);
var row = pts[j] || (pts[j] = []);
for (i = 0; i <= COLS; i++) {
var x = -XMAX + 2 * XMAX * i / COLS;
var y = height(x, zz, t);
var p = row[i] || (row[i] = [0, 0, 0]);
p[0] = cx + x * f / zz; p[1] = hy + (CAMH - y) * f / zz;
var dx = x - hx, dz = zz - hz; p[2] = Math.exp(-(dx * dx + dz * dz) / 4) * amp;
}
}
ctx.lineWidth = 1;
for (j = ROWS; j >= 0; j--) {
var a = 0.06 + 0.42 * Math.pow(1 - j / ROWS, 1.3);
ctx.strokeStyle = 'rgba(232,228,220,' + a.toFixed(3) + ')';
ctx.beginPath();
var r0 = pts[j], r1 = pts[j - 1];
for (i = 0; i < COLS; i++) {
ctx.moveTo(r0[i][0], r0[i][1]); ctx.lineTo(r0[i + 1][0], r0[i + 1][1]);
if (r1) { ctx.moveTo(r0[i][0], r0[i][1]); ctx.lineTo(r1[i][0], r1[i][1]); ctx.moveTo(r0[i + 1][0], r0[i + 1][1]); ctx.lineTo(r1[i][0], r1[i][1]); }
}
if (r1) { ctx.moveTo(r0[COLS][0], r0[COLS][1]); ctx.lineTo(r1[COLS][0], r1[COLS][1]); }
ctx.stroke();
}
// brillo azul de marca donde el relieve responde al mouse
if (amp > 0.05) {
ctx.strokeStyle = 'rgba(143,166,203,0.9)';
for (j = 1; j <= ROWS; j++) {
var q0 = pts[j], q1 = pts[j - 1];
for (i = 0; i < COLS; i++) {
var g = q0[i][2];
if (g < 0.18) { continue; }
ctx.globalAlpha = Math.min(1, g * 1.2);
ctx.beginPath(); ctx.moveTo(q0[i][0], q0[i][1]); ctx.lineTo(q0[i + 1][0], q0[i + 1][1]);
ctx.moveTo(q0[i][0], q0[i][1]); ctx.lineTo(q1[i][0], q1[i][1]); ctx.stroke();
}
}
ctx.globalAlpha = 1;
}
}
function frame(now) {
requestAnimationFrame(frame);
if (!visible) { return; }
if (mx !== null && now - last < 3000) {
if (my > hy + 4) {
var z = (CAMH - 0.3) * f / (my - hy);
tmz = Math.max(ZN + 2.2, Math.min(ZF - 2, z)); tmx = (mx - cx) * tmz / f;
}
tamp = 1.1;
} else {
var s = now / 1000;
tmx = 2.5 + Math.sin(s * 0.17) * 3.5; tmz = 7 + Math.sin(s * 0.11) * 2; tamp = 0.8;
}
hx += (tmx - hx) * 0.06; hz += (tmz - hz) * 0.06; amp += (tamp - amp) * 0.04;
tph = (window.scrollY || 0) * 0.004 + (mx === null ? 0 : (mx / W - 0.5) * 0.9);
ph += (tph - ph) * 0.05;
draw(now);
}
window.addEventListener('mousemove', function (e) {
var r = cv.getBoundingClientRect();
if (e.clientY < r.top || e.clientY > r.bottom) { return; }
mx = e.clientX - r.left; my = e.clientY - r.top; last = performance.now();
});
window.addEventListener('resize', function () { size(); if (reduce) { draw(0); } });
if (window.IntersectionObserver) { new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv); }
size();
if (reduce) { amp = 0; draw(0); } else { requestAnimationFrame(frame); }
})();
