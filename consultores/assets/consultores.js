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
