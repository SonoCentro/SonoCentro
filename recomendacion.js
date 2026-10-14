document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LÓGICA DE LA PANTALLA DE CARGA ---
    const loaderWrapper = document.getElementById('loader-wrapper');
    const waveformContainer = document.getElementById('waveform-loader');

    if (loaderWrapper && waveformContainer) {
        // Alturas de las barras de sonido (en píxeles) para hacer la onda
        const waveHeights = [15, 25, 45, 20, 35, 60, 40, 25, 15, 30, 50, 70, 55, 30, 15, 25, 45, 65, 40, 20, 15, 35, 25, 15];
        
        // Crear las barras dinámicamente
        waveHeights.forEach(height => {
            const bar = document.createElement('div');
            bar.className = 'wave-bar';
            bar.style.height = `${height}px`;
            waveformContainer.appendChild(bar);
        });

        const bars = document.querySelectorAll('.wave-bar');
        let progress = 0;
        const totalBars = bars.length;

        // Animación de carga simulada (de izquierda a derecha)
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 0.15; 
            const barsToLight = Math.floor(progress * totalBars);

            for (let i = 0; i < barsToLight; i++) {
                if (bars[i]) bars[i].classList.add('light-up');
            }

            if (progress >= 0.9) {
                progress = 0.9; 
            }
        }, 150);

        // Cuando la página y los videos cargan por completo
        window.addEventListener('load', () => {
            clearInterval(loadingInterval);
            
            // Iluminar todas las barras al finalizar
            bars.forEach(bar => bar.classList.add('light-up'));

            // Esperar un instante y ocultar el loader
            setTimeout(() => {
                loaderWrapper.classList.add('hidden');
            }, 600);
        });
    }

    // --- 2. LÓGICA DEL MENÚ LATERAL ---
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.getElementById('sidebar');

    menuIcon.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !menuIcon.contains(event.target) && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // --- 3. TRANSICIÓN SUAVE DE VIDEOS ---
    const videos = document.querySelectorAll('.bg-video');
    let currentVideo = 0;
    
    if (videos.length > 0) {
        setInterval(() => {
            videos[currentVideo].classList.remove('active');
            currentVideo = (currentVideo + 1) % videos.length;
            videos[currentVideo].classList.add('active');
        }, 6000); 
    }

    // --- 4. LÓGICA DE LA MÚSICA ---
    const bgMusic = document.getElementById('bg-music');
    
    document.body.addEventListener('click', () => {
        if (bgMusic && bgMusic.paused) {
            bgMusic.volume = 0.5;
            bgMusic.play().catch(e => console.log("Auto-play prevenido", e));
        }
    }, { once: true });

    // --- 5. ACCIÓN DEL BOTÓN CONTINUAR ---
    const btnContinuar = document.getElementById('btn-continuar');
    if (btnContinuar) {
        btnContinuar.addEventListener('click', () => {
            window.location.href = "mapa.html";
        });
    }
});