/* Hesap Ayarları · Profil — Doğum tarihi takvimi (canlı Gourmet'te alan açık).
   Sürücü kanonun gömülü betiğinden (assets/g/kanon/gomulu/j-18ba956a5fcd.js, "DOĞUM TARİHİ TAKVİMİ" bloğu, satır 243-378)
   AYNEN alındı: o dosyanın tamamı bu sayfada yüklenmiyor (sekme ve kayıt dinleyicileri prototipin kendi betikleriyle çakışır),
   kanon dosyası da değiştirilmez. Seçilen tarih yalnız alana yazılır; kayıt mevcut Profil formu üzerinden bu tarayıcıda kalır. */
(function(){
  var kok = document.querySelector('[data-tar-kok]');
  if(!kok) return;
  var $ = function(id){ return document.getElementById(id); };
  var alan=$('hsDogum'), btn=$('hsDogumAc'), pop=$('hsDogumPop'),
      selAy=$('hsDogumAy'), selYil=$('hsDogumYil'), grid=$('hsDogumGrid'),
      sinirNot=$('hsDogumSinir'), temizle=$('hsDogumTemizle'), hata=$('hsDogumHata');
  if(!alan||!btn||!pop||!grid) return;

  var AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
               'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

  function gunBasi(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  var BUGUN    = gunBasi(new Date());
  var UST      = new Date(BUGUN.getFullYear()-13,  BUGUN.getMonth(), BUGUN.getDate());
  var ALT      = new Date(BUGUN.getFullYear()-100, BUGUN.getMonth(), BUGUN.getDate());

  function iki(n){ return (n<10?'0':'')+n; }
  function bicimle(d){ return iki(d.getDate())+'.'+iki(d.getMonth()+1)+'.'+d.getFullYear(); }
  function coz(metin){
    var m = /^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/.exec((metin||'').trim());
    if(!m) return null;
    var g=+m[1], a=+m[2], y=+m[3];
    var d = new Date(y, a-1, g);
    /* 31.02.1990 gibi taşan tarihi Date sessizce kaydırır — geri
       çevirerek yakalarız. */
    if(d.getFullYear()!==y || d.getMonth()!==a-1 || d.getDate()!==g) return null;
    return d;
  }
  function sinirDisi(d){ return d > UST || d < ALT; }

  var secili = coz(alan.value);
  var gorunen = new Date((secili || UST).getFullYear(), (secili || UST).getMonth(), 1);

  /* ---- ay ve yıl seçicileri ---- */
  selAy.innerHTML = AYLAR.map(function(a,i){ return '<option value="'+i+'">'+a+'</option>'; }).join('');
  var yilHtml = '';
  for(var y = UST.getFullYear(); y >= ALT.getFullYear(); y--) yilHtml += '<option value="'+y+'">'+y+'</option>';
  selYil.innerHTML = yilHtml;

  if(sinirNot){
    sinirNot.textContent = '13 yaşından küçük ya da ' + ALT.getFullYear() +
      ' öncesi bir tarih seçilemez. Seçilebilen en yeni tarih: ' + bicimle(UST) + '.';
  }

  function hataYaz(metin){
    alan.classList.toggle('is-err', !!metin);
    alan.setAttribute('aria-invalid', metin ? 'true' : 'false');
    if(hata){
      hata.classList.toggle('show', !!metin);
      hata.querySelector('span').textContent = metin || '';
    }
  }

  function ciz(){
    var yil = gorunen.getFullYear(), ay = gorunen.getMonth();
    selAy.value = ay; selYil.value = yil;

    /* Pazartesi başlangıçlı ızgara: JS'in 0=Pazar dizinini kaydırıyoruz. */
    var ilk = new Date(yil, ay, 1);
    var bosluk = (ilk.getDay() + 6) % 7;
    var gunSayisi = new Date(yil, ay+1, 0).getDate();

    var h = '';
    for(var i=0;i<bosluk;i++) h += '<span aria-hidden="true"></span>';
    for(var g=1; g<=gunSayisi; g++){
      var d = new Date(yil, ay, g);
      var kapali = sinirDisi(d);
      var secim = secili && d.getTime() === gunBasi(secili).getTime();
      h += '<button type="button" data-gun="'+g+'"'+
           (kapali ? ' disabled aria-disabled="true"' : '')+
           ' aria-selected="'+(secim?'true':'false')+'"'+
           (d.getTime()===BUGUN.getTime() ? ' class="bugun"' : '')+
           ' aria-label="'+g+' '+AYLAR[ay]+' '+yil+'">'+g+'</button>';
    }
    grid.innerHTML = h;

    /* uçlardaki oklar kapanır — sınır dışına gezinme yolu bırakılmaz */
    var geri = pop.querySelector('[data-ay="-1"]'), ileri = pop.querySelector('[data-ay="1"]');
    geri.disabled  = new Date(yil, ay, 1)   <= new Date(ALT.getFullYear(), ALT.getMonth(), 1);
    ileri.disabled = new Date(yil, ay+1, 1) >  new Date(UST.getFullYear(), UST.getMonth(), 1);
  }

  function ac(){
    pop.hidden = false;
    btn.setAttribute('aria-expanded','true');
    secili = coz(alan.value);
    gorunen = new Date((secili || UST).getFullYear(), (secili || UST).getMonth(), 1);
    ciz();
    selAy.focus();
  }
  function kapat(odakDon){
    pop.hidden = true;
    btn.setAttribute('aria-expanded','false');
    if(odakDon) alan.focus();
  }

  btn.addEventListener('click', function(){ pop.hidden ? ac() : kapat(true); });
  alan.addEventListener('keydown', function(e){
    if(e.key==='ArrowDown' && !e.altKey){ e.preventDefault(); ac(); }
  });

  selAy.addEventListener('change', function(){ gorunen.setMonth(+selAy.value); ciz(); });
  selYil.addEventListener('change', function(){ gorunen.setFullYear(+selYil.value); ciz(); });
  pop.addEventListener('click', function(e){
    var nav = e.target.closest('[data-ay]');
    if(nav && !nav.disabled){ gorunen.setMonth(gorunen.getMonth() + (+nav.getAttribute('data-ay'))); ciz(); return; }
    var g = e.target.closest('[data-gun]');
    if(g && !g.disabled){
      secili = new Date(gorunen.getFullYear(), gorunen.getMonth(), +g.getAttribute('data-gun'));
      alan.value = bicimle(secili);
      hataYaz('');
      kapat(true);
    }
  });
  pop.addEventListener('keydown', function(e){
    if(e.key==='Escape'){ e.preventDefault(); kapat(true); }
  });
  if(temizle) temizle.addEventListener('click', function(){
    secili = null; alan.value = ''; hataYaz(''); ciz(); kapat(true);
  });
  document.addEventListener('click', function(e){
    if(!pop.hidden && !kok.contains(e.target)) kapat(false);
  });

  /* Elle yazılan değer de aynı sınırlardan geçer. */
  alan.addEventListener('blur', function(){
    var v = alan.value.trim();
    if(!v){ hataYaz(''); return; }                       /* alan opsiyonel */
    var d = coz(v);
    if(!d){ hataYaz('Tarihi gg.aa.yyyy biçiminde yaz — örneğin 14.03.1992.'); return; }
    if(d > UST){ hataYaz('DadaGastro 13 yaş ve üzeri içindir. En yeni seçilebilen tarih: '+bicimle(UST)+'.'); return; }
    if(d < ALT){ hataYaz(ALT.getFullYear()+' öncesi bir tarih seçilemez.'); return; }
    secili = d; alan.value = bicimle(d); hataYaz('');
  });
})();
