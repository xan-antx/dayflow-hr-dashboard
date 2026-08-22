import React from 'react'

export default function PageHeader({title,subtitle,eyebrow,description,action}){
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1 style={{fontSize:28,fontWeight:700,color:'var(--text-primary)'}}>{title}</h1>
      {(subtitle || description) && <div style={{color:'var(--text-secondary)'}}>{subtitle || description}</div>}
      {action}
    </div>
  )
}
