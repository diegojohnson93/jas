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
