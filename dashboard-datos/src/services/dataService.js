import dataset from '../data/dataset.json'
import { get } from './apiClient.js'

export async function obtenerDatosVisualizacion() {
  return new Promise((resolve) => setTimeout(() => resolve(dataset), 300))
}

export async function obtenerPrediccion({ simularError = false } = {}) {
  if (simularError) throw new Error('No fue posible conectar con la API de ciencia de datos.')
  const respuesta = await get('/dataset.json')
  return procesarDatos(respuesta)
}

export function procesarDatos(datos) {
  return datos.map(({ categoria, valor, periodo }) => ({ etiqueta: categoria, valor: Number(valor), periodo }))
}
