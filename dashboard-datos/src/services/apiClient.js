const baseURL = import.meta.env.VITE_API_URL || '/src/data'

export async function get(ruta) {
  const respuesta = await fetch(`${baseURL}${ruta}`)
  if (!respuesta.ok) throw new Error(`La API respondió con estado ${respuesta.status}`)
  return respuesta.json()
}
