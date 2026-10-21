const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { leerLibrosDesdeArchivo } = require('../services/procesamientoArchivos');

test('datos.json contiene diez libros válidos para la práctica', async () => {
  const ruta = path.join(__dirname, '..', 'datos.json');

  const libros = await leerLibrosDesdeArchivo({ path: ruta, originalname: 'datos.json' });

  assert.equal(libros.length, 10);
});

test('datos.csv contiene los mismos diez libros válidos', async () => {
  const rutaJson = path.join(__dirname, '..', 'datos.json');
  const rutaCsv = path.join(__dirname, '..', 'datos.csv');

  const [librosJson, librosCsv] = await Promise.all([
    leerLibrosDesdeArchivo({ path: rutaJson, originalname: 'datos.json' }),
    leerLibrosDesdeArchivo({ path: rutaCsv, originalname: 'datos.csv' }),
  ]);

  assert.equal(librosCsv.length, 10);
  assert.deepEqual(librosCsv, librosJson);
});
