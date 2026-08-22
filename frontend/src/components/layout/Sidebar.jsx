import React from 'react'

const defaultItems = ['Dashboard','Employees','Attendance','Leave','Payroll']

export default function Sidebar({items=defaultItems, activeItem='Dashboard', onSelect}){
  return (
    <aside style={{width:240,background:'var(--color-deep-olive)',color:'var(--color-ivory)',padding:20,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
      <div>
        <div style={{fontWeight:700,marginBottom:20}}>DAYFLOW</div>
        <nav>
          {items.map((item) => {
            const selected = item === activeItem
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelect && onSelect(item)}
                style={{
                  width:'100%',
                  textAlign:'left',
                  padding:'10px 12px',
                  borderRadius:8,
                  marginBottom:6,
                  border:'1px solid transparent',
                  background: selected ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: 'inherit',
                  fontSize:14,
                  fontWeight: selected ? 600 : 500,
                  cursor:'pointer'
                }}
              >
                {item}
              </button>
            )
          })}
        </nav>
      </div>
      <div style={{fontSize:13}}>
        <div>Priya Sharma</div>
        <div className="muted" style={{color:'rgba(255,255,255,0.7)'}}>HR Admin</div>
      </div>
    </aside>
  )
}
