document.addEventListener('DOMContentLoaded', () => {
    // --- SISTEMA DE BOOT SEQUENCE ---
    const bootLoader = document.getElementById('boot-loader');
    const bootTerminal = document.getElementById('boot-terminal');
    const bootAscii = document.getElementById('boot-ascii');
    const bootProgress = document.getElementById('boot-progress');
    const progressContainer = document.getElementById('boot-progress-container');
    
    const bootLines = [
        { text: "[  0.000000] Initializing JOHN-BRENOF BIOS v4.0...", type: "gray" },
        { text: "[  0.412034] CPU: Genuine BrenoF 2.40GHz @ 8 Cores", type: "gray" },
        { text: "[  0.892341] Memory Test: 65536MB OK", type: "gray" },
        { text: "[  1.102938] Checking filesystem integrity...", type: "gray" },
        { text: "[  1.450281] Mounting /dev/jb-os on /root...", type: "gray" },
        { text: "[  1.829301] Loading BRENOF KERNEL...", type: "highlight" },
        { text: "[  2.102394] Initializing drivers: GPU, HID, NET...", type: "gray" },
        { text: "[  2.503921] Starting Graphical Environment...", type: "gray" },
        { text: "CORE_SYSTEM_READY > EXECUTE PORTFOLIO_UI", type: "highlight" }
    ];

    async function showProgressBar() {
        progressContainer.style.display = 'block';
        const width = 30;
        for (let i = 0; i <= width; i++) {
            const percent = Math.round((i / width) * 100);
            const bar = "#".repeat(i) + ".".repeat(width - i);
            bootProgress.textContent = `LOADING_MODULES: [${bar}] ${percent}%`;
            await new Promise(r => setTimeout(r, 40));
        }
    }

    async function askName() {
        const overlay = document.getElementById('name-prompt-overlay');
        const input = document.getElementById('user-name-input');
        
        overlay.style.display = 'flex';
        input.focus();

        return new Promise(resolve => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && input.value.trim() !== '') {
                    const name = input.value.trim();
                    localStorage.setItem('jb_portfolio_user', name);
                    overlay.style.opacity = '0';
                    setTimeout(() => { overlay.style.display = 'none'; resolve(name); }, 500);
                }
            });
        });
    }

    async function runBootSequence() {
        // Mostra o ASCII primeiro
        setTimeout(() => bootAscii.style.opacity = '1', 300);

        for (let line of bootLines) {
            const p = document.createElement('p');
            p.className = `boot-line ${line.type === 'highlight' ? 'highlight' : ''}`;
            p.textContent = line.text;
            bootTerminal.appendChild(p);
            
            // Scroll automático para o final do terminal
            bootTerminal.scrollTop = bootTerminal.scrollHeight;
            
            // Delay aleatório para parecer real
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
        }

        await showProgressBar();

        // Verifica se já sabemos o nome
        let userName = localStorage.getItem('jb_portfolio_user');
        
        if (!userName) {
            bootLoader.style.opacity = '0';
            setTimeout(() => bootLoader.style.display = 'none', 500);
            userName = await askName();
            
            // Segunda animação ASCII de boas-vindas
            bootLoader.style.display = 'flex';
            bootLoader.style.opacity = '1';
            bootTerminal.innerHTML = "";
            progressContainer.style.display = 'none';
            bootAscii.innerHTML = `
      ██╗    ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗
      ██║    ██║██╔════╝██║     ██╔════╝██╔═══██╗████╗ ████║██╔════╝
      ██║ █╗ ██║█████╗  ██║     ██║     ██║   ██║██╔████╔██║█████╗  
      ██║███╗██║██╔══╝  ██║     ██║     ██║   ██║██║╚██╔╝██║██╔══╝  
      ╚███╔███╔╝███████╗███████╗╚██████╗╚██████╔╝██║ ╚═╝ ██║███████╗
       ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝`;
            
            const p = document.createElement('p');
            p.className = "boot-line highlight";
            p.style.fontSize = "1.5rem";
            p.style.textAlign = "center";
            p.textContent = `ACCESS_GRANTED: WELCOME, ${userName.toUpperCase()}`;
            bootTerminal.appendChild(p);
            
            await new Promise(r => setTimeout(r, 2000));
        }

        bootLoader.style.opacity = '0';
        document.body.classList.remove('loading');
        setTimeout(() => bootLoader.style.display = 'none', 800);
    }

    runBootSequence();

    // Sistema de tratamento de erro para imagens e estatísticas externas
    const handleImageError = (event) => {
        const img = event.target;
        
        // Se for uma imagem de stats do GitHub, ela falha muito por rate limit
        if (img.src.includes('github-readme-stats') || img.src.includes('streak-stats')) {
            img.parentElement.classList.add('stats-offline');
            console.warn("GitHub Stats atingiu o limite de requisições. Tente novamente mais tarde.");
        } else {
            img.style.opacity = '0.5';
            img.style.filter = 'grayscale(1) contrast(0.5)';
            console.warn(`Recurso externo indisponível: ${img.src}`);
        }
    };

    // Rastreamento global do mouse para o efeito de lanterna
    window.addEventListener('mousemove', (e) => {
        document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    });

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

    // Scroll Reveal para Ícones de Skills
    const skillIcons = document.querySelectorAll('.skills-stack img');
    skillIcons.forEach((icon, index) => {
        // Delay escalonado para criar o efeito de "onda" na entrada
        icon.style.transitionDelay = `${(index % 8) * 0.05}s`; 
        observer.observe(icon);
    });

    // Efeito de brilho palavra por palavra + Chance de Glitch no Hover
    const textElements = document.querySelectorAll('.about-content p, .service-item p, .service-item h3, .skill-category p, .skill-label');
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

    // Interatividade 3D para os Cartões de Contato
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (centerY - y) / 15; // Sensibilidade do movimento
            const rotateY = (x - centerX) / 15;
            
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `rotateX(0deg) rotateY(0deg)`;
        });
    });

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
        // Novo Observer para lidar com o foco (blur/unblur) dos cards no carrossel
        const focusObserverOptions = {
            root: carousel,
            threshold: 0.7 // Card precisa estar 70% visível para ganhar foco
        };

        const focusObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('focused', entry.isIntersecting);
            });
        }, focusObserverOptions);

        serviceItems.forEach(item => focusObserver.observe(item));

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
