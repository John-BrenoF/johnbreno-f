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

    // Lógica do Cartão 3D Interativo
    const cardContainer = document.querySelector('.card-3d-container');
    const card = document.getElementById('interactive-card');
    const glare = document.querySelector('.card-glare');

    if (cardContainer && card) {
        cardContainer.addEventListener('mousemove', (e) => {
            const rect = cardContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calcula a rotação (máximo 15 graus)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (centerY - y) / 15;
            const rotateY = (x - centerX) / 15;

            // Se estiver virado, inverte a lógica do rotateY para manter a naturalidade
            const currentRotation = card.classList.contains('flipped') ? 180 : 0;
            
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${currentRotation + rotateY}deg)`;
            
            // Atualiza posição da luz (glare)
            glare.style.setProperty('--x', `${(x / rect.width) * 100}%`);
            glare.style.setProperty('--y', `${(y / rect.height) * 100}%`);
        });

        cardContainer.addEventListener('mouseleave', () => {
            const currentRotation = card.classList.contains('flipped') ? 180 : 0;
            card.style.transform = `rotateX(0deg) rotateY(${currentRotation}deg)`;
        });

        card.addEventListener('click', (e) => {
            // Impede o clique no link de disparar o giro se for o link do GitHub
            if (!e.target.closest('a')) {
                card.classList.toggle('flipped');
            }
        });
    }
});
