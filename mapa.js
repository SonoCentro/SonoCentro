document.addEventListener("DOMContentLoaded", () => {

    // --- LÓGICA DE LA PANTALLA DE CARGA ---
    const loaderWrapper = document.getElementById('loader-wrapper');
    const waveformContainer = document.getElementById('waveform-loader');

    if (loaderWrapper && waveformContainer) {
        const waveHeights = [15, 25, 45, 20, 35, 60, 40, 25, 15, 30, 50, 70, 55, 30, 15, 25, 45, 65, 40, 20, 15, 35, 25, 15];
        
        waveHeights.forEach(height => {
            const bar = document.createElement('div');
            bar.className = 'wave-bar';
            bar.style.height = `${height}px`;
            waveformContainer.appendChild(bar);
        });

        const bars = document.querySelectorAll('.wave-bar');
        let progress = 0;
        const totalBars = bars.length;

        const loadingInterval = setInterval(() => {
            progress += Math.random() * 0.15; 
            const barsToLight = Math.floor(progress * totalBars);

            for (let i = 0; i < barsToLight; i++) {
                if (bars[i]) bars[i].classList.add('light-up');
            }

            if (progress >= 0.9) progress = 0.9; 
        }, 150);

        window.addEventListener('load', () => {
            clearInterval(loadingInterval);
            bars.forEach(bar => bar.classList.add('light-up'));
            setTimeout(() => {
                loaderWrapper.classList.add('hidden');
            }, 600);
        });
    }
    
    // --- LÓGICA DE AUDIO DE FONDO ---
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) bgMusic.volume = 0.5;
    
    document.body.addEventListener('click', () => {
        if (bgMusic && bgMusic.paused && !document.getElementById('interview-modal').classList.contains('show')) {
            bgMusic.play().catch(e => console.log("Auto-play prevenido", e));
        }
    }, { once: true });

    // --- LÓGICA DEL MENÚ LATERAL ---
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

    // --- INICIALIZAR EL MAPA DE LEAFLET ---
    const map = L.map('map', { zoomControl: false });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 18
    }).addTo(map);

    // --- PUNTOS Y DESCRIPCIONES ---
    const puntos = [
        { name: "Plaza de Bolívar", lat: 4.598219, lng: -74.076039, img: "PlazaDeBolivar.png", video: "Entrevista1.mp4", 
          desc: "Ubicada en el centro de la ciudad, fue establecida desde la época colonial y ha sido escenario de importantes acontecimientos políticos, sociales y culturales. A su alrededor se encuentran edificaciones representativas como el Capitolio Nacional y la Catedral Primada." },
        
        { name: "Catedral Primada", lat: 4.598058, lng: -74.075389, img: "Catedral.png", video: "Entrevista2.mp4", 
          desc: "La Catedral Basílica Metropolitana de Bogotá es un templo católico de estilo neoclásico. Es la sede del Arzobispo de Bogotá y un hito arquitectónico fundamental en la historia de la ciudad." },
        
        { name: "Chorro de Quevedo", lat: 4.597167, lng: -74.069603, img: "Chorro.png", video: "Entrevista3.mp4", 
          desc: "Considerado por muchos como el lugar donde se fundó Bogotá en 1538. Hoy en día es un espacio bohemio, lleno de cuenteros, arte urbano, cafés y la tradicional chicha." },
        
        { name: "Plaza La Concordia", lat: 4.598356, lng: -74.068639, img: "Concordia.png", video: "Entrevista4.mp4", 
          desc: "Una plaza de mercado histórica y recientemente renovada. Es un centro cultural y gastronómico donde convergen los sabores tradicionales de Colombia." },
        
        { name: "Septimazo", lat: 4.599219, lng: -74.074244, img: "Septimazo.png", video: "Entrevista5.mp4", 
          desc: "Recorrer la Carrera Séptima es vivir el corazón palpitante de Bogotá. Músicos, artistas callejeros y transeúntes hacen de este corredor un espectáculo constante." },
        
        { name: "Teatro Colón", lat: 4.596664, lng: -74.074419, img: "TeatroColon.png", video: "Entrevista6.mp4", 
          desc: "El teatro nacional de Colombia, una joya arquitectónica de estilo neoclásico inaugurada en 1892. Es el epicentro de las artes escénicas en el país." }
    ];

    // Centrar y acercar el mapa automáticamente (con padding reducido)
    const bounds = L.latLngBounds(puntos.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [10, 10], maxZoom: 18 });

    // Referencias al Modal
    const modal = document.getElementById('interview-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const interviewVideo = document.getElementById('interview-video');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const btnIrRecorrido = document.getElementById('btn-ir-recorrido');
    
    let lugarActualSeleccionado = ""; 

    // Cargar marcadores
    puntos.forEach((punto, index) => {
        const customIcon = L.divIcon({
            className: 'custom-icon-wrapper',
            html: `
                <div class="custom-marker" id="marker-${index}">
                    <img src="${punto.img}" alt="${punto.name}" class="marker-img">
                    <div class="marker-label">${punto.name}</div>
                </div>
            `,
            iconSize: [120, 120], 
            iconAnchor: [60, 60]
        });

        const marker = L.marker([punto.lat, punto.lng], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
            // Guardar el lugar actual para el botón
            lugarActualSeleccionado = punto.name;

            // Llenar los datos en el modal
            if (modalTitle && modalDesc) {
                modalTitle.textContent = punto.name;
                modalDesc.textContent = punto.desc;
            }

            // Pausar la música de fondo
            if (bgMusic) bgMusic.pause();

            // Asignar video y reproducirlo
            if (interviewVideo && modal) {
                interviewVideo.src = punto.video;
                interviewVideo.load();
                
                modal.classList.add('show');
                interviewVideo.play().catch(e => console.log("Error al reproducir entrevista", e));
            }
        });
    });

    // Lógica para cerrar el Modal
    if (closeModalBtn && modal && interviewVideo) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            interviewVideo.pause(); 
            interviewVideo.currentTime = 0; 
            if (bgMusic) bgMusic.play(); 
        });
    }

    // Lógica del botón "Ir al recorrido"
    if (btnIrRecorrido) {
        btnIrRecorrido.addEventListener('click', () => {
            if (lugarActualSeleccionado === "Plaza de Bolívar") {
                window.location.href = "recorrido_plaza.html";
            } else {
                alert(`¡Preparando el recorrido para: ${lugarActualSeleccionado}!\n(Próximamente)`);
            }
        });
    }
});