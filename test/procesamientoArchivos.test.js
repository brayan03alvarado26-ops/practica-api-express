const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  convertirLibrosACsv,
  leerLibrosDesdeArchivo,
  normalizarLibro,
} = require('../services/procesamientoArchivos');

function crearArchivoTemporal(t, nombre, contenido) {
  const directorio = fs.mkdtempSync(path.join(os.tmpdir(), 'practica-api-'));
  const ruta = path.join(directorio, nombre);
  fs.writeFileSync(ruta, contenido, 'utf8');
  t.after(() => fs.rmSync(directorio, { recursive: true, force: true }));
  return ruta;
}

test('normalizarLibro recorta texto y convierte un precio de CSV a número', () => {
  const libro = normalizarLibro(
    { nombre: '  Pedro Páramo  ', autor: '  Juan Rulfo ', precio: '189.50' },
    1
  );

  assert.deepEqual(libro, {
    nombre: 'Pedro Páramo',
    autor: 'Juan Rulfo',
    precio: 189.5,
  });
});

test('normalizarLibro rechaza registros sin nombre', () => {
  assert.throws(
    () => normalizarLibro({ nombre: '   ', autor: 'Juan Rulfo', precio: 189.5 }, 3),
    /registro 3.*nombre/i
  );
});

test('normalizarLibro rechaza registros sin autor', () => {
  assert.throws(
    () => normalizarLibro({ nombre: 'Pedro Páramo', autor: '', precio: 189.5 }, 4),
    /registro 4.*autor/i
  );
});

test('normalizarLibro conserva un precio vacío como null', () => {
  const libro = normalizarLibro(
    { nombre: 'El llano en llamas', autor: 'Juan Rulfo', precio: '   ' },
    5
  );

  assert.equal(libro.precio, null);
});

test('normalizarLibro rechaza precios no numéricos', () => {
  assert.throws(
    () =>
      normalizarLibro(
        { nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: 'gratis' },
        6
      ),
    /registro 6.*precio/i
  );
});

test('normalizarLibro rechaza precios negativos', () => {
  assert.throws(
    () =>
      normalizarLibro(
        { nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: '-1' },
        7
      ),
    /registro 7.*precio/i
  );
});

test('normalizarLibro rechaza valores que no son objetos', () => {
  assert.throws(
    () => normalizarLibro(null, 8),
    (error) => error.code === 'DATOS_INVALIDOS' && /registro 8/i.test(error.message)
  );
});

test('leerLibrosDesdeArchivo procesa un arreglo JSON', async (t) => {
  const ruta = crearArchivoTemporal(
    t,
    'datos.json',
    JSON.stringify([
      { nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: 189.5 },
      { nombre: 'Aura', autor: 'Carlos Fuentes', precio: null },
    ])
  );

  const libros = await leerLibrosDesdeArchivo({ path: ruta, originalname: 'datos.json' });

  assert.deepEqual(libros, [
    { nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: 189.5 },
    { nombre: 'Aura', autor: 'Carlos Fuentes', precio: null },
  ]);
});

test('leerLibrosDesdeArchivo rechaza un JSON cuya raíz no es un arreglo', async (t) => {
  const ruta = crearArchivoTemporal(
    t,
    'datos.json',
    JSON.stringify({ nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: 189.5 })
  );

  await assert.rejects(
    () => leerLibrosDesdeArchivo({ path: ruta, originalname: 'datos.json' }),
    (error) => {
      assert.equal(error.code, 'DATOS_INVALIDOS');
      assert.match(error.message, /arreglo/i);
      return true;
    }
  );
});

test('leerLibrosDesdeArchivo rechaza un arreglo JSON vacío', async (t) => {
  const ruta = crearArchivoTemporal(t, 'datos.json', '[]');

  await assert.rejects(
    () => leerLibrosDesdeArchivo({ path: ruta, originalname: 'datos.json' }),
    (error) => error.code === 'DATOS_INVALIDOS' && /vacío/i.test(error.message)
  );
});

test('leerLibrosDesdeArchivo identifica un JSON mal formado como dato inválido', async (t) => {
  const ruta = crearArchivoTemporal(t, 'datos.json', '[{"nombre":');

  await assert.rejects(
    () => leerLibrosDesdeArchivo({ path: ruta, originalname: 'datos.json' }),
    (error) => error.code === 'DATOS_INVALIDOS' && /json/i.test(error.message)
  );
});

test('leerLibrosDesdeArchivo marca como inválido un registro JSON incompleto', async (t) => {
  const ruta = crearArchivoTemporal(
    t,
    'datos.json',
    JSON.stringify([{ nombre: '', autor: 'Juan Rulfo', precio: 189.5 }])
  );

  await assert.rejects(
    () => leerLibrosDesdeArchivo({ path: ruta, originalname: 'datos.json' }),
    (error) => error.code === 'DATOS_INVALIDOS' && /nombre/i.test(error.message)
  );
});

test('leerLibrosDesdeArchivo procesa las filas de un CSV', async (t) => {
  const ruta = crearArchivoTemporal(
    t,
    'datos.csv',
    'nombre,autor,precio\nPedro Páramo,Juan Rulfo,189.50\nAura,Carlos Fuentes,'
  );

  const libros = await leerLibrosDesdeArchivo({ path: ruta, originalname: 'datos.csv' });

  assert.deepEqual(libros, [
    { nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: 189.5 },
    { nombre: 'Aura', autor: 'Carlos Fuentes', precio: null },
  ]);
});

test('convertirLibrosACsv genera encabezados y conserva acentos', () => {
  const csv = convertirLibrosACsv([
    { id: 1, nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: '189.50' },
  ]);

  assert.equal(
    csv,
    '\uFEFF"id","nombre","autor","precio"\n1,"Pedro Páramo","Juan Rulfo","189.50"'
  );
});
