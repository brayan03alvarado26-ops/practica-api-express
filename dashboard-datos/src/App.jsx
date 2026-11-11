import Navbar from './components/Navbar.jsx'
import PanelAnalitico from './components/PanelAnalitico.jsx'
import './App.css'

function App() {
  return <div className="app-shell"><Navbar /><main className="dashboard-content"><div className="hero-copy"><p className="eyebrow">Unidad 3 · Práctica 3</p><h1>Conecta, analiza y comprende.</h1><p className="intro">Consumo de datos con estados de carga y manejo de errores en una interfaz preparada para ciencia de datos.</p></div><PanelAnalitico /></main></div>
}

export default App
