import React from 'react'

export default function StatCard({title,value,trend}){
  return (
    <div className="df-card" style={{width:200}}>
      <div style={{fontSize:12,color:'var(--text-secondary)'}}>{title}</div>
      <div style={{fontSize:20,fontWeight:700,marginTop:6}}>{value}</div>
      {trend && <div style={{marginTop:8,color: trend==='up'? 'var(--success)' : 'var(--danger)'}}>{trend==='up'? '▲' : '▼'}</div>}
    </div>
  )
}
