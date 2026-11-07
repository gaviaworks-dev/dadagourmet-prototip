document.addEventListener('DOMContentLoaded', () => {
    const mesaj = document.querySelector('[data-count-for="mesaj"]')?.previousElementSibling;
    const sayac = document.querySelector('[data-count-for="mesaj"]');

    if (!(mesaj instanceof HTMLTextAreaElement) || !(sayac instanceof HTMLElement)) {
        return;
    }

    const guncelle = () => {
        sayac.textContent = `${mesaj.value.length} / ${mesaj.maxLength}`;
    };

    mesaj.addEventListener('input', guncelle);
    guncelle();
});
