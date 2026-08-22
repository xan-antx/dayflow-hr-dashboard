import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell({children}){
  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar />
      <div style={{flex:1,display:'flex',flexDirection:'column'}}>
        <Topbar />
        <main style={{flex:1}}>{children}</main>
      </div>
    </div>
  )
}
