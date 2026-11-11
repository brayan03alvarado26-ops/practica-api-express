import { useState } from 'react'
import TarjetaMetrica from './TarjetaMetrica.jsx'
import TablaDatos from './TablaDatos.jsx'
import { obtenerPrediccion } from '../services/dataService.js'

function PanelAnalitico() {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function analizarDatos(simularError = false) {
    setCargando(true)
    setError('')
    try {
      setDatos(await obtenerPrediccion({ simularError }))
    } catch (fallo) {
      setDatos([])
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }

  const total = datos.reduce((suma, dato) => suma + dato.valor, 0)
  const promedio = datos.length ? Math.round(total / datos.length) : 0

  return <section className="analytics-panel"><div className="panel-toolbar"><div><p className="eyebrow">Integración con API</p><h2>Panel analítico</h2></div><div className="panel-actions"><button onClick={() => analizarDatos(false)} disabled={cargando}>{cargando ? 'Analizando...' : 'Consultar API'}</button><button className="danger-button" onClick={() => analizarDatos(true)} disabled={cargando}>Simular error</button></div></div>{cargando && <p className="loading-message">⏳ Analizando datos...</p>}{error && <p className="error-message">⚠️ {error}</p>}{datos.length > 0 && !cargando && <><div className="metrics-grid"><TarjetaMetrica titulo="Predicciones" valor={datos.length} detalle="Respuesta de la API" /><TarjetaMetrica titulo="Valor total" valor={total.toLocaleString('es-MX')} detalle="Datos recibidos" /><TarjetaMetrica titulo="Promedio" valor={promedio.toLocaleString('es-MX')} detalle="Resultado analítico" /></div><TablaDatos datos={datos} /></>}</section>
}

export default PanelAnalitico
