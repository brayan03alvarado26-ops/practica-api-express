// URL del endpoint GET de la API local
const API_URL = 'http://localhost:3000/api/libros';

// Parte III: consumir la API con fetch()
async function obtenerLibros() {
  const respuesta = await fetch(API_URL);
  if (!respuesta.ok) {
    throw new Error(`La API respondió con estado ${respuesta.status}`);
  }
  return respuesta.json();
}

// Genera las filas de la tabla e inyecta el resultado en el DOM
function renderizarTabla(libros) {
  const contenedor = document.getElementById('tabla-datos');

  if (libros.length === 0) {
    contenedor.innerHTML = '<p class="estado">No hay registros en la base de datos.</p>';
    return;
  }

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <thead>
      <tr><th>ID</th><th>Nombre</th><th>Autor</th><th>Precio</th></tr>
    </thead>
    <tbody></tbody>
  `;

  const cuerpo = tabla.querySelector('tbody');
  libros.forEach((libro) => {
    const fila = document.createElement('tr');
    // textContent evita inyectar HTML proveniente de los datos (XSS)
    [libro.id, libro.nombre, libro.autor].forEach((valor) => {
      const celda = document.createElement('td');
      celda.textContent = valor;
      fila.appendChild(celda);
    });
    const celdaPrecio = document.createElement('td');
    celdaPrecio.className = 'num';
    celdaPrecio.textContent = libro.precio !== null ? `$${Number(libro.precio).toFixed(2)}` : '—';
    fila.appendChild(celdaPrecio);
    cuerpo.appendChild(fila);
  });

  contenedor.innerHTML = '';
  contenedor.appendChild(tabla);
}

// Parte IV: dibujar la gráfica con Chart.js
function renderizarGrafica(libros) {
  // Arreglos separados: etiquetas (nombres) y valores (precios)
  const nombres = libros.map((libro) => libro.nombre);
  // PostgreSQL devuelve NUMERIC como texto, por eso se convierte a número
  const precios = libros.map((libro) => Number(libro.precio) || 0);

  const ctx = document.getElementById('miGrafica');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: nombres,
      datasets: [{
        label: 'Precio (MXN)',
        data: precios,
        backgroundColor: 'rgba(30, 58, 138, 0.7)',
        borderColor: 'rgba(30, 58, 138, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (valor) => `$${valor}` },
        },
      },
    },
  });
}

async function iniciar() {
  try {
    const libros = await obtenerLibros();
    renderizarTabla(libros);
    renderizarGrafica(libros);
  } catch (error) {
    console.error(error);
    document.getElementById('tabla-datos').innerHTML =
      '<p class="error">No se pudieron cargar los datos. Verifica que la API esté corriendo en http://localhost:3000.</p>';
  }
}

iniciar();
