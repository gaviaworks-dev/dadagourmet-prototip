/* DadaGastro: mevcut alan değerlerini koruyan kanon çoklu seçim. */
(function () {
  'use strict';
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
  var d = document;
  function anahtar(s) { return String(s).toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  window.GastroCokluSecim = function (source, options) {
    if (source._gastroSecici) return source._gastroSecici;
    var selected = [], active = -1, filtered = [], drag = null, placeholder = null;
    var root = d.createElement('div'); root.className = 'gastro-secici';
    root.dataset.secici = source.id || options.id;
    var box = d.createElement('div'); box.className = 'acilir-kap';
    var input = d.createElement('input'); input.type = 'text'; input.className = 'alan-girdi';
    input.id = (source.id || options.id) + 'Arama'; input.placeholder = options.placeholder || dmLk('kabuk_js.secici.ara_sec', 'Ara ve seç'); input.autocomplete = 'off';
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-expanded', 'false');
    var list = d.createElement('div'); list.className = 'acilir-yuzey'; list.hidden = true; list.id = input.id + 'Liste'; list.setAttribute('role', 'listbox');
    input.setAttribute('aria-controls', list.id);
    var chips = d.createElement('div'); chips.className = 'cipler gastro-secimler'; chips.setAttribute('data-ek-sirali', source.id || options.id);
    var help = d.createElement('span'); help.className = 'alan-yardim'; help.id = input.id + 'Yardim'; help.setAttribute('role', 'status'); input.setAttribute('aria-describedby', help.id);
    box.append(input, list); root.append(box, chips, help); source.insertAdjacentElement('afterend', root); source.hidden = true;
    var label = source.id && d.querySelector('label[for="' + source.id + '"]');
    if (!label && source.closest('.alan')) label = source.closest('.alan').querySelector('label');
    var count = d.createElement('span'); count.className = 'gastro-secim-sayac'; if (label) { label.classList.add('gastro-secim-etiket'); label.appendChild(count); }
    if (label) label.htmlFor = input.id; else input.setAttribute('aria-label', options.label || 'Etiket ara');
    function items() { return options.items(); }
    function name(value) { var found = items().find(function (x) { return x.value === value; }); return found ? found.label : value; }
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
    function renderList() {
      var query = input.value.trim();
      filtered = items().filter(function (x) { return anahtar(x.label).includes(anahtar(query)); });
      if (options.free && query && query.length <= 100 && !selected.includes(query) && !filtered.some(function (x) { return anahtar(x.label) === anahtar(query); })) filtered.unshift({ value: query, label: query, yeni: true });
      // Revize 5 · madde 19: kapalı listelerde (kategori) boş aramada HEPSİ görünür; ilk 8 kesintisi yalnız öneri listeleri için.
      if (!query && !options.hepsi) filtered = filtered.slice(0, 8);
      if (active < 0 || active >= filtered.length || selected.includes(filtered[active].value)) active = filtered.findIndex(function (x) { return !selected.includes(x.value); });
      list.replaceChildren();
      filtered.forEach(function (item, i) {
        var button = d.createElement('button'); button.type = 'button'; button.className = 'acilir-kalem' + (i === active ? ' aktif' : '');
        button.id = list.id + '-' + i; button.tabIndex = -1; button.setAttribute('role', 'option'); button.setAttribute('aria-selected', String(selected.includes(item.value)));
        var check = d.createElement('i'); check.className = selected.includes(item.value) ? 'fa-solid fa-check' : 'gastro-oneri-bos'; check.setAttribute('aria-hidden', 'true'); button.append(check, d.createTextNode(item.label + (item.yeni ? ' — ekle' : '')));
        button.disabled = selected.includes(item.value) || !!options.max && selected.length >= options.max;
        button.addEventListener('click', function () { add(item.value); }); list.appendChild(button);
      });
      if (!filtered.length) { var empty = d.createElement('p'); empty.className = 'alan-yardim'; empty.textContent = dmLk('kabuk_js.secici.bulunamadi', 'Bulunamadı'); list.appendChild(empty); }
      if (active >= 0) input.setAttribute('aria-activedescendant', list.id + '-' + active); else input.removeAttribute('aria-activedescendant');
    }
    function open() { if (input.disabled) return; renderList(); list.hidden = false; input.setAttribute('aria-expanded', 'true'); }
    function write() {
      if (options.write) options.write(selected.slice());
      source.dispatchEvent(new Event('input', { bubbles: true })); source.dispatchEvent(new CustomEvent('gastro:secim', { bubbles: true }));
    }
    function move(value, to) {
      var from = selected.indexOf(value); if (!options.ordered || from < 0 || to < 0 || to >= selected.length || from === to) return;
      var before = positions(); selected.splice(from, 1); selected.splice(to, 0, value); draw(); animate(before); write();
      var chip = Array.from(chips.children).find(function (x) { return x.dataset.value === value; }); if (chip) chip.focus();
    }
    function positions() { return new Map(Array.from(chips.querySelectorAll('.gastro-secim')).map(function (e) { return [e.dataset.value, e.getBoundingClientRect()]; })); }
    function animate(before) { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; Array.from(chips.querySelectorAll('.gastro-secim')).forEach(function (e) { var a = before.get(e.dataset.value), b = e.getBoundingClientRect(); if (a && (a.x !== b.x || a.y !== b.y)) e.animate([{ transform: 'translate(' + (a.x-b.x) + 'px,' + (a.y-b.y) + 'px)' }, { transform: 'translate(0,0)' }], { duration: 200, easing: 'ease-out' }); }); }
    function endDrag() { if (placeholder) { placeholder.remove(); placeholder = null; } Array.from(chips.children).forEach(function (e) { e.classList.remove('surukleniyor', 'hedef'); }); }
    function draw() {
      chips.replaceChildren();
      selected.forEach(function (value, index) {
        var chip = d.createElement('span'); chip.className = 'cip gastro-secim' + (options.ordered && index === 0 ? ' ana' : ''); chip.dataset.value = value;
        var icon = d.createElement('i'); icon.className = 'fa-solid ' + (options.ordered ? 'fa-grip-vertical gastro-tutamac' : 'fa-tag'); icon.setAttribute('aria-hidden', 'true'); chip.appendChild(icon);
        var text = d.createElement('span'); text.textContent = name(value); chip.appendChild(text);
        if (options.ordered) {
          chip.tabIndex = 0; chip.setAttribute('aria-label', dmLk('kabuk_js.secici.cip_sirali', ':ad, :n. kategori. Alt ve ok tuşlarıyla sırala.', { ad: name(value), n: index + 1 }));
          if (index === 0) { var main = d.createElement('b'); main.className = 'gastro-ana'; main.textContent = dmLk('kabuk_js.secici.ana', 'Ana'); chip.appendChild(main); }
          chip.addEventListener('keydown', function (e) { if (e.altKey && ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); move(value, index + (['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 1)); } });
          chip.addEventListener('pointerdown', function (e) {
            if (e.target.closest('button') || e.button !== 0) return;
            drag = { value: value, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, target: index };
            chip.setPointerCapture(e.pointerId);
          });
          chip.addEventListener('pointermove', function (e) {
            if (!drag || drag.id !== e.pointerId) return;
            if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
            drag.moved = true; chip.classList.add('surukleniyor');
            var target = d.elementFromPoint(e.clientX, e.clientY); target = target && target.closest('.gastro-secim');
            if (target && target.parentNode === chips && target !== chip && target.dataset.value) {
              drag.target = selected.indexOf(target.dataset.value);
              if (!placeholder) { placeholder = chip.cloneNode(true); placeholder.className = 'cip gastro-secim gastro-bosluk'; placeholder.removeAttribute('data-value'); placeholder.removeAttribute('tabindex'); placeholder.setAttribute('aria-hidden', 'true'); placeholder.querySelectorAll('button').forEach(function(b){b.tabIndex=-1;b.disabled=true;}); }
              var oldPositions = positions(); var ref = drag.target > index ? target.nextSibling : target; if (ref !== placeholder) chips.insertBefore(placeholder, ref); animate(oldPositions);
            }
          });
          chip.addEventListener('pointerup', function () { if (!drag) return; var saved = drag; drag = null; endDrag(); if (saved.moved) move(saved.value, saved.target); });
          chip.addEventListener('pointercancel', function () { drag = null; endDrag(); });
        }
        var remove = d.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', dmLk('kabuk_js.secici.kaldir', ':ad — Kaldır', { ad: name(value) }));
        remove.addEventListener('click', function () { selected = selected.filter(function (v) { return v !== value; }); draw(); write(); input.focus(); }); chip.appendChild(remove); chips.appendChild(chip);
      });
      var full = options.max && selected.length >= options.max; input.disabled = false; count.textContent = dmLk('kabuk_js.secici.secim_sayisi', ':n seçim', { n: selected.length }) + (full ? dmLk('kabuk_js.secici.en_cok', ' · En çok :n', { n: options.max }) : '');
      help.textContent = options.ordered ? dmLk('kabuk_js.secici.sirali_ipucu', 'İlk kategori ana kategoridir · sürükleyerek ya da Alt+ok ile sırala') : (source.id === 'tfMutfak' ? dmLk('kabuk_js.secici.mutfak_ipucu', 'Birden çok mutfak seçebilirsin') : (options.hint || dmLk('kabuk_js.secici.ipucu', 'Ara, listeden seç ve Enter ile ekle.')));
      if (!list.hidden) renderList();
    }
    function add(value) { if (selected.includes(value) || options.max && selected.length >= options.max) return; selected.push(value); input.value = ''; draw(); write(); close(); if (!input.disabled) input.focus(); else (chips.lastElementChild.querySelector('button')).focus(); }
    input.addEventListener('input', function () { active = 0; open(); }); input.addEventListener('focus', open); input.addEventListener('click', open);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key === 'Tab') { close(); return; }
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); if (list.hidden) open(); else { var step = e.key === 'ArrowDown' ? 1 : -1; for (var n = 0; n < filtered.length; n++) { active = (active + step + filtered.length) % filtered.length; if (!selected.includes(filtered[active].value)) break; } renderList(); } var option = list.children[active]; if (option) option.scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter') { e.preventDefault(); if (list.hidden) open(); else if (filtered[active]) add(filtered[active].value); }
    });
    d.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
    var api = { read: function () { return selected.slice(); }, set: function (values) { selected = Array.from(new Set(values || [])); draw(); }, root: root, input: input, move: move };
    source._siraliOku = api.read; source._siraliYaz = api.set; source._gastroSecici = api; draw(); return api;
  };
  function etiketKur() {
    var holder = d.querySelector('[data-ek-etiket-coklu]'); if (!holder || !d.getElementById('tfKategori')) return;
    var source = holder.querySelector('[data-ek-etiket-deger]'); if (!source) return;
    holder.hidden = true;
    var buttons = Array.from(holder.querySelectorAll('[data-etiket]'));
    var syncing = false;
    // Revize 5 · madde 33 ek (lead kararı): beslenme listesi de kapalı liste; boş aramada hepsi görünür.
    var api = window.GastroCokluSecim(source, { id: 'tfBeslenme', label: 'Beslenme ve tip etiketleri', placeholder: 'Beslenme veya tip etiketi ara', hepsi: true,
      items: function () { return buttons.map(function (b) { return { value: b.dataset.etiket, label: b.dataset.etiket }; }); },
      write: function (values) {
        syncing = true;
        buttons.forEach(function (b) { if ((b.getAttribute('aria-selected') === 'true') !== values.includes(b.dataset.etiket)) b.click(); });
        syncing = false;
      }
    });
    holder.insertAdjacentElement('afterend', api.root);
    source.addEventListener('input', function () { if (!syncing) api.set(source.value.split(',').map(function (v) { return v.trim(); }).filter(Boolean)); });
    api.set(source.value.split(',').filter(Boolean));
  }
  d.addEventListener('DOMContentLoaded', etiketKur);
})();
