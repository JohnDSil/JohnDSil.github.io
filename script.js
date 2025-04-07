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
        });

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
        const fin = inicio + filasPorPagina;
        const paginados = juegosFiltrados.slice(inicio, fin);

        paginados.forEach(juego => {
            const fila = elementos.tabla.insertRow();
            
            Object.values(juego).forEach(valor => {
                const celda = fila.insertCell();
                celda.textContent = valor;
            });
        });

        actualizarPaginacion();
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

});

function aplicarEfectosEspeciales() {
    const celdas = document.querySelectorAll('td');
    
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

document.addEventListener('DOMContentLoaded', () => {
    // Llamar después de renderizar la tabla
    aplicarEfectosEspeciales();
});
