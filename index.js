require('dotenv').config();
const express = require('express');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Verificar conexión a PostgreSQL al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar a PostgreSQL:', err.message);
    process.exit(1);
  }
  release();
  console.log('Conectado exitosamente a la base de datos PostgreSQL');
});

// Ruta base
app.get('/', (req, res) => {
  res.send('Servidor en línea');
});

// GET todos los libros
app.get('/api/libros', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM libros ORDER BY id ASC');
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener libros:', error.message);
    res.status(500).json({ mensaje: 'Internal Server Error' });
  }
});

// GET libro por ID
app.get('/api/libros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('SELECT * FROM libros WHERE id = $1', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }
    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener libro:', error.message);
    res.status(500).json({ mensaje: 'Internal Server Error' });
  }
});

// POST crear nuevo libro
app.post('/api/libros', async (req, res) => {
  try {
    const { nombre, autor, precio } = req.body;
    if (!nombre || !autor) {
      return res.status(400).json({ mensaje: 'nombre y autor son obligatorios' });
    }
    const resultado = await pool.query(
      'INSERT INTO libros (nombre, autor, precio) VALUES ($1, $2, $3) RETURNING *',
      [nombre, autor, precio ?? null]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al crear libro:', error.message);
    res.status(500).json({ mensaje: 'Internal Server Error' });
  }
});

// PUT actualizar libro
app.put('/api/libros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, autor, precio } = req.body;

    // Verificar que el libro existe
    const existe = await pool.query('SELECT * FROM libros WHERE id = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }

    const libro = existe.rows[0];
    const resultado = await pool.query(
      'UPDATE libros SET nombre = $1, autor = $2, precio = $3 WHERE id = $4 RETURNING *',
      [
        nombre !== undefined ? nombre : libro.nombre,
        autor !== undefined ? autor : libro.autor,
        precio !== undefined ? precio : libro.precio,
        id,
      ]
    );
    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar libro:', error.message);
    res.status(500).json({ mensaje: 'Internal Server Error' });
  }
});

// DELETE eliminar libro
app.delete('/api/libros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('DELETE FROM libros WHERE id = $1 RETURNING *', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }
    res.status(200).json({ mensaje: 'Libro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar libro:', error.message);
    res.status(500).json({ mensaje: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
