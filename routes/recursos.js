const express = require('express');
const fs = require('node:fs');
const {
  convertirLibrosACsv,
  leerLibrosDesdeArchivo,
} = require('../services/procesamientoArchivos');

function crearRecursosRouter({ repository, upload }) {
  const router = express.Router();

  router.post('/importar', upload.single('archivo'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        mensaje: 'Debes adjuntar un archivo en el campo archivo',
      });
    }

    try {
      const libros = await leerLibrosDesdeArchivo(req.file);
      const totalInsertados = await repository.insertarTodos(libros);
      res.status(200).json({
        mensaje: 'Importación completada correctamente',
        totalInsertados,
      });
    } catch (error) {
      if (error.code === 'DATOS_INVALIDOS') {
        return res.status(400).json({ mensaje: error.message });
      }
      console.error('Error al importar libros:', error.message);
      return res.status(500).json({ mensaje: 'Internal Server Error' });
    } finally {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });

  router.get('/exportar/:formato', async (req, res) => {
    const formato = req.params.formato.toLowerCase();
    if (!['json', 'csv'].includes(formato)) {
      return res.status(400).json({ mensaje: 'El formato debe ser json o csv' });
    }

    try {
      const libros = await repository.obtenerTodos();
      if (formato === 'json') {
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="datos_exportados.json"'
        );
        return res.status(200).json(libros);
      }

      const csv = convertirLibrosACsv(libros);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="datos_exportados.csv"'
      );
      return res.status(200).send(csv);
    } catch (error) {
      console.error('Error al exportar libros:', error.message);
      return res.status(500).json({ mensaje: 'Internal Server Error' });
    }
  });

  return router;
}

module.exports = {
  crearRecursosRouter,
};
