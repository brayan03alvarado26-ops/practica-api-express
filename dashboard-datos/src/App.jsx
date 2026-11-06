import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import TarjetaMetrica from './components/TarjetaMetrica.jsx'
import TablaDatos from './components/TablaDatos.jsx'
import { obtenerDatosVisualizacion, procesarDatos } from './services/dataService.js'
import './App.css'

function App() {
  const [datos, setDatos] = useState([])
  useEffect(() => { obtenerDatosVisualizacion().then((datosOriginales) => setDatos(procesarDatos(datosOriginales))) }, [])
  const total = datos.reduce((suma, dato) => suma + dato.valor, 0)
  const promedio = datos.length ? Math.round(total / datos.length) : 0

  return <div className="app-shell"><Navbar /><main className="dashboard-content"><div className="hero-copy"><p className="eyebrow">Unidad 3 · Práctica 2</p><h1>Datos listos para explorar.</h1><p className="intro">Arquitectura modular con servicios y componentes reutilizables para preparar la visualización.</p></div><section className="metrics-grid"><TarjetaMetrica titulo="Registros" valor={datos.length} detalle="Elementos cargados" /><TarjetaMetrica titulo="Valor total" valor={total.toLocaleString('es-MX')} detalle="Suma del dataset" /><TarjetaMetrica titulo="Promedio" valor={promedio.toLocaleString('es-MX')} detalle="Media por registro" /></section><TablaDatos datos={datos} /></main></div>
}

export default App
