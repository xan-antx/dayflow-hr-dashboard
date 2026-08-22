import React from 'react'
import Avatar from '../ui/Avatar'

export default function Topbar(){
  return (
    <header style={{height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',borderBottom:'1px solid var(--border)',background:'transparent'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{fontSize:18,fontWeight:600}}>Workspace</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="muted">dayflow@company.com</div>
        <Avatar name="Priya Sharma" />
      </div>
    </header>
  )
}
