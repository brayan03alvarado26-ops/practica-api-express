const fs = require('node:fs');
const path = require('node:path');
const csvParser = require('csv-parser');
const { parse: convertirAFormatoCsv } = require('json2csv');

function crearErrorDatos(mensaje) {
  const error = new Error(mensaje);
  error.code = 'DATOS_INVALIDOS';
  return error;
}

function normalizarLibro(registro, numeroRegistro) {
  if (!registro || typeof registro !== 'object' || Array.isArray(registro)) {
    throw crearErrorDatos(`El registro ${numeroRegistro} debe ser un objeto`);
  }

  const nombre = String(registro.nombre ?? '').trim();
  if (!nombre) {
    throw crearErrorDatos(`El registro ${numeroRegistro} requiere nombre`);
  }

  const autor = String(registro.autor ?? '').trim();
  if (!autor) {
    throw crearErrorDatos(`El registro ${numeroRegistro} requiere autor`);
  }

  const precioOriginal = registro.precio;
  const precio =
    precioOriginal === null ||
    precioOriginal === undefined ||
    String(precioOriginal).trim() === ''
      ? null
      : Number(precioOriginal);
  if (precio !== null && (!Number.isFinite(precio) || precio < 0)) {
    throw crearErrorDatos(`El registro ${numeroRegistro} tiene un precio inválido`);
  }

  return {
    nombre,
    autor,
    precio,
  };
}

function leerLibrosDesdeCsv(rutaArchivo) {
  return new Promise((resolve, reject) => {
    const registros = [];
    const entrada = fs.createReadStream(rutaArchivo);
    const parser = csvParser({
      strict: true,
      mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim(),
    });

    entrada.on('error', reject);
    parser
      .on('data', (registro) => registros.push(registro))
      .on('error', () => reject(crearErrorDatos('El archivo CSV no contiene datos válidos')))
      .on('end', () => {
        try {
          if (registros.length === 0) {
            throw crearErrorDatos('El archivo CSV está vacío');
          }
          resolve(
            registros.map((registro, indice) => normalizarLibro(registro, indice + 1))
          );
        } catch (error) {
          reject(error);
        }
      });

    entrada.pipe(parser);
  });
}

async function leerLibrosDesdeArchivo(archivo) {
  const extension = path.extname(archivo.originalname).toLowerCase();
  if (extension === '.csv') {
    return leerLibrosDesdeCsv(archivo.path);
  }
  if (extension !== '.json') {
    throw crearErrorDatos('Formato de archivo no permitido; utiliza JSON o CSV');
  }

  const contenido = await fs.promises.readFile(archivo.path, 'utf8');
  let registros;
  try {
    registros = JSON.parse(contenido);
  } catch {
    throw crearErrorDatos('El archivo JSON no contiene datos válidos');
  }
  if (!Array.isArray(registros)) {
    throw crearErrorDatos('El contenido JSON debe ser un arreglo de registros');
  }
  if (registros.length === 0) {
    throw crearErrorDatos('El archivo no puede contener un arreglo vacío');
  }
  return registros.map((registro, indice) => normalizarLibro(registro, indice + 1));
}

function convertirLibrosACsv(libros) {
  return convertirAFormatoCsv(libros, {
    fields: ['id', 'nombre', 'autor', 'precio'],
    eol: '\n',
    withBOM: true,
  });
}

module.exports = {
  convertirLibrosACsv,
  leerLibrosDesdeArchivo,
  normalizarLibro,
};
