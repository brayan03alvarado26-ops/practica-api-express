const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let libros = [
  { id: 1, nombre: 'Cien años de soledad', autor: 'Gabriel García Márquez' },
  { id: 2, nombre: 'El principito', autor: 'Antoine de Saint-Exupéry' },
  { id: 3, nombre: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes' }
];

// Ruta base
app.get('/', (req, res) => {
  res.send('Servidor en línea');
});

// GET todos
app.get('/api/libros', (req, res) => {
  res.status(200).json(libros);
});

// GET por id
app.get('/api/libros/:id', (req, res) => {
  const libro = libros.find(l => l.id === parseInt(req.params.id));
  if (!libro) return res.status(404).json({ mensaje: 'Libro no encontrado' });
  res.status(200).json(libro);
});

// POST
app.post('/api/libros', (req, res) => {
  const { nombre, autor } = req.body;
  if (!nombre || !autor) {
    return res.status(400).json({ mensaje: 'nombre y autor son obligatorios' });
  }
  const nuevoId = libros.length > 0 ? Math.max(...libros.map(l => l.id)) + 1 : 1;
  const nuevo = { id: nuevoId, nombre, autor };
  libros.push(nuevo);
  res.status(201).json(nuevo);
});

// PUT
app.put('/api/libros/:id', (req, res) => {
  const libro = libros.find(l => l.id === parseInt(req.params.id));
  if (!libro) return res.status(404).json({ mensaje: 'Libro no encontrado' });
  const { nombre, autor } = req.body;
  if (nombre !== undefined) libro.nombre = nombre;
  if (autor !== undefined) libro.autor = autor;
  res.status(200).json(libro);
});

// DELETE
app.delete('/api/libros/:id', (req, res) => {
  const index = libros.findIndex(l => l.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ mensaje: 'Libro no encontrado' });
  libros.splice(index, 1);
  res.status(200).json({ mensaje: 'Libro eliminado correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});