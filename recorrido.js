// =========================================================
// 1. REPRODUCTOR AMBISÓNICO CON OMNITONE BLINDADO
// =========================================================
AFRAME.registerComponent('reproductor-youtube-360', {
    init: function () {
        this.video = document.getElementById('video360');
        this.audio = document.getElementById('audio-ambisonico');
        this.camera = document.getElementById('camara-usuario');
        
        this.barraControles = document.getElementById('barra-controles');
        this.btnPlayPause = document.getElementById('btn-play-pause');
        this.lineaTiempo = document.getElementById('linea-tiempo');
        
        this.isDragging = false; 
        this.omnitoneIniciado = false;

        document.getElementById('btn-start-vr').addEventListener('click', () => {
            document.getElementById('start-overlay').classList.add('hidden');
            this.barraControles.classList.remove('hidden');
            
            // Configurar el contexto de audio
            if (!this.audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioCtx = new AudioContext();
            }

            this.audioCtx.resume().then(() => {
                if (!this.omnitoneIniciado) {
                    this.iniciarOmnitone();
                }
            });

            // Silenciamos el video original visual
            this.video.muted = true;
            
            // PROTECCIÓN: Manejo de errores si el archivo no existe aún
            this.video.play().catch(e => console.warn("Video cargando...", e));
            
            if (this.audio) {
                this.audio.play().catch(e => console.warn("Audio ambisónico ausente o cargando...", e));
            }
            
            this.btnPlayPause.innerText = "⏸"; 
        });

        // Controles de Play/Pausa
        this.btnPlayPause.addEventListener('click', () => {
            if (this.video.paused) {
                this.video.play();
                if (this.audio) this.audio.play().catch(e => {});
                this.btnPlayPause.innerText = "⏸";
            } else {
                this.video.pause();
                if (this.audio) this.audio.pause();
                this.btnPlayPause.innerText = "▶";
            }
        });

        // Línea de tiempo
        this.lineaTiempo.addEventListener('mousedown', () => {
            this.isDragging = true;
            this.video.pause();
            if (this.audio) this.audio.pause();
        });

        this.lineaTiempo.addEventListener('mouseup', () => {
            this.isDragging = false;
            if (this.btnPlayPause.innerText === "⏸") {
                this.video.play();
                if (this.audio) this.audio.play().catch(e => {});
            }
        });

        this.lineaTiempo.addEventListener('input', (e) => {
            const nuevoTiempo = (e.target.value / 100) * this.video.duration;
            this.video.currentTime = nuevoTiempo;
            
            // Solo intentamos adelantar el audio si ya cargó exitosamente
            if (this.audio && this.audio.readyState >= 1) {
                this.audio.currentTime = nuevoTiempo; 
            }
            
            if (window.actualizarMinimapa) {
                window.actualizarMinimapa(nuevoTiempo, this.video.duration);
            }
        });
    },

    iniciarOmnitone: function() {
        try {
            this.omnitoneRenderer = Omnitone.createFOARenderer(this.audioCtx, {});

            this.omnitoneRenderer.initialize().then(() => {
                const source = this.audioCtx.createMediaElementSource(this.audio);
                source.connect(this.omnitoneRenderer.input);
                this.omnitoneRenderer.output.connect(this.audioCtx.destination);
                
                this.omnitoneIniciado = true;
                console.log("Omnitone Ambisonics activado exitosamente.");
            }).catch(e => console.warn("Error iniciando decodificador:", e));
        } catch (e) {
            console.warn("Librería Omnitone no cargada aún.", e);
        }
    },

    tick: function () {
        // ENVOLVEMOS TODO EN UN TRY-CATCH
        // Esto es el escudo: si falta un archivo, A-Frame ignora el error en lugar de bloquear la cámara
        try {
            if (this.video.readyState >= 1) {
                
                // Sincronización segura: Solo actúa si el .wav ya cargó
                if (this.audio && this.audio.readyState >= 1 && !this.isDragging) {
                    if (Math.abs(this.audio.currentTime - this.video.currentTime) > 0.1) {
                        this.audio.currentTime = this.video.currentTime;
                    }
                }

                // Actualizar barra de tiempo visual
                if (!this.isDragging) {
                    this.lineaTiempo.value = (this.video.currentTime / this.video.duration) * 100;
                    if (window.actualizarMinimapa) {
                        window.actualizarMinimapa(this.video.currentTime, this.video.duration);
                    }
                }
            }

            // ROTACIÓN AMBISÓNICA
            if (this.omnitoneIniciado && this.omnitoneRenderer && this.camera) {
                const matrix = new THREE.Matrix4();
                matrix.extractRotation(this.camera.object3D.matrixWorld);
                this.omnitoneRenderer.setRotationMatrix(matrix.elements);
            }
            
        } catch (error) {
            // Error atrapado de forma silenciosa para que puedas seguir girando la vista
        }
    }
});

// =========================================================
// 2. LÓGICA DEL MAPA (LEAFLET)
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btn-volver').addEventListener('click', () => {
        window.location.href = "mapa.html"; 
    });

    const startLatLng = [4.598219, -74.076039]; 
    const endLatLng = [4.598600, -74.076000];   

    const map = L.map('minimap', {
        zoomControl: false, dragging: false, scrollWheelZoom: false
    }).setView(startLatLng, 18);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
    }).addTo(map);

    const userMarker = L.circleMarker(startLatLng, {
        color: '#c19b38', fillColor: '#c19b38', fillOpacity: 1, radius: 6
    }).addTo(map);

    window.actualizarMinimapa = function(currentTime, duration) {
        if (isNaN(duration) || duration === 0) return;
        const porcentaje = currentTime / duration;
        const currentLat = startLatLng[0] + (endLatLng[0] - startLatLng[0]) * porcentaje;
        const currentLng = startLatLng[1] + (endLatLng[1] - startLatLng[1]) * porcentaje;
        userMarker.setLatLng([currentLat, currentLng]);
    };
});