// Menú móvil: tres rayas que abren un panel grafito desde arriba
(function () {
if (window.__nvMenu) { return; }
window.__nvMenu = true;
var bt = document.querySelector('.nv-bg'), ov = document.getElementById('nv-ov');
if (!bt || !ov) { return; }
var root = document.documentElement;
var set = function (open) {
root.classList.toggle('nv-open', open);
bt.setAttribute('aria-expanded', open ? 'true' : 'false');
bt.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
ov.setAttribute('aria-hidden', open ? 'false' : 'true');
};
bt.addEventListener('click', function () { set(!root.classList.contains('nv-open')); });
var ls = ov.querySelectorAll('a');
for (var i = 0; i < ls.length; i++) { ls[i].addEventListener('click', function () { set(false); }); }
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); } });
window.addEventListener('resize', function () { if (window.innerWidth > 900) { set(false); } });
})();
