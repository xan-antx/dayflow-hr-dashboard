import React from 'react'
import { CalendarDays, Clock3, Home, LogOut, UserRound, WalletCards } from 'lucide-react'
import Avatar from '../ui/Avatar'

const defaultItems = ['Dashboard','Employees','Attendance','Leave','Payroll']

export default function Sidebar({items=defaultItems, activeItem='Dashboard', onSelect, current, onNavigate, session, onLogout}){
  if (current) {
    const employeeItems = [
      { path:'dashboard', label:'Dashboard', icon:Home },
      { path:'profile', label:'My Profile', icon:UserRound },
      { path:'attendance', label:'Attendance', icon:Clock3 },
      { path:'leave', label:'Leave', icon:CalendarDays },
      { path:'salary', label:'Salary', icon:WalletCards }
    ]
    return <aside className="sidebar"><div><div className="brand"><strong>dayflow</strong><span>HR management</span></div><nav>{employeeItems.map(({path,label,icon:Icon})=><button key={path} className={`nav-item ${current===path?'active':''}`} onClick={()=>onNavigate(path)}><Icon size={19}/>{label}</button>)}</nav></div><div className="sidebar-footer"><div className="profile-chip"><Avatar employee={session} size="sm"/><div><strong>{session?.name}</strong><span>Employee</span></div></div><button className="logout" onClick={onLogout}><LogOut size={17}/>Log out</button></div></aside>
  }
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
