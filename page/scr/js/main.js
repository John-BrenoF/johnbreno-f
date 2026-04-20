document.addEventListener('DOMContentLoaded', () => {
    const aboutTitle = document.querySelector('.about-content h2');
    
    if (aboutTitle) {
        const text = aboutTitle.innerText;
        aboutTitle.innerText = '';
        let i = 0;

        function typeWriter() {
            if (i < text.length) {
                aboutTitle.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        typeWriter();
    }

    // Scroll Reveal para Serviços
    const serviceItems = document.querySelectorAll('.service-item');
    const observerOptions = { threshold: 0.2 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    serviceItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(item);
    });

    // Efeito de brilho palavra por palavra
    const textElements = document.querySelectorAll('.about-content p, .service-item p');
    textElements.forEach(el => {
        const words = el.innerText.split(' ');
        el.innerHTML = words.map(word => `<span class="glow-word">${word}</span>`).join(' ');
    });

    // Filtro do Fórum
    const forumSearch = document.getElementById('forum-search');
    const topics = document.querySelectorAll('.topic-card');

    if (forumSearch) {
        forumSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            topics.forEach(topic => {
                const text = topic.innerText.toLowerCase();
                topic.style.display = text.includes(term) ? 'flex' : 'none';
            });
        });
    }
});
