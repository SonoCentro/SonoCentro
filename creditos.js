document.addEventListener("DOMContentLoaded", () => {
    
    // --- Lógica del Menú Lateral ---
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.getElementById('sidebar');

    if (menuIcon && sidebar) {
        menuIcon.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', (event) => {
            if (!sidebar.contains(event.target) && !menuIcon.contains(event.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    // --- Lógica de la Música de Fondo ---
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) bgMusic.volume = 0.5;
    
    document.body.addEventListener('click', () => {
        if (bgMusic && bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Auto-play prevenido", e));
        }
    }, { once: true });
});