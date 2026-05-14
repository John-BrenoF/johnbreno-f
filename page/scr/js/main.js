document.addEventListener('DOMContentLoaded', () => {
    // --- SISTEMA DE BOOT SEQUENCE ---
    const bootLoader = document.getElementById('boot-loader');
    const bootTerminal = document.getElementById('boot-terminal');
    const bootAscii = document.getElementById('boot-ascii');
    const bootProgress = document.getElementById('boot-progress');
    const progressContainer = document.getElementById('boot-progress-container');
    
    const icons = {
        sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.72-12.72l-1.41 1.41"></path>',
        moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
    };

    // --- CONTROLE DE TEMA (MODO CLARO/ESCURO) ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeSvg = themeToggle.querySelector('svg');
    const currentTheme = localStorage.getItem('theme');

    const updateThemeIcon = (theme) => {
        themeSvg.innerHTML = theme === 'light' ? icons.sun : icons.moon;
    };

    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcon('light');
    } else {
        updateThemeIcon('dark');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
        showNotification(`MODO ${theme === 'light' ? 'CLARO' : 'ESCURO'} ATIVADO`);

        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 400);
    });

    function showNotification(message) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerHTML = `
            <span class="notif-accent">></span> ${message}
            <div class="notif-progress"></div>
        `;
        container.appendChild(notif);

        const progressBar = notif.querySelector('.notif-progress');
        const duration = 5000;
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        // Animação da barra de progresso
        progressBar.animate([
            { transform: 'scaleX(1)' },
            { transform: 'scaleX(0)' }
        ], { duration: duration, easing: 'linear' });

        setTimeout(() => notif.classList.add('show'), 100);

        // Lógica de Arrastar (Swipe)
        notif.addEventListener('pointerdown', (e) => {
            startX = e.clientX;
            isDragging = true;
            notif.classList.add('dragging');
            notif.setPointerCapture(e.pointerId);
        });

        notif.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            currentX = Math.max(0, e.clientX - startX); // Só permite arrastar para a direita
            notif.style.transform = `translateX(${currentX}px)`;
            notif.style.opacity = 1 - (currentX / 300);
        });

        notif.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            notif.classList.remove('dragging');
            
            if (currentX > 150) { // Threshold para fechar
                dismiss();
            } else {
                notif.style.transform = '';
                notif.style.opacity = '';
            }
        });

        const dismiss = () => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 500);
        };

        const autoDismissTimeout = setTimeout(dismiss, duration);
    }

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
        const isReturning = !!userName;
        
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

        // Determinar saudação baseada na hora
        const currentHour = new Date().getHours();
        let timeGreeting = "BOA NOITE";
        if (currentHour >= 5 && currentHour < 12) timeGreeting = "BOM DIA";
        else if (currentHour >= 12 && currentHour < 18) timeGreeting = "BOA TARDE";

        // Mostrar notificações
        if (isReturning) {
            showNotification(`${timeGreeting}, ${userName.toUpperCase()}`);
            setTimeout(() => showNotification(`SEJA BEM-VINDO DE VOLTA !!!`), 800);
        } else {
            showNotification(`SEJA BEM-VINDO, ${userName.toUpperCase()}`);
        }

        bootLoader.style.opacity = '0';
        document.body.classList.remove('loading');
        setTimeout(() => bootLoader.style.display = 'none', 800);
    }

    // Só executa o boot se estivermos na página principal (onde o loader existe)
    if (bootLoader) runBootSequence();

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
    let mouseX = 0, mouseY = 0;
    let ticking = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                document.body.style.setProperty('--mouse-x', `${mouseX}px`);
                document.body.style.setProperty('--mouse-y', `${mouseY}px`);
                document.body.style.setProperty('--scroll-y', `${window.scrollY}px`);

                const particleContainer = document.getElementById('cv-particles');
                if (particleContainer) {
                    const moveX = (mouseX - window.innerWidth / 2) / 40;
                    const moveY = (mouseY - window.innerHeight / 2) / 40;
                    particleContainer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    window.addEventListener('scroll', () => {
        document.body.style.setProperty('--scroll-y', `${window.scrollY}px`);
    });

    // --- EFEITO TYPEWRITER UNIVERSAL ---
    const typewriterElements = document.querySelectorAll('.about-content h2, .typewriter-text');
    typewriterElements.forEach(el => {
        const text = el.innerText;
        el.innerText = '';
        let i = 0;

        function typeWriter() {
            if (i < text.length) {
                el.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        typeWriter();
    });

    // Scroll Reveal Setup
    const observerOptions = { threshold: 0.2 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                setTimeout(() => {
                    entry.target.style.transitionDelay = '0s';
                }, 1000);
            }
        });
    }, observerOptions);

    // Coletamos todos os itens que precisam de scroll reveal (incluindo as seções da Wiki)
    const revealItems = document.querySelectorAll('.welcome-section, .service-item, .wiki-section, .cv-card');
    revealItems.forEach(item => observer.observe(item));

    // Scroll Reveal para Ícones de Skills
    const skillIcons = document.querySelectorAll('.skills-stack img');
    skillIcons.forEach((icon, index) => {
        // Delay escalonado para criar o efeito de "onda" na entrada
        icon.style.transitionDelay = `${(index % 8) * 0.05}s`; 
        observer.observe(icon);

        let rect;
        icon.addEventListener('mouseenter', () => {
            rect = icon.getBoundingClientRect();
        });

        icon.addEventListener('mousemove', (e) => {
            if (!rect) return;
            const centerX = rect.left + rect.width / 2;
            const relativeX = (e.clientX - centerX) / (rect.width / 2);
            
            // requestAnimationFrame para suavizar a atualização da variável CSS
            window.requestAnimationFrame(() => {
                const tilt = relativeX * 20;
                icon.style.setProperty('--tilt', `${tilt}deg`);
            });
        });

        // Reseta a inclinação quando o mouse sai
        icon.addEventListener('mouseleave', () => {
            icon.style.setProperty('--tilt', '0deg');
        });
    });

    // Efeito de brilho palavra por palavra + Chance de Glitch no Hover
    const textElements = document.querySelectorAll('.about-content p, .service-item p, .service-item h3, .skill-category p, .skill-label, .cv-info p, .cv-info h3, .project-content p, .project-content li');
    textElements.forEach(el => {
        const words = el.innerText.split(' ');
        el.innerHTML = words.map(word => `<span class="glow-word">${word}</span>`).join(' ');
        
    });

    // --- WIKI SCROLL SPY ---
    const wikiSections = document.querySelectorAll('.wiki-section');
    const wikiLinks = document.querySelectorAll('.wiki-nav a');
    
    if (wikiSections.length > 0 && wikiLinks.length > 0) {
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    wikiLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { threshold: 0.3, rootMargin: "-10% 0px -70% 0px" });
        wikiSections.forEach(section => spyObserver.observe(section));
    }

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
    const interactiveCards = document.querySelectorAll('.contact-card, .cv-card');
    interactiveCards.forEach(card => {
        let rect;
        card.addEventListener('mouseenter', () => {
            rect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
            if (!rect) return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = (rect.height / 2 - y) / 15;
            const rotateY = (x - rect.width / 2) / 15;
            
            window.requestAnimationFrame(() => {
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `rotateX(0deg) rotateY(0deg)`;
        });
    });

    // Lógica do Carrossel de Projetos
    const carousel = document.getElementById('project-carousel');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const serviceItems = document.querySelectorAll('.service-item');

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

    // Controle dinâmico da luz da seção de currículo via scroll
    const cvSection = document.getElementById('curriculo');
    if (cvSection) {
        let scrollTicking = false;
        const updateCvLight = () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    const rect = cvSection.getBoundingClientRect();
                    const viewHeight = window.innerHeight;

                    if (rect.top < viewHeight && rect.bottom > 0) {
                        const sectionCenter = rect.top + rect.height / 2;
                        const viewCenter = viewHeight / 2;
                        const distance = Math.abs(viewCenter - sectionCenter);
                        const maxRange = viewHeight * 0.8;
                        
                        let progress = 1 - (distance / maxRange);
                        progress = Math.max(0, Math.min(1, progress));
                        
                        cvSection.style.setProperty('--cv-light-opacity', progress.toFixed(3));
                    }
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        };
        window.addEventListener('scroll', updateCvLight);
        updateCvLight(); // Executa uma vez no load
    }

    // Geração de partículas de poeira para a seção de currículo
    const particleContainer = document.getElementById('cv-particles');
    if (particleContainer) {
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            
            const size = Math.random() * 3 + 1;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${Math.random() * 100}%`;
            p.style.top = `${Math.random() * 100}%`;
            
            p.style.setProperty('--move-x', `${(Math.random() - 0.5) * 150}px`);
            p.style.setProperty('--move-y', `${(Math.random() - 0.5) * 150}px`);
            
            p.style.animation = `float-dust ${Math.random() * 8 + 7}s linear infinite`;
            p.style.animationDelay = `${Math.random() * 10}s`;
            
            particleContainer.appendChild(p);
        }
    }

    // Geração de partículas para a seção de boas-vindas
    const welcomeParticleContainer = document.getElementById('welcome-particles');
    if (welcomeParticleContainer) {
        for (let i = 0; i < 80; i++) {
            const p = document.createElement('div');
            p.className = 'welcome-particle';
            
            const size = Math.random() * 2 + 1;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${Math.random() * 100}%`;
            p.style.top = `${Math.random() * 100}%`;
            
            p.style.setProperty('--move-x', `${(Math.random() - 0.5) * 300}px`);
            p.style.setProperty('--move-y', `${(Math.random() - 0.5) * 300}px`);
            
            p.style.animationDuration = `${Math.random() * 10 + 10}s`;
            p.style.animationDelay = `${Math.random() * 5}s`;
            
            welcomeParticleContainer.appendChild(p);
        }
    }

    // --- LOGICA DO EASTER EGG (GATINHO) ---
    const logoElement = document.querySelector('.logo');
    const catElement = document.getElementById('cat-easter-egg');
    let catAppearanceTimer;
    let catRemovalTimer;

    if (logoElement && catElement) {
        logoElement.addEventListener('mouseenter', () => {
            // Se o mouse ficar 2 segundos parado no titulo
            catAppearanceTimer = setTimeout(() => {
                catElement.classList.add('active');
                showNotification("SISTEMA_INFO: GATINHO DETECTADO");
                
                // Fica em loop por 4 segundos e depois some
                catRemovalTimer = setTimeout(() => {
                    catElement.classList.remove('active');
                }, 4000);
            }, 2000);
        });

        logoElement.addEventListener('mouseleave', () => {
            // Se tirar o mouse, cancela tudo e esconde
            clearTimeout(catAppearanceTimer);
            clearTimeout(catRemovalTimer);
            catElement.classList.remove('active');
            catElement.style.transform = '';
            catElement.style.opacity = '';
        });
    }

    // --- LOGICA DO MINI-GAME (SNAKE) ---
    const pythonTrigger = document.getElementById('python-trigger');
    const gameModal = document.getElementById('game-modal');
    const closeGameBtn = document.getElementById('close-game-btn');
    const snakeCanvas = document.getElementById('snake-canvas');
    const ctx = snakeCanvas.getContext('2d');
    const scoreEl = document.getElementById('snake-score');
    const gameCountdownEl = document.getElementById('game-countdown'); // Novo elemento para o countdown

    let pythonClicks = 0;
    let gameInterval;
    let snake = [];
    let food = {};
    let dx = 20;
    let dy = 0;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let changingDirection = false;
    let isGameOver = false; // Nova variável para controlar o estado do jogo
    let snakeParticles = [];

    pythonTrigger.addEventListener('click', () => {
        pythonClicks++;
        if (pythonClicks === 7) {
            openGame();
            pythonClicks = 0;
        }
    });

