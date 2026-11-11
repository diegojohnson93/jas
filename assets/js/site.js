// Cursor: punto + anillo que sigue al mouse
(function () {

var ring = document.querySelector('.cur');
var dot = document.querySelector('.cur-dot');
if (!ring || !dot || !window.matchMedia || window.matchMedia('(pointer:coarse)').matches) { return; }
var x = 0, y = 0, rx = 0, ry = 0;
var mv = function (e) {
x = e.clientX; y = e.clientY;
ring.classList.add('on'); dot.classList.add('on');
dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
var t = e.target && e.target.closest ? e.target.closest('a,button,summary,input,select,textarea') : null;
ring.classList.toggle('hov', !!t);
var l = e.target && e.target.closest ? e.target.closest('[data-cur]') : null;
ring.classList.toggle('lbl', !!l);
};
var lv = function () {
ring.classList.remove('on'); dot.classList.remove('on');
};
document.addEventListener('mousemove', mv);
document.documentElement.addEventListener('mouseleave', lv);
var tick = function () {
rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
requestAnimationFrame(tick);
};
tick();
})();

// Portada: malla que se hunde en 3D siguiendo al mouse con 100 px de desfase
(function () {
var cv = document.querySelector('.mesh');
if (!cv || !cv.getContext) { return; }
var ctx = cv.getContext('2d');
var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var W = 0, H = 0, dpr = 1;
var GAP = 44, STEP = 11, LAG = 100, SIGMA = 175, PULL = 0.58, DROP = 78;
var mx = null, my = null, sx = 0, sy = 0, depth = 0, t0 = 0, visible = true, last = 0;
function size() {
var r = cv.getBoundingClientRect();
dpr = Math.min(window.devicePixelRatio || 1, 2);
W = r.width; H = r.height;
cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
if (mx === null) { sx = W * 0.72; sy = H * 0.45; }
}
function warp(x, y, out) {
var dx = x - sx, dy = y - sy;
var g = Math.exp(-(dx * dx + dy * dy) / (2 * SIGMA * SIGMA)) * depth;
out[0] = x - dx * PULL * g;
out[1] = y - dy * PULL * g + DROP * g;
out[2] = g;
}
var p = [0, 0, 0], q = [0, 0, 0];
function seg(x1, y1, x2, y2) {
warp(x1, y1, p); warp(x2, y2, q);
var g = (p[2] + q[2]) / 2;
ctx.strokeStyle = g > 0.02 ? 'rgba(' + Math.round(143 + 64 * g) + ',' + Math.round(166 + 32 * g) + ',' + Math.round(203 - 23 * g) + ',' + (0.2 + 0.75 * g).toFixed(3) + ')' : 'rgba(143,166,203,0.2)';
ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
}
function draw() {
ctx.clearRect(0, 0, W, H);
ctx.lineWidth = 1;
var x, y, x0 = -GAP, y0 = -GAP, x1 = W + GAP, y1 = H + GAP;
for (y = y0; y <= y1; y += GAP) { for (x = x0; x < x1; x += STEP) { seg(x, y, x + STEP, y); } }
for (x = x0; x <= x1; x += GAP) { for (y = y0; y < y1; y += STEP) { seg(x, y, x, y + STEP); } }
}
function frame(now) {
requestAnimationFrame(frame);
if (!visible) { return; }
var tx, ty;
if (mx === null || now - last > 4000) {
// sin mouse (o en reposo): el hundimiento deriva solo
var t = now / 1000;
tx = W * (0.68 + 0.2 * Math.sin(t * 0.21)); ty = H * (0.46 + 0.22 * Math.sin(t * 0.33 + 1));
sx += (tx - sx) * 0.02; sy += (ty - sy) * 0.02;
} else {
// correa de 100 px: el hundimiento va detrás del cursor
var dx = mx - sx, dy = my - sy, d = Math.sqrt(dx * dx + dy * dy);
if (d > LAG) { tx = mx - dx / d * LAG; ty = my - dy / d * LAG; sx += (tx - sx) * 0.12; sy += (ty - sy) * 0.12; }
}
depth += (1 - depth) * 0.04;
draw();
}
window.addEventListener('mousemove', function (e) {
var r = cv.getBoundingClientRect();
if (e.clientY < r.top || e.clientY > r.bottom) { return; }
mx = e.clientX - r.left; my = e.clientY - r.top; last = performance.now();
});
window.addEventListener('resize', function () { size(); if (reduce) { draw(); } });
if (window.IntersectionObserver) {
new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
}
size();
if (reduce) { depth = 0; draw(); } else { requestAnimationFrame(frame); }
})();

// Enfoque: la frase se escribe sola al entrar en pantalla
(function () {
var el = document.querySelector('.ty');
if (!el || !window.IntersectionObserver) { return; }
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
var full = el.textContent, MS = 14;
var a = document.createElement('span'), b = document.createElement('span');
a.className = 'ty-a'; b.className = 'ty-b';
a.setAttribute('aria-hidden', 'true'); b.setAttribute('aria-hidden', 'true');
if (el.parentNode) { el.parentNode.setAttribute('aria-label', full); }
el.textContent = ''; b.textContent = full; el.appendChild(a); el.appendChild(b);
var io = new IntersectionObserver(function (es) {
if (!es[0].isIntersecting) { return; }
io.disconnect();
var t0 = performance.now();
var step = function (now) {
var n = Math.min(full.length, Math.floor((now - t0) / MS));
a.textContent = full.slice(0, n); b.textContent = full.slice(n);
if (n < full.length) { requestAnimationFrame(step); } else { setTimeout(function () { a.className = 'ty-a done'; }, 1800); }
};
requestAnimationFrame(step);
}, { threshold: 0.35 });
io.observe(el);
})();

// Formularios de contacto: campos obligatorios y aviso de demostración
(function () {
var forms = document.querySelectorAll('form[aria-label="Formulario de contacto"]');
for (var i = 0; i < forms.length; i++) {
(function (f) {
f.addEventListener('invalid', function (ev) {
f.classList.add('tried');
var el = ev.target;
if (el.validity && el.validity.valueMissing) { el.setCustomValidity('Este campo es obligatorio.'); }
else if (el.validity && el.validity.typeMismatch) { el.setCustomValidity('Ingrese un correo válido.'); }
}, true);
f.addEventListener('input', function (ev) { if (ev.target.setCustomValidity) { ev.target.setCustomValidity(''); } });
f.addEventListener('submit', function (ev) {
ev.preventDefault();
var m = f.querySelector('.form-msg');
if (m) { m.textContent = 'Gracias. Esta es una demostración: el envío se conectará en el sitio final.'; }
});
})(forms[i]);
}
})();
