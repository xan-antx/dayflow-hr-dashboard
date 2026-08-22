import React from 'react'

export default function PageHeader({title,subtitle}){
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
      <h1 style={{fontSize:28,fontWeight:700,color:'var(--text-primary)'}}>{title}</h1>
      {subtitle && <div style={{color:'var(--text-secondary)'}}>{subtitle}</div>}
    </div>
  )
}
