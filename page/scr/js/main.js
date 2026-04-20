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

    // Definição dos ícones SVG
    const iconLike = `<svg class="vote-icon" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.75 0 1.41-.41 1.75-1.03l3.51-8.12c.09-.23.14-.48.14-.73v-1.91l-.01-.01c0-.11.01-.22.01-.33z"/></svg>`;
    const iconDislike = `<svg class="vote-icon" viewBox="0 0 24 24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01c0 .11-.01.22-.01.33 0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>`;
    
    let topics = JSON.parse(localStorage.getItem('tasma_topics')) || [
        { id: 1, title: "Dúvidas sobre a instalação do TasmaOS", author: "@dev_freedom", category: "Kernel Freedom", content: "Como compilar o kernel com suporte a drivers legados?", replies: [], views: 1200, likes: 45, dislikes: 2, media: "", date: "Há 2 horas" },
        { id: 2, title: "Sugestões de plugins para o Tasma Code", author: "@code_master", category: "Desenvolvimento", content: "Precisamos de um plugin de LSP para Rust.", replies: [], views: 3500, likes: 89, dislikes: 5, media: "", date: "Há 5 horas" }
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
            filtered.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
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
                    <div class="vote-group">
                        <div class="vote-btn like" onclick="handleVote(event, ${topic.id}, 'like')">${iconLike} ${topic.likes}</div>
                        <div class="vote-btn dislike" onclick="handleVote(event, ${topic.id}, 'dislike')">${iconDislike} ${topic.dislikes}</div>
                    </div>
                    <div class="stat"><strong>${topic.views}</strong><span>vistas</span></div>
                </div>
            `;
            card.querySelector('.topic-info').onclick = () => openTopic(topic.id);
            topicsContainer.appendChild(card);
        });
        updateStats();
    }

    window.handleVote = (e, id, type) => {
        e.stopPropagation();
        const topic = topics.find(t => t.id === id);
        if (type === 'like') topic.likes++;
        else topic.dislikes++;
        saveAndRefresh();
    };

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
                ${topic.media ? `<img src="${topic.media}" class="topic-media-content">` : ''}
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

    // --- Mecânicas de Mídia e Preview ---
    const urlMediaInput = document.getElementById('topic-media');
    const fileMediaInput = document.getElementById('topic-file-input');
    const previewImg = document.getElementById('preview-img');
    const previewContainer = document.getElementById('media-preview-container');
    let currentMediaData = "";

    function showPreview(src) {
        previewImg.src = src;
        previewContainer.style.display = 'block';
        currentMediaData = src;
    }

    urlMediaInput?.addEventListener('input', (e) => {
        if (e.target.value) showPreview(e.target.value);
        else previewContainer.style.display = 'none';
    });

    fileMediaInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (f) => showPreview(f.target.result);
            reader.readAsDataURL(file);
        }
    });

    function closeModals() { 
        modalNew.style.display = 'none'; 
        previewContainer.style.display = 'none';
        currentMediaData = "";
        document.getElementById('form-new-topic')?.reset();
    }

    document.getElementById('form-new-topic')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTopic = {
            id: Date.now(),
            title: document.getElementById('topic-title').value,
            category: document.getElementById('topic-category').value,
            content: document.getElementById('topic-content').value,
            media: currentMediaData,
            author: "@visitante",
            date: "Agora",
            replies: [],
            views: 0,
            likes: 0,
            dislikes: 0
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
