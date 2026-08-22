import React from 'react'

const items = ['Dashboard','Employees','Attendance','Leave','Payroll','Reports','Settings']

export default function Sidebar(){
  return (
    <aside style={{width:240,background:'var(--color-deep-olive)',color:'var(--color-ivory)',padding:20,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
      <div>
        <div style={{fontWeight:700,marginBottom:20}}>DAYFLOW</div>
        <nav>
          {items.map(i=> (
            <div key={i} style={{padding:'8px 10px',borderRadius:8,marginBottom:6}}>{i}</div>
          ))}
        </nav>
      </div>
      <div style={{fontSize:13}}>
        <div>Priya Sharma</div>
        <div className="muted">HR Admin</div>
      </div>
    </aside>
  )
}
