# dadagourmet-prototip

Dada Gourmet'in güncel hedef prototipi (Faz 1, karar K1). Ortak ekranların donörü canlı Gastro render'ı; bu depo Gourmet'in yeni donörüdür. Faz 4'te Blade'e bu sayfaların render edilmiş DOM'undan geçilir.

Durum: public depo `gaviaworks-dev/dadagourmet-prototip`, GitHub Pages'te yayında (Beyar kararı, 7 Kas). `admin/` panel donörleri public depoya girmez, yerel `panel-donor-yerel` dalında durur. Push ve yayın Beyar onayıyladır. `robots.txt` her yolu kapatır, her sayfada `noindex, nofollow` vardır.

## Çalıştırma

    node _src/build.mjs              # bağımlılıksız derleme
    python3 -m http.server 8996      # kökten statik sunucu, sonra http://localhost:8996/ekranlar/

## Yapı

Yöntem `dadadiet-prototip` ile aynıdır.

| Yol | İçerik |
|---|---|
| `_src/build.mjs` | Derleyici. `_src/sayfalar/` altını `<yol>/index.html` yapar, karşılığı olmayan iç bağı en yakın gerçek ekrana bağlar (`YEDEK` tablosu) |
| `_src/kabuk/` | `kabuk.mjs` sayfa iskeleti, `zincir.json` donör sayfaların CSS ve JS sırası, `logo.svg` |
| `_src/parcalar/kabuk/` | Üst bant, başlık, çekmece, altbilgi, alt çubuk, Görüş Bildir, çerez bandı: üretilmiş parçalar, elle düzenlenmez |
| `_src/sayfalar/` | Ekranlar. `.html` ilk satırı JSON ön bilgi; `.mjs` çok sayfa üretir |
| `_src/araclar/` | Donör çekimi ve dönüşüm betikleri. Markup buradan üretilir |
| `_src/ekran-kaynaklari.md` | Her ekranın donörü, sapması, gerekçesi |
| `_src/sayfa-listesi.json` | Üretilen sayfalar |
| `assets/g/` | Canlı Gastro zinciri; marka rengi Gourmet'e eşlenmiş, `kanon/markalar/gourmet.css` yüklü |
| `assets/o/` | Canlı Gourmet gövde dosyaları ve görselleri |
| `assets/css/gourmet-sapma.css` | Gastro kabuğu altında Gourmet gövdesi için yazılı sapmalar |
| `assets/js/prototip.js` | Form göndermeyi ve yazma isteğini keser; hiçbir veri gitmez. Demo kayıtları (`dgKayit`) ve Dada Puan kuralı (`dgPuan`) burada; kayıtlar yalnız tarayıcıda durur |
| `assets/js/rota-telefon-veri.js`, `assets/js/sayfa/rota-telefon.js`, `_src/parcalar/rota-telefon.html` | Rotayı telefona gönder örnek akışı; gerçek gönderim yok |
| `admin/` | Panel donör seti; ayrı iş kolu |

## Donörü yenileme

Playwright kurulu bir projeyi `PW_KOK=<yol>/package.json` ile gösterin. Yalnız GET yapılır, User-Agent `DadaGourmetKanonBot/1.0`.

    node _src/araclar/donor-cek.mjs <cekim> _src/araclar/donor-liste.json
    node _src/araclar/varlik-hazirla.mjs <cekim> <gastro>/public/kanon/markalar/gourmet.css
    node _src/araclar/zincir-uret.mjs <cekim>/dom
    node _src/araclar/kabuk-uret.mjs <cekim>/dom
    node _src/araclar/sayfa-kurumsal.mjs <cekim>/dom
    node _src/araclar/sayfa-gourmet.mjs <cekim>/dom <eski-referans>/sayfa-dom.html
    node _src/araclar/sayfa-rota.mjs <cekim>/dom
    node _src/araclar/sayfa-mekan-bul.mjs <cekim>/dom
    node _src/araclar/etkinlik-veri.mjs
    node _src/araclar/etkinlik-gorunum.mjs
    node _src/araclar/sayfa-etkinlik.mjs <cekim>/dom
    node _src/araclar/gorsel-al.mjs
    node _src/build.mjs

Girişli Hesabım render'ı yerel bir Gastro kopyasından alınır; o adım ve tohum hesabı depoda yoktur. Tohum kimliği çekimden okunup temizlenir.

## Kurallar

- Markup elle yazılmaz: donörün render edilmiş DOM'u alınır, yalnız dinamik parça değişir. Donörü olmayan parça `ekran-kaynaklari.md`'de sapma olarak yazılır.
- Sahte puan, yorum, takipçi, analitik yok. Örnek veri görünür `prototip örneği` etiketi taşır.
- Şirket bilgisi Gastro ile aynıdır; Gastro'da değeri olmayan alan gösterilmez (K5 güncellemesi).
- Siyah bantta Dada Akademi ve Dada Store yok.
- Mekânlar ve mekân detayı haritası MapLibre. Dada Route canlı altyapıda, Leaflet ile kalır; geçiş K7 ile Faz 4'te yapılır.
- Sır, `.env`, canlı üye bilgisi depoya girmez.
