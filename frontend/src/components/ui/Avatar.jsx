import React from 'react'

export default function Avatar({src, name, employee, size=40, style}){
  const person = employee || { name, profile_picture: src }
  const resolvedSize = typeof size === 'string' ? ({sm:32, md:40, lg:56, xl:76}[size] || 40) : size
  const initials = person.name? person.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():''
  return (
    <div className={`avatar avatar-${size}`} style={{width:resolvedSize,height:resolvedSize,borderRadius:'50%',overflow:'hidden',background:'var(--color-soft-olive)',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'var(--text-primary)',fontWeight:600,...style}}>
      {person.profile_picture? <img src={person.profile_picture} alt={person.name} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : initials}
    </div>
  )
}
