import React from 'react'

export default function Select({options=[], value, onChange, style, ...rest}){
  return (
    <select className="df-input" value={value} onChange={onChange} style={style} {...rest}>
      {options.map((o,i)=> <option key={i} value={o.value||o}>{o.label||o}</option>)}
    </select>
  )
}
