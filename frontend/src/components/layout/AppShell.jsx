import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({children, activeItem='Dashboard', items, onSelect, current, onNavigate, session, onLogout}){
  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar items={items} activeItem={activeItem} onSelect={onSelect} current={current} onNavigate={onNavigate} session={session} onLogout={onLogout} />
      <div style={{flex:1,display:'flex',flexDirection:'column'}}>
        <Topbar title={activeItem} session={session} employeeMode={Boolean(current)} />
        <main style={{flex:1}}>{children}</main>
      </div>
    </div>
  )
}