// Helper para gerar som de bip via código
const playBeep = (freq = 440, duration = 0.1) => {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.frequency.value = freq;
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => oscillator.stop(), duration * 1000);
    } catch (e) { console.warn("Audio não suportado"); }
};

    function openGame() {
        gameModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        resetGame();
        
        gameCountdownEl.style.display = 'inline'; // Mostra o elemento do countdown
        let countdown = 3;
        gameCountdownEl.textContent = `INICIANDO EM: ${countdown}...`;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                gameCountdownEl.textContent = `INICIANDO EM: ${countdown}...`;
            } else {
                clearInterval(countdownInterval);
                gameCountdownEl.style.display = 'none'; // Esconde o elemento do countdown
                updateScoreDisplay();
                isGameOver = false;
                main();
            }
        }, 1000);
    }

    closeGameBtn.addEventListener('click', () => {
        gameModal.style.display = 'none';
        document.body.style.overflow = '';
        clearTimeout(gameInterval);
    });


    function resetGame() {
        snake = [
            { x: 200, y: 200 }, { x: 180, y: 200 },
            { x: 160, y: 200 }, { x: 140, y: 200 }
        ];
        score = 0;
        dx = 20;
        dy = 0;
        createFood();
        snakeParticles = [];
        updateScoreDisplay();
        isGameOver = false; // Reseta o estado de Game Over
    }

    function updateScoreDisplay() {
        scoreEl.textContent = `SCORE: ${score.toString().padStart(3, '0')} | BEST: ${highScore.toString().padStart(3, '0')}`;
    }

    let gameSpeed = 100; // Velocidade inicial
    function main() {
        if (didGameEnd()) {
            showNotification("GAME_OVER: CONEXÃO PERDIDA");
            return;
        }

        // Aumenta a velocidade conforme a pontuação sobe
        gameSpeed = Math.max(40, 100 - (Math.floor(score / 50) * 10));

        gameInterval = setTimeout(function gameLoop() {
            changingDirection = false;
            clearCanvas();
            updateAndDrawParticles();
            drawFood();
            advanceSnake();
            drawSnake();
            if (!isGameOver) main(); // Continua o loop apenas se o jogo não acabou
        }, gameSpeed);
    }
    function clearCanvas() {
        ctx.fillStyle = "#000"; // Cor de fundo do jogo
        ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    }

    function drawSnake() {
    // Lógica para detectar se a cobra vai morrer no próximo movimento
    const nextHead = { x: snake[0].x + dx, y: snake[0].y + dy };
    const willDie = nextHead.x < 0 || 
                    nextHead.x > snakeCanvas.width - 20 || 
                    nextHead.y < 0 || 
                    nextHead.y > snakeCanvas.height - 20 ||
                    snake.some(part => part.x === nextHead.x && part.y === nextHead.y);

        snake.forEach((part, index) => {
        if (willDie) {
            // Muda para vermelho se o Game Over for iminente
            ctx.fillStyle = index === 0 ? "#ff0000" : "#aa0000";
        } else {
            ctx.fillStyle = index === 0 ? "#ffffff" : "#999999";
        }
            ctx.fillRect(part.x, part.y, 20, 20);

            // Detalhes internos mantendo o estilo quadrado
            if (index === 0) {
                // "Sensores/Olhos" pretos para a cabeça
                ctx.fillStyle = "#000000";
                ctx.fillRect(part.x + 4, part.y + 4, 4, 4);
                ctx.fillRect(part.x + 12, part.y + 4, 4, 4);
            } else {
                // Brilho interno para os segmentos do corpo
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                ctx.fillRect(part.x + 5, part.y + 5, 10, 10);
            }

            ctx.strokeStyle = "#000000";
            ctx.strokeRect(part.x, part.y, 20, 20);
        });
    }

    function createSnakeParticle(x, y) {
        // Cria pequenos "pixels" de fumaça
        for (let i = 0; i < 6; i++) {
            snakeParticles.push({
                x: x + 10,
                y: y + 10,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.floor(Math.random() * 4) + 2,
                life: 1.0,
                decay: Math.random() * 0.1 + 0.05
            });
        }
    }

    function updateAndDrawParticles() {
        for (let i = snakeParticles.length - 1; i >= 0; i--) {
            const p = snakeParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            if (p.life <= 0) {
                snakeParticles.splice(i, 1);
                continue;
            }
            ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.5})`;
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        }
    }

    function advanceSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);
        
        // Gera rastro na posição que a cabeça acabou de deixar
        createSnakeParticle(snake[1].x, snake[1].y);

        const didEatFood = snake[0].x === food.x && snake[0].y === food.y;
        if (didEatFood) {
            score += 10;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('snakeHighScore', highScore);
            }
            updateScoreDisplay();
            createFood();
        } else {
            snake.pop();
        }
    }

    function didGameEnd() {
        if (snake.length === 0) return false;
        for (let i = 4; i < snake.length; i++) {
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
        }
        const hitLeftWall = snake[0].x < 0;
        const hitRightWall = snake[0].x > snakeCanvas.width - 20;
        const hitTopWall = snake[0].y < 0;
        const hitBottomWall = snake[0].y > snakeCanvas.height - 20;
        return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
    }

    function createFood() {
        food.x = Math.round((Math.random() * (snakeCanvas.width - 20)) / 20) * 20;
        food.y = Math.round((Math.random() * (snakeCanvas.height - 20)) / 20) * 20;
        snake.forEach(part => {
            if (part.x == food.x && part.y == food.y) createFood();
        });
    }

    function drawFood() {
        ctx.fillStyle = "#ff0055";
        ctx.fillRect(food.x, food.y, 20, 20);
    }

    document.addEventListener("keydown", (e) => {
        // Lógica de reiniciar com Espaço (no Game Over) ou tecla 'r' (a qualquer momento com o jogo aberto)
        if ((isGameOver && (e.key === ' ' || e.code === 'Space')) || (gameModal.style.display === 'flex' && e.key.toLowerCase() === 'r')) {
            e.preventDefault();
            openGame();
            return;
        }

        if (changingDirection) return;
        const keyPressed = e.key.toLowerCase();
        const goingUp = dy === -20;
        const goingDown = dy === 20;
        const goingRight = dx === 20;
        const goingLeft = dx === -20;

        if ((keyPressed === 'w' || e.key === 'ArrowUp') && !goingDown) { dx = 0; dy = -20; }
        if ((keyPressed === 's' || e.key === 'ArrowDown') && !goingUp) { dx = 0; dy = 20; }
        if ((keyPressed === 'a' || e.key === 'ArrowLeft') && !goingRight) { dx = -20; dy = 0; }
        if ((keyPressed === 'd' || e.key === 'ArrowRight') && !goingLeft) { dx = 20; dy = 0; }
        changingDirection = true;
    });
});
