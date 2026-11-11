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
