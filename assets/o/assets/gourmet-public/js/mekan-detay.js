/* mekan-detay.js — reference/gourmet-mekan-detay/mekan-detay-v1.html "SAYFA JS"
   bölümünün (satır 3001-3175 + 3204-3321) gerçek-backend'e bağlanmış hâli
   (tasks/gourmet/02-dalga1.md B3). Tab paneli / galeri+lightbox / rezervasyon
   modalının adım-geçiş choreografisi BİREBİR korunur; salt-görsel mock'lar
   (Kaydet class toggle, rezervasyon "success" metni) yerini gerçek XHR/POST'a
   bırakır. Kabuk davranışları (drawer/lg-gate/mentor/to-top/cookie/fb-modal)
   resources/js/gourmet.js'te — burada TEKRARLANMAZ (00-ortak.md §7: page-local
   JS yalnız sayfa-özel; drag-scroll/row-nav/save-toggle kabukta karşılığı
   olmadığından her sayfa kendi kopyasını tutar, tarif-detay deseni). */
(function () {
  var csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

  // T9 (kapanış turu, 2026-08-08) — KÖK NEDEN düzeltmesi: eskiden `res.ok`
  //      false ise (ör. doğrulanmamış e-postada 403) fonksiyon `null` dönüyordu
  //      ve çağıran sessizce hiçbir şey yapmıyordu. Backend artık JSON isteyen
  //      çağıranlara redirect DEĞİL gerçek JSON 403 döndüğü için (Venue
  //      ActionController::unverifiedResponse) burada `{ok,data}` ikilisi
  //      döndürülür — çağıran hem başarı hem hata gövdesini okuyabilir.
  function postJson(url) {
    return fetch(url, {
      method: 'POST',
      headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        return { ok: res.ok, data: data };
      });
    });
  }

  // ---- KAYDET (mdSave) — gerçek XHR toggle (madde 10). Guest'te data-lg-gate
  //      zaten capture-fazda bu tıklamayı keser (gourmet.js) — is-auth kontrolü
  //      burada GEREKMEZ (portal-capture-stopprop dersi: kendi listener'ımız
  //      guest'te hiç tetiklenmez). ----
  (function () {
    var save = document.getElementById('mdSave');
    if (!save) return;
    save.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!document.body.classList.contains('is-auth')) return; // lg-gate zaten açtı
      var url = save.getAttribute('data-save-url');
      if (!url || save.disabled) return;
      save.disabled = true;
      postJson(url).then(function (result) {
        if (!result.ok) {
          // T9 — sessiz yutma kalkacak: doğrulanmamış e-posta 403'ünün mesajı
          // artık gösteriliyor (menu.blade.php'nin fail() deseni BİREBİR).
          window.alert((result.data && result.data.message) || 'İşlem tamamlanamadı. Sayfayı yenileyip tekrar dene.');
          return;
        }
        var data = result.data;
        if (!data) return;
        save.classList.toggle('saved', data.active);
        save.innerHTML = '<i class="fa-' + (data.active ? 'solid' : 'regular') + ' fa-bookmark" aria-hidden="true"></i>';
      }).finally(function () { save.disabled = false; });
    });
  })();

  // ---- PAYLAŞ (mdShare) — salt-görsel popover (backend yok). Aynı tıklamada
  //      kapanmama şartı: document click-listener capture'da DEĞİL, bubble'da
  //      ve trigger tıklaması stopPropagation ile korunur (daha önce yaşanan
  //      "popover kendi tıklamasıyla kapanıyor" hatası). ----
  (function () {
    var btn = document.getElementById('mdShare');
    var menu = document.getElementById('mdShareMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
    });
    menu.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () { menu.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu.hidden = true; });
    var copyBtn = document.getElementById('mdShareCopy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var url = copyBtn.getAttribute('data-share-url');
        navigator.clipboard?.writeText(url).then(function () {
          var original = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> ' + (copyBtn.dataset.copiedLabel || 'Kopyalandı');
          setTimeout(function () { copyBtn.innerHTML = original; }, 1600);
        });
      });
    }
  })();

  // ---- KİŞİSEL LİSTE / BİLGİ HATASI popover'ları (kc-pop) ----
  (function () {
    [['mdListBtn', 'mdListPop'], ['mdReportBtn', 'mdReportPop']].forEach(function (pair) {
      var btn = document.getElementById(pair[0]);
      var pop = document.getElementById(pair[1]);
      if (!btn || !pop) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        pop.hidden = !pop.hidden;
      });
      pop.addEventListener('click', function (e) { e.stopPropagation(); });
    });
    document.addEventListener('click', function () {
      var lp = document.getElementById('mdListPop'); if (lp) lp.hidden = true;
      var rp = document.getElementById('mdReportPop'); if (rp) rp.hidden = true;
    });
  })();

  // ---- GERÇEK TAB PANELİ: pane yerinde değişir, ?tab= derin link ----
  (function () {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('#mdTabs .dt'));
    if (!tabs.length) return;
    function showPane(key) {
      tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-pane') === key); });
      document.querySelectorAll('.md-pane').forEach(function (p) { p.classList.toggle('active', p.id === 'pane-' + key); });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var key = t.getAttribute('data-pane');
        showPane(key);
        try {
          var u = new URL(location.href);
          if (key === 'genel') u.searchParams.delete('tab'); else u.searchParams.set('tab', key);
          history.replaceState(null, '', u);
        } catch (err) { /* no-op */ }
      });
    });
    var q = new URLSearchParams(location.search).get('tab');
    if (q && document.getElementById('pane-' + q)) showPane(q);
    document.querySelectorAll('[data-pane-link]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        showPane(a.getAttribute('data-pane-link'));
        document.getElementById('pane-' + a.getAttribute('data-pane-link'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  })();

  // ---- YORUM FORMU: yıldız zorunlu (gerçek submit — hidden #rfRatingInput) ----
  (function () {
    var form = document.getElementById('revForm');
    var stars = document.getElementById('rfStars');
    if (!form || !stars) return;
    var hint = document.getElementById('rfHint');
    var ratingInput = document.getElementById('rfRatingInput');
    var rated = 0;
    document.getElementById('rfText')?.addEventListener('focus', function () { form.classList.add('open'); });
    Array.prototype.forEach.call(stars.querySelectorAll('button'), function (b, i) {
      b.addEventListener('click', function () {
        rated = i + 1;
        ratingInput.value = String(rated);
        form.classList.add('open');
        Array.prototype.forEach.call(stars.querySelectorAll('button'), function (x, j) { x.classList.toggle('on', j <= i); });
        hint.textContent = rated + '/5';
        hint.className = 'rf-hint ok';
      });
    });
    form.addEventListener('submit', function (e) {
      if (!rated) {
        e.preventDefault();
        hint.textContent = 'Önce puan ver';
        hint.className = 'rf-hint err';
        stars.classList.add('shake');
        setTimeout(function () { stars.classList.remove('shake'); }, 450);
      }
    });
  })();

  // ---- YORUM "Faydalı" toggle — gerçek XHR (B1-2, Beyar kararı: "beğeni
  //      kaydedilsin ve kalıcı olsun"; lead kararı 2026-08-24: görünen-
  //      davranış çatalları — misafir daveti, kendi yorum uyarısı — Beyar'a
  //      soruldu, buraya YAZILMADI). Markup zaten data-engagement-toggle/
  //      data-url/data-active/data-icon-on/-off taşıyordu
  //      (_review-actions.blade.php) — eskiden bu dinleyici SALT-GÖRSEL'di
  //      (textContent'ten sayaç kazıyordu, "Faydalı (" metnini SABİT
  //      varsayıyordu — gurme-lezzetler varyantının "Beğen " etiketinde
  //      zaten yanlış sonuç verirdi), gerçek uca hiç bağlanmamıştı.
  //      İYİMSER GÜNCELLEME: tıklamada ikon/sayaç/`data-active` hemen
  //      değişir, sunucu 200 dönünce KENDİ `{active,count}`ıyla uzlaştırılır
  //      (yarış payı sıfırlanır). HER başarısızlık yolu — 401 misafir ·
  //      404 kendi yorumu (bootstrap/app.php model-bound çevrimi) · 429 ·
  //      ağ hatası — AYNI: tıklamadan ÖNCEKİ görsel duruma sessizce geri
  //      dönülür. Yeni uyarı metni/renk/sınıf YOK (lead kararı md.2-3).
  document.querySelectorAll('[data-engagement-toggle]').forEach(function (b) {
    var busy = false;
    b.addEventListener('click', function () {
      if (busy) return;
      var url = b.getAttribute('data-url');
      if (!url) return;
      var icon = b.querySelector('i');
      var countEl = b.querySelector('[data-engagement-count]');
      var iconOn = b.getAttribute('data-icon-on');
      var iconOff = b.getAttribute('data-icon-off');
      var wasOn = b.classList.contains('on');
      var prevActive = b.getAttribute('data-active');
      var prevIconClass = icon ? icon.className : null;
      var prevCount = countEl ? countEl.textContent : null;

      var nowOn = !wasOn;
      b.classList.toggle('on', nowOn);
      b.setAttribute('data-active', nowOn ? '1' : '0');
      if (icon) icon.className = nowOn ? iconOn : iconOff;
      if (countEl) {
        var n = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = String(nowOn ? n + 1 : n - 1);
      }

      busy = true;
      fetch(url, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
      }).then(function (res) {
        if (!res.ok) throw new Error('http-' + res.status);
        return res.json();
      }).then(function (data) {
        if (!data || typeof data.active === 'undefined') throw new Error('bad-body');
        b.classList.toggle('on', data.active);
        b.setAttribute('data-active', data.active ? '1' : '0');
        if (icon) icon.className = data.active ? iconOn : iconOff;
        if (countEl) countEl.textContent = String(data.count);
      }).catch(function () {
        b.classList.toggle('on', wasOn);
        b.setAttribute('data-active', prevActive);
        if (icon) icon.className = prevIconClass;
        if (countEl) countEl.textContent = prevCount;
      }).finally(function () { busy = false; });
    });
  });

  // ---- YORUM FİLTRE ÇİPLERİ — tarif-detay.js deseni BİREBİR + madde 13
  //      (verified_visit/editor) data-kind eşleşmesi eklendi. ----
  (function () {
    var chips = document.querySelectorAll('#revFilter .chip');
    if (!chips.length) return;
    var items = document.querySelectorAll('#revList > .c-item');
    var empty = document.getElementById('revEmpty');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.remove('on'); });
        c.classList.add('on');
        var k = c.getAttribute('data-f'), visible = 0;
        items.forEach(function (it) {
          var s = it.getAttribute('data-stars');
          var kind = it.getAttribute('data-kind');
          var show = k === 'all'
            || (k === 'photo' && it.hasAttribute('data-photo'))
            || k === s
            || (k === 'low' && parseInt(s, 10) <= 3)
            || k === kind;
          it.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        if (empty) empty.hidden = visible > 0;
      });
    });
  })();

  // ---- GALERİ: TD davranışı — thumb sahneyi değiştirir, sahne/+N lightbox açar ----
  (function () {
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    var img = document.getElementById('lbImg');
    var cap = document.getElementById('lbCap');
    var count = document.getElementById('lbCount');
    var group = [], idx = 0;
    function bgUrl(el) {
      var m = (el.style.backgroundImage || '').match(/url\(["']?(.*?)["']?\)/);
      return m ? m[1] : null;
    }
    function render() {
      img.src = group[idx].src;
      cap.textContent = group[idx].cap || '';
      count.textContent = (idx + 1) + ' / ' + group.length;
      lb.classList.toggle('single', group.length < 2);
    }
    /* KAYDIRMA KILIDI — F2/W2.2 (2026-08-21, olculdu): kilit <body>'den <html>'e
       TASINDI. gourmet.css:764,766 `html,body{overflow-x:clip}` yazdigi icin <html>'in
       overflow'u `visible` degil; CSS Overflow sozlesmesi geregi <body>'nin overflow
       degeri viewport'a YAYILMIYORDU. Olcum (CDP gercek parmak kaydirmasi, 390px):
       panel acikken arka plan 465-854px kaydi. `overflow-x:clip` satirina DOKUNULMADI. */
    function open(g, i) { group = g; idx = i; render(); lb.classList.add('open'); document.documentElement.style.overflow = 'hidden'; }
    function close() { lb.classList.remove('open'); document.documentElement.style.overflow = ''; }
    document.getElementById('lbClose').addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.getElementById('lbPrev').addEventListener('click', function () { idx = (idx - 1 + group.length) % group.length; render(); });
    document.getElementById('lbNext').addEventListener('click', function () { idx = (idx + 1) % group.length; render(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') { idx = (idx + 1) % group.length; render(); }
      if (e.key === 'ArrowLeft') { idx = (idx - 1 + group.length) % group.length; render(); }
    });

    var stage = document.getElementById('mdStage');
    var thumbs = [].slice.call(document.querySelectorAll('#mdThumbs .rd-thumb'));
    if (stage && thumbs.length) {
      var gallery = thumbs.map(function (t) {
        return { src: t.getAttribute('data-img'), cap: t.getAttribute('aria-label') || '' };
      });
      function activeIdx() {
        var i = thumbs.findIndex(function (t) { return t.classList.contains('active'); });
        return i < 0 ? 0 : i;
      }
      thumbs.forEach(function (t, i) {
        t.addEventListener('click', function () {
          if (t.id === 'mdThumbMore') { open(gallery, i); return; }
          thumbs.forEach(function (x) { x.classList.remove('active'); });
          t.classList.add('active');
          stage.style.backgroundImage = "url('" + t.getAttribute('data-img') + "')";
        });
      });
      stage.addEventListener('click', function (e) {
        if (e.target.closest('.md-stage-acts,a')) return;
        open(gallery, activeIdx());
      });
    }

    document.querySelectorAll('.c-item').forEach(function (item) {
      var phs = [].slice.call(item.querySelectorAll('.c-photos .c-ph'));
      if (!phs.length) return;
      var who = item.querySelector('.c-head b')?.textContent || '';
      phs.forEach(function (p, i) {
        p.addEventListener('click', function () {
          var g = phs.map(function (x) { return { src: bgUrl(x), cap: 'Yorum fotoğrafı — ' + who }; });
          open(g, i);
        });
      });
    });
  })();

  // ---- ROW-NAV slider (data-slider-dir/data-slider-for) — ui.js bindRowSlider
  //      emsali (Gourmet'e yüklenmiyor, sayfa kendi kopyasını tutar). ----
  document.querySelectorAll('[data-slider-dir]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var track = document.getElementById(btn.getAttribute('data-slider-for'));
      if (!track) return;
      var dir = btn.getAttribute('data-slider-dir') === 'prev' ? -1 : 1;
      track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: 'smooth' });
    });
  });

  // ---- SÜRÜKLE-KAYDIR (mouse ile yatay şeritler) ----
  (function () {
    function enableDrag(el) {
      el.classList.add('drag-scroll');
      var down = false, startX = 0, startScroll = 0, moved = false;
      el.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        down = true; moved = false; startX = e.clientX; startScroll = el.scrollLeft;
      });
      el.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) { moved = true; el.classList.add('dragging'); }
        el.scrollLeft = startScroll - dx;
      });
      function up() { down = false; setTimeout(function () { el.classList.remove('dragging'); }, 0); }
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('pointerleave', up);
      el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
      el.addEventListener('wheel', function (e) {
        if (el.scrollWidth <= el.clientWidth) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault(); el.scrollLeft += e.deltaY;
      }, { passive: false });
    }
    ['.row-track', '.chip-row', '.disc-grid'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(enableDrag);
    });
  })();

  // ---- LEAFLET PİNİ (yol-guzergahim-v2.html kurulumunun aynısı — 1.9.4) ----
  (function () {
    if (typeof window.L === 'undefined') return;
    document.querySelectorAll('.map-mock[data-lat][data-lng]').forEach(function (el) {
      var lat = parseFloat(el.getAttribute('data-lat'));
      var lng = parseFloat(el.getAttribute('data-lng'));
      if (isNaN(lat) || isNaN(lng)) return;
      var map = window.L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 15);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);
      window.L.marker([lat, lng]).addTo(map).bindPopup(el.getAttribute('data-name') || '');
    });
  })();

  // ===== M10 — MASA REZERVASYONU MODALI (gerçek submit) =====
  (function () {
    var modal = document.getElementById('rsvModal'), ov = document.getElementById('rsvOverlay');
    if (!modal) return;
    var prog = document.getElementById('rsvProg');
    var steps = Array.prototype.slice.call(modal.querySelectorAll('.rsv-step'));
    var sum1 = document.getElementById('rsvSum1'), sum2 = document.getElementById('rsvSum2');
    var partySizeInput = document.getElementById('rsvPartySizeInput');
    var childrenInput = document.getElementById('rsvChildrenInput');
    var prefInput = document.getElementById('rsvPrefInput');
    var occInput = document.getElementById('rsvOccInput');
    var dateInput = document.getElementById('rsvDateInput');
    var slotInput = document.getElementById('rsvSlotInput');

    var calendar = {};
    try { calendar = JSON.parse(document.getElementById('mdCalendarData')?.textContent || '{}'); } catch (e) { calendar = {}; }
    var calendarDates = Object.keys(calendar);

    var state = { people: 2, children: 0, prefLabel: '', occLabel: '', day: calendarDates[0] || '', slot: '' };

    function people() { return state.people + ' kişi'; }
    function refreshSum1() {
      var parts = [people()];
      if (state.prefLabel) parts.push(state.prefLabel);
      if (state.occLabel) parts.push(state.occLabel);
      sum1.textContent = parts.join(' · ');
    }
    function refreshSum2() {
      var dayLabel = calendar[state.day] ? calendar[state.day].label : state.day;
      sum2.textContent = dayLabel + (state.slot ? ' · ' + state.slot : ' · saat seç');
    }

    var pplVal = document.getElementById('rsvPplVal'), pplMinus = document.getElementById('rsvPplMinus'), pplPlus = document.getElementById('rsvPplPlus');
    var MAXP = 20;
    function syncPeopleUI() {
      pplVal.textContent = String(state.people);
      pplMinus.disabled = state.people <= 1;
      pplPlus.disabled = state.people >= MAXP;
      modal.querySelectorAll('#rsvQuick .rsv-qp').forEach(function (q) {
        q.classList.toggle('sel', parseInt(q.getAttribute('data-people'), 10) === state.people);
      });
      partySizeInput.value = String(state.people);
    }
    function setPeople(v) { state.people = Math.max(1, Math.min(MAXP, v)); syncPeopleUI(); refreshSum1(); }

    var childVal = document.getElementById('rsvChildVal'), childMinus = document.getElementById('rsvChildMinus'), childPlus = document.getElementById('rsvChildPlus');
    function syncChildUI() { childVal.textContent = String(state.children); childMinus.disabled = state.children <= 0; childrenInput.value = String(state.children); }
    function setChildren(v) { state.children = Math.max(0, Math.min(20, v)); syncChildUI(); }

    function go(n) {
      steps.forEach(function (s) { s.classList.toggle('active', s.getAttribute('data-pane') === String(n)); });
      prog.querySelectorAll('.pstep').forEach(function (p) {
        var sn = parseInt(p.getAttribute('data-step'), 10);
        p.classList.toggle('cur', sn === n);
        p.classList.toggle('done', sn < n);
      });
      prog.querySelectorAll('.pline').forEach(function (l) { l.classList.toggle('done', parseInt(l.getAttribute('data-line'), 10) < n); });
      modal.querySelector('.rsv-panel').scrollTop = 0;
    }

    function renderDays() {
      var wrap = document.getElementById('rsvDays');
      wrap.innerHTML = '';
      calendarDates.forEach(function (iso) {
        var d = calendar[iso];
        var btn = document.createElement('button');
        btn.type = 'button';
        // Y4#24 (2026-08-08) — 'closed' (mekân o gün kapalı) ile 'full'
        // (mekân açık ama saat kalmadı) AYRI etiketler basar; ikisi de
        // tıklanamaz (.off), ama "dolu" demek "kapalıyız" demek DEĞİL —
        // biri "başka saate bak", diğeri "biz bugün hiç açık değiliz" der.
        var unbookableDay = d.state === 'full' || d.state === 'closed';
        btn.className = 'rsv-day' + (unbookableDay ? ' off' : '') + (iso === state.day ? ' sel' : '');
        btn.setAttribute('data-day', iso);
        var stateLabel = d.state === 'closed' ? 'kapalı' : (d.state === 'full' ? 'dolu' : (d.state === 'limited' ? 'az yer' : 'açık'));
        btn.innerHTML = '<span>' + d.label.split(' ')[0] + '</span><b>' + d.day_number + '</b><small>' + stateLabel + '</small>';
        btn.addEventListener('click', function () {
          if (unbookableDay) return;
          state.day = iso; state.slot = '';
          wrap.querySelectorAll('.rsv-day').forEach(function (x) { x.classList.remove('sel'); });
          btn.classList.add('sel');
          dateInput.value = iso; slotInput.value = '';
          renderSlots();
          refreshSum2();
        });
        wrap.appendChild(btn);
      });
      if (state.day) dateInput.value = state.day;
    }

    function renderSlots() {
      var wrap = document.getElementById('rsvSlots');
      wrap.innerHTML = '';
      var day = calendar[state.day];
      if (!day) return;
      day.slots.forEach(function (slot) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rsv-slot' + (!slot.bookable ? ' off' : '') + (slot.time === state.slot ? ' sel' : '');
        btn.setAttribute('data-slot', slot.time);
        btn.textContent = slot.time;
        btn.addEventListener('click', function () {
          if (!slot.bookable) return;
          state.slot = slot.time;
          wrap.querySelectorAll('.rsv-slot').forEach(function (x) { x.classList.remove('sel'); });
          btn.classList.add('sel');
          slotInput.value = slot.time;
          refreshSum2();
        });
        wrap.appendChild(btn);
      });
    }

    function open_() {
      go(1); syncPeopleUI(); syncChildUI(); refreshSum1(); renderDays(); renderSlots(); refreshSum2();
      ov.classList.add('show'); modal.classList.add('show'); document.documentElement.style.overflow = 'hidden';
    }
    function close() { ov.classList.remove('show'); modal.classList.remove('show'); document.documentElement.style.overflow = ''; }

    // D3-recap (2026-08-08) — Adım 3 özet kutusu (#rsvRecap) HER ZAMAN
    // boştu (grep: tek referans, dolduran hiçbir kod yoktu). Form GERÇEK
    // submit olduğu için (bu dosyanın kendi KARAR NOTU — AJAX yok) başarıdan
    // sonra sayfa TAM YENİDEN yükleniyor, `state` (refreshSum2()'nin
    // kullandığı istemci kaynağı) kaybolmuş oluyor — o yüzden İKİNCİ bir
    // hesap YAZILMADI, veri #mdRsvSignal'in data-recap-* özniteliklerinden
    // (VenueController@reservationRecap'in GERÇEK DB kaydı) okunuyor. Tarih
    // etiketi için AYNI `calendar` kaynağı kullanılır (refreshSum2()'nin
    // kullandığı obje) — yalnız çip sırası referans mockup'ın kendi statik
    // örneğine (mekan-detay-v1.html:2540-2544 "12 Çar") uydurulur, calendar
    // label'ı "Çar 12" sırasında (rsv-day düğmeleriyle ortak).
    function renderRecap(signal) {
      var recapEl = document.getElementById('rsvRecap');
      if (!recapEl) return;
      var day = signal.getAttribute('data-recap-day');
      var time = signal.getAttribute('data-recap-time');
      var peopleText = signal.getAttribute('data-recap-people-text');
      var childrenText = signal.getAttribute('data-recap-children-text');
      if (!day && !time && !peopleText) return;

      var dayLabel = day;
      if (calendar[day] && calendar[day].label) {
        dayLabel = calendar[day].label.split(' ').reverse().join(' ');
      }

      var chips = [];
      if (peopleText) {
        chips.push('<span><i class="fa-solid fa-user-group" aria-hidden="true"></i> ' + peopleText + (childrenText ? ' · ' + childrenText : '') + '</span>');
      }
      if (dayLabel) chips.push('<span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ' + dayLabel + '</span>');
      if (time) chips.push('<span><i class="fa-regular fa-clock" aria-hidden="true"></i> ' + time + '</span>');
      recapEl.innerHTML = chips.join('');
    }

    var openBtn = document.getElementById('openRsv');
    if (openBtn) openBtn.addEventListener('click', open_);
    document.getElementById('rsvClose').addEventListener('click', close);
    ov.addEventListener('click', close);
    document.getElementById('rsvDone')?.addEventListener('click', close);

    pplMinus.addEventListener('click', function () { setPeople(state.people - 1); });
    pplPlus.addEventListener('click', function () { setPeople(state.people + 1); });
    modal.querySelectorAll('#rsvQuick .rsv-qp').forEach(function (q) {
      q.addEventListener('click', function () { setPeople(parseInt(q.getAttribute('data-people'), 10) || 8); });
    });
    if (childMinus) childMinus.addEventListener('click', function () { setChildren(state.children - 1); });
    if (childPlus) childPlus.addEventListener('click', function () { setChildren(state.children + 1); });

    modal.querySelectorAll('#rsvPref .rsv-prefp').forEach(function (pf) {
      pf.addEventListener('click', function () {
        modal.querySelectorAll('#rsvPref .rsv-prefp').forEach(function (x) { x.classList.remove('sel'); });
        pf.classList.add('sel');
        prefInput.value = pf.getAttribute('data-pref');
        state.prefLabel = pf.textContent.trim();
        refreshSum1();
      });
    });
    modal.querySelectorAll('#rsvOcc input').forEach(function (i) {
      i.addEventListener('change', function () {
        occInput.value = i.getAttribute('data-occ');
        state.occLabel = i.nextElementSibling?.nextElementSibling?.textContent.trim() || '';
        refreshSum1();
      });
    });
    // S2 (2026-08-08) — DESEN düzeltmesi: sekmeli/adımlı formda gizli
    // alandaki doğrulama hatası artık AÇIKÇA kontrol edilir (form `novalidate`,
    // bkz. _reservation-modal.blade.php), native sessiz blok kapatıldı.
    // Geçersiz alan bulunursa onu taşıyan adım açılır + görünür hata basılır.
    var rsvForm = modal.querySelector('#rsvForm');
    var rsvConfirmBtn = document.getElementById('rsvConfirm');
    var rsvPane1 = modal.querySelector('.rsv-step[data-pane="1"]');
    var rsvClientError = document.getElementById('rsvClientError');
    var rsvClientErrorText = document.getElementById('rsvClientErrorText');

    function paneNumberOf(el) {
      var pane = el.closest('.rsv-step');
      return pane ? parseInt(pane.getAttribute('data-pane'), 10) : 1;
    }
    function clearFieldError() {
      modal.querySelectorAll('[aria-invalid="true"]').forEach(function (f) { f.removeAttribute('aria-invalid'); });
    }
    function hideClientError() {
      if (rsvClientError) rsvClientError.hidden = true;
    }
    // Tarayıcının kendi `validationMessage`'ı (İngilizce/tarayıcı diline
    // bağlı — "Please fill out this field.") YAZI KUTUSUNDA basılmaz;
    // uygulamanın kendi TR metni gösterilir (kanon `dish-note` kanalıyla
    // AYNI dil — bu dosyanın geri kalanı da zaten TR-sabit plain JS,
    // "Lütfen tarih ve saat seç" deseninin aynısı, Blade'e taşınmadı).
    function friendlyMessage(field) {
      var v = field.validity;
      if (v.valueMissing) {
        // A5-4 (Beyar kararı, 2026-08-23) — guest_email artık ZORUNLU; boş
        // bırakılınca "Adını soyadını yazman gerekiyor." basılıyordu (yanlış
        // alanı işaret eden metin). Üç alan da kendi cümlesini alır.
        if (field.name === 'guest_email') return 'E-posta adresini yazman gerekiyor — rezervasyon takip bağlantın oraya gider.';
        return field.name === 'guest_phone' ? 'Telefon numaranı yazman gerekiyor.' : 'Adını soyadını yazman gerekiyor.';
      }
      if (v.typeMismatch) return 'Geçerli bir e-posta adresi gir.';

      return field.validationMessage || 'Bu alanı doldurman gerekiyor.';
    }
    function showFieldError(field) {
      clearFieldError();
      field.setAttribute('aria-invalid', 'true');
      if (rsvClientError && rsvClientErrorText) {
        rsvClientErrorText.textContent = friendlyMessage(field);
        rsvClientError.hidden = false;
      }
      // 390px'te ölçüldü: field.focus() tek başına odağı görünür kılmak
      // için PANELİ KAYDIRABİLİR, bu da kutuyu (panelin en üstünde durur)
      // scroll dışına iter — display=block ama elementFromPoint kutuya
      // düşmüyordu. Panel ÖNCE tepeye alınır (kutu + alan ikisi de o anda
      // görünür aralıkta kalır, bu formun tüm alanları tek ekrana yakın),
      // SONRA odak verilir.
      var panel = modal.querySelector('.rsv-panel');
      if (panel) panel.scrollTop = 0;
      field.focus();
      // Kulvar B'nin S2 deseniyle AYNI iki parça (tasks/kulvar-B-sekme-
      // dogrulama-deseni.md): sekme/adım ÖNCE açılır, SONRA tarayıcının
      // kendi balonu gösterilir — alan bu noktada artık görünür/odaklanabilir
      // olduğundan reportValidity() sessizce iptal edilmez.
      requestAnimationFrame(function () { field.reportValidity(); });
    }

    document.getElementById('rsvNext1').addEventListener('click', function () {
      hideClientError();
      var invalid = rsvPane1 ? rsvPane1.querySelector(':invalid') : null;
      if (invalid) { showFieldError(invalid); return; }
      clearFieldError();
      go(2);
    });
    document.getElementById('rsvBack2').addEventListener('click', function () { hideClientError(); go(1); });

    // Onayla — düğme artık type=button (native submit-anı otomatik doğrulama
    // gizli alanda sessizce bloklanıyordu); geçerlilik burada AÇIKÇA
    // kontrol edilir, yalnız gün+saat seçilmişse GERÇEK submit çalışır
    // (server zaten aynı şeyi ReservationAvailability ile tekrar doğruluyor
    // — kapasite reddi burada DEĞİL, orada).
    rsvConfirmBtn.type = 'button';
    rsvConfirmBtn.addEventListener('click', function () {
      hideClientError();
      var invalid = rsvForm.querySelector(':invalid');
      if (invalid) { go(paneNumberOf(invalid)); showFieldError(invalid); return; }
      clearFieldError();
      if (!state.day || !state.slot) {
        refreshSum2();
        sum2.textContent = 'Lütfen tarih ve saat seç';
        return;
      }
      rsvForm.submit();
    });

    // Enter tuşuyla implicit submit (form `novalidate` olduğu için native
    // blok artık yok) AYNI kontrolden geçer — düğme tıklamasıyla aynı yol.
    rsvForm.addEventListener('submit', function (e) {
      hideClientError();
      var invalid = rsvForm.querySelector(':invalid');
      if (invalid) { e.preventDefault(); go(paneNumberOf(invalid)); showFieldError(invalid); return; }
      if (!state.day || !state.slot) {
        e.preventDefault();
        refreshSum2();
        sum2.textContent = 'Lütfen tarih ve saat seç';
      }
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('show')) close(); });

    // D3 (2026-08-08) — mekan-liste kartı `#openRsv` hash'iyle buraya
    // gönderiyor; eskiden tarayıcı yalnız düğmeye KAYDIRIYORDU, modal
    // AÇILMIYORDU (kart vaadi yarım kalıyordu). Aynı `open_()` yolu
    // kullanılır (openRsv düğmesinin dinleyicisiyle BİREBİR), ikinci bir
    // açma mekanizması icat edilmedi. Bu modal IIFE'nin en başındaki
    // `if (!modal) return;` guard'ı zaten mekân rezervasyon almadığında
    // (`#rsvModal` hiç render edilmediğinde) tüm bloğu atlıyor — hash orada
    // hiç işlenmez, konsol hatası da üretmez (doğrudan URL yapıştırma
    // savunması, kartın kendisi zaten CTA basmıyor ama URL elle de gelebilir).
    if (window.location.hash === '#openRsv') {
      open_();
      // Tarayıcının fragment-scroll'u modalın ARKASINDAKİ düğmeye kaydırmış
      // olabilir; modal kendi overlay'iyle üstte olduğu için görünmez ama
      // kapatınca sayfa ortada kalmasın diye başa alınır.
      window.scrollTo(0, 0);
    }

    // Sunucu sinyali — başarı/hatadan sonra modalı otomatik uygun adımda aç.
    var signal = document.getElementById('mdRsvSignal');
    if (signal) {
      if (signal.getAttribute('data-success-id')) {
        open_();
        go(3);
        renderRecap(signal);
      } else if (signal.getAttribute('data-reopen') === '1') {
        open_();
        go(2);
        if (signal.getAttribute('data-old-day')) { state.day = signal.getAttribute('data-old-day'); renderSlots(); }
        if (signal.getAttribute('data-old-slot')) { state.slot = signal.getAttribute('data-old-slot'); }
      }
    }
  })();

  // ---- STICKY AKSİYON BARI (.vd-actbar): başlık bandı geçilince görünür ----
  //      public/reference/tarif-detay/tarif-detay.js:198-209 kalıbı BİREBİR
  //      (yalnız id/sınıf adları vd- önekli). Sayfa sonuna 220px kala geri
  //      alınır ki footer/benzer-mekânlar alanını örtmesin.
  (function () {
    var bar = document.getElementById('vdActbar');
    var head = document.querySelector('.rd-head');
    if (!bar || !head) return;
    function onScroll() {
      // M8 (Beyar 2026-07-27): kaynak eşik `bottom < 0` — başlık bandı ekranın
      // ÜSTÜNDEN tamamen çıkana kadar bar yok, sayfanın ilk ~900px'i boş
      // geçiyordu (kapsama %44). Eşik "başlık bandı viewport'un alt üçte
      // birine girdi" noktasına çekildi: kullanıcı okumaya başlar başlamaz bar
      // elinin altında olur, hero hâlâ ekrandayken görünmez.
      var past = head.getBoundingClientRect().bottom < window.innerHeight * 0.35;
      // M6 (Beyar 2026-07-27, ölçüldü): kaynak kalıp `document.body.scrollHeight`
      // kullanıyor ve tarif sayfasında sorun çıkarmıyor, çünkü orada body ile
      // documentElement yükseklikleri örtüşüyor. GOURMET kabuğunda ayrışıyorlar
      // (gourmet.js .page-main'e footer yüksekliği kadar margin-bottom veriyor):
      // 1500x1000'de body 2998, documentElement 3438 — 440px eksik. Bar sayfanın
      // yalnızca %38'inde görünüyordu. Belge yüksekliği iki ölçünün BÜYÜĞÜNDEN
      // alınır; "sona 220px kala kapan" amacı korunur.
      var docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      var nearEnd = (window.innerHeight + window.scrollY) >= docH - 220;
      bar.classList.toggle('show', past && !nearEnd);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  // ---- S6-c (kapanış turu 2026-08-08, ORTAK DESENE taşındı) — .vd-actbar
  //      kaydırılabilirlik ipucu artık reference/shared/scroll-affordance.js
  //      üzerinden geliyor (Y5/E7b — dada-route hızlı-filtre şeritleri — İLE
  //      AYNI kaynak, ikinci kopya yazılmadı); burada yalnız `data-scroll-fade`
  //      attribute'u basılır (_actions.blade.php), kablolama ortak script'te. ----

  // ---- Bar popover'larının KONUMU (#mdListPop / #mdReportPop) ----
  //      Açma/kapama yukarıdaki kc-pop IIFE'sinde (hidden toggle + dışarı
  //      tıklayınca kapan) — burada YALNIZ konum + aria. Popover'lar barın
  //      DIŞINDA fixed duruyor: bar kalıbın `overflow-x:auto`sunu taşıyor,
  //      bu overflow-y'yi de auto'ya zorluyor (CSS spec) ve içeride
  //      position:absolute bir panel kırpılırdı. Yerleştirme tarif-detay.js'in
  //      #rdSharePop çözümünün aynısı: yukarı doğru açılır, viewport kenarına
  //      8px kala kelepçelenir.
  (function () {
    var pairs = [['mdListBtn', 'mdListPop'], ['mdReportBtn', 'mdReportPop']];

    function syncAria() {
      pairs.forEach(function (pair) {
        var btn = document.getElementById(pair[0]);
        var pop = document.getElementById(pair[1]);
        if (btn && pop) btn.setAttribute('aria-expanded', pop.hidden ? 'false' : 'true');
      });
    }

    pairs.forEach(function (pair) {
      var btn = document.getElementById(pair[0]);
      var pop = document.getElementById(pair[1]);
      if (!btn || !pop) return;
      // Aynı öğe üzerindeki dinleyiciler stopPropagation'dan etkilenmez ve
      // kayıt sırasıyla çalışır — kc-pop IIFE'si hidden'ı zaten çevirdi.
      btn.addEventListener('click', function () {
        syncAria();
        if (pop.hidden) return;
        var r = btn.getBoundingClientRect();
        pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - pop.offsetWidth - 8)) + 'px';
        pop.style.bottom = (window.innerHeight - r.top + 10) + 'px';
      });
    });

    document.addEventListener('click', syncAria);
  })();
})();
