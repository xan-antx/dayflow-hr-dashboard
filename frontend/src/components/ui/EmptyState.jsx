import React from 'react'

export default function EmptyState({title,description}){
  return (
    <div className="df-card" style={{textAlign:'center',padding:24}}>
      <div style={{fontSize:18,fontWeight:600}}>{title}</div>
      {description && <div style={{color:'var(--text-secondary)',marginTop:8}}>{description}</div>}
    </div>
  )
}
