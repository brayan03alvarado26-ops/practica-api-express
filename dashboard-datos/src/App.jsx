import Navbar from './components/Navbar.jsx'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="dashboard-content">
        <p className="eyebrow">Unidad 3 · Práctica 1</p>
        <h1>Preparación del entorno</h1>
        <p className="intro">
          Entorno base listo para integrar y visualizar modelos de ciencia de datos.
        </p>
      </main>
    </div>
  )
}

export default App
