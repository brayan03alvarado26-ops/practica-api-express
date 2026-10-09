-- ============================================================
-- Script DDL/DML - Base de datos: api_practica
-- Ejecutar en pgAdmin, DBeaver o TablePlus
-- ============================================================

-- 1. Crear la base de datos (ejecutar conectado a postgres u otra BD)
CREATE DATABASE api_practica;

-- 2. Conectarse a api_practica y luego ejecutar lo siguiente:

-- Crear tabla libros
CREATE TABLE IF NOT EXISTS libros (
  id     SERIAL        PRIMARY KEY,
  nombre VARCHAR(255)  NOT NULL,
  autor  VARCHAR(255)  NOT NULL,
  precio NUMERIC(10,2) DEFAULT NULL
);

-- 3. Datos de ejemplo (opcional)
INSERT INTO libros (nombre, autor, precio) VALUES
  ('Cien años de soledad',      'Gabriel García Márquez',   350.00),
  ('El principito',             'Antoine de Saint-Exupéry', 180.00),
  ('Don Quijote de la Mancha',  'Miguel de Cervantes',      420.00);
