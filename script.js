document.addEventListener('DOMContentLoaded', () => {
    let juegosOriginales = [];
    let juegosFiltrados = [];
    let paginaActual = 1;
    let filasPorPagina = 10;

    const elementos = {
        tablaContenedor: document.querySelector('.tabla-contenedor'),
        tabla: document.querySelector('#tabla-juegos tbody'),
        buscador: document.getElementById('buscador'),
        filasPagina: document.getElementById('filas-pagina'),
        paginacion: document.getElementById('paginacion'),
        prevBtn: document.getElementById('prev'),
        nextBtn: document.getElementById('next'),
        contador: document.getElementById('contador-pagina'),
        infoJuego: document.getElementById('info-juego'),
        tituloJuego: document.getElementById('titulo-juego'),
        anioJuego: document.getElementById('anio-juego'),
        generoJuego: document.getElementById('genero-juego'),
        idiomaJuego: document.getElementById('idioma-juego'),
        desarrolladorJuego: document.getElementById('desarrollador-juego'),
        imagenJuego: document.getElementById('imagen-juego')
    };

    // Función para verificar que todos los elementos existan
    function verificarElementos() {
        for (const [key, element] of Object.entries(elementos)) {
            if (!element) {
                console.error(`Elemento no encontrado: ${key}`);
                mostrarError(`Error de inicialización: No se encontró el elemento ${key}`);
                return false;
            }
        }
        return true;
    }

    // Verificar que todos los elementos existan antes de continuar
    if (!verificarElementos()) return;

    // Cargar datos iniciales
    fetch('juegos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.juegos || !Array.isArray(data.juegos)) {
                throw new Error('El formato del archivo JSON no es válido');
            }
            juegosOriginales = data.juegos;
            juegosFiltrados = [...juegosOriginales];
            console.log(`Se cargaron ${juegosOriginales.length} juegos correctamente`);
            renderTabla();
            // Seleccionar el primer juego por defecto si hay juegos disponibles
            if (juegosOriginales.length > 0) {
                mostrarInfoJuego(juegosOriginales[0]);
                // Destacar la primera fila
                setTimeout(() => {
                    const primeraFila = document.querySelector('#tabla-juegos tbody tr');
                    if (primeraFila) primeraFila.classList.add('seleccionado');
                }, 100);
            }
        })
        .catch(error => {
            console.error('Error al cargar el JSON:', error);
            mostrarError('No se pudieron cargar los juegos. Intenta recargar la página.');
        });

    // Sistema de búsqueda con debounce para mejor rendimiento
    let timeoutId;
    elementos.buscador.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            paginaActual = 1;
            filtrarJuegos();
            renderTabla();
        }, 300); // Esperar 300ms después de que el usuario deje de escribir
    });

    // Cambiar número de filas
    elementos.filasPagina.addEventListener('change', (e) => {
        filasPorPagina = parseInt(e.target.value);
        paginaActual = 1;
        renderTabla();
        // Seleccionar el primer juego de la nueva página
        seleccionarPrimerJuego();
    });

    // Paginación
    elementos.prevBtn.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderTabla();
            seleccionarPrimerJuego();
        }
    });

    elementos.nextBtn.addEventListener('click', () => {
        if (paginaActual < totalPaginas()) {
            paginaActual++;
            renderTabla();
            seleccionarPrimerJuego();
        }
    });

    // Seleccionar primer juego de la página actual
    function seleccionarPrimerJuego() {
        setTimeout(() => {
            const primeraFila = document.querySelector('#tabla-juegos tbody tr');
            if (primeraFila) {
                primeraFila.click();
            } else {
                // Si no hay filas, ocultar la información del juego
                elementos.infoJuego.style.display = 'none';
            }
        }, 100);
    }

    // Funciones principales
    function filtrarJuegos() {
        const termino = elementos.buscador.value.toLowerCase().trim();
        // Si no hay término de búsqueda, mostrar todos los juegos
        if (!termino) {
            juegosFiltrados = [...juegosOriginales];
            return;
        }

        // Filtrar por campos relevantes para la búsqueda
        juegosFiltrados = juegosOriginales.filter(juego => {
            const camposBuscables = [
                juego.titulo,
                juego.anio.toString(),
                juego.genero,
                juego.idioma,
                juego.desarrollador
            ];
            return camposBuscables.some(campo =>
                campo.toLowerCase().includes(termino)
            );
        });
        console.log(`Filtro aplicado: "${termino}". Resultados: ${juegosFiltrados.length}`);
    }

    function renderTabla() {
        elementos.tabla.innerHTML = '';
        // Verificar si hay juegos para mostrar...
        if (juegosFiltrados.length === 0) {
            const fila = elementos.tabla.insertRow();
            const celda = fila.insertCell();
            celda.colSpan = 5;
            celda.textContent = 'No se encontraron juegos que coincidan con la búsqueda';
            celda.style.padding = '20px';
            celda.style.textAlign = 'center';
            celda.style.color = 'var(--neon-pink)';
            // Ocultar detalles de juego si está visible
            elementos.infoJuego.style.display = 'none';
            actualizarPaginacion();
            return;
        }

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = filasPorPagina === 0 ? juegosFiltrados.length : inicio + filasPorPagina;
        const paginados = juegosFiltrados.slice(inicio, fin);
        paginados.forEach(juego => {
            const fila = elementos.tabla.insertRow();
            const celda = fila.insertCell();
            celda.textContent = juego.titulo;
            celda.classList.add('celda-juego');
            fila.addEventListener('click', () => {
                mostrarInfoJuego(juego);
                // Destacar la fila seleccionada
                document.querySelectorAll('#tabla-juegos tbody tr').forEach(r =>
                    r.classList.remove('seleccionado'));
                fila.classList.add('seleccionado');
            });
        });
        actualizarPaginacion();
    }

    function mostrarInfoJuego(juego) {
        elementos.tituloJuego.textContent = juego.titulo;
        elementos.anioJuego.textContent = `Año: ${juego.anio}`;
        elementos.generoJuego.textContent = `Género: ${juego.genero}`;
        elementos.idiomaJuego.textContent = `Idioma: ${juego.idioma}`;
        elementos.desarrolladorJuego.textContent = `Desarrollador: ${juego.desarrollador}`;
        // Preparar imagen con fallback en caso de error
        elementos.imagenJuego.alt = juego.titulo;
        elementos.imagenJuego.onerror = function() {
            this.onerror = null; // Evitar bucle infinito
            this.src = 'data:image/svg+xml;utf8,Imagen no disponible';
        };
        elementos.imagenJuego.src = juego.imagen;
        // Mostrar la tabla de información con transición suave
        elementos.infoJuego.style.display = 'table';
        elementos.infoJuego.style.width = '100%';
        // Aplicar efecto de fade-in
        elementos.infoJuego.style.opacity = '0';
        setTimeout(() => {
            elementos.infoJuego.style.transition = 'opacity 0.3s ease';
            elementos.infoJuego.style.opacity = '1';
        }, 10);
    }

    function actualizarPaginacion() {
        const totalPag = totalPaginas();
        const totalElementos = juegosFiltrados.length;

        // Actualizar texto de paginación con contador de elementos
        if (filasPorPagina === 0) {
            elementos.contador.textContent = `Mostrando ${totalElementos} juegos`;
        } else {
            const inicio = (paginaActual - 1) * filasPorPagina + 1;
            const fin = Math.min(paginaActual * filasPorPagina, totalElementos);
            elementos.contador.textContent = `${inicio}-${fin} de ${totalElementos} juegos | Página ${paginaActual} de ${totalPag}`;
        }

        // Botones de navegación
        elementos.prevBtn.disabled = paginaActual === 1;
        elementos.nextBtn.disabled = paginaActual === totalPag || totalElementos === 0;

        // Mostrar/Ocultar paginación
        elementos.paginacion.style.display =
            (filasPorPagina === 0 || totalElementos === 0) ? 'none' : 'flex';
    }

    function totalPaginas() {
        return filasPorPagina === 0 ? 1 : Math.ceil(juegosFiltrados.length / filasPorPagina);
    }

    function mostrarError(mensaje) {
        // Eliminar mensajes de error anteriores
        const erroresAnteriores = document.querySelectorAll('.error-mensaje');
        erroresAnteriores.forEach(err => err.remove());

        // Crear nuevo mensaje de error
        const error = document.createElement('div');
        error.classList.add('error-mensaje');
        error.textContent = mensaje;
        document.querySelector('.contenedor-central').prepend(error);

        // Eliminar después de 5 segundos con transición suave
        setTimeout(() => {
            error.style.opacity = '0';
            error.style.transition = 'opacity 1s ease';
            setTimeout(() => error.remove(), 1000);
        }, 5000);
    }

    // Añadir listener para teclas de navegación
    document.addEventListener('keydown', (e) => {
        // Flecha izquierda o arriba para página anterior
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && !elementos.prevBtn.disabled) {
            elementos.prevBtn.click();
        }
        // Flecha derecha o abajo para página siguiente
        else if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && !elementos.nextBtn.disabled) {
            elementos.nextBtn.click();
        }
    });

    // Asegurar que la interfaz se mantiene estable en diferentes tamaños de pantalla
    window.addEventListener('resize', () => {
        // La tabla ahora es responsiva gracias al CSS mejorado
        // No necesitamos ajustes específicos aquí
    });
});

