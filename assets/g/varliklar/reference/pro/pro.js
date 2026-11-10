/* ===== Pro planları — SSS akordeonu + kart "Tüm özellikler" senkron aç/kapa =====
   ref pro-v1.html satır 1983-2013 ("SSS akordeon" + "PRO-CARD EXPAND" IIFE'leri) —
   literal transfer, davranış DEĞİŞMEDİ.

   PRO-GATE (FB9-b, Beyar 2026-07-14): pro-demo bölümü GERİ KONDU, GERÇEK
   pro-gate mekanizmasıyla (video-mutfagi.js'teki AYNI altyapı — #proGate/
   .pg-overlay/[data-pro-gate], CSS artık tokens.css'te paylaşılan bileşen).
   CREATOR-SUB (ref'in [data-abone-takip] JS toggle'ı) BİLEREK taşınmadı —
   gerçek takip artık follow.toggle route'una POST eden bir <form> (video
   modülünün .creator-sub deseniyle aynı), sayfa yeniden render eder; ayrıca
   client-side toggle JS'ine gerek yok. */
(function(){
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click',function(){
      var item=q.closest('.faq-item');
      var open=item.classList.toggle('open');
      var a=item.querySelector('.faq-a');
      a.style.maxHeight=open ? a.scrollHeight+'px' : '';
    });
  });
})();

// ---- PRO-GATE — [data-pro-gate] açar (video-mutfagi.js ile birebir aynı davranış) ----
(function () {
  /* Aşama 2 · B (ajan-b4): EN sayfada kabuk sözlüğü (`KabukSozlugu`, <script type="application/json" data-l-js-kabuk>) ve
     sayfanın kendi sözlüğü (<main data-l-js>) basılı; ikisi de okunur. TR'de sözlük yok → TR yedek AYNEN döner. */
  var dmLk = window.dmLk = window.dmLk || function (k, tr, p) {
    var s = null, els = document.querySelectorAll('[data-l-js-kabuk], [data-l-js]');
    for (var i = 0; i < els.length && s === null; i++) {
      try { var a = els[i].getAttribute('data-l-js'); var o = JSON.parse(a ? a : els[i].textContent); if (o && typeof o[k] === 'string') s = o[k]; } catch (e) { /* bozuk sözlük → TR yedek */ }
    }
    var kayitli = s !== null;
    if (s === null) s = tr;
    /* Çoğul (EN): sözlük değeri 'tekil|çoğul' — sayı p.sayi, yoksa p.toplam, yoksa p.n; 1 → ilk biçim, gerisi son biçim; RU (üç kategorili dil, 20 Eki): 'bir|az|çok', kesir → az. */
    if (kayitli && s.indexOf('|') >= 0) { var cn = p ? [p.sayi, p.toplam, p.n].filter(function (x) { return x !== undefined && x !== null && x !== ''; })[0] : undefined; var cb = s.split('|'); var cbi = (function (x) { if (cb.length < 3 || typeof document === 'undefined' || typeof Intl === 'undefined') return -1; var pr = new Intl.PluralRules(document.documentElement.lang || 'tr'); if (pr.resolvedOptions().pluralCategories.indexOf('few') < 0) return -1; x = Math.abs(Number(x)) || 0; if (x !== Math.floor(x)) return 1; var k = pr.select(x); return k === 'one' ? 0 : (k === 'few' ? 1 : 2); })(cn); s = cbi >= 0 ? cb[cbi] : (Number(cn) === 1 ? cb[0] : cb[cb.length - 1]); }
    if (!p) return s;
    /* Laravel'in kuralı: adlar uzundan kısaya, doğrudan değiştirilir (`:minpx` içinde `:min` dolar). */
    Object.keys(p).sort(function (a, b) { return b.length - a.length; }).forEach(function (n) { s = s.split(':' + n).join(String(p[n])); });
    return s;
  };
  var gate = document.getElementById('proGate'); if (!gate) return;
  var overlay = document.getElementById('pgOverlay'),
    closeBtn = document.getElementById('pgClose'),
    later = document.getElementById('pgLater'),
    title = document.getElementById('pgTitle'),
    desc = document.getElementById('pgDesc');
  function open(t, d) { if (t) title.textContent = t; if (d) desc.textContent = d; overlay.classList.add('show'); gate.classList.add('show'); }
  function close() { overlay.classList.remove('show'); gate.classList.remove('show'); }
  closeBtn.addEventListener('click', close);
  if (later) later.addEventListener('click', close);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gate.classList.contains('show')) close(); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-pro-gate]'); if (!t) return;
    e.preventDefault(); e.stopPropagation();
    open(t.getAttribute('data-pro-title'), t.getAttribute('data-pro-desc'));
  }, true);
})();

(function(){
  var allCards=document.querySelectorAll('.pro-card');
  var allBtns=document.querySelectorAll('.pro-expand-btn');
  if(!allBtns.length)return;
  var globalExpanded=false;
  function setExpanded(open){
    globalExpanded=open;
    allCards.forEach(function(c){ c.classList.toggle('expanded',open); });
    allBtns.forEach(function(b){
      b.innerHTML=open
        ? dmLk('kabuk_js.pro.daha_az', '<i class="fa-solid fa-chevron-up" aria-hidden="true"></i> Daha az göster')
        : dmLk('kabuk_js.pro.tum_ozellikler', '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i> Tüm özellikler');
    });
  }
  allBtns.forEach(function(btn){
    btn.addEventListener('click',function(){ setExpanded(!globalExpanded); });
  });
})();
