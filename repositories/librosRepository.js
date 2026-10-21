function crearLibrosRepository(pool) {
  return {
    async insertarTodos(libros) {
      const cliente = await pool.connect();
      try {
        await cliente.query('BEGIN');
        for (const libro of libros) {
          await cliente.query(
            'INSERT INTO libros (nombre, autor, precio) VALUES ($1, $2, $3)',
            [libro.nombre, libro.autor, libro.precio]
          );
        }
        await cliente.query('COMMIT');
        return libros.length;
      } catch (error) {
        await cliente.query('ROLLBACK');
        throw error;
      } finally {
        cliente.release();
      }
    },
    async obtenerTodos() {
      const resultado = await pool.query('SELECT * FROM libros ORDER BY id ASC');
      return resultado.rows;
    },
  };
}

module.exports = {
  crearLibrosRepository,
};
