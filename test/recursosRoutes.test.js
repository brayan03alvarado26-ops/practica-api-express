const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const express = require('express');
const multer = require('multer');

const { crearRecursosRouter } = require('../routes/recursos');

async function iniciarServidor(t, { repository, upload }) {
  const app = express();
  app.use('/api/recursos', crearRecursosRouter({ repository, upload }));

  const servidor = app.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  t.after(() => new Promise((resolve) => servidor.close(resolve)));

  const direccion = servidor.address();
  return `http://127.0.0.1:${direccion.port}`;
}

function crearDirectorioTemporal(t) {
  const directorio = fs.mkdtempSync(path.join(os.tmpdir(), 'practica-uploads-'));
  t.after(() => fs.rmSync(directorio, { recursive: true, force: true }));
  return directorio;
}

test('POST /api/recursos/importar inserta un JSON y elimina el archivo temporal', async (t) => {
  const directorio = crearDirectorioTemporal(t);
  const guardados = [];
  const repository = {
    async insertarTodos(libros) {
      guardados.push(...libros);
      return libros.length;
    },
  };
  const baseUrl = await iniciarServidor(t, {
    repository,
    upload: multer({ dest: directorio }),
  });
  const form = new FormData();
  form.set(
    'archivo',
    new File(
      [
        JSON.stringify([
          { nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: 189.5 },
          { nombre: 'Aura', autor: 'Carlos Fuentes', precio: null },
        ]),
      ],
      'datos.json',
      { type: 'application/json' }
    )
  );

  const respuesta = await fetch(`${baseUrl}/api/recursos/importar`, {
    method: 'POST',
    body: form,
  });

  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), {
    mensaje: 'Importación completada correctamente',
    totalInsertados: 2,
  });
  assert.deepEqual(guardados, [
    { nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: 189.5 },
    { nombre: 'Aura', autor: 'Carlos Fuentes', precio: null },
  ]);
  assert.deepEqual(fs.readdirSync(directorio), []);
});

test('POST /api/recursos/importar inserta un CSV con BOM y campos entre comillas', async (t) => {
  const directorio = crearDirectorioTemporal(t);
  const guardados = [];
  const repository = {
    async insertarTodos(libros) {
      guardados.push(...libros);
      return libros.length;
    },
  };
  const baseUrl = await iniciarServidor(t, {
    repository,
    upload: multer({ dest: directorio }),
  });
  const form = new FormData();
  form.set(
    'archivo',
    new File(
      [
        '\uFEFFnombre,autor,precio\r\n"El amor, la vida","Gabriel García Márquez",275.00\r\n',
      ],
      'datos.csv',
      { type: 'text/csv' }
    )
  );

  const respuesta = await fetch(`${baseUrl}/api/recursos/importar`, {
    method: 'POST',
    body: form,
  });

  assert.equal(respuesta.status, 200);
  assert.equal((await respuesta.json()).totalInsertados, 1);
  assert.deepEqual(guardados, [
    {
      nombre: 'El amor, la vida',
      autor: 'Gabriel García Márquez',
      precio: 275,
    },
  ]);
  assert.deepEqual(fs.readdirSync(directorio), []);
});

test('POST /api/recursos/importar responde 400 cuando falta el archivo', async (t) => {
  const directorio = crearDirectorioTemporal(t);
  const repository = {
    async insertarTodos() {
      throw new Error('No debe intentar insertar sin archivo');
    },
  };
  const baseUrl = await iniciarServidor(t, {
    repository,
    upload: multer({ dest: directorio }),
  });

  const respuesta = await fetch(`${baseUrl}/api/recursos/importar`, {
    method: 'POST',
  });

  assert.equal(respuesta.status, 400);
  assert.deepEqual(await respuesta.json(), {
    mensaje: 'Debes adjuntar un archivo en el campo archivo',
  });
  assert.deepEqual(fs.readdirSync(directorio), []);
});

test('POST /api/recursos/importar rechaza extensiones distintas de JSON y CSV', async (t) => {
  const directorio = crearDirectorioTemporal(t);
  let inserciones = 0;
  const repository = {
    async insertarTodos() {
      inserciones += 1;
      return 0;
    },
  };
  const baseUrl = await iniciarServidor(t, {
    repository,
    upload: multer({ dest: directorio }),
  });
  const form = new FormData();
  form.set(
    'archivo',
    new File(['contenido'], 'datos.txt', { type: 'text/plain' })
  );

  const respuesta = await fetch(`${baseUrl}/api/recursos/importar`, {
    method: 'POST',
    body: form,
  });

  assert.equal(respuesta.status, 400);
  assert.match((await respuesta.json()).mensaje, /json o csv/i);
  assert.equal(inserciones, 0);
  assert.deepEqual(fs.readdirSync(directorio), []);
});

test('POST /api/recursos/importar no inserta un JSON mal formado y limpia el temporal', async (t) => {
  const directorio = crearDirectorioTemporal(t);
  let inserciones = 0;
  const repository = {
    async insertarTodos() {
      inserciones += 1;
      return 0;
    },
  };
  const baseUrl = await iniciarServidor(t, {
    repository,
    upload: multer({ dest: directorio }),
  });
  const form = new FormData();
  form.set(
    'archivo',
    new File(['[{"nombre":'], 'datos.json', { type: 'application/json' })
  );

  const respuesta = await fetch(`${baseUrl}/api/recursos/importar`, {
    method: 'POST',
    body: form,
  });

  assert.equal(respuesta.status, 400);
  assert.match((await respuesta.json()).mensaje, /json/i);
  assert.equal(inserciones, 0);
  assert.deepEqual(fs.readdirSync(directorio), []);
});

test('POST /api/recursos/importar limpia el temporal si PostgreSQL falla', async (t) => {
  t.mock.method(console, 'error', () => {});
  const directorio = crearDirectorioTemporal(t);
  const repository = {
    async insertarTodos() {
      throw new Error('PostgreSQL no disponible');
    },
  };
  const baseUrl = await iniciarServidor(t, {
    repository,
    upload: multer({ dest: directorio }),
  });
  const form = new FormData();
  form.set(
    'archivo',
    new File(
      [JSON.stringify([{ nombre: 'Aura', autor: 'Carlos Fuentes', precio: 175 }])],
      'datos.json',
      { type: 'application/json' }
    )
  );

  const respuesta = await fetch(`${baseUrl}/api/recursos/importar`, {
    method: 'POST',
    body: form,
  });

  assert.equal(respuesta.status, 500);
  assert.deepEqual(await respuesta.json(), { mensaje: 'Internal Server Error' });
  assert.deepEqual(fs.readdirSync(directorio), []);
});

test('GET /api/recursos/exportar/json descarga todos los libros como JSON', async (t) => {
  const filas = [
    { id: 1, nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: '189.50' },
  ];
  const repository = {
    async obtenerTodos() {
      return filas;
    },
  };
  const baseUrl = await iniciarServidor(t, {
    repository,
    upload: multer({ dest: crearDirectorioTemporal(t) }),
  });

  const respuesta = await fetch(`${baseUrl}/api/recursos/exportar/json`);

  assert.equal(respuesta.status, 200);
  assert.match(respuesta.headers.get('content-type'), /^application\/json/);
  assert.equal(
    respuesta.headers.get('content-disposition'),
    'attachment; filename="datos_exportados.json"'
  );
  assert.deepEqual(await respuesta.json(), filas);
});

test('GET /api/recursos/exportar/csv descarga todos los libros como CSV', async (t) => {
  const filas = [
    { id: 1, nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: '189.50' },
  ];
  const repository = {
    async obtenerTodos() {
      return filas;
    },
  };
  const baseUrl = await iniciarServidor(t, {
    repository,
    upload: multer({ dest: crearDirectorioTemporal(t) }),
  });

  const respuesta = await fetch(`${baseUrl}/api/recursos/exportar/csv`);

  assert.equal(respuesta.status, 200);
  assert.match(respuesta.headers.get('content-type'), /^text\/csv/);
  assert.equal(
    respuesta.headers.get('content-disposition'),
    'attachment; filename="datos_exportados.csv"'
  );
  const contenido = Buffer.from(await respuesta.arrayBuffer()).toString('utf8');
  assert.equal(
    contenido,
    '\uFEFF"id","nombre","autor","precio"\n1,"Pedro Páramo","Juan Rulfo","189.50"'
  );
});

test('GET /api/recursos/exportar rechaza formatos distintos de JSON y CSV', async (t) => {
  let consultas = 0;
  const repository = {
    async obtenerTodos() {
      consultas += 1;
      return [];
    },
  };
  const baseUrl = await iniciarServidor(t, {
    repository,
    upload: multer({ dest: crearDirectorioTemporal(t) }),
  });

  const respuesta = await fetch(`${baseUrl}/api/recursos/exportar/xml`);

  assert.equal(respuesta.status, 400);
  assert.deepEqual(await respuesta.json(), {
    mensaje: 'El formato debe ser json o csv',
  });
  assert.equal(consultas, 0);
});
