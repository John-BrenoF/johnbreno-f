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

    // --- SISTEMA DO FÓRUM (Mecânicas Funcionais) ---
    const topicsContainer = document.getElementById('topics-list');
    const forumMain = document.getElementById('forum-main-content');
    const topicView = document.getElementById('topic-view-container');
    const forumSearch = document.getElementById('forum-search');
    const sortSelect = document.getElementById('sort-topics');
    const categoryList = document.querySelectorAll('#category-filter li');
    const modalNew = document.getElementById('modal-new-topic');
    
    let topics = JSON.parse(localStorage.getItem('tasma_topics')) || [
        { id: 1, title: "Dúvidas sobre a instalação do TasmaOS", author: "@dev_freedom", category: "Kernel Freedom", content: "Como compilar o kernel com suporte a drivers legados?", replies: [], views: 1200, votes: 45, date: "Há 2 horas" },
        { id: 2, title: "Sugestões de plugins para o Tasma Code", author: "@code_master", category: "Desenvolvimento", content: "Precisamos de um plugin de LSP para Rust.", replies: [], views: 3500, votes: 89, date: "Há 5 horas" }
    ];

    function updateStats() {
        if(document.getElementById('stat-topics')) {
            document.getElementById('stat-topics').innerText = topics.length;
            document.getElementById('topic-count').innerText = `Mostrando ${topics.length} tópicos`;
        }
    }

    function renderTopics(filterCategory = 'Tudo', term = '', sortBy = 'newest') {
        if (!topicsContainer) return;
        topicsContainer.innerHTML = '';
        
        const filtered = topics.filter(t => {
            const matchesCategory = filterCategory === 'Tudo' || t.category === filterCategory;
            const matchesSearch = t.title.toLowerCase().includes(term.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        // Ordenação
        if (sortBy === 'popular') {
            filtered.sort((a, b) => b.votes - a.votes);
        } else {
            filtered.sort((a, b) => b.id - a.id);
        }

        filtered.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'topic-card';
            card.innerHTML = `
                <div class="topic-info">
                    <span class="category-tag">${topic.category}</span>
                    <h3>${topic.title}</h3>
                    <p>Iniciado por <span class="user-mention">${topic.author}</span> • ${topic.date}</p>
                </div>
                <div class="topic-meta">
                    <div class="stat vote-btn" data-id="${topic.id}"><strong>▲ ${topic.votes}</strong><span>votos</span></div>
                    <div class="stat"><strong>${topic.views}</strong><span>vistas</span></div>
                </div>
            `;
            card.querySelector('.topic-info').onclick = () => openTopic(topic.id);
            card.querySelector('.vote-btn').onclick = (e) => {
                e.stopPropagation();
                topic.votes++;
                saveAndRefresh();
            };
            topicsContainer.appendChild(card);
        });
        updateStats();
    }

    function openTopic(id) {
        const topic = topics.find(t => t.id === id);
        topic.views++; // Incrementa visualização real
        activeTopicId = id;
        
        const detail = document.getElementById('topic-detail-content');
        detail.innerHTML = `
            <div class="topic-full-view">
                <span class="category-tag">${topic.category}</span>
                <h1 style="font-size: 2.5rem; margin: 15px 0;">${topic.title}</h1>
                <div class="post-header" style="border-bottom: 1px solid #111; padding-bottom: 20px;">
                    <span class="user-mention">${topic.author}</span> • Postado em ${topic.date} • <strong>${topic.views} visualizações</strong>
                </div>
                <div class="topic-body-content" style="padding: 30px 0; font-size: 1.1rem; line-height: 1.8; color: #ccc;">
                    ${topic.content.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
        
        renderReplies(topic.replies);
        forumMain.style.display = 'none';
        topicView.style.display = 'block';
        forumMain.parentElement.appendChild(topicView); 
        saveAndRefresh();
    }

    document.getElementById('back-to-list')?.addEventListener('click', () => {
        topicView.style.display = 'none';
        forumMain.style.display = 'block';
    });

    function saveAndRefresh() {
        localStorage.setItem('tasma_topics', JSON.stringify(topics));
        renderTopics();
    }

    // Filtros e Categorias
    document.querySelectorAll('#category-filter li').forEach(li => {
        li.onclick = () => {
            document.querySelectorAll('#category-filter li').forEach(l => l.classList.remove('active'));
            li.classList.add('active');
            renderTopics(li.dataset.cat);
        };
    });

    sortSelect?.addEventListener('change', () => renderTopics('Tudo', forumSearch.value, sortSelect.value));
    let activeTopicId = null;

    window.onclick = (event) => { if (event.target.classList.contains('modal')) closeModals(); };
    document.querySelectorAll('.close-modal').forEach(b => b.onclick = closeModals);
    
    if (document.getElementById('open-new-topic')) {
        document.getElementById('open-new-topic').onclick = () => modalNew.style.display = 'block';
    }

    function closeModals() { 
        modalNew.style.display = 'none'; 
    }

    document.getElementById('form-new-topic')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTopic = {
            id: Date.now(),
            title: document.getElementById('topic-title').value,
            category: document.getElementById('topic-category').value,
            content: document.getElementById('topic-content').value,
            author: "@visitante",
            date: "Agora",
            replies: [],
            views: 0
        };
        topics.unshift(newTopic);
        localStorage.setItem('tasma_topics', JSON.stringify(topics));
        renderTopics();
        closeModals();
        e.target.reset();
    });

    function renderReplies(replies) {
        const list = document.getElementById('replies-list');
        list.innerHTML = replies.map(r => `
            <div class="reply-item">
                <p>${r.text}</p>
                <small>${r.author} • ${r.date}</small>
            </div>
        `).join('');
    }

    document.getElementById('form-reply')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('reply-content').value;
        const topic = topics.find(t => t.id === activeTopicId);
        topic.replies.push({ text, author: "@visitante", date: "Agora" });
        localStorage.setItem('tasma_topics', JSON.stringify(topics));
        renderReplies(topic.replies);
        renderTopics();
        e.target.reset();
    });

    // Eventos de Filtro
    if (forumSearch) {
        forumSearch.addEventListener('input', (e) => {
            renderTopics('Tudo', e.target.value);
        });
    }

    renderTopics();
});
