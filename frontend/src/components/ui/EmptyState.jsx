import React from 'react'

export default function EmptyState({title,description,icon: Icon,children}){
  return (
    <div className="df-card" style={{textAlign:'center',padding:24}}>
      {Icon && <Icon size={22} />}
      <div style={{fontSize:18,fontWeight:600}}>{title || children}</div>
      {description && <div style={{color:'var(--text-secondary)',marginTop:8}}>{description}</div>}
    </div>
  )
}
