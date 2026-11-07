
    (function () {
        var box = document.querySelector('.lg-toc');
        var list = document.getElementById('lgToc');
        var body = document.querySelector('.prose__body');
        if (! box || ! list || ! body) return;

        var heads = body.querySelectorAll('h2, h3');
        if (! heads.length) return;

        heads.forEach(function (h, i) {
            if (! h.id) h.id = 'lg-h-' + (i + 1);
            h.style.scrollMarginTop = '130px';
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = '#' + h.id;
            // Başlığın kendi numarası kırpılır — numarayı .lg-toc'un CSS
            // counter'ı basar (a::before{content:counter(toc)"."}, ref:781).
            // Desen İKİ SEVİYELİ numaraya genişletildi (2026-08-15): eski
            // /^\d+\.\s*/ tek seviyeye göre yazılmıştı, "4.1 Şu"nun yalnız
            // "4."ini kırpıp geriye "1 Şu" bırakıyordu.
            a.textContent = h.textContent.replace(/^\d+(?:\.\d+)*\.?\s*/, '');
            li.appendChild(a);
            list.appendChild(li);
        });

        box.hidden = false;
    })();
    