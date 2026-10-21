const test = require('node:test');
const assert = require('node:assert/strict');

const { crearLibrosRepository } = require('../repositories/librosRepository');

test('insertarTodos guarda el lote completo dentro de una transacción', async () => {
  const consultas = [];
  let liberado = false;
  const cliente = {
    async query(sql, parametros) {
      consultas.push({ sql, parametros });
      return { rows: [] };
    },
    release() {
      liberado = true;
    },
  };
  const pool = {
    async connect() {
      return cliente;
    },
  };
  const repository = crearLibrosRepository(pool);
  const libros = [
    { nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: 189.5 },
    { nombre: 'Aura', autor: 'Carlos Fuentes', precio: null },
  ];

  const total = await repository.insertarTodos(libros);

  assert.equal(total, 2);
  assert.deepEqual(consultas, [
    { sql: 'BEGIN', parametros: undefined },
    {
      sql: 'INSERT INTO libros (nombre, autor, precio) VALUES ($1, $2, $3)',
      parametros: ['Pedro Páramo', 'Juan Rulfo', 189.5],
    },
    {
      sql: 'INSERT INTO libros (nombre, autor, precio) VALUES ($1, $2, $3)',
      parametros: ['Aura', 'Carlos Fuentes', null],
    },
    { sql: 'COMMIT', parametros: undefined },
  ]);
  assert.equal(liberado, true);
});

test('insertarTodos revierte la transacción y libera el cliente si una inserción falla', async () => {
  const consultas = [];
  let liberado = false;
  const cliente = {
    async query(sql) {
      consultas.push(sql);
      if (sql.startsWith('INSERT')) {
        throw new Error('fallo de PostgreSQL');
      }
      return { rows: [] };
    },
    release() {
      liberado = true;
    },
  };
  const repository = crearLibrosRepository({
    async connect() {
      return cliente;
    },
  });

  await assert.rejects(
    () =>
      repository.insertarTodos([
        { nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: 189.5 },
      ]),
    /fallo de PostgreSQL/
  );

  assert.deepEqual(consultas, [
    'BEGIN',
    'INSERT INTO libros (nombre, autor, precio) VALUES ($1, $2, $3)',
    'ROLLBACK',
  ]);
  assert.equal(liberado, true);
});

test('obtenerTodos devuelve los libros ordenados por id', async () => {
  const filas = [
    { id: 1, nombre: 'Pedro Páramo', autor: 'Juan Rulfo', precio: '189.50' },
  ];
  const consultas = [];
  const repository = crearLibrosRepository({
    async query(sql) {
      consultas.push(sql);
      return { rows: filas };
    },
  });

  const libros = await repository.obtenerTodos();

  assert.deepEqual(libros, filas);
  assert.deepEqual(consultas, ['SELECT * FROM libros ORDER BY id ASC']);
});
