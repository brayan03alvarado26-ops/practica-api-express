import dataset from '../data/dataset.json'

export async function obtenerDatosVisualizacion() {
  return new Promise((resolve) => setTimeout(() => resolve(dataset), 300))
}

export function procesarDatos(datos) {
  return datos.map(({ categoria, valor, periodo }) => ({ etiqueta: categoria, valor: Number(valor), periodo }))
}
