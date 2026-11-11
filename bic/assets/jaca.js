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
