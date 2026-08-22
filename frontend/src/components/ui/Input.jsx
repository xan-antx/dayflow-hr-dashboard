import React from 'react'

export default function Input({placeholder, disabled, error, style, ...rest}){
  return (
    <input
      className="df-input"
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={error||undefined}
      style={error?{borderColor:'var(--danger)', ...style}:style}
      {...rest}
    />
  )
}
