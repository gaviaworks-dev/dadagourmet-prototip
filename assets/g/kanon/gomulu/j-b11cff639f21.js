
/* ═══ GENEL DİYALOG BAĞI · ARIA'nın İLAN ETTİĞİ KAPIYI AÇAR ═══════════
   🔴 ÖLÇÜLDÜ, 2026-09-03 (slot-odeme canlı sınadı, lead doğruladı):
   `<button id="odFtBilgi" aria-haspopup="dialog" aria-controls="ftModal">`
   düğmesi HİÇBİR ŞEY açmıyordu. Kaynakta tetiği `FIT_FATURA_FORM.kur()`
   bağlıyor; `kur()` bir MONTAJ YUVASI (`#ftFormYuva`) arıyor ve yuva
   çıktıda yok — çünkü yuva `kur()` çağrısında markup ile YER DEĞİŞTİRİR
   ve donör POST-`kur()` bir anlık görüntüdür (modül yuvayı tüketip
   yerine `#ftModal`ı basmış). Yani yuva bir içerik bölümü değil, geçici
   bir montaj noktası.
   🔴 YUVAYI GERİ EKLEMEK YANLIŞ OLURDU: markup'ta ZATEN kurulu bir
      `#ftModal` var (109 KB · `#ftForm` + 15 alan). Yuva verilseydi
      `kur()` İKİNCİ bir `#ftModal` basar, `$('ftModal')` belge
      sırasındaki ilkini döndürür ve iki pencere doğardı.
   Çözüm yuvasız ve YENİ KANCA GEREKTİRMİYOR: ARIA ilişkiyi zaten ilan
   ediyor (`aria-haspopup="dialog"` + `aria-controls`). Kabuk o ilanı
   okur ve hedefi açar. Bu, kaynağın kendi sözleşmesini kullanmaktır —
   uydurma bir kanca değil.
   ⚠ Kendi sürücüsü OLAN kalemler bozulmasın: hedef zaten açıksa
     dokunulmaz ve olay `defaultPrevented` ise atlanır. */
(function(){
  function ac(kap, tetik){
    if(!kap) return false;
    if(/(^|\s)(show|acik)(\s|$)/.test(kap.className)) return false;   /* zaten açık */
    /* 🔴 `hidden` KALIBI DA AÇILIR — ölçüldü, 2026-09-03; slot-program
       bildirdi ("§53 takvim katmanı çıktıda ölü"), doğruladım.
       Bağın ilk hâli yalnız `.show` sınıfı ekliyordu. §53 tarih katmanı
       ise `hidden` NİTELİĞİYLE saklanıyor:
           <button aria-haspopup="dialog" aria-controls="prgTarih1Pop">
           <div id="prgTarih1Pop" role="dialog" hidden>
       Sınıf eklenince görünürlük değişmiyordu: `aria-expanded` false,
       `hidden` true, katmanın içi 0 bayt — düğme "Takvimi aç" yazıp
       hiçbir şey yapmıyordu. ÖLÜ DENETİM.
       ⚠ Bu bir `kapi-acilir` kusuru DEĞİL: kaynağın `programlarim-v1`
         sayfasında o düğme HİÇ YOK (ölçüldü). Markup A kararıyla kurulan
         panoya kanonun §53 kalıbından geldi, sürücüsü olmadan. Yani
         donörde açılan bir şey kapanmadı — kanonun kalıbı yarım kaldı.
         Kabuk ARIA'nın ilan ettiği kapıyı açıyor: yeni kanca yok.
       ⚠ Katmanın İÇİ boş kalır (takvim ızgarasını basan sürücü yok) —
         bu ayrı bir açık kalem, bildirildi. Bağ yalnız görünürlüğü
         sözleşmeye uygun hâle getiriyor; içerik icat etmiyor. */
    if(kap.hasAttribute('hidden')){
      /* 🔴 BOŞ KABI AÇMAK KUSURU GİZLER — ölçüldü, 2026-09-03.
         `programlarim`/`ilerlemem`in kurulan panolarındaki katman
         GERÇEKTEN BOŞ: `<div id="prgTarih1Pop" role="dialog" hidden></div>`
         (hesabim'da aynı kalıp tam: başlık · ay seçimi · oklar · ızgara).
         Yani kalıbın yalnız dış kabı kopyalanmış. Bağı buna açtırırsam
         düğme boş bir diyalog açar — ölü düğmeden DAHA KÖTÜ ve kusuru
         "çalışıyor" gibi gösterir. Kap boşsa açılmaz; kusur görünür
         kalır ve pano sahibine bildirilir. */
      if(!kap.children.length && !kap.textContent.trim()) return false;
      kap.hidden = false;
      kap.removeAttribute('hidden');
      if(tetik) tetik.setAttribute('aria-expanded','true');
      kap.setAttribute('data-aria-acildi','1');
      return true;
    }
    kap.classList.add('show');
    var perde = document.getElementById(kap.id.replace(/Modal$/,'Overlay'))
             || kap.previousElementSibling;
    if(perde && /fb-overlay|perde|overlay/.test(perde.className)) perde.classList.add('show');
    return true;
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[aria-haspopup="dialog"][aria-controls]');
    if(!t || e.defaultPrevented) return;
    var hedef = document.getElementById(t.getAttribute('aria-controls'));
    if(!hedef) return;
    /* Kendi sürücüsü varsa o çalışmış olur ve kap açıktır; ac() false döner. */
    setTimeout(function(){ ac(hedef, t); }, 0);
  }, false);
  /* Kapatma: perdeye ya da kapat düğmesine tıklama + Escape */
  document.addEventListener('click', function(e){
    var k = e.target.closest('.fb-close,[data-kapat],[data-close],.kapat');
    var perde = e.target.classList && /fb-overlay|perde|overlay/.test(e.target.className);
    if(!k && !perde) return;
    document.querySelectorAll('.fb-modal.show,.fb-overlay.show').forEach(function(m){ m.classList.remove('show'); });
    kapatAriaAcilan();
  }, false);
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    document.querySelectorAll('.fb-modal.show,.fb-overlay.show').forEach(function(m){ m.classList.remove('show'); });
    kapatAriaAcilan();
  });
  /* `hidden` ile açılanı GERİ KAPAT — açmayı bilip kapatmayı bilmemek
     kalemi yarım bırakır; dışarı tıklama da kapatır. */
  function kapatAriaAcilan(){
    document.querySelectorAll('[data-aria-acildi]').forEach(function(m){
      m.hidden = true; m.setAttribute('hidden','');
      m.removeAttribute('data-aria-acildi');
      var t = document.querySelector('[aria-controls="' + m.id + '"]');
      if(t) t.setAttribute('aria-expanded','false');
    });
  }
  document.addEventListener('click', function(e){
    var acik = document.querySelectorAll('[data-aria-acildi]');
    if(!acik.length) return;
    for(var i=0;i<acik.length;i++){
      if(acik[i].contains(e.target)) return;
      if(e.target.closest('[aria-controls="' + acik[i].id + '"]')) return;
    }
    kapatAriaAcilan();
  }, false);
})();

/* ═══ BOŞ DURUM AÇMA DEYİMİ KÖPRÜSÜ ══════════════════════════════════
   🔴 ÖLÇÜLDÜ, 2026-09-03. K5 ile `lib-empty → bos-durum` bağlandı ve iki
   bileşenin varsayılanı ZIT çıktı. Statik markup'ı üretici çeviriyor
   (`show` yoksa `hidden` ekler). Ama ÇALIŞMA ANI açılışı kaynağın
   sürücüsünden geliyor ve tek deyimi `show`:
       js-fit-ilerlemem.js · bos.classList.toggle('show', n === 0)
   Kanon `show`u tanımıyor → süzgeç SIFIR sonuç verdiğinde boş durum HİÇ
   görünmezdi.
   🔴 İLK DENEMEM KANONA KURAL YAZMAKTI ve ÖLÜ ÇIKTI: kanon zaten
      `[hidden]{display:none !important}` taşıyor (gerekçesi §'de kayıtlı)
      ve `!important` her sınıf kuralını yener. `.bos-durum[hidden].show`
      eklendi, ölçüldü, `display` yine `none` — geri alındı.
      "Etkisi ölçülmemiş kural kanona yazılmaz" bu kez kuralı YAZDIKTAN
      SONRA ölçmekle yakalandı; ölçmeseydim ölü kural kanonda kalacaktı.
   Doğru yer DAVRANIŞ: `show` sınıfı `hidden` niteliğine köprülenir.
   ⚠ DAR TUTULDU — yalnız `show` jetonu DEĞİŞEN `.bos-durum` kalemine
     dokunulur. Elle kurulmuş 17 boş durum `show` hiç taşımıyor ve
     bu köprü onlara HİÇ dokunmaz; dokunsa `hidden` verip hepsini
     bozardı. `.fb-modal.show` (modal) da etkilenmez: köprü yalnız
     `.bos-durum` seçer. */
(function(){
  function kopru(el, oncekiShow){
    var simdi = el.classList.contains('show');
    if(simdi === oncekiShow) return;          /* `show` değişmedi → dokunma */
    if(simdi){ el.hidden = false; el.removeAttribute('hidden'); }
    else { el.hidden = true; el.setAttribute('hidden',''); }
  }
  var hafiza = new WeakMap();
  function izle(){
    document.querySelectorAll('.bos-durum').forEach(function(el){
      if(!hafiza.has(el)) hafiza.set(el, el.classList.contains('show'));
    });
  }
  izle();
  new MutationObserver(function(kayitlar){
    for(var i=0;i<kayitlar.length;i++){
      var k = kayitlar[i];
      if(k.type === 'attributes' && k.target.classList &&
         k.target.classList.contains('bos-durum')){
        var onceki = hafiza.has(k.target) ? hafiza.get(k.target)
                   : /(^|\s)show(\s|$)/.test(k.oldValue || '');
        kopru(k.target, onceki);
        hafiza.set(k.target, k.target.classList.contains('show'));
      }
      if(k.type === 'childList') izle();
    }
  }).observe(document.documentElement,
             { subtree:true, childList:true, attributes:true,
               attributeFilter:['class'], attributeOldValue:true });
})();

/* ═══ GÖVDE KİLİDİ · MODAL AÇILINCA SAYFA KAYMAZ ══════════════════════
   🔴 ÖLÇÜLDÜ, 2026-09-02: fatura belge penceresi açılıyor ama
   `body.scroll-locked` KURULMUYOR — arkadaki sayfa kaydırılabiliyor.
   v2'de bunu KABUK yapıyor (`fit-shell.js:1975` `lockScroll`), sayfa
   betiği değil; bu yüzden sayfa JS'ine taşımak yanlış olurdu — her
   modal için bir kez daha yazılması gerekirdi.
   Kaynağın kendi kipi BİREBİR: sayaçlı (iç içe modal), kaydırma çubuğu
   genişliği telafili, `scrollbar-gutter:stable` destekliyorsa telafi YOK.
   Tetikleyici: kaynakta her modal `ac()`/`kapat()` çağırıyordu; burada
   modal sınıfının kendisi izlenir (`.fb-modal.show`) — hangi sürücü
   açarsa açsın kilit kurulur. Böylece taşınan her sayfa JS'i bunu
   TEKRAR yazmak zorunda kalmaz. */
(function(){
  var sayac = 0, eskiPad = '';
  function kilitle(){
    if(sayac++ > 0) return;
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    var oluk = window.CSS && CSS.supports && CSS.supports('scrollbar-gutter','stable');
    if(sbw > 0 && !oluk){ eskiPad = document.body.style.paddingRight;
      document.body.style.paddingRight = sbw + 'px'; }
    document.body.classList.add('scroll-locked');
  }
  function coz(){
    if(sayac === 0) return;
    if(--sayac > 0) return;
    document.body.classList.remove('scroll-locked');
    document.body.style.paddingRight = eskiPad; eskiPad = '';
  }
  var acik = new WeakSet();
  function tara(){
    document.querySelectorAll('.fb-modal, .modal, [role="dialog"]').forEach(function(m){
      var g = m.classList.contains('show') || m.classList.contains('acik');
      if(g && !acik.has(m)){ acik.add(m); kilitle(); }
      else if(!g && acik.has(m)){ acik.delete(m); coz(); }
    });
  }
  new MutationObserver(tara).observe(document.documentElement,
    { subtree:true, attributes:true, attributeFilter:['class'] });
  document.addEventListener('DOMContentLoaded', tara);
  tara();
})();

/* ── KABUK DAVRANIŞI — kaynağın mekanizması, kanon adlarıyla ──────────
   🔴 `fit-shell.js` yüklenmiyor (üreticinin şerhi): kendi 9 kalemlik
   ACCOUNT dizisini yeniden basıp menüyü 13'ten 9'a düşürürdü. Burada
   yalnız DAVRANIŞ var, markup üretimi YOK — markup kaynağın render
   edilmiş DOM'undan geldiği gibi duruyor. */
