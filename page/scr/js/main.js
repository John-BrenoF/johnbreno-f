document.addEventListener('DOMContentLoaded', () => {
    const content = document.querySelector('.about-content');
    
    if (content) {
        // Inicia invisível e sobe um pouco
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
        content.style.transition = 'all 1s ease-out';

        // Dispara a animação
        setTimeout(() => {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        }, 300);
    }
});
