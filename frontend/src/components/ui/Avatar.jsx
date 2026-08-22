import React from 'react'

export default function Avatar({src, name, size=40, style}){
  const initials = name? name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():''
  return (
    <div style={{width:size,height:size,borderRadius:'50%',overflow:'hidden',background:'var(--color-soft-olive)',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'var(--text-primary)',fontWeight:600,...style}}>
      {src? <img src={src} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : initials}
    </div>
  )
}
