import React from 'react'

export default function LoadingState(){
  return (
    <div style={{display:'flex',alignItems:'center',gap:12}}>
      <div style={{width:24,height:24,borderRadius:4,background:'var(--color-soft-olive)'}} />
      <div className="muted">Loading your Dayflow...</div>
    </div>
  )
}
