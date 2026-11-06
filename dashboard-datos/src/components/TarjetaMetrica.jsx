function TarjetaMetrica({ titulo, valor, detalle }) {
  return <article className="metric-card"><p className="metric-title">{titulo}</p><strong className="metric-value">{valor}</strong><span className="metric-detail">{detalle}</span></article>
}

export default TarjetaMetrica
