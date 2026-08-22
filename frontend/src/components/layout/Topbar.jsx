import React from 'react'
import Avatar from '../ui/Avatar'

export default function Topbar({title='Workspace', session, employeeMode=false}){
  return (
    <header style={{height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',borderBottom:'1px solid var(--border)',background:'transparent'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{fontSize:18,fontWeight:600}}>{title}</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="muted">{employeeMode ? new Date().toLocaleDateString('en-IN', {weekday:'long', month:'short', day:'numeric'}) : 'dayflow@company.com'}</div>
        <Avatar employee={employeeMode ? session : undefined} name={employeeMode ? undefined : 'Priya Sharma'} />
      </div>
    </header>
  )
}
