import React from 'react'

const STATUS = {
  Present: {color:'var(--success)', bg:'var(--success-bg)'},
  Absent: {color:'var(--danger)', bg:'var(--danger-bg)'},
  'Half-day': {color:'var(--warning)', bg:'var(--warning-bg)'},
  Leave: {color:'var(--neutral)', bg:'var(--neutral-bg)'},
  Pending: {color:'var(--warning)', bg:'var(--warning-bg)'},
  Approved: {color:'var(--success)', bg:'var(--success-bg)'},
  Rejected: {color:'var(--danger)', bg:'var(--danger-bg)'}
}

export default function Badge({status, children, style}){
  const s = STATUS[status] || {color:'var(--text-primary)', bg:'transparent'}
  return (
    <span style={{display:'inline-block',padding:'4px 10px',borderRadius:'6px',fontSize:12,fontWeight:500,color:s.color,background:s.bg,...style}}>
      {children||status}
    </span>
  )
}
