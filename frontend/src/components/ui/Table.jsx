import React from 'react'

export default function Table({columns=[], data=[], headers, children}){
  if (headers) {
    return <div className="table-wrap"><table style={{width:'100%',borderCollapse:'collapse',background:'var(--color-ivory)',border:'1px solid var(--border)'}}><thead><tr>{headers.map((header)=><th key={header} style={{textAlign:'left',padding:12,borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
  }
  if(!data || data.length===0){
    return <div className="df-card"><div className="muted">No data</div></div>
  }
  return (
    <table style={{width:'100%',borderCollapse:'collapse',background:'var(--color-ivory)',border:'1px solid var(--border)'}}>
      <thead>
        <tr>
          {columns.map(c=> <th key={c.key} style={{textAlign:'left',padding:12,borderBottom:'1px solid var(--border)',color:'var(--text-secondary)'}}>{c.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row,ri)=> (
          <tr key={ri} style={{borderBottom:'1px solid var(--border)'}}>
            {columns.map(c=> <td key={c.key} style={{padding:12}}>{row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
