import React from 'react'

export default function Card({children, header, footer, style}){
  return (
    <div className="df-card" style={{...style}}>
      {header && <div style={{marginBottom:12}}>{header}</div>}
      <div>{children}</div>
      {footer && <div style={{marginTop:12}}>{footer}</div>}
    </div>
  )
}
