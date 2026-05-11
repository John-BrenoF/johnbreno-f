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

    // Efeito de brilho palavra por palavra + Chance de Glitch no Hover (P e H3)
    const textElements = document.querySelectorAll('.about-content p, .service-item p, .service-item h3');
    textElements.forEach(el => {
        const words = el.innerText.split(' ');
        el.innerHTML = words.map(word => `<span class="glow-word">${word}</span>`).join(' ');
        
        el.querySelectorAll('.glow-word').forEach(wordSpan => {
            wordSpan.addEventListener('mouseenter', () => {
                // 15% de chance de disparar um glitch visual na palavra
                if (Math.random() < 0.15) {
                    wordSpan.classList.add('word-glitch-active');
                    setTimeout(() => {
                        wordSpan.classList.remove('word-glitch-active');
                    }, 350);
                }
            });
        });
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
            const rotateX = (centerY - y) / 14.4; // Aumentado a sensibilidade em 4% (15 / 1.04)
            const rotateY = (x - centerX) / 14.4;

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
                
                // Atualiza o transform imediatamente para garantir que o lado de trás apareça
                const currentRotation = card.classList.contains('flipped') ? 180 : 0;
                card.style.transform = `rotateX(0deg) rotateY(${currentRotation}deg)`;
            }
        });
    }

    // Busca a descrição (bio) do GitHub dinamicamente
    async function fetchGitHubData() {
        const bioElement = document.querySelector('.profile-bio');
        if (!bioElement) return;

        try {
            const response = await fetch('https://api.github.com/users/John-BrenoF');
            if (response.ok) {
                const data = await response.json();
                if (data.bio) {
                    bioElement.innerText = data.bio;
                }
            }
        } catch (error) {
            console.error('Erro ao buscar dados do GitHub:', error);
        }
    }

    fetchGitHubData();

    // --- SISTEMA DE GLITCH ---
    const canvas = document.getElementById('glitch-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        const colors = [
            'rgba(138, 43, 226, 0.5)', // Roxo mais forte
            'rgba(255, 0, 127, 0.5)',   // Rosa
            'rgba(255, 255, 255, 0.4)', // Branco
            'rgba(128, 128, 128, 0.3)'  // Cinza
        ];

        // Desenha "fatias" de interferência em vez de ruído total
        function drawDataCorruption() {
            const lines = isGlitching ? 15 : 2;
            for (let i = 0; i < lines; i++) {
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                const y = Math.random() * height;
                const h = Math.random() * 3;
                // Linhas horizontais longas e finas
                ctx.fillRect(0, y, width, h);
            }
            
            if (isGlitching) {
                // Pequenos blocos de "bits" perdidos
                for (let i = 0; i < 20; i++) {
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 30, Math.random() * 30);
                }
            }
        }

        function drawGlitches() {
            const glitchCount = Math.floor(Math.random() * 5) + 2;
            for (let i = 0; i < glitchCount; i++) {
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                const x = Math.random() * width;
                const y = Math.random() * height;
                const w = width * (Math.random() * 0.5 + 0.5);
                const h = Math.random() * 20 + 5;
                
                if (Math.random() < 0.3) {
                    ctx.fillRect(0, y, width, h);
                } else {
                    ctx.fillRect(x, y, w * 0.4, h);
                }
            }
        }

        let isGlitching = false;

        function triggerGlitch() {
            isGlitching = true;
            
            // Aplica tremida no corpo
            if (Math.random() > 0.4) {
                document.body.classList.add('shake-effect');
                setTimeout(() => document.body.classList.remove('shake-effect'), 150);
            }

            const duration = Math.random() * 200 + 100;
            const startTime = Date.now();

            function animate() {
                if (Date.now() - startTime < duration) {
                    ctx.clearRect(0, 0, width, height);
                    drawDataCorruption();
                    drawGlitches();
                    
                    if (Math.random() > 0.8) {
                        ctx.translate((Math.random() - 0.5) * 15, 0);
                    }
                    
                    requestAnimationFrame(animate);
                } else {
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.clearRect(0, 0, width, height);
                    isGlitching = false;
                    scheduleNextGlitch();
                }
            }
            animate();
        }

        function scheduleNextGlitch() {
            const delay = Math.random() * 5000 + 2000; // Entre 2 e 7 segundos
            setTimeout(triggerGlitch, delay);
        }

        scheduleNextGlitch();
    }

    // Lógica do Carrossel de Projetos
    const carousel = document.getElementById('project-carousel');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (carousel && prevBtn && nextBtn) {
        const scrollAmount = 340; // largura do item + gap

        const updateButtons = () => {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            prevBtn.classList.toggle('disabled', carousel.scrollLeft <= 5);
            nextBtn.classList.toggle('disabled', carousel.scrollLeft >= maxScroll - 5);
        };

        carousel.addEventListener('scroll', updateButtons);
        window.addEventListener('resize', updateButtons);
        updateButtons(); // Estado inicial

        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }
});
