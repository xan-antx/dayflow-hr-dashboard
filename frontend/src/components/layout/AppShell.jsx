import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({children, activeItem='Dashboard', items, onSelect}){
  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar items={items} activeItem={activeItem} onSelect={onSelect} />
      <div style={{flex:1,display:'flex',flexDirection:'column'}}>
        <Topbar title={activeItem} />
        <main style={{flex:1}}>{children}</main>
      </div>
    </div>
  )
}
