import React from 'react'

const VARIANTS = {
  primary: {
    background: 'var(--color-primary-olive)',
    color: 'var(--color-ivory)'
  },
  secondary: {
    background: 'var(--color-soft-olive)',
    color: 'var(--color-deep-olive)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-primary-olive)',
    border: '1px solid transparent'
  },
  danger: {
    background: 'var(--danger)',
    color: 'var(--color-ivory)'
  }
}

export default function Button({variant='primary', children, style, className, ...rest}){
  const v = VARIANTS[variant] || VARIANTS.primary
  return (
    <button
      className={`df-button ${className||''}`}
      style={{background:v.background,color:v.color,border:v.border, ...style}}
      {...rest}
    >
      {children}
    </button>
  )
}
