document.addEventListener('DOMContentLoaded', () => {
    let juegosOriginales = [];
    let juegosFiltrados = [];
    let paginaActual = 1;
    let filasPorPagina = 10;

    const elementos = {
        tabla: document.querySelector('#tabla-juegos tbody'),
        buscador: document.getElementById('buscador'),
        filasPagina: document.getElementById('filas-pagina'),
        paginacion: document.getElementById('paginacion'),
        prevBtn: document.getElementById('prev'),
        nextBtn: document.getElementById('next'),
        contador: document.getElementById('contador-pagina')
    };

    // Cargar datos iniciales
    fetch('juegos.json')
        .then(response => response.json())
        .then(data => {
            juegosOriginales = data.juegos;
            juegosFiltrados = [...juegosOriginales];
            renderTabla();
        })
        .catch(error => console.error('Error al cargar el JSON:', error));

    // Sistema de búsqueda
    elementos.buscador.addEventListener('input', () => {
        paginaActual = 1;
        filtrarJuegos();
        renderTabla();
    });

    // Cambiar número de filas
    elementos.filasPagina.addEventListener('change', (e) => {
        filasPorPagina = parseInt(e.target.value);
        paginaActual = 1;
        renderTabla();
    });

    // Paginación
    elementos.prevBtn.addEventListener('click', () => {
        if(paginaActual > 1) {
            paginaActual--;
            renderTabla();
        }
    });

    elementos.nextBtn.addEventListener('click', () => {
        if(paginaActual < totalPaginas()) {
            paginaActual++;
            renderTabla();
        }
    });

    // Funciones principales
    function filtrarJuegos() {
        const termino = elementos.buscador.value.toLowerCase();
        juegosFiltrados = juegosOriginales.filter(juego => {
            return Object.values(juego).some(valor => 
                String(valor).toLowerCase().includes(termino)
            );
        });
    }

    function renderTabla() {
        elementos.tabla.innerHTML = '';
        
        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = filasPorPagina === 0 ? juegosFiltrados.length : inicio + filasPorPagina; // Mostrar todos si filasPorPagina es 0
        const paginados = juegosFiltrados.slice(inicio, fin);

        paginados.forEach(juego => {
            const fila = elementos.tabla.insertRow();
            
            const valores = Object.values(juego);
            for (let i = 1; i < valores.length; i++) { // Comenzar desde el segundo valor (omitiendo el ID)
                const celda = fila.insertCell();
                celda.textContent = valores[i];
            }
        });

        actualizarPaginacion();
        aplicarEfectosEspeciales(); // Llamar después de renderizar la tabla
    }

    function actualizarPaginacion() {
        // Contador de página
        const totalPag = totalPaginas();
        elementos.contador.textContent = `Página ${paginaActual} de ${totalPag}`;

        // Botones de navegación
        elementos.prevBtn.disabled = paginaActual === 1;
        elementos.nextBtn.disabled = paginaActual === totalPag;

        // Mostrar/Ocultar paginación
        elementos.paginacion.style.display = filasPorPagina === 0 ? 'none' : 'flex';
    }

    function totalPaginas() {
        return filasPorPagina === 0 ? 1 : Math.ceil(juegosFiltrados.length / filasPorPagina);
    }

    function aplicarEfectosEspeciales() {
        const celdas = document.querySelectorAll('#tabla-juegos tbody td');
    
        celdas.forEach(celda => {
            celda.addEventListener('mouseenter', () => {
                celda.style.transition = 'all 0.3s ease';
                celda.style.transform = 'scale(1.05)';
                celda.style.boxShadow = '0 0 15px var(--neon-pink)';
            });
            
            celda.addEventListener('mouseleave', () => {
                celda.style.transform = 'scale(1)';
                celda.style.boxShadow = 'none';
            });
        });
    }

});
