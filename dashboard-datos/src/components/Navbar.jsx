function Navbar() {
  return (
    <header className="navbar">
      <div className="brand-mark" aria-hidden="true">DS</div>
      <div>
        <p className="brand-title">Dashboard de Ciencia de Datos</p>
        <p className="student-name">Alumno: Brayan</p>
      </div>
      <span className="status-badge">Entorno activo</span>
    </header>
  )
}

export default Navbar
