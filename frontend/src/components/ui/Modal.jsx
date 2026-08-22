import React from 'react'

export default function Modal({open=true,title,children,onClose}){
  if(!open) return null
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.3)'}}>
      <div className="df-card" style={{width:520}}>
        {title && <h3 style={{marginBottom:8}}>{title}</h3>}
        <div>{children}</div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
          <button className="df-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