(function(){
  var d=document;

  /* 🔴 `.at-top` EKLENMEZ — ÖLÇÜLDÜ, ilk üretimde.
     İlk yazım `data-fit-hero-kind` varsa tepedeyken `.at-top` ekliyordu
     ve header'ı saydamlaştırıyordu. Sonuç ekranda görüldü: zemin BEYAZ
     kaldı (kanon `.kabuk-basi` sonra yüklenip saydamlığı ezdi) ama metin
     BEYAZA döndü — ana menü, arama ve zil ikonu GÖRÜNMEZ oldu.

     Kaynak bu sınıfı bu sayfalarda HİÇ eklemiyor. Ölçüldü — 13 modül
     render'ının hepsinde `<header class="header">`, `at-top` YOK;
     `fit-shell.js:2235` `forceSolid` dalı at-top'ı hiç kurmuyor.

     Kural: DURUM SINIFI KAYNAĞIN DOM'UNDAN GELİR, ÜRETİCİ UYDURMAZ.
     Kanonun "JS'in eklediği durum sınıfları da kopyalanır" kuralı
     KOPYALAMAYI emreder, ÜRETMEYİ değil — kaynak eklemiyorsa yoktur.
     Bir render `at-top` taşıyorsa donör DOM'uyla zaten geliyor. */

  /* footer payı — footer `position:fixed`, gövdeye kendi yüksekliği
     kadar dip boşluğu açılmazsa son ekranı KALICI örter (ölçüldü:
     626px). ResizeObserver `border-box` izler: dolgu değişince
     content-box aynı kalır ve gözlemci hiç tetiklenmezdi. */
  var mn=d.getElementById('pageMain'), ft=d.querySelector('.footer');
  if(mn&&ft){ function pay(){ mn.style.marginBottom=(innerWidth>=641?ft.offsetHeight:0)+'px'; }
    pay(); addEventListener('resize',pay);
    if(window.ResizeObserver) new ResizeObserver(pay).observe(ft,{box:'border-box'}); }

  /* 🔴 HEADER'IN TEPEDE KİPİ — 2026-09-03, Beyar gözle gördü:
     "donörde header tepedeyken şeffaf, aşağı kaydırınca solid; bizde hep
     şeffaf kalıyor."
     ÖLÇÜLDÜ, üç parçadan İKİSİ taşınmıştı:
       ✅ CSS   `.kabuk-basi.tepede` (§TEPEDE KİPİ) 38/39 çıktıda var
       ✅ ad    `kabuk_ikili`de `at-top → tepede` çevrisi var
       🔴 BETİK sınıfı ekleyip KALDIRAN kural  0/39 çıktıda
     Sonuç: render anındaki `at-top` statik markup'a DONMUŞ ve onu
     kaldıracak kimse yok — header sonsuza dek şeffaf kalıyordu.
     (`msj-cerez`in aynısı: çalışma anı durumu statik markup'a donuyor.
      Bu turda üçüncü kez; kalıcı çözüm durum sınıflarını üreticide
      sökmek, ayrı kalem olarak DEVİR'e yazıldı.)

     Kaynağın kendi kuralı birebir (`fit-shell.js:2229-2237`):
       · yalnız HERO/BANNER sayfasında çalışır — kapı `data-fit-over`
       · eşik 60px, kaynağın kendi sayısı
       · `at-top` VARSAYILAN DEĞİL: sayfa tepesindeyken EKLENİR
     İki ad birlikte taşınır (`show`/`gorunur` deseninin aynısı):
     donörün `at-top`i ve kanonun `tepede`si. */
  var hd=d.querySelector('.header,.kabuk-basi');
  if(hd && d.body.getAttribute('data-fit-over')==='1'
        && location.search.indexOf('hdr=solid')<0){
    function tepe(){ var t=scrollY<60;
      hd.classList.toggle('at-top',t); hd.classList.toggle('tepede',t); }
    tepe(); addEventListener('scroll',tepe,{passive:true});
  } else if(hd){ hd.classList.remove('at-top','tepede'); }

  /* başa dön — eşik kaynağın kendi değeri: 600px */
  var tt=d.getElementById('toTop');
  if(tt){ function bak(){ tt.classList.toggle('show',scrollY>600); tt.classList.toggle('gorunur',scrollY>600); }
    bak(); addEventListener('scroll',bak,{passive:true});
    tt.addEventListener('click',function(){ scrollTo({top:0,behavior:'smooth'}); }); }

  /* çekmece · perde · alt kalem — `max-height` ile açılır (§64 şerhi:
     `display` ile açmak geçişi öldürür) */
  var hb=d.getElementById('hamburger'), dr=d.getElementById('drawer'), dro=d.getElementById('drawerOverlay');
  function drKapa(){ if(!dr)return; dr.classList.remove('open','acik');
    if(dro)dro.classList.remove('open','acik'); d.body.style.overflow=''; }
  if(hb&&dr){ hb.addEventListener('click',function(){
      var a=!dr.classList.contains('open');
      dr.classList.toggle('open',a); dr.classList.toggle('acik',a);
      if(dro){dro.classList.toggle('open',a); dro.classList.toggle('acik',a);}
      d.body.style.overflow=a?'hidden':''; }); }
  if(dro)dro.addEventListener('click',drKapa);
  d.querySelectorAll('.drawer-close').forEach(function(x){ x.addEventListener('click',drKapa); });
  d.querySelectorAll('.d-toggle').forEach(function(t){
    t.addEventListener('click',function(){ var r=t.closest('.d-item')||t.parentNode;
      r.classList.toggle('open'); r.classList.toggle('acik'); }); });

  /* açılır menüler — hesap · dil · üst gezinti */
  function acKapa(kapSec,dugSec,sinif){
    d.querySelectorAll(kapSec).forEach(function(k){
      var b=k.querySelector(dugSec); if(!b)return;
      b.addEventListener('click',function(e){ e.stopPropagation();
        var a=!k.classList.contains(sinif);
        d.querySelectorAll(kapSec).forEach(function(o){o.classList.remove(sinif);});
        k.classList.toggle(sinif,a); b.setAttribute('aria-expanded',a?'true':'false'); }); });
  }
  acKapa('.acct-wrap','.acct-btn','open');
  acKapa('.tb-lang','.tb-lang-btn','open');
  addEventListener('click',function(){
    d.querySelectorAll('.acct-wrap.open,.tb-lang.open').forEach(function(o){o.classList.remove('open');}); });
  addEventListener('keydown',function(e){ if(e.key==='Escape'){
    d.querySelectorAll('.acct-wrap.open,.tb-lang.open').forEach(function(o){o.classList.remove('open');});
    drKapa(); } });

  /* görüş bildir modalı — sekme açar; ×, perde, dışına tıklama ve
     Escape kapatır. Form GÖNDERMEZ: dosya çevrimdışı, "gönderildi"
     demek yalan olurdu. */
  /* 🔴 SINIF ADI KAYNAĞINDAN OKUNUR — ölçüldü, 2026-09-02.
     İlk yazım `.open` ekliyordu; kaynağın CSS'i `.fb-modal.show` bekliyor.
     Ölçüm: FIT tıklayınca `fb-modal show` → AÇILDI · kanon `fb-modal open`
     → AÇILMADI. Sınıf DOM'a yazılıyordu ama hiçbir kural onu tanımıyordu.
     ⚠ "Kural yazılı olması ekranda basıldığı anlamına gelmez" tuzağının
       JS tarafı: sınıf eklendi, kuralı yoktu. */
  var fbT=d.getElementById('fbTab'), fbM=d.getElementById('fbModal'), fbO=d.getElementById('fbOverlay');
  function fbKapa(){ if(fbM)fbM.classList.remove('show','open'); if(fbO)fbO.classList.remove('show','open'); d.body.style.overflow=''; }
  function fbAc(e){ if(e)e.preventDefault();
    fbM.classList.add('show','open'); if(fbO)fbO.classList.add('show','open'); d.body.style.overflow='hidden'; }
  if(fbT&&fbM)fbT.addEventListener('click',fbAc);
  /* `#fbRouteBtn` — "Öneri ve Şikâyet" kabındaki yönlendirme düğmesi
     ("Görüş Bildir'i Aç"). Kaynağın kendi markup'ıyla geldi; açıcısı
     `fit-shell.js`teydi ve o dosya yüklenmiyor. Bağlanmazsa düğme
     ORADA DURUR AMA HİÇBİR ŞEY YAPMAZ — "kural var, tüketicisi yok"un
     JS tarafı, görüş modalının konu şeridiyle aynı kusur ailesi. */
  var fbR=d.getElementById('fbRouteBtn');
  if(fbR&&fbM)fbR.addEventListener('click',fbAc);
  if(fbO)fbO.addEventListener('click',fbKapa);
  d.querySelectorAll('.fb-close').forEach(function(x){ x.addEventListener('click',fbKapa); });
  addEventListener('keydown',function(e){ if(e.key==='Escape')fbKapa(); });

  /* 🔴 MODALIN İÇİNDEKİ KONU ŞERİDİ — ÖLÇÜLDÜ, 2026-09-02.
     Beyar gördü: modal açılıyor ama sekmeleri çalışmıyor. Ölçüm
     (`lead-kusur-iki.mjs`) iki tarafa AYNI soruyu sordu:
       FIT   "Teknik sorun"a bas → aktif konu=sorun · görünür kap=[sorun] ✅
       kanon "Teknik sorun"a bas → aktif konu=oneri · görünür kap=[oneri] 🔴
     Kök: kaynağın mekanizması `fit-shell.js:2666..2681`te; üretici
     `fit-shell.js`i YÜKLEMİYOR (menüyü 13'ten 9'a düşürürdü) ve bu
     davranış buraya taşınmamıştı. Şerit `[data-tab]/[data-pane]`
     ailesinden DEĞİL — kendi `[data-topic]/[data-for]` çifti ve kendi
     `.active` jetonu var; genel sekme rayı onu hiç görmüyordu.
     ⚠ "ölü varyant"ın aynası: markup vardı, onu çalıştıran kod yoktu.

     Kaynağın `syncPanes()`i AYNEN taşınır — pasif kapların alanları
     `disabled` edilir ki gizli `required` alan gönderimi bloklamasın. */
  (function(){ if(!fbM)return;
    var konu=fbM.querySelectorAll('.fb-topic'); if(!konu.length)return;
    function esitle(){
      var akt=fbM.querySelector('.fb-topic.active');
      var cur=akt?akt.getAttribute('data-topic'):null;
      fbM.querySelectorAll('.fb-fields').forEach(function(kap){
        var on=kap.getAttribute('data-for')===cur;
        kap.classList.toggle('active',on);
        kap.querySelectorAll('input,textarea,select,button').forEach(function(el){el.disabled=!on;});
      });
    }
    konu.forEach(function(t){ t.addEventListener('click',function(){
      konu.forEach(function(x){ x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
      t.classList.add('active'); t.setAttribute('aria-selected','true'); esitle(); }); });
    esitle();
    /* emoji ve çip satırları da tek seçim — kaynağın aynı bloğu */
    ['.fb-emoji button','.fb-chiprow .chip'].forEach(function(sec){
      var g=fbM.querySelectorAll(sec); if(!g.length)return;
      g.forEach(function(x){ x.addEventListener('click',function(){
        g.forEach(function(o){o.classList.remove('active');}); x.classList.add('active'); }); });
    });
  })();

  /* sohbet paneli (§62) ve kapılar (§64/§65) — `display:none` KULLANILMAZ,
     geçiş ölür; `.open` sınıfıyla açılır. */
  function kapi(dugId,panelId,ortuId,kapatSec){
    var g=d.getElementById(dugId), p=d.getElementById(panelId), o=d.getElementById(ortuId);
    if(!p)return;
    /* Üç ad birden: kaynağın `.show`/`.open` ikilisi + kanonun `.acik`sı.
       Hangisinin kuralı varsa o çalışır; eksik ad sessizce ölü kalmaz. */
    function kapa(){ p.classList.remove('show','open','acik'); if(o)o.classList.remove('show','open','acik'); }
    function ac(e){ if(e)e.preventDefault(); p.classList.add('show','open','acik'); if(o)o.classList.add('show','open','acik'); }
    if(g)g.addEventListener('click',ac);
    if(o)o.addEventListener('click',kapa);
    if(kapatSec)d.querySelectorAll(kapatSec).forEach(function(x){x.addEventListener('click',kapa);});
    addEventListener('keydown',function(e){ if(e.key==='Escape')kapa(); });
  }
  /* 🔴 BOŞ KİPTE FAB BİR BAĞLANTIDIR, PANEL AÇICISI DEĞİL — ölçüldü.
     Kaynak `is-bos` (randevusu olmayan üye) hâlinde düğmeyi
     `<a href="sefler.html">` yapıyor ve kendi şerhinde
     gerekçesini yazıyor: *"düğme yuvarlak rozet değil, DOĞRUYU SÖYLEYEN
     bir satırdır"*. Panel açmak yerine antrenör dizinine götürüyor.
     İlk yazım onu koşulsuz panel açıcısı diye bağlıyordu ve
     `preventDefault` ile gezinmeyi ELE GEÇİRİYORDU — kullanıcı hiçbir
     yere gidemez, panel de açılmazdı (ölçüldü: sınıf hiç değişmiyor).
     ⚠ Ölçüm "AÇILMADI" derken kusur DEĞİL, doğru davranışı görüyordu.
        Kapıya bakarken hangi KİP'te olduğuna bak. */
  /* 🔴 KİP TEK SEFER OKUNMAZ — GÖVDEDE DELEGE EDİLİR. Ölçüldü, 2026-09-02.
     Önceki yazım yüklemede bir kez bakıp `is-bos` ise HİÇ BAĞLANMIYORDU.
     Tohumsuz render (K20) her ekranda `is-bos` olduğu için sohbet paneli
     hiçbir ekranda açılamıyordu — antrenörü OLAN kullanıcıda da.
     Ölçüm canlı kaynakta iki kiple yapıldı (`lead-sohbet-kip.mjs`):
       tohumsuz  FAB=<a  class="msj-fab is-bos">  panel AÇILMAZ  ✅ doğru
       tohumlu   FAB=<button class="msj-fab">     panel .acik    ✅ açılır
     Aynı ölçüm üreticinin çıktısında 🔴 verdi: kip değiştirilse bile
     panel açılmıyordu, çünkü dinleyici hiç kurulmamıştı.
     Kaynağın kendi kipi zaten delegasyondur (`fit-mesaj.js:717..723`):
     gövdeye bağlanır, `#msjFab`i olaydan bulur ve **etiketine** bakar —
     `<a>` ise gezinmeye karışmaz, `<button>` ise paneli açar.
     ⚠ Ders: DURUM SORUSU KURULUMDA DEĞİL, OLAY ANINDA SORULUR. Kip
       çalışma anında değişebiliyorsa (kaynağın `fabTur()`ü tam da bunu
       yapıyor) kurulumdaki tek bakış kalıcı bir yanlış cevaptır. */
  (function(){
    var p=d.getElementById('msjPanel'), o=d.getElementById('msjOrtu');
    if(!p)return;
    function kapa(){ p.classList.remove('show','open','acik');
      if(o)o.classList.remove('show','open','acik');
      var f=d.getElementById('msjFab'); if(f)f.setAttribute('aria-expanded','false'); }
    function ac(){ p.classList.add('show','open','acik');
      if(o)o.classList.add('show','open','acik');
      var f=d.getElementById('msjFab'); if(f)f.setAttribute('aria-expanded','true'); }
    d.body.addEventListener('click',function(e){
      var t=e.target.closest&&e.target.closest('#msjFab'); if(!t)return;
      if(t.tagName==='A')return;            /* boş kip: bağlantı — gezinmeye dokunma */
      e.preventDefault();
      p.classList.contains('acik')?kapa():ac();
    });
    if(o)o.addEventListener('click',kapa);
    d.querySelectorAll('.msj-kapat,.sohbet-kapat').forEach(function(x){x.addEventListener('click',kapa);});
    addEventListener('keydown',function(e){ if(e.key==='Escape')kapa(); });
  })();
  kapi(null,'proGate','pgOverlay','.pg-close');
  kapi(null,'lgGate','lgOverlay','.lg-close');

  /* sekme rayı — `[data-tab]` ↔ `[data-pane]`. Kaynağın kipi: panel
     `hidden` ile gizlenir, aktif olan `aria-current="page"` taşır. */
  d.querySelectorAll('[data-tab]').forEach(function(t){
    t.addEventListener('click',function(e){
      var k=t.getAttribute('data-tab'); if(!k)return;
      var kap=t.closest('[data-fit-tabs-scope]')||d;
      var gr=kap.querySelectorAll('[data-tab]'), pn=kap.querySelectorAll('[data-pane]');
      if(!pn.length)return; e.preventDefault();
      /* 🔴 ARIA DURUMU DA TAŞINIR — ölçüldü 2026-09-03, ALTI EKRANDA
         sekme değişiyor ama `aria-selected` İLK sekmede donuyordu.
         Kök: markup ARIA sekme kalıbına yükseltilmiş (`role=tab/tablist/
         tabpanel` + `aria-selected` + gezici `tabindex`), betik ise
         kaynağın eski kipinde kalmış — yalnız `aria-current` yazıyordu.
         Ekran okuyucu hangi pano açık olursa olsun "1. sekme seçili"
         diyordu; klavyenin gezici odağı da taşınmıyordu.
         ⚠ Bu kusur ÖLÇÜM ARACINI DA yanılttı: `kapi-bos-bant.mjs`
         görünür panoyu `aria-selected="true"` üzerinden buluyordu,
         yani hep ilk panoyu ölçüyordu.
         `aria-current` KALDIRILMADI: ray aynı zamanda gezinme olarak da
         okunuyor ve kaldırmanın etkisi ölçülmedi. */
      gr.forEach(function(x){ var a=x.getAttribute('data-tab')===k;
        x.classList.toggle('is-active',a); x.classList.toggle('aktif',a);
        if(x.getAttribute('role')==='tab'){
          x.setAttribute('aria-selected', a?'true':'false');
          x.tabIndex = a?0:-1;
        }
        if(a)x.setAttribute('aria-current','page'); else x.removeAttribute('aria-current'); });
      pn.forEach(function(x){ x.hidden=x.getAttribute('data-pane')!==k; });
      if(location.hash.slice(1)!==k)history.replaceState(null,'',location.pathname+location.search+'#'+k);
    }); });
  if(location.hash){ var h=d.querySelector('[data-tab="'+location.hash.slice(1)+'"]');
    if(h)h.click(); }

  /* arama kutusunun × düğmesi — 🔴 ÖLÇÜLDÜ, Beyar gözle gördü.
     Kaynakta davranış: boşken `.sx` `display:none`, doluyken `.sx.show`
     `display:grid` 40×42 (Playwright'la yazılarak ölçüldü, CSS okunarak
     değil). Kanonda × HİÇ çıkmıyordu — sınıfı ekleyen betik sayfanın
     kendi JS'iydi ve üretici onu söküyor.
     ⚠ Yeni bir ad İCAT EDİLMEDİ: kaynağın `.sx`/`.show` ikilisi duruyor
       ve `fit-shell.css` onu zaten çiziyor (kanon §22'nin
       `.arama-temizle`/`.gorunur` kipi Diyet tarafının karşılığı). */
  d.querySelectorAll('.lib-search, .arama, .faq-searchbar .lib-search').forEach(function(kap){
    var gir = kap.querySelector('input');
    var sil = kap.querySelector('.sx, .lib-clear, .arama-temizle');
    if(!gir || !sil) return;
    function bak(){ var dolu = gir.value.trim().length > 0;
      sil.classList.toggle('show', dolu); sil.classList.toggle('gorunur', dolu); }
    gir.addEventListener('input', bak);
    sil.addEventListener('click', function(e){ e.preventDefault();
      gir.value=''; bak(); gir.focus();
      gir.dispatchEvent(new Event('input',{bubbles:true})); });
    bak();
  });

  /* ── §52 ÜLKE KODLU TELEFON — açılır liste davranışı ────────────────
     🔴 LİSTE MARKUP'TA, BETİK ONU ÜRETMEZ — YALNIZ SÜZER.
     Kaynağın `assets/js/fit-ulke.js`i 199 kalemi çalışma anında basıyor
     ve üretici kaynak betiklerini SÖKÜYOR; liste burada üretilseydi veri
     iki yerde (JS + markup) durur ve kayardı. Gövde 199 kalemi statik
     taşıyor (FIT'in kendi render'ından çıkarıldı), bu blok yalnız aç/kapa,
     süz ve seç işini yapıyor. Kanonun Diyet tarafında kanıtlanmış kip. */
  d.querySelectorAll('[data-ulke-kok],[data-cc-kok]').forEach(function(kok){
    var dugme  = kok.querySelector('.alan-ulke,.fk-cc');
    var katman = kok.querySelector('.alan-ulke-katman,.fk-cc-pop');
    var liste  = kok.querySelector('.alan-ulke-liste,.fk-cc-list');
    var ara    = kok.querySelector('.alan-ulke-arama input,.fk-cc-search input');
    var bos    = kok.querySelector('.alan-ulke-bos,.fk-cc-bos');
    if(!dugme||!katman||!liste) return;
    var kalemler = [].slice.call(liste.querySelectorAll('li'));
    function kapat(){ katman.hidden=true; dugme.setAttribute('aria-expanded','false'); }
    function ciz(q){ q=(q||'').toLocaleLowerCase('tr'); var n=0;
      kalemler.forEach(function(li){
        var ad=(li.querySelector('.ad')||{textContent:''}).textContent.toLocaleLowerCase('tr');
        var kod=(li.querySelector('.kod')||{textContent:''}).textContent;
        var gor=!q||ad.indexOf(q)>=0||kod.indexOf(q)>=0; li.hidden=!gor; if(gor)n++; });
      if(bos)bos.hidden=n>0; }
    kalemler.forEach(function(li){ li.tabIndex=-1;
      li.addEventListener('click',function(){
        var bayrak=kok.querySelector('.alan-ulke-bayrak,.fk-cc-flag');
        var kodEl =kok.querySelector('.alan-ulke-kod,.fk-cc-dial');
        var b=li.querySelector('.bayrak,.bay'), k=li.querySelector('.kod');
        if(bayrak&&b)bayrak.textContent=b.textContent;
        if(kodEl&&k)kodEl.textContent=k.textContent;
        var h=kok.querySelector('input[type=hidden]'); if(h)h.value=li.getAttribute('data-iso');
        kalemler.forEach(function(x){ x.setAttribute('aria-selected',x===li?'true':'false');
                                      x.classList.toggle('secili',x===li); });
        kapat(); dugme.focus(); }); });
    dugme.addEventListener('click',function(){
      if(katman.hidden){ katman.hidden=false; dugme.setAttribute('aria-expanded','true');
        ciz(''); if(ara){ara.value=''; ara.focus();} } else kapat(); });
    if(ara)ara.addEventListener('input',function(){ ciz(ara.value); });
    addEventListener('click',function(e){ if(!kok.contains(e.target))kapat(); });
    addEventListener('keydown',function(e){ if(e.key==='Escape')kapat(); });
  });

  /* akordeon — 🔴 BİR GRUPTA TEK AÇIK KALEM (Beyar, 2026-09-01).
     Açık kaleme tekrar basmak kapatır; "hepsi kapalı" geçerli bir hâl.
     `.open`/`.acik` ile `aria-expanded` BİRLİKTE güncellenir. */
  d.querySelectorAll('.qa-head,.akordeon-bas').forEach(function(b){
    b.addEventListener('click',function(){
      var k=b.closest('.qa,.akordeon-kalem'); if(!k)return;
      var grup=k.parentNode, acik=k.classList.contains('open')||k.classList.contains('acik');
      Array.prototype.forEach.call(grup.children,function(o){
        o.classList.remove('open','acik');
        var h=o.querySelector('.qa-head,.akordeon-bas'); if(h)h.setAttribute('aria-expanded','false');
        var g=o.querySelector('.qa-body,.akordeon-govde'); if(g)g.style.maxHeight='0px'; });
      if(!acik){ k.classList.add('open','acik'); b.setAttribute('aria-expanded','true');
        var g=k.querySelector('.qa-body,.akordeon-govde');
        if(g)g.style.maxHeight=g.scrollHeight+'px'; }
    }); });
  d.querySelectorAll('.qa.open,.akordeon-kalem.acik').forEach(function(k){
    var g=k.querySelector('.qa-body,.akordeon-govde'); if(g)g.style.maxHeight=g.scrollHeight+'px'; });
})();

/* ═══ B6 · BANNER → GÖVDE DİKİŞİ · kaynağın basıcısı, kanon adlarıyla ══
   Kaynak `fit-shell.js:4500` bu sınıfı ÇALIŞMA ANINDA basıyor; donörün
   render anlık görüntüsünde o iz yakalanıp statik çıktıya donuyor ve
   yanlış yere yapışıyor. ÖLÇÜLDÜ (22 ekran, 2026-09-03):
       bildirimler  `.dikis.bant-ustunde` SAYDAM kutuda — yuvarlak köşe
                    görünmüyor, altındaki beyaz katman kare kalıyor
       arama        `.dikis` 0×0 gizli kutuda; görünen beyaz panel
                    (`#fsPop`) dikişsiz  ← Beyar ikisini de gözle gördü
   HAZIRLIK BELGESİNİN İKİ ÖLÇÜSÜ DÜZELTİLDİ (lead ölçtü, 2026-09-03):
     (1) `div.zebra` BANNER DEĞİL, sarmal. Banner ölçütü ada değil
         GÖRÜNÜŞE sorulur: ilk tam-en, alanı olan, KOYU blok.
     (2) "OPAK 22" hedefi yanlış: 12 profil ekranında koyu banner YOK
         (zebranın ilk çocuğu `.kimlik-bant`, zemini #f9f9f9). Kaynak da
         orada erken donuyor. Olmayan banner'a dikiş uydurulmaz.
   UYARI: `.dikis` kanonda BANT demek (harita: `sec` -> `dikis`), yalnız
   dikiş değil. Bu yuzden basici `.dikis`i SOKMEZ; yalniz `bant-ustunde`
   binmesini dogru tasiyiciya tasir ve tasiyicida `.dikis` yoksa ekler.
   Kaynagin UC ELEMESI birebir tasindi: alani olmayan blok komsulugu
   bozmaz; sticky/fixed keser; saydam ama tam-en ise ICINE inilir. */
/* NOT: bu blok KABUK_JS'in `d` kısayolunun KAPSAMI DIŞINDA — ilk yazım
   `d.querySelector` diyordu ve sayfa `ReferenceError: d is not defined`
   ile düştü; hata betiğin geri kalanını da (kabuk durum damgası) öldürdü.
   ÖLÇÜLDÜ: 22/22 ekranda pageerror. Kısayol kullanılmaz, `document` yazılır. */
(function(){
  var main = document.querySelector('main.page-main') || document.querySelector('main');
  if(!main) return;
  var esik = main.clientWidth * 0.94;
  function alan(el){ var r = el.getBoundingClientRect();
    return el.getClientRects().length !== 0 && r.width >= 1 && r.height >= 1; }
  function tamEn(el){ return el.getBoundingClientRect().width >= esik; }
  function saydam(el){ var bg = getComputedStyle(el).backgroundColor;
    return !bg || bg === 'transparent' ||
           /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)$/.test(bg); }
  function koyu(el){ var c = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if(!c) return false;
    function f(v){ v = v/255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }
    return (0.2126*f(+c[0]) + 0.7152*f(+c[1]) + 0.0722*f(+c[2])) < 0.2; }

  var kuyruk = [].slice.call(main.children), ban = null, sonrasi = null;
  while(kuyruk.length){
    var el = kuyruk.shift();
    if(!alan(el) || !tamEn(el)) continue;
    if(saydam(el)){ kuyruk = [].slice.call(el.children).concat(kuyruk); continue; }
    if(koyu(el)){ ban = el; sonrasi = kuyruk.slice(); }
    break;
  }
  var eski = document.querySelectorAll('.bant-ustunde');
  for(var i=0;i<eski.length;i++) eski[i].classList.remove('bant-ustunde');
  if(!ban) return;

  var komsu = true, basildi = false, q = sonrasi;
  if(!q.length && ban.parentElement && ban.parentElement !== main){
    var p2 = ban.parentElement, kard = [].slice.call(p2.parentElement.children);
    q = kard.slice(kard.indexOf(p2) + 1);
  }
  while(q.length && !basildi){
    var e2 = q.shift();
    if(!alan(e2)) continue;
    var cs = getComputedStyle(e2);
    if(cs.position === 'sticky' || cs.position === 'fixed'){ komsu = false; continue; }
    if(!tamEn(e2)){ komsu = false; continue; }
    if(saydam(e2)){ q = [].slice.call(e2.children).concat(q); komsu = false; continue; }
    e2.classList.add('dikis');
    if(komsu) e2.classList.add('bant-ustunde');
    basildi = true;
  }
})();


/* ═══ SOHBET FAB'ININ KİPİ · kaynağın `fabTur()`ü, kanon tarafında ═════
   HANDOFF §0c/2 borcu. Tohum (`_tohum_kodu()`) 13 ekrana da iniyor ve
   `dm_fit.randevular` DOLU — ama FAB hâlâ `<a class="msj-fab is-bos">`
   kalıyordu ve panel açılmıyordu. ÖLÇÜLDÜ (13/13, 2026-09-03):
       FAB=A · tıklayınca panel=false · panelin "Tüm mesajlar" kapısı=true
   Kök, 42 sayfa ile aramızdaki YAPISAL fark:
       42 sayfa   `#msjFab` markup'ta YOK — `fit-mesaj.js` çalışma anında
                  basıyor, tohumu okuyup `<button>` üretiyor  ✅
       13 ekran   `#msjFab` markup'ta VAR ve donörden DONMUŞ `<a>`
                  (donör tohumsuz alındı, K20); betikler sökülü olduğu
                  için onu yeniden basacak kod yok  🔴
   Yani `msj-cerez`/`at-top` ile aynı aile: DONÖR BİR ANLIK GÖRÜNTÜDÜR.
   Orada sınıf donuyordu, burada ELEMANIN TÜRÜ donuyor.

   Kaynağın kendi kuralı taşındı (fit-mesaj.js:589 `fabTur` · :602 `fabBas`):
       randevu YOK  → <a href="sefler.html" class="msj-fab is-bos">
       randevu VAR  → <button type="button" class="msj-fab">
   ⚠ Karar TOHUMA sorulur, sınıfa değil: tohumsuz basımda (`FIT_KABUK_DURUM=0`)
     `randevular` boş kalır ve kaynağın `is-bos` dalı AYNEN korunur —
     kanonun "boş kipte FAB bir bağlantıdır" ölçümü geçerliliğini sürdürür.
   ⚠ OKUNMAMIŞ SAYACI TAŞINMADI: kaynakta `API.okunmamis()` mesaj deposunu
     (`dm_fit_mesaj_v1`) sayıyor; o depo bu çıktıda yok. Rozet gizli
     basılır — uydurma sayı basmaktansa sayısız. Ayrı kalem. */
(function(){
  var fab = document.getElementById('msjFab');
  if(!fab || fab.tagName !== 'A') return;          /* zaten <button> ya da hiç yok */
  var randevu = [];
  try{
    var ham = JSON.parse(localStorage.getItem('dm_fit') || 'null');
    randevu = (ham && ham.randevular) || [];
  }catch(e){ return; }
  if(!randevu.length) return;                      /* tohumsuz kip: kaynağın kararı */
  var yeni = document.createElement('button');
  yeni.id = 'msjFab';
  yeni.className = 'msj-fab';
  yeni.type = 'button';
  yeni.setAttribute('aria-label','Şef sohbeti');
  yeni.setAttribute('aria-expanded','false');
  yeni.innerHTML = '<i class="fa-solid fa-comment-dots" aria-hidden="true"></i>' +
                   '<span class="msj-fab-rozet" hidden>0</span>';
  fab.parentNode.replaceChild(yeni, fab);
})();


/* ══ KABUK DURUM MODÜLÜ · fit-shell.js'ten ÇIKARILDI, yazılmadı ══
   Taşınan blokların 23'ü `window.FIT_SHELL.state` kapısına
   dayanıyor ve o ad açılmadığında kendi ilk satırında dönüyor.
   Menü işlevi GİRMEZ (kayıtlı sebep), durum modülü girer. */
window.FIT_SHELL = window.FIT_SHELL || {};
(function(){
  var KEY='dm_fit';
  /* ============================================================
     ŞEMA v2 — R10 · belge §3.7 · §4.3 · §5.2 · §5.3 · §6
     ------------------------------------------------------------
     Belgenin kapatılamayan sekiz kalemi tek bir sebebe bağlıydı:
     şemada alan yoktu. Eklenenler ve hangi kalemi açtıkları:

       program.baslangic   ISO tarih   → §5.2 tahmini bitiş · §4 aylık görünüm
       program.gunler[]    1=Pzt…7=Paz → §4.3 "haftanın hangi günleri"
       program.saat        'HH:MM'     → §4.3 hatırlatma saati
       bugun.su            bardak      → §6 su takibi (D16: oturumluktu)
       bugun.gunSonu{}     §3.7 alanları (not·zorluk·efor·enerji·agri)
       gecmis[].kaynak     KANIT KADEMESİ — aşağıda
       program.tasimalar{} 1=Pzt kalıbının TEK SEANSLIK istisnası → §4.3/2
       program.dinlenmeler[] belirli tarihi dinlenmeye çevirir → §4.3/3
       arsiv[]             biten/bırakılan programlar → "Geçmiş programların"

     KANIT KADEMESİ (akış denetiminden geldi, belgede yok):
     Bugüne kadar aynı "antrenman tamamlandı" dört ayrı yerde dört farklı
     kalitede kayıt üretiyordu ve uygulama dördünü aynı sayıyordu:
       egzersiz-detay      → çalışan kronometreden ÖLÇÜLDÜ
       video-ay-detay   → videonun nominal süresi  [modül 2026-08-29'da kalktı]
       program-detay       → SABİT dk:25 kcal:280 (uydurma)
       challengeGunTamamla → hiçbir şey
     Artık her kayıt neye dayandığını taşıyor. Rozet/seri buna bakabilir,
     kullanıcı kendi geçmişinin ne kadar sağlam olduğunu görebilir.
     ============================================================ */
  var KAYNAKLAR = ['olculdu','video','cihaz','beyan'];
  var BOS = { surum:2, program:null, arsiv:[], bildirimler:[], challenge:null, randevular:[],
              bugun:{tarih:null,dk:0,kcal:0,tamam:false,su:0,gunSonu:null},
              gecmis:[] };
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  /* R20/K13 · GÜN ANAHTARI — fit-su.js ile AYNI biçim ('YYYY-MM-DD', yerel
     saat). İki modül aynı güne aynı adı vermezse "bugün" iki yerde iki ayrı
     gün olur; bu depoda üç kez temizlenen "aynı soruya iki cevap" kusuru. */
  function bugunAnahtar(d){
    d = d || new Date();
    var ay = String(d.getMonth()+1), gn = String(d.getDate());
    if(ay.length<2) ay='0'+ay;
    if(gn.length<2) gn='0'+gn;
    return d.getFullYear()+'-'+ay+'-'+gn;
  }

  /* GÖÇ — v1 kayıtları KIRILMAZ. Eksik alan varsayılanla tamamlanır, var olan
     hiçbir değer ezilmez. Yazma anında değil OKUMA anında yapılıyor: kullanıcı
     depoyu hiç açmasa bile eski kayıt yeni koda güvenli girer. */
  function goc(v){
    if(!v || typeof v !== 'object') return clone(BOS);
    /* R14-B/#7 — `bildirimler` v2 yayınlandıktan SONRA eklendi; surum===2
       kayıtlar erken dönüyor ve alanı hiç görmüyordu. Sürüm numarasını
       yükseltmek yerine alan bazlı tamamlama: eski kayıt kırılmaz, yeni
       alan her okumada güvenceye alınır. */
    if(!Array.isArray(v.bildirimler)) v.bildirimler = [];

    /* ============================================================
       R20 · HER OKUMADA KOŞAN ÜÇ DÜZELTME — surum===2 erken dönüşünün
       ÜSTÜNDE durmak ZORUNDALAR. Aşağıdaki blok yalnız göç turunda koşar;
       gün dönümü ise her okumada sorulmalı.
       ============================================================ */

    /* K13 · GÜN DÖNÜMÜ. `bugun` nesnesinin tarih alanı YOKTU ve sıfırlayan
       kod da yoktu: ölçüldü, üç ayrı güne yazılan 90 dakikanın tamamı ekranda
       "90 dk bugün hareket" oluyordu. Doğrusu o günün kendi 20 dakikasıydı.
       Sıfırlama YAZMA anında değil OKUMA anında: kullanıcı depoyu gece
       kapatıp sabah açtığında araya girecek bir yazma olayı yok.
       `su` taşınıyor — su artık dm_fit_su_v1'in işi (K20), buradaki alan
       yalnız fit-su.js'in tek seferlik göç okuması için duruyor. */
    v.bugun = v.bugun || {dk:0,kcal:0,tamam:false,su:0,gunSonu:null};
    var _gun = bugunAnahtar();
    if(v.bugun.tarih !== _gun){
      v.bugun = {tarih:_gun, dk:0, kcal:0, tamam:false,
                 su:(typeof v.bugun.su === 'number' ? v.bugun.su : 0),
                 gunSonu:null};
    }

    /* K15 · TOHUM HAFTA DİZİSİ SÖKÜLDÜ. `[62,74,90,96,118,142]` BOŞ depoda
       bile doğuyordu ve yalnız son elemanı artıyordu: hiç antrenman yapmamış
       kullanıcı "bu haftanın ritmi" grafiğinde beş haftalık düzenli bir geçmiş
       görüyordu. Dizi artık SAKLANMIYOR, `haftalik()` ile gecmis[].tarihISO'dan
       TÜRETİLİYOR — veri yoksa grafik boş durumunu basar. */
    if('hafta' in v) delete v.hafta;

    /* K14 · `gecmis[].tarih` sabit 'bugün' dizgesiydi ve ekrana BASILAN alan
       oydu; gerçek tarih `tarihISO`da zaten doğru duruyor (rozet motoru onu
       kullanıyor). Alan siliniyor; okuyan taraf FIT_SHELL.tarihEtiket() ile
       biçimliyor. Bir alanı yanlış tutmaktansa hiç tutmamak. */
    var _tarihTemiz = false;
    (v.gecmis||[]).forEach(function(g){ if(g && 'tarih' in g){ delete g.tarih; _tarihTemiz = true; } });
    if(_tarihTemiz && v.surum === 2){ try{ localStorage.setItem(KEY, JSON.stringify(v)); }catch(e){} }

    if(v.surum === 2) return v;
    v.surum = 2;
    v.bugun = v.bugun || {dk:0,kcal:0,tamam:false};
    if(typeof v.bugun.su !== 'number') v.bugun.su = 0;
    if(!('gunSonu' in v.bugun))        v.bugun.gunSonu = null;
    if(!Array.isArray(v.arsiv)) v.arsiv = [];
    /* R14-B/#7 — bildirim akışı artık VERİDEN. Eski kayıtlarda alan yok. */
    if(!Array.isArray(v.bildirimler)) v.bildirimler = [];
    if(v.program){
      if(!('baslangic' in v.program)) v.program.baslangic = null;
      if(!Array.isArray(v.program.gunler)) v.program.gunler = [];
      if(!('saat' in v.program))      v.program.saat = null;
      /* tasimalar: TEK ayın istisnası. gunler[] haftalık KALIP, istisnayı
         tutamaz. Anahtar ay numarası, değer o ayın yeni tarihi. */
      if(!v.program.tasimalar)  v.program.tasimalar  = {};
      /* dinlenmeler: belirli bir TARİHİ antrenman günü olmaktan çıkarır.
         gunler[]'den gün silmek başka şey — o kalıcı kalıp değişikliği. */
      if(!Array.isArray(v.program.dinlenmeler)) v.program.dinlenmeler = [];
    }
    /* Eski geçmiş kayıtlarının kaynağı BİLİNMİYOR. 'olculdu' demek yalan
       olurdu; en zayıf kademeye değil, dürüst olana yazıyoruz. */
    (v.gecmis||[]).forEach(function(g){ if(!g.kaynak) g.kaynak = 'beyan'; });
    return v;
  }
  function read(){
    /* R20/K13 · BOŞ kayıt da `goc`tan geçer. Eskiden `clone(BOS)` doğrudan
       dönüyordu ve `bugun.tarih` null kalıyordu: ilk antrenman tarihsiz
       yazılıyor, İKİNCİ okuma bunu gün dönümü sanıp sayacı sıfırlıyordu.
       Ölçüldü — üç kaydın ilki (40 dk) sessizce uçuyordu. */
    try{ var r=localStorage.getItem(KEY); return goc(r?JSON.parse(r):clone(BOS)); }
    catch(e){ return goc(clone(BOS)); }
  }
  function write(v){
    try{ localStorage.setItem(KEY,JSON.stringify(v)); }catch(e){}
    document.dispatchEvent(new CustomEvent('fit:state',{detail:v}));
    return v;
  }
  /* R20/K11 · K12 · ARŞİV KAYDI TEK YERDEN ÜRETİLİYOR.
     Üç yer aynı nesneyi ayrı ayrı yazıyordu ve üçü de `dinlenmeler`i
     DÜŞÜRÜYORDU. Ölçüldü: bir dinlenme günü eklenip yeni program başlatılınca
     `dinlenme` ölçüsü 1'den 0'a düşüyordu — `dinlenme-5` rozeti ancak TEK bir
     program içinde 5 dinlenme günü olan kullanıcıya düşebiliyordu, program
     değiştiren kullanıcının sayacı geri gidiyordu. Dinlenme günleri artık
     arşiv kaydıyla birlikte taşınıyor; rozet motoru aktif + arşiv toplar. */
  function _arsivKaydi(p, durum){
    return {
      slug:p.slug, ad:p.ad, durum:durum,
      biten:p.biten||0, kacan:p.kacan||0, toplam:p.toplam||0,
      baslangic:p.baslangic||null, bitis:new Date().toISOString(),
      dinlenmeler:(Array.isArray(p.dinlenmeler) ? p.dinlenmeler.slice() : [])
    };
  }

  /* R20/K15 · HAFTALIK RİTİM TÜRETİLİYOR, SAKLANMIYOR.
     Dönen dizi son `n` haftayı ESKİDEN YENİYE verir; her eleman
     {baslangic:'YYYY-MM-DD', dk:Number, kayit:Number}. Hafta Pazartesi başlar.
     `veriVar` yanlışsa çağıran boş durum basar — sıfır dolu bir grafik
     "hiç antrenman yok" demenin dürüst yoludur, uydurma sayı değil. */
  function haftaBasi(d){
    var t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var g = t.getDay(); if(g === 0) g = 7;          /* Pazar = 7 */
    t.setDate(t.getDate() - (g - 1));
    return t;
  }
  function haftalik(n){
    n = (typeof n === 'number' && n > 0) ? n : 6;
    var s = read(), kova = [], i, b = haftaBasi(new Date());
    for(i = n - 1; i >= 0; i--){
      var t = new Date(b.getFullYear(), b.getMonth(), b.getDate() - i * 7);
      kova.push({baslangic:bugunAnahtar(t), dk:0, kayit:0, _t:t.getTime()});
    }
    var enErken = kova[0]._t;
    (s.gecmis || []).forEach(function(g){
      if(!g || !g.tarihISO) return;
      var d = new Date(g.tarihISO);
      if(isNaN(d)) return;
      var hb = haftaBasi(d).getTime();
      if(hb < enErken) return;
      for(var j = 0; j < kova.length; j++){
        if(kova[j]._t === hb){
          kova[j].kayit++;
          if(typeof g.dk === 'number') kova[j].dk += g.dk;
          break;
        }
      }
    });
    var veriVar = false;
    kova.forEach(function(k){ delete k._t; if(k.kayit) veriVar = true; });
    return {haftalar:kova, veriVar:veriVar};
  }

  var API = {
    read:read, write:write, reset:function(){ return write(clone(BOS)); },
    /* R20/K13 · K15 — ekranların ortak takvim ucu. Gün anahtarı fit-su.js ile
       aynı biçimde üretilir; iki modül aynı güne aynı adı verir. */
    bugunAnahtar:bugunAnahtar,
    haftalik:haftalik,

    /* ---- program yaşam döngüsü (belge §8.3 · §11) ---- */
    /* Aktif program varken yenisine başlamak ESKİSİNİ SİLİYORDU: biten, kacan,
       baslangic sessizce yok oluyordu ve "Geçmiş programların" kartını
       besleyecek veri kalmıyordu (kart bu yüzden sabit HTML'di). Artık eski
       program arşive geçiyor. Sessiz veri kaybı bir kusurdur, özellik değil. */
    programArsivle:function(){
      var s=read();
      if(s.program){
        if(!s.program.arsivlendi) s.arsiv.unshift(_arsivKaydi(s.program, s.program.durum));
        s.program=null;
      }
      return write(s);
    },
    programBasla:function(p){
      var s=read();
      /* Üzerine yazmadan önce arşivle. Çağıran ayrıca uyarmalı — bu yalnız
         veriyi kurtarır, kullanıcıya sormanın yerini tutmaz. */
      /* R20/K11 · bayraklı program ikinci kez arşivlenmez: biten program
         zaten `antrenmanTamamla` anında arşive geçti. Eskiden buradaki
         koşulsuz arşivleme "İlk Program" rozetini GEÇ düşüren tek yoldu. */
      if(s.program && !s.program.arsivlendi){
        s.arsiv.unshift(_arsivKaydi(s.program,
          s.program.durum==='tamamlandi' ? 'tamamlandi' : 'birakildi'));
      }
      s.program={slug:p.slug,ad:p.ad,durum:'devam',hafta:1,gun:1,
                 toplam:p.toplam||12,biten:0,kacan:0,
                 /* v2 — program artık TAKVİME oturuyor. Bunlar olmadan program
                    bir liste; "yarın 07:30, Gün 2" denemez, hatırlatma kurulamaz,
                    aylık görünüm çizilemez, bitiş tarihi hesaplanamaz. */
                 baslangic:(p&&p.baslangic)||null,
                 gunler:(p&&p.gunler)||[],
                 saat:(p&&p.saat)||null,
                 tasimalar:{}, dinlenmeler:[]};
      return write(s);
    },
    /* §4.3 madde 2 — tek ayı başka güne taşı. Kalıbı değiştirmez. */
    ayTasi:function(ayNo, tarih){
      var s=read();
      if(s.program){ if(tarih) s.program.tasimalar[String(ayNo)]=tarih;
                     else delete s.program.tasimalar[String(ayNo)]; }
      return write(s);
    },
    /* §4.3 madde 3 — belirli bir tarihi dinlenme günü yap / geri al. */
    dinlenmeEkle:function(tarih){
      var s=read();
      if(s.program && s.program.dinlenmeler.indexOf(tarih)<0) s.program.dinlenmeler.push(tarih);
      return write(s);
    },
    dinlenmeKaldir:function(tarih){
      var s=read();
      if(s.program) s.program.dinlenmeler=s.program.dinlenmeler.filter(function(t){return t!==tarih;});
      return write(s);
    },
    /* Takvimi sonradan da kurulabilsin: kullanıcı programı başlatırken
       atlayabilir, Plan ve Takvim'den doldurur. */
    programPlanla:function(o){
      var s=read();
      if(s.program){
        if(o&&o.baslangic!==undefined) s.program.baslangic=o.baslangic;
        if(o&&o.gunler)                s.program.gunler=o.gunler;
        if(o&&o.saat!==undefined)      s.program.saat=o.saat;
      }
      return write(s);
    },
    /* §5.2 — tahmini bitiş. Kaçırılan gün CEZA DEĞİL: programı öteler.
       Haftalık antrenman sayısı bilinmiyorsa 3 varsayılır (kataloğun modu). */
    bitisTahmini:function(){
      var s=read(), p=s.program;
      if(!p||!p.baslangic) return null;
      var bas=new Date(p.baslangic);
      if(isNaN(bas)) return null;
      var haftalik=(p.gunler&&p.gunler.length)||3;
      var kalan=Math.max(0,(p.toplam||0)-(p.biten||0))+(p.kacan||0);
      /* KUSUR DÜZELTİLDİ (R10): kalan haftalar BAŞLANGIÇ tarihine ekleniyordu.
         Oysa biten aylar zaten zaman tüketti — fonksiyon "hiç antrenman
         yapılmamış gibi" hesaplıyordu ve `biten` arttıkça tahmini bitiş GERİYE
         gidiyordu (biten=toplam olduğunda bitiş neredeyse başlangıç oluyordu).
         Ölçülen çelişki: aylık takvim son antrenmanı 18 Eylül'e çizerken çip
         31 Ağustos diyordu.
         Doğrusu: kalan süre BUGÜNE eklenir. Program henüz başlamadıysa
         (başlangıç ileri tarihli) referans başlangıçtır. */
      var bugun=new Date(); bugun.setHours(0,0,0,0);
      var ref=new Date(Math.max(bas.getTime(), bugun.getTime()));
      ref.setDate(ref.getDate()+Math.ceil(kalan/haftalik)*7);
      /* Saat 12:00'ye sabitleniyor. Yerel GECE YARISI kullanınca `toISOString()`
         UTC'ye çevirirken günü geriye atıyordu: TR (UTC+3) için bitmiş bir
         program "dün" bitiyor görünüyordu. Öğlen, ±12 saatlik hiçbir dilimde
         gün sınırını geçmez. */
      ref.setHours(12,0,0,0);
      return ref.toISOString();
    },

    /* §6 — su takibi. D16'da "oturumluk" diye açık kalmıştı; artık kalıcı. */
    /* R20/K20 · `suEkle` ve `suSifirla` SÖKÜLDÜ. Ölçüldü: çağıranları 0'dı
       (tek geçiş bir yorum satırıydı) ve `bugun.su` alanını yazan da 0'dı.
       R18'de su tek kaynağa (`dm_fit_su_v1` · FIT_SU) taşınmış, kabuk tarafı
       geride kalmıştı. İki uç durdukça bir sonraki geliştiricinin onları
       çağırıp İKİNCİ bir su deposu doğurma riski vardı.
       `bugun.su` alanı DURUYOR — fit-su.js'in tek seferlik göç okuması onu
       hâlâ okuyor; yazan artık yok. */

    /* §3.7 — gün sonu. D12'de "şemada yer yok" diye açık kalmıştı.
       Hepsi isteğe bağlı; boş gönderilen alan yazılmaz, silinmez. */
    gunSonuKaydet:function(v){
      var s=read();
      s.bugun.gunSonu = {
        not:(v&&v.not)||'', zorluk:(v&&v.zorluk)||null, efor:(v&&v.efor)||null,
        enerji:(v&&v.enerji)||null, agri:(v&&v.agri)||'',
        tarih:new Date().toISOString()
      };
      s.bugun.tamam = true;
      return write(s);
    },
    programDurakla:function(){ var s=read(); if(s.program)s.program.durum='duraklatildi'; return write(s); },
    programDevam:function(){   var s=read(); if(s.program)s.program.durum='devam';        return write(s); },
    programBirak:function(){   var s=read(); if(s.program)s.program.durum='birakildi';    return write(s); },
    programYenidenBasla:function(){
      var s=read();
      if(s.program){ s.program.durum='devam'; s.program.hafta=1; s.program.gun=1; s.program.biten=0; s.program.kacan=0; }
      return write(s);
    },
    /* kaçırılan gün: kaydır = planı ötele · atla = günü tüket. İkisinde de suçluluk dili yok. */
    gunKaydir:function(){ var s=read(); if(s.program){ s.program.kacan=(s.program.kacan||0)+1; } return write(s); },
    gunAtla:function(){   var s=read(); if(s.program){ s.program.gun++; } return write(s); },

    /* ---- tamamlanan antrenman → Enerji Defteri + ilerleme (belge §19) ---- */
    antrenmanTamamla:function(a){
      var s=read(), ad=(a&&a.ad)||'Antrenman';
      /* R14-B · dk ARTIK ÜÇ DURUMLU — kcal ile simetrik.
         Eskiden `(a&&a.dk)||25` idi: süresi bilinmeyen bir kayıt sessizce
         "25 dk" oluyordu. Plan köprüsü tam bu duruma düşüyor — üretilen
         planda ay süresi YOK (`secimler`de süre alanı yok,
         `hareketler[].sure` null), yalnız set/tekrar/dinlenme var. 25
         yazmak uydurma olurdu; kanıt kademesinin öldürmeye çalıştığı şey
         de bu (programlarim-v1.html#programlarim'de `antrenmanTamamla` bu yüzden hiç
         çağrılmıyordu: "gecmis'e 'Gün sonu · 0 dk' diye sahte bir
         antrenman kaydı düşürür").
           sayı verildi (0 dahil) → o sayı
           açıkça null verildi    → BİLİNMİYOR, sayıya çevrilmez
           hiç verilmedi          → 25 (eski çağrılar kırılmaz) */
      var dk;
      if      (a && typeof a.dk === 'number') dk = a.dk;
      else if (a && 'dk' in a)                dk = null;
      else                                    dk = 25;
      /* kcal ÜÇ DURUM taşır — eskiden ikisi aynıydı ve bu, kanıt kademesinin
         tam da öldürmeye çalıştığı uydurmayı üretiyordu:
           sayı verildi (0 dahil) → o sayı
           açıkça null verildi   → BİLİNMİYOR, sayıya çevrilmez
           hiç verilmedi         → 280 (eski çağrılar kırılmasın)
         Eskiden `(a&&a.kcal)||280` yüzünden `kcal:0` ve `kcal:null` de 280'e
         düşüyordu: çağıran "bilmiyorum" diyemiyor, uydurmak zorunda kalıyordu. */
      var kcal;
      if      (a && typeof a.kcal === 'number') kcal = a.kcal;
      else if (a && 'kcal' in a)                kcal = null;
      else                                      kcal = 280;
      /* KANIT KADEMESİ — çağıran neye dayandığını SÖYLEMEK ZORUNDA.
         Söylemezse 'beyan' yazılır, çünkü söylenmeyen şey ölçülmüş sayılamaz.
         Uydurma bir kademe yazmaktansa zayıf ama doğru olanı yazıyoruz. */
      var kaynak = (a&&a.kaynak && KAYNAKLAR.indexOf(a.kaynak)>=0) ? a.kaynak : 'beyan';
      /* R20/K13 · "BUGÜN" YALNIZ BUGÜNÜ SAYAR. Eskiden sayaç, kaydın TARİHİNE
         bakmadan artıyordu: geriye dönük ya da cihazdan gelen bir kayıt
         (9 gün önce, 40 dk) bugünün rakamına giriyordu. Gün dönümü düzeltmesi
         tek başına yetmez — kaydın kendi tarihi de sorulmak zorunda.
         `tarihISO` verilmemişse kayıt zaten şimdi doğuyor, bugüne yazılır. */
      var _kayitISO = (a && a.tarihISO) || null;
      var _bugunMu = !_kayitISO || bugunAnahtar(new Date(_kayitISO)) === bugunAnahtar();
      if(_bugunMu){
        s.bugun.dk += (dk||0); s.bugun.kcal += (kcal||0); s.bugun.tamam = true;
      }
      /* R15/5 · ÜÇ ALAN EKLENDİ — challenge motorunun tek hunisi.
         Üçü de İSTEĞE BAĞLI; eski kayıtlarda yok ve okuyan taraf yokluğu
         göstermez, uydurmaz (fit-plan-kayit.js v2 şema göçünün deseni).
           tarihISO → süreli hedef penceresi + alışkanlık serisi
           slug     → egzersiz serisi eşleşmesi
           metrik   → sayısal hedef toplamı, ör. {km,tekrar,set,dk,adim}
         `goc()` DEĞİŞMEDİ, yeni olay kanalı da gerekmedi: `write()` zaten
         `fit:state` yayınlıyor ve `fit-challenge.js` ona abone. */
      s.gecmis.unshift({
        /* R20/K14 · `tarih:'bugün'` sabiti KALKTI — yazılan her kaydın tarihi
           harfi harfine "bugün" oluyordu ve ekrana basılan alan oydu. */
        tarihISO:(a && a.tarihISO) || new Date().toISOString(),
        ad:ad,
        slug:(a && a.slug) || null,
        metrik:(a && a.metrik && typeof a.metrik==='object') ? a.metrik : null,
        dk:dk, kcal:kcal, kaynak:kaynak
      });
      /* R20/K15 · haftalık dizinin son elemanını artıran satır KALKTI:
         diğer beş değeri yazan kod hiç yoktu, hafta kaydırması da yoktu.
         Ritim artık `haftalik()` ile gecmis[].tarihISO'dan türetiliyor. */
      if(s.program && s.program.durum==='devam'){
        s.program.biten++;
        if(s.program.biten>=s.program.toplam){
          s.program.durum='tamamlandi';
          /* R20/K11 · PROGRAMI BİTİRMEK ROZETİ VERMİYORDU. Ölçüldü: 3 aylık
             program 3/3 bitirildi → durum 'tamamlandi', ama `arsiv` boş,
             `bitenProgram` 0, "İlk Program" rozeti "yolda". Rozet ancak
             HAFTALAR SONRA alakasız bir program başlatılınca düşüyordu, çünkü
             arşive yazan tek yol `programBasla`nın içindeki otomatik arşivlemeydi.
             Artık biten program ANINDA arşive geçiyor.
             Program NESNESİ SİLİNMİYOR: kutlama ekranı, bitiş kartı ve
             "Geçmiş programların" aynı anda doğru kalsın diye kayıt hem
             duruyor hem arşivde. Çift sayımı `arsivlendi` bayrağı önler —
             `programBasla` bayraklı programı ikinci kez arşivlemez. */
          if(!s.program.arsivlendi){
            s.arsiv.unshift(_arsivKaydi(s.program, 'tamamlandi'));
            s.program.arsivlendi = true;
          }
        }
        else { s.program.gun++; if(s.program.gun>7){ s.program.gun=1; s.program.hafta++; } }
      }
      return write(s);
    },

    /* ---- R14-B/#5 · PLAN ARŞİVİ -------------------------------------
       Arşiv ekranı (fit-planim-programim → arsivBas) ve şeması hazırdı
       ({durum, biten, toplam, bitis}) ama yalnız PROGRAM tarafından
       besleniyordu; biten bir plan hiçbir yere düşmüyor, ekran "Henüz
       arşivlenmiş program yok" demeye devam ediyordu.

       `kaynak` alanı ekleniyor: bir arşiv satırının programdan mı plandan
       mı geldiği kaydın kendisinden okunmalı. Eski kayıtlarda alan yok —
       okuyan taraf yokluğu 'program' sayar (o güne kadar yalnız program
       yazıyordu, bu bir varsayım değil kayıt altındaki gerçek).
       `biten/toplam` planda GÜN sayısıdır: bir gün bir antrenmandır. */
    planArsivle:function(k){
      var s=read();
      s.arsiv.unshift({
        kaynak:'plan', slug:k.slug, ad:k.ad, durum:'tamamlandi',
        biten:k.biten||0, kacan:0, toplam:k.toplam||0,
        /* `oran` AYRI TAŞINIYOR, biten/toplam'dan türetilmiyor. Planda bu iki
           sayı iki ayrı şeyi ölçer: biten/toplam GÜN sayısıdır (hepsi karar
           aldıysa 3/3), oran ise HAREKET düzeyindedir ve atlananı saymaz.
           Türetseydik arşiv "%100" derken bitiş kartı "%93" diyecekti —
           aynı kayıt için iki farklı yüzde. */
        oran:(typeof k.oran==='number'?k.oran:null),
        baslangic:k.baslangic||null, bitis:k.bitis||new Date().toISOString(),
        tur:k.tur||1
      });
      return write(s);
    },

    /* ---- R14-B/#7 · BİLDİRİM AKIŞI ----------------------------------
       bildirimler-v1 tamamen sabit HTML'di; "3. gün tamamlandı" satırı
       ekranda duruyordu ama hiçbir veriye bağlı değildi. Artık gerçek
       olaylar buraya yazılıyor, sayfa bunları basıyor.
       Aynı olay iki kez yazılmasın diye `anahtar` benzersizdir. */
    bildirimEkle:function(b){
      var s=read();
      if(!Array.isArray(s.bildirimler)) s.bildirimler=[];
      var ah = b && b.anahtar;
      if(ah && s.bildirimler.some(function(x){ return x.anahtar===ah; })) return s;
      s.bildirimler.unshift({
        anahtar: ah || ('b_'+Date.now()),
        tur:     (b&&b.tur)||'sistem',
        baslik:  (b&&b.baslik)||'',
        metin:   (b&&b.metin)||'',
        href:    (b&&b.href)||null,
        tarih:   (b&&b.tarih)||new Date().toISOString(),
        okundu:  false
      });
      if(s.bildirimler.length>50) s.bildirimler.length=50;
      return write(s);
    },
    bildirimOkundu:function(anahtar){
      var s=read();
      (s.bildirimler||[]).forEach(function(x){ if(!anahtar||x.anahtar===anahtar) x.okundu=true; });
      return write(s);
    },
    /* Silme GERİ ALINABİLİR olmalı — sayfada zaten bir "geri al" şeridi var.
       Kaydı diziden çıkarmak geri almayı imkânsız kılardı; işaretleniyor.
       İşaretli kayıt basılmaz. */
    bildirimSil:function(anahtar, geriAl){
      var s=read();
      (s.bildirimler||[]).forEach(function(x){ if(x.anahtar===anahtar) x.silindi = !geriAl; });
      return write(s);
    },

    /* ---- challenge ----
       R16/1 · İKİNCİ KAYIT YERİ SÖKÜLDÜ.
       Burada dört yazma ucu vardı ve `s.challenge` tek nesnesini ELLE
       ARTIRIYORDU: katıl → gun:1/seri:1, günü tamamla → gun++/seri++,
       kaçır → telafi++, bırak → durum. Hiçbiri kanıt almıyordu ve
       `fit-challenge.js` aynı soruya BAŞKA bir cevap veriyordu: o,
       ilerlemeyi `gecmis[]`ten her seferinde YENİDEN HESAPLIYOR.
       Aynı veriye iki yazıcı, biri sayaç biri hesap — bu depoda üç kez
       temizlenen "aynı soruya iki cevap" kusurunun tam kendisi.
       ÖLÇÜLDÜ: dördünün de çağıranı 0'dı (sayfalar R15/5'te motora geçti).
       Yazma artık YALNIZ `FIT_CHALLENGE.katil/birak/isaretle`den geçer.
       `s.challenge` alanı DURUYOR ve okunmaya devam ediyor (programlarim ·
       kabuğun modül rozeti); ona motorun `_yansit()`i yazar — okuyan taraf
       kırılmadı, yazan taraf teke indi. */
    /* ---- randevu yaşam döngüsü (belge §11, 9 adım) ---- */
    randevuAl:function(r){
      var s=read();
      s.randevular = s.randevular || [];
      /* R15 · Ajan 5'in ölçümü: `durum` gelse bile YOK SAYILIYORDU, her
         randevu sabit 'onay-bekliyor' oluyordu. Sonuç: "Onaylandı" ya da
         "Tamamlandı" hiçbir zaman doğal yoldan doğmuyor, ancak
         `randevuDurum(i,d)` ile elle kuruluyordu — yani ekranlar tek bir
         hâli gösterebiliyordu. Çağıran artık söyleyebilir; söylemezse
         varsayılan yine 'onay-bekliyor'. Bilinmeyen bir dizge kabul
         edilmiyor: uydurma bir durum, olmayan bir rozet demek olurdu. */
      var DURUMLAR = ['onay-bekliyor','onaylandi','tamamlandi','iptal','ertelendi','gelmedi'];
      var d = (r && DURUMLAR.indexOf(r.durum) > -1) ? r.durum : 'onay-bekliyor';
      s.randevular.unshift({sef:r.antrenor, slug:r.slug, hizmet:r.hizmet, fiyat:r.fiyat,
                            tarih:r.tarih, saat:r.saat, durum:d});
      return write(s);
    },
    randevuDurum:function(i,d){ var s=read(); if(s.randevular&&s.randevular[i])s.randevular[i].durum=d; return write(s); },
    randevuEtiket:function(d){
      return {'onay-bekliyor':'Onay bekliyor','onaylandi':'Onaylandı','tamamlandi':'Tamamlandı',
              'iptal':'İptal edildi','ertelendi':'Ertelendi','gelmedi':'Gelinmedi'}[d]||d;
    },
    randevuRozet:function(d){
      return {'onay-bekliyor':'wait','onaylandi':'ok','tamamlandi':'ok',
              'iptal':'off','ertelendi':'wait','gelmedi':'stop'}[d]||'off';
    },

    /* durum → okunur etiket (renge EK OLARAK metin — belge §14.3) */
    etiket:function(d){
      return {devam:'Devam ediyor', duraklatildi:'Duraklatıldı', birakildi:'Bırakıldı',
              tamamlandi:'Tamamlandı'}[d] || 'Başlanmadı';
    },
    rozet:function(d){
      return {devam:'ok', duraklatildi:'wait', birakildi:'off', tamamlandi:'ok'}[d] || 'off';
    }
  };
  window.FIT_SHELL = window.FIT_SHELL || {};
  window.FIT_SHELL.state = API;

  /* ============================================================
     PLAN → PROGRAM KÖPRÜSÜ  (R14-B · Beyar kararı #4)
     ------------------------------------------------------------
     Ölçülen kopukluk: iki ayrı sistem birbirine hiç dokunmuyordu.
       PLAN    → FIT_PLAN / dm_fit_planlar_v1 · Tam/Yarım/Atlandı
       PROGRAM → bu modül / dm_fit           · biten++ · arşiv · geçmiş
     Plan %100 olduğunda bile `program` null, `bugun.tamam` false,
     `gecmis` ve `arsiv` boş kalıyordu. `antrenmanTamamla()` dört
     sayfadan çağrılıyordu ama Programım sayfası listede yoktu.

     Köprü BURADA duruyor, sayfada değil: `FIT_PLAN.isaretle()` üç ayrı
     sayfadan çağrılıyor (programim · ilerleme · gecmis); köprüyü sayfaya
     yazsaydık ya çoğaltılır ya eksik kalırdı. Kabuk 66 sayfada var.

     KANIT KADEMESİ 'beyan' (Beyar kararı): kullanıcı kendi işaretledi,
     bu bir beyandır — ölçülmüş değil, ama YOK da sayılmaz.
     SÜRE ve KALORİ açıkça null: üretilen planda ay süresi yok, uydurmak
     kanıt kademesini anlamsız kılardı. Okuyan ekranlar "—" basar.

     TEK SEFERLİK: mühür FIT_PLAN.gunDurum[k].kayit. Kullanıcı işareti geri
     alıp günü tekrar tamamlarsa ikinci kayıt yazılmaz.
     ============================================================ */
  window.addEventListener('fit-plan-degisti', function (e) {
    var d = (e && e.detail) || {};
    if (!window.FIT_PLAN) return;
    if (!d.gunTamamlandi && !d.planTamamlandi) return;
    var p = FIT_PLAN.getir(d.id);
    if (!p) return;
    var tur = (typeof p.tur === 'number' ? p.tur : 1);

    /* --- gün bitti: geçmiş kaydı + bildirim --- */
    if (d.gunTamamlandi) {
      var g   = (p.gunler || []).filter(function (x) { return x.no === d.gunTamamlandi; })[0];
      var gAd = (g && g.ad) || ('Gün ' + d.gunTamamlandi);
      API.antrenmanTamamla({
        ad:     gAd,
        dk:     null,          /* BİLİNMİYOR — planda ay süresi yok */
        kcal:   null,          /* BİLİNMİYOR */
        kaynak: 'beyan'
      });
      FIT_PLAN.gunKayitIsaretle(p.id, d.gunTamamlandi);

      /* R14-B/#7 — bildirim metni VERİDEN kuruluyor; sıradaki gün gerçekten
         varsa söylenir, yoksa cümle uydurulmaz. */
      var o       = FIT_PLAN.ozet(p.id) || {};
      var sonraki = (p.gunler || []).filter(function (x) { return x.no > d.gunTamamlandi; })[0];
      API.bildirimEkle({
        anahtar: p.id + '|t' + tur + '|g' + d.gunTamamlandi,
        tur:     'program',
        baslik:  '"' + (p.ad || 'Planın') + '" planında ' + gAd + ' tamamlandı.',
        metin:   sonraki
                   ? 'Sıradaki gün: ' + (sonraki.ad || ('Gün ' + sonraki.no)) + '.'
                   : 'Planın son günüydü.',
        href:    'programlarim-v1.html?plan=#takvim' + p.id
      });
    }

    /* --- plan bitti: arşiv kaydı + bildirim --- */
    if (d.planTamamlandi) {
      var oz = FIT_PLAN.ozet(p.id) || {};
      API.planArsivle({
        slug:      p.id,
        ad:        p.ad || 'Planım',
        biten:     oz.bitenGun || 0,
        toplam:    oz.gunSayisi || 0,
        oran:      (typeof oz.oran === 'number' ? oz.oran : null),
        baslangic: p.olusturma || null,
        bitis:     p.bitis || null,
        tur:       tur
      });
      FIT_PLAN.planArsivIsaretle(p.id);
      API.bildirimEkle({
        anahtar: p.id + '|t' + tur + '|plan',
        tur:     'program',
        baslik:  '"' + (p.ad || 'Planın') + '" planını bitirdin.',
        metin:   (oz.gunSayisi || 0) + ' gün, ' + (oz.toplam || 0) + ' hareket. ' +
                 'Özet Plan ve Takvim sayfasında, kayıt arşivde.',
        href:    'programlarim-v1.html?plan=#takvim' + p.id
      });
    }
  });
})();

/* ══ SOHBET API ÇEKİRDEĞİ · fit-mesaj.js'ten ÇIKARILDI ══
   Satır 76→496 (veri · biçimleme · görünüm yardımcıları).
   FAB/panel kurucusu (498→795) BİLEREK DIŞARIDA — gerekçe
   üreticide, "CERRAHİ ENJEKSİYON" başlığı altında. */
(function (kok) {
  'use strict';

  var ANAHTAR = 'dm_fit_mesaj_v1';
  var YONLER  = ['uye', 'sef'];
  var EK_SINIR = 20 * 1024 * 1024;          /* 20 MB — künye sınırı, bkz. `ekSec` */

  /* Açılış demosu — SABİT, depoya yazılmaz, yalnız ilk antrenörde görünür.
     Tarihler sabittir: her açılışta "az önce" görünmesi sahtelik olurdu. */
  var DEMO = [
    { id:'demo-1', yon:'sef', demo:true, tarih:'2026-08-27T06:12:00.000Z',
      metin:'Merhaba! Randevunu aldım. İlk aytan önce iki şeyi bilmem gerekiyor: son altı ayda bir sakatlık yaşadın mı ve haftada kaç gün ayırabilirsin?' },
    { id:'demo-2', yon:'uye', demo:true, tarih:'2026-08-27T06:41:00.000Z',
      metin:'Sakatlık yok. Haftada üç gün ayırabilirim, akşamları daha uygun.' },
    { id:'demo-3', yon:'sef', demo:true, tarih:'2026-08-27T07:05:00.000Z',
      metin:'Üç gün yeter. İlk ayta hareket taramasi yapacağız, spor ayakkabı ve su yanında olsun.' }
  ];

  /* ---- düşük seviye: oku / yaz ------------------------------------ */
  function bos() { return { surum: 1, sohbetler: {} }; }

  /* GÖÇ — okuma anında, yazma anında değil. Alan bazlı tamamlama:
     eski kayıt kırılmaz, eksik alan varsayılanla dolar, var olan hiçbir
     değer ezilmez (FIT_PLAN'ın `goc` dersi). */
  function goc(d) {
    if (!d || typeof d !== 'object') return bos();
    if (typeof d.surum !== 'number') d.surum = 1;
    if (!d.sohbetler || typeof d.sohbetler !== 'object') d.sohbetler = {};
    Object.keys(d.sohbetler).forEach(function (s) {
      var c = d.sohbetler[s];
      if (!c || typeof c !== 'object') { delete d.sohbetler[s]; return; }
      if (!Array.isArray(c.mesajlar)) c.mesajlar = [];
      if (!('okundu' in c)) c.okundu = null;
      c.slug = c.slug || s;
      c.mesajlar = c.mesajlar.filter(function (m) {
        return m && YONLER.indexOf(m.yon) > -1 && typeof m.tarih === 'string';
      });
    });
    return d;
  }

  function oku() {
    try {
      var ham = kok.localStorage.getItem(ANAHTAR);
      if (!ham) return bos();
      return goc(JSON.parse(ham));
    } catch (e) { return bos(); }
  }

  function yaz(d) {
    try { kok.localStorage.setItem(ANAHTAR, JSON.stringify(d)); return true; }
    catch (e) { return false; }                 /* kota dolu / gizli kip */
  }

  function haberVer(slug) {
    try {
      kok.dispatchEvent(new CustomEvent('fit-mesaj-degisti', {
        detail: { slug: slug || null, sayi: API.toplamSayi(), okunmamis: API.okunmamis() }
      }));
    } catch (e) {}
  }

  function S() { return kok.FIT_SHELL && kok.FIT_SHELL.state; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function yeniId() {
    return 'm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  /* ---- biçimleme --------------------------------------------------- */
  function tarihObj(iso) { var t = new Date(iso); return isNaN(t.getTime()) ? null : t; }

  function saatMetni(iso) {
    var t = tarihObj(iso); if (!t) return '';
    try { return t.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  }

  function gunMetni(iso) {
    var t = tarihObj(iso); if (!t) return '';
    var bugun = new Date(), dun = new Date(bugun.getTime() - 86400000);
    function ayniGun(a, b) {
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }
    if (ayniGun(t, bugun)) return 'Bugün';
    if (ayniGun(t, dun))   return 'Dün';
    try { return t.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }); }
    catch (e) { return ''; }
  }

  function boyutMetni(b) {
    var n = Number(b);
    if (!isFinite(n) || n < 0) return '';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
    return (n / 1024 / 1024).toFixed(1) + ' MB';
  }

  function monogram(ad) {
    var p = String(ad || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '?';
    if (p.length === 1) return p[0].slice(0, 2).toLocaleUpperCase('tr-TR');
    return (p[0][0] + p[p.length - 1][0]).toLocaleUpperCase('tr-TR');
  }

  var EK_IKON = [
    [/^image\//,                        'fa-solid fa-image'],
    [/^video\//,                        'fa-solid fa-film'],
    [/^audio\//,                        'fa-solid fa-music'],
    [/pdf/,                             'fa-solid fa-file-pdf'],
    [/sheet|excel|csv/,                 'fa-solid fa-file-csv'],
    [/word|document|text\/plain/,       'fa-solid fa-file-lines']
  ];
  function ekIkon(tur) {
    var t = String(tur || '');
    for (var i = 0; i < EK_IKON.length; i++) if (EK_IKON[i][0].test(t)) return EK_IKON[i][1];
    return 'fa-solid fa-paperclip';
  }

  /* =====================================================================
     GENEL YÜZEY
     ===================================================================== */
  var API = {

    ANAHTAR: ANAHTAR,
    DEMO:    DEMO,

    kullanilabilir: function () {
      try {
        kok.localStorage.setItem('__fit_msj__', '1');
        kok.localStorage.removeItem('__fit_msj__');
        return true;
      } catch (e) { return false; }
    },

    oku: oku,

    /* Randevu alınmış antrenörler — en yeni randevu başta, slug'a göre tekil.
       KAYNAK kabuğun durum modülü; bu modül kendi antrenör listesi tutmaz. */
    antrenorler: function () {
      var st = S(); if (!st) return [];
      var r = st.read().randevular || [];
      var gorulen = {}, out = [];
      r.forEach(function (x) {
        if (!x || !x.slug || !x.antrenor) return;      /* adsız kayıt atlanır */
        if (gorulen[x.slug]) return;
        gorulen[x.slug] = 1;
        out.push({
          slug:     String(x.slug),
          sef: String(x.antrenor),
          hizmet:   x.hizmet ? String(x.hizmet) : '',
          tarih:    x.tarih  ? String(x.tarih)  : '',
          saat:     x.saat   ? String(x.saat)   : '',
          durum:    x.durum  ? String(x.durum)  : ''
        });
      });
      return out;
    },

    /* Randevu durumunun rozet sınıfı — kabuğun kendi tablosundan.
       Burada ikinci bir eşleme tutmak iki kaynak demek olurdu. */
    durumRozet: function (durum) {
      var st = S();
      if (st && typeof st.randevuRozet === 'function') return st.randevuRozet(durum);
      return 'off';
    },
    durumEtiket: function (durum) {
      var st = S();
      if (st && typeof st.randevuEtiket === 'function') return st.randevuEtiket(durum);
      return durum || '';
    },

    /* Bir sohbetin TÜM mesajları: sabit demo + depodakiler, eskiden yeniye.
       Demo yalnız listedeki İLK antrenöre bağlıdır (bkz. NE UYDURULMAZ):
       panel o antrenörle açıldığı için açılış ekranı dolu gelir.
       ⚠ Liste EN YENİ randevu başta sıralı; yeni randevu alınırsa demo yeni
       antrenöre geçer, eskisi boşalır. Maket için kabul edilebilir bir
       kayma; gerçek veri gelince `DEMO` tamamen kalkacağı için sabitlemedim.
       Beyar aksini isterse tek satır: `antrenorler().slice(-1)[0]`. */
    mesajlar: function (slug) {
      if (!slug) return [];
      var ilk = API.antrenorler()[0];
      var demo = (ilk && ilk.slug === slug) ? DEMO.slice() : [];
      var c = oku().sohbetler[slug];
      var kendi = c ? c.mesajlar.slice() : [];
      return demo.concat(kendi).sort(function (a, b) {
        return String(a.tarih).localeCompare(String(b.tarih));
      });
    },

    sonMesaj: function (slug) {
      var l = API.mesajlar(slug);
      return l.length ? l[l.length - 1] : null;
    },

    /* Üyenin mesajını KAYDEDER. Karşı tarafa iletmez ve iletiyormuş gibi
       yapmaz — dönen değer yalnız "kaydedildi mi" sorusunun cevabıdır. */
    gonder: function (slug, metin, ek) {
      if (!slug) return null;
      var t = String(metin == null ? '' : metin).trim();
      if (!t && !ek) return null;

      var kayit = API.antrenorler().filter(function (a) { return a.slug === slug; })[0];
      if (!kayit) return null;                 /* randevusu olmayan antrenör */

      var d = oku();
      if (!d.sohbetler[slug]) {
        d.sohbetler[slug] = { slug: slug, sef: kayit.antrenor, okundu: null, mesajlar: [] };
      }
      d.sohbetler[slug].antrenor = kayit.antrenor;   /* ad randevudan tazelenir */

      var m = {
        id:    yeniId(),
        yon:   'uye',
        metin: t,
        tarih: new Date().toISOString(),
        ek:    ek ? { ad: String(ek.ad), boyut: Number(ek.boyut) || 0, tur: String(ek.tur || '') } : null
      };
      d.sohbetler[slug].mesajlar.push(m);
      if (!yaz(d)) return null;
      haberVer(slug);
      return m;
    },

    /* Sohbeti okundu say. Yalnız ANTRENÖR mesajları okunmamış olabilir;
       üyenin kendi yazdığı zaten okunmuştur. */
    okunduIsaretle: function (slug) {
      if (!slug) return false;
      var kayit = API.antrenorler().filter(function (a) { return a.slug === slug; })[0];
      if (!kayit) return false;
      var d = oku();
      if (!d.sohbetler[slug]) {
        d.sohbetler[slug] = { slug: slug, sef: kayit.antrenor, okundu: null, mesajlar: [] };
      }
      var yeni = new Date().toISOString();
      if (d.sohbetler[slug].okundu === yeni) return true;
      d.sohbetler[slug].okundu = yeni;
      if (!yaz(d)) return false;
      haberVer(slug);
      return true;
    },

    /* Bir sohbette okunmamış ANTRENÖR mesajı sayısı. */
    okunmamisSayi: function (slug) {
      var c = oku().sohbetler[slug];
      var okundu = c ? c.okundu : null;
      return API.mesajlar(slug).filter(function (m) {
        return m.yon === 'sef' && (!okundu || String(m.tarih) > String(okundu));
      }).length;
    },

    /* Tüm sohbetlerdeki okunmamış toplamı — yüzen düğmenin rozeti. */
    okunmamis: function () {
      return API.antrenorler().reduce(function (t, a) { return t + API.okunmamisSayi(a.slug); }, 0);
    },

    toplamSayi: function () {
      return API.antrenorler().reduce(function (t, a) { return t + API.mesajlar(a.slug).length; }, 0);
    },

    /* Arama — tüm sohbetlerde metin geçen mesajlar, yeniden eskiye. */
    ara: function (q) {
      var s = String(q || '').trim().toLocaleLowerCase('tr-TR');
      if (s.length < 2) return [];
      var out = [];
      API.antrenorler().forEach(function (a) {
        API.mesajlar(a.slug).forEach(function (m) {
          var govde = String(m.metin || '') + ' ' + (m.ek ? m.ek.ad : '');
          if (govde.toLocaleLowerCase('tr-TR').indexOf(s) > -1) {
            out.push({ slug: a.slug, sef: a.antrenor, mesaj: m });
          }
        });
      });
      return out.sort(function (x, y) { return String(y.mesaj.tarih).localeCompare(String(x.mesaj.tarih)); });
    },

    temizle: function () {
      try { kok.localStorage.removeItem(ANAHTAR); haberVer(null); return true; }
      catch (e) { return false; }
    },

    /* ---- görünüm yardımcıları (iki yüzey de aynı HTML'i basar) ------ */
    esc: esc,
    monogram: monogram,
    saatMetni: saatMetni,
    gunMetni: gunMetni,
    boyutMetni: boyutMetni,
    ekIkon: ekIkon,

    /* Bir mesaj listesini balonlara çevirir. Gün ayracı, künye, ek şeridi
       ve `Örnek` rozeti burada basılır — iki yüzeyde iki farklı balon
       görünümü olmasın diye. */
    akisHtml: function (liste) {
      if (!liste.length) return '';
      var sonGun = '';
      return liste.map(function (m) {
        var g = gunMetni(m.tarih), ayrac = '';
        if (g && g !== sonGun) { ayrac = '<div class="msj-gun">' + esc(g) + '</div>'; sonGun = g; }
        var kim = m.yon === 'uye' ? 'uye' : 'sef';
        var ek = m.ek
          ? '<span class="msj-ek"><i class="' + ekIkon(m.ek.tur) + '" aria-hidden="true"></i>' +
            '<b>' + esc(m.ek.ad) + '</b><small>' + esc(boyutMetni(m.ek.boyut)) + '</small></span>'
          : '';
        return ayrac +
          '<div class="msj-balon ' + kim + '">' +
            '<p>' + esc(m.metin) + '</p>' + ek +
            '<span class="msj-kunye">' +
              (m.demo ? '<span class="fp-badge off">Örnek</span>' : '') +
              esc(saatMetni(m.tarih)) +
            '</span>' +
          '</div>';
      }).join('');
    },

    /* Yazma kutusu — panel ve sayfa AYNI markup'ı kullanır. */
    yazHtml: function (idOnek) {
      return '' +
        '<div class="msj-yaz">' +
          '<div class="msj-secilen" id="' + idOnek + 'Ek" hidden>' +
            '<i class="fa-solid fa-paperclip" aria-hidden="true"></i>' +
            '<b></b><small></small>' +
            '<button type="button" data-ek-sil aria-label="Eki kaldır"><i class="fa-solid fa-xmark"></i></button>' +
          '</div>' +
          '<form novalidate>' +
            '<input type="file" id="' + idOnek + 'Dosya" tabindex="-1" aria-hidden="true" />' +
            '<button class="msj-btn ek" type="button" data-ek-ac aria-label="Dosya ekle" title="Dosya ekle">' +
              '<i class="fa-solid fa-paperclip" aria-hidden="true"></i></button>' +
            '<label class="sr-only" for="' + idOnek + 'Metin">Mesajın</label>' +
            '<textarea id="' + idOnek + 'Metin" rows="1" placeholder="Mesajını yaz…"></textarea>' +
            '<button class="msj-btn gonder" type="submit" aria-label="Mesajı kaydet" title="Mesajı kaydet">' +
              '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button>' +
          '</form>' +
          '<p class="msj-uyari" id="' + idOnek + 'Uyari" hidden></p>' +
          '<p class="msj-ipucu">Dosya eki maket: adı ve boyutu kaydedilir, dosyanın kendisi yüklenmez.</p>' +
        '</div>';
    },

    /* Yazma kutusunu çalıştırır. `seciliSlug()` o anki sohbeti döndürmeli,
       `sonra()` kayıttan sonra çağrılır. Tek yerde: iki yüzeyde iki ayrı
       gönderme kodu olsaydı biri sessizce bozulurdu. */
    yazBagla: function (kokEl, idOnek, seciliSlug, sonra) {
      var form   = kokEl.querySelector('.msj-yaz form');
      var metin  = kokEl.querySelector('#' + idOnek + 'Metin');
      var dosya  = kokEl.querySelector('#' + idOnek + 'Dosya');
      var serit  = kokEl.querySelector('#' + idOnek + 'Ek');
      var uyari  = kokEl.querySelector('#' + idOnek + 'Uyari');
      var ekBtn  = kokEl.querySelector('[data-ek-ac]');
      if (!form || !metin) return;

      var bekleyen = null;

      function uyar(t) {
        if (!uyari) return;
        uyari.textContent = t || '';
        uyari.hidden = !t;
      }
      function ekBas() {
        if (!serit) return;
        if (!bekleyen) { serit.hidden = true; if (ekBtn) ekBtn.classList.remove('is-dolu'); return; }
        serit.querySelector('b').textContent = bekleyen.ad;
        serit.querySelector('small').textContent = boyutMetni(bekleyen.boyut);
        serit.querySelector('i').className = ekIkon(bekleyen.tur);
        serit.hidden = false;
        if (ekBtn) ekBtn.classList.add('is-dolu');
      }
      function buyut() {
        metin.style.height = 'auto';
        metin.style.height = Math.min(metin.scrollHeight, 132) + 'px';
      }

      metin.addEventListener('input', buyut);
      metin.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', {cancelable:true})); }
      });

      if (ekBtn && dosya) ekBtn.addEventListener('click', function () { dosya.click(); });
      if (dosya) dosya.addEventListener('change', function () {
        var f = dosya.files && dosya.files[0];
        if (!f) { bekleyen = null; ekBas(); return; }
        if (f.size > EK_SINIR) {
          /* Sınır künyeye değil dürüstlüğe ait: 20 MB'lık bir dosyanın
             "eklendi" görünmesi, hiçbir yere gitmediği için yanıltıcı olur. */
          uyar('Bu dosya 20 MB üstünde. Maket ekranda yalnız dosya künyesi tutuluyor; bu boyutta bir eki künye olarak göstermek yanıltıcı olur.');
          dosya.value = ''; bekleyen = null; ekBas(); return;
        }
        uyar('');
        bekleyen = { ad: f.name, boyut: f.size, tur: f.type || '' };
        ekBas();
      });

      if (serit) serit.addEventListener('click', function (e) {
        if (!e.target.closest('[data-ek-sil]')) return;
        bekleyen = null; if (dosya) dosya.value = ''; ekBas();
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var slug = seciliSlug();
        if (!slug) { uyar('Önce bir şef seç.'); return; }
        if (!API.kullanilabilir()) {
          uyar('Tarayıcı depolaması kapalı — mesaj kaydedilemiyor. Gizli kipteysen kapatıp yeniden dene.');
          return;
        }
        var t = metin.value.trim();
        if (!t && !bekleyen) return;
        var m = API.gonder(slug, t, bekleyen);
        if (!m) { uyar('Mesaj kaydedilemedi.'); return; }
        uyar('');
        metin.value = ''; buyut();
        bekleyen = null; if (dosya) dosya.value = ''; ekBas();
        if (typeof sonra === 'function') sonra(m);
      });
    }
  };

  kok.FIT_MESAJ = API;
})(window);

/* ═══ SOHBET İÇERİĞİ · İKİ YÜZEY, TEK API ═════════════════════════════
   Yüzeyler: kabuk paneli (#msjPanel — 13 ekranda) ve sayfa yüzeyi
   (#msjKok — yalnız antrenörüm/Mesajlarım panosunda). İkisi de VAR OLAN
   markup'a bağlanır; eleman YARATILMAZ. Kaynağın iki ayrı sürücüsündeki
   basım mantığı birebir taşındı (fit-mesaj.js `basBas`/`kisilerBas`/
   `akisBas` · g-toplulugum.html `listeBas`/`akisBas`/`aramaBas`). */
(function () {
  var API = window.FIT_MESAJ;
  if (!API) return;
  var d = document;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ── A · KABUK PANELİ ────────────────────────────────────────────
     🔴 Bu blok panelin AÇ/KAPA'sına DOKUNMAZ. `classList`/`hidden`
        yazımı yok; yalnız içerik basar. Açılışı KABUK_JS yapıyor. */
  (function () {
    var panel = d.getElementById('msjPanel');
    if (!panel) return;
    var avaEl  = d.getElementById('msjBasAva'),
        adEl   = d.getElementById('msjBasAd'),
        altEl  = d.getElementById('msjBasAlt'),
        kisEl  = d.getElementById('msjKisiler'),
        akisEl = d.getElementById('msjAkis'),
        yazEl  = panel.querySelector('.msj-yaz');
    var secili = null;

    function basBas() {
      var a = API.antrenorler().filter(function (x) { return x.slug === secili; })[0];
      if (!adEl) return;
      if (!a) {
        if (avaEl) avaEl.hidden = true;
        adEl.textContent = 'Şef sohbeti';
        if (altEl) { altEl.textContent = 'Abone olduğun şef yok.'; altEl.removeAttribute('title'); }
        return;
      }
      if (avaEl) {
        avaEl.hidden = false;
        avaEl.className = 'msj-mono buyuk ' + API.durumRozet(a.durum);
        avaEl.textContent = API.monogram(a.antrenor);
      }
      adEl.textContent = a.antrenor;
      var alt = [API.durumEtiket(a.durum), a.hizmet,
                 [a.tarih, a.saat].filter(Boolean).join(' ')].filter(Boolean).join(' · ');
      if (altEl) { altEl.textContent = alt; altEl.setAttribute('title', alt); }
    }

    function kisilerBas() {
      var liste = API.antrenorler();
      if (secili && !liste.some(function (a) { return a.slug === secili; })) secili = null;
      if (!secili && liste.length) secili = liste[0].slug;
      if (!kisEl) return;
      /* Tek antrenörde seçici basılmaz — kaynağın kuralı. */
      if (liste.length < 2) { kisEl.hidden = true; kisEl.innerHTML = ''; return; }
      kisEl.hidden = false;
      kisEl.innerHTML = liste.map(function (a) {
        var on = a.slug === secili, n = API.okunmamisSayi(a.slug);
        return '<button class="msj-kisi" type="button" data-slug="' + esc(a.slug) + '" ' +
               'aria-pressed="' + (on ? 'true' : 'false') + '" ' +
               'title="' + esc(a.antrenor + ' · ' + API.durumEtiket(a.durum)) + '">' +
                 '<span class="msj-mono ' + esc(API.durumRozet(a.durum)) + '" aria-hidden="true">' +
                   esc(API.monogram(a.antrenor)) + '</span>' +
                 '<span>' + esc(a.antrenor) + '</span>' +
                 '<span class="msj-nokta"' + (n ? '' : ' hidden') + '></span>' +
               '</button>';
      }).join('');
    }

    function akisBas() {
      if (!akisEl) return;
      var liste = API.antrenorler();
      if (!liste.length) { akisEl.innerHTML = ''; return; }
      if (!secili) secili = liste[0].slug;
      var kayit = liste.filter(function (a) { return a.slug === secili; })[0];
      var m = API.mesajlar(secili);
      akisEl.innerHTML = m.length ? API.akisHtml(m)
        : '<div class="fp-card fpx-bos">' +
            '<span class="pe-ico"><i class="fa-solid fa-comment-dots" aria-hidden="true"></i></span>' +
            '<h4>' + esc(kayit ? kayit.antrenor : 'Şeflerin') + ' ile ilk mesaj sende</h4>' +
            '<p>Randevundan önce sormak istediğini buraya yaz. Maket ekranda mesajın kaydedilir, karşı tarafa iletilmez.</p>' +
          '</div>';
      akisEl.scrollTop = akisEl.scrollHeight;
    }

    function tazele() { kisilerBas(); basBas(); akisBas(); }

    if (kisEl) kisEl.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-slug]');
      if (!b) return;
      secili = b.getAttribute('data-slug');
      API.okunduIsaretle(secili);
      tazele();
    });

    if (yazEl) API.yazBagla(yazEl, 'msjP', function () { return secili; }, function () { akisBas(); });

    /* Panel AÇILDIĞINDA tazelenir. KABUK_JS'in dinleyicisi bizden ÖNCE
       kurulduğu için sınıf bu noktada değişmiş oluyor; biz yalnız
       OKURUZ. Kapanışta iş yok. */
    d.body.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('#msjFab');
      if (!t || t.tagName === 'A') return;
      if (!panel.classList.contains('acik')) return;
      tazele();
      if (secili) { API.okunduIsaretle(secili); kisilerBas(); }
    });

    tazele();
    window.addEventListener('fit-mesaj-degisti', tazele);
  })();

  /* ── B · SAYFA YÜZEYİ · #msjKok ─────────────────────────────────── */
  (function () {
    var kokEl = d.getElementById('msjKok');
    if (!kokEl) return;
    var araEl   = d.getElementById('msjAra'),
        araSil  = d.getElementById('msjAraSil'),
        sonucEl = d.getElementById('msjSonuc');
    var secili = null;

    function bosKart(ikon, baslik, metin, eylem) {
      return '<div class="fp-card fpx-bos msj-kol">' +
        '<span class="pe-ico"><i class="' + ikon + '" aria-hidden="true"></i></span>' +
        '<h4>' + esc(baslik) + '</h4><p>' + esc(metin) + '</p>' + (eylem || '') + '</div>';
    }

    function iskeletBas() {
      var liste = API.antrenorler();
      if (!d.body.classList.contains('is-auth')) {
        kokEl.innerHTML = bosKart('fa-solid fa-lock', 'Mesajların girişin arkasında',
          'Antrenör yazışmaları hesabına bağlı. Giriş yaptığında randevu aldığın antrenörler burada listelenir.',
          '<a class="btn btn-primary" href="g-giris.html">Giriş yap</a>');
        return false;
      }
      if (!liste.length) {
        kokEl.innerHTML = bosKart('fa-solid fa-user-tie', 'Henüz abone olduğun şef yok',
          'Yazışma abonelikle açılır: bir şefin üyeliğine katıldığında sohbetiniz burada başlar.',
          '<a class="btn btn-primary" href="sefler.html">Şeflere göz at</a>');
        return false;
      }
      if (!secili || !liste.some(function (a) { return a.slug === secili; })) secili = liste[0].slug;
      if (d.getElementById('msjListe')) return true;      /* iskelet duruyor */

      kokEl.innerHTML =
        '<div class="msj-sayfa">' +
          '<div class="msj-panel-kart">' +
            '<div class="msj-kart-bas"><div><h3>Yazışmalar</h3><small id="msjSayi"></small></div></div>' +
            '<div class="msj-liste" id="msjListe" role="group" aria-label="Şeflerin"></div>' +
          '</div>' +
          '<div class="msj-panel-kart">' +
            '<div class="msj-kart-bas" id="msjTepe"></div>' +
            '<div class="msj-akis" id="msjAkisS" tabindex="0" aria-live="polite" aria-label="Mesaj akışı"></div>' +
            API.yazHtml('msjS') +
          '</div>' +
        '</div>';

      API.yazBagla(kokEl, 'msjS', function () { return secili; },
                   function () { akisBas(); listeBas(); });

      d.getElementById('msjListe').addEventListener('click', function (e) {
        var b = e.target.closest('[data-slug]'); if (!b) return;
        secili = b.getAttribute('data-slug');
        API.okunduIsaretle(secili);
        listeBas(); akisBas();
      });
      return true;
    }

    function listeBas() {
      var el = d.getElementById('msjListe'), sayiEl = d.getElementById('msjSayi');
      if (!el) return;
      var liste = API.antrenorler();
      if (sayiEl) sayiEl.textContent = liste.length + ' şef · ' + API.toplamSayi() + ' mesaj';
      el.innerHTML = liste.map(function (a) {
        var on = a.slug === secili, son = API.sonMesaj(a.slug), n = API.okunmamisSayi(a.slug);
        var onizleme = son ? (son.yon === 'uye' ? 'Sen: ' : '') + (son.metin || (son.ek ? son.ek.ad : ''))
                           : 'Henüz mesaj yok';
        return '<button class="msj-liste-oge" type="button" data-slug="' + esc(a.slug) + '" ' +
               'aria-pressed="' + (on ? 'true' : 'false') + '">' +
                 '<span class="msj-mono ' + esc(API.durumRozet(a.durum)) + '" aria-hidden="true">' +
                   esc(API.monogram(a.antrenor)) + '</span>' +
                 '<span class="msj-liste-txt"><b>' + esc(a.antrenor) + '</b>' +
                   '<small>' + esc(onizleme) + '</small></span>' +
                 (n ? '<span class="fp-badge stop">' + n + '</span>' : '') +
               '</button>';
      }).join('');
    }

    function akisBas() {
      var el = d.getElementById('msjAkisS'), tepe = d.getElementById('msjTepe');
      if (!el || !secili) return;
      var a = API.antrenorler().filter(function (x) { return x.slug === secili; })[0];
      if (!a) return;
      if (tepe) tepe.innerHTML =
        '<span class="msj-mono buyuk ' + esc(API.durumRozet(a.durum)) + '" aria-hidden="true">' +
          esc(API.monogram(a.antrenor)) + '</span>' +
        '<div><h3>' + esc(a.antrenor) + '</h3><small>' + esc(a.hizmet || 'Randevu') +
          (a.tarih ? ' · ' + esc(a.tarih) : '') + (a.saat ? ' ' + esc(a.saat) : '') + '</small></div>' +
        '<span class="fp-badge ' + esc(API.durumRozet(a.durum)) + '">' +
          esc(API.durumEtiket(a.durum)) + '</span>';
      var m = API.mesajlar(secili);
      el.innerHTML = m.length ? API.akisHtml(m)
        : '<div class="fp-card fpx-bos">' +
            '<span class="pe-ico"><i class="fa-solid fa-comment-dots" aria-hidden="true"></i></span>' +
            '<h4>' + esc(a.antrenor) + ' ile ilk mesaj sende</h4>' +
            '<p>Randevundan önce sormak istediğini buraya yaz. Maket ekranda mesajın kaydedilir, karşı tarafa iletilmez.</p>' +
          '</div>';
      el.scrollTop = el.scrollHeight;
    }

    /* ---- ARAMA — sonuç akışın YERİNE değil ÜSTÜNDE durur ---------- */
    function vurgula(metin, q) {
      var h = esc(metin);
      if (!q) return h;
      var i = h.toLocaleLowerCase('tr-TR').indexOf(esc(q).toLocaleLowerCase('tr-TR'));
      if (i < 0) return h;
      var n = esc(q).length;
      return h.slice(0, i) + '<mark class="msj-vurgu">' + h.slice(i, i + n) + '</mark>' + h.slice(i + n);
    }

    function aramaBas() {
      if (!sonucEl) return;
      var q = (araEl && araEl.value || '').trim();
      if (araSil) araSil.hidden = !q;
      if (q.length < 2) { sonucEl.hidden = true; sonucEl.innerHTML = ''; return; }
      var bulunan = API.ara(q);
      sonucEl.hidden = false;
      if (!bulunan.length) {
        sonucEl.innerHTML =
          '<div class="fp-card fpx-bos">' +
            '<span class="pe-ico"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></span>' +
            '<h4>"' + esc(q) + '" için sonuç yok</h4>' +
            '<p>Arama yazışma metinlerinde ve eklenen dosya adlarında çalışır. Başka bir kelime dene.</p>' +
          '</div>';
        return;
      }
      sonucEl.innerHTML =
        '<p class="msj-sonuc-not">' + bulunan.length + ' mesaj bulundu — birine tıkla, sohbeti açsın.</p>' +
        '<div class="msj-panel-kart"><div class="msj-liste">' +
        bulunan.slice(0, 20).map(function (s) {
          var m = s.mesaj, govde = m.metin || (m.ek ? m.ek.ad : '');
          return '<button class="msj-liste-oge" type="button" data-git="' + esc(s.slug) + '">' +
                   '<span class="msj-mono" aria-hidden="true">' + esc(API.monogram(s.antrenor)) + '</span>' +
                   '<span class="msj-liste-txt"><b>' + esc(s.antrenor) + ' · ' +
                     esc(API.gunMetni(m.tarih)) + ' ' + esc(API.saatMetni(m.tarih)) + '</b>' +
                     '<small>' + vurgula(govde, q) + '</small></span>' +
                 '</button>';
        }).join('') +
        '</div></div>' +
        (bulunan.length > 20 ? '<p class="msj-sonuc-not" style="margin:10px 0 0">İlk 20 sonuç gösteriliyor.</p>' : '');
    }

    if (araEl) araEl.addEventListener('input', aramaBas);
    if (araSil) araSil.addEventListener('click', function () { araEl.value = ''; aramaBas(); araEl.focus(); });
    if (sonucEl) sonucEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-git]'); if (!b) return;
      secili = b.getAttribute('data-git');
      API.okunduIsaretle(secili);
      listeBas(); akisBas();
      var akis = d.getElementById('msjAkisS');
      if (akis) akis.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    function hepsi() {
      if (!iskeletBas()) return;
      listeBas(); akisBas();
      API.okunduIsaretle(secili);
      listeBas();
    }
    window.addEventListener('fit-mesaj-degisti', function () {
      if (!d.getElementById('msjListe')) return;
      listeBas(); akisBas();
    });
    d.addEventListener('fit:state', hepsi);
    window.addEventListener('storage', function (e) {
      if (e && (e.key === API.ANAHTAR || e.key === 'dm_fit')) hepsi();
    });
    hepsi();
  })();
})();
