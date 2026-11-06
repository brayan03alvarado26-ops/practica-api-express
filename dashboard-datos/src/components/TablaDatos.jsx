function TablaDatos({ datos }) {
  return <section className="table-card"><div className="section-heading"><div><p className="eyebrow">Datos procesados</p><h2>Resumen del dataset</h2></div><span className="row-count">{datos.length} registros</span></div><div className="table-wrapper"><table><thead><tr><th>Etiqueta</th><th>Periodo</th><th>Valor</th></tr></thead><tbody>{datos.map((dato) => <tr key={`${dato.etiqueta}-${dato.periodo}`}><td>{dato.etiqueta}</td><td>{dato.periodo}</td><td className="value-cell">{dato.valor.toLocaleString('es-MX')}</td></tr>)}</tbody></table></div></section>
}

export default TablaDatos
