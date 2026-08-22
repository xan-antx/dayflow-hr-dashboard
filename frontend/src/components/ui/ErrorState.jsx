import React from 'react'
import Button from './Button'

export default function ErrorState({message='Unable to load this information. Please try again.',onRetry}){
  return (
    <div className="df-card error-state" role="alert">
      <div style={{fontWeight:600}}>Unable to load this information</div>
      <div className="muted" style={{marginTop:8}}>{message}</div>
      {onRetry && <Button variant="secondary" onClick={onRetry} style={{marginTop:16}}>Try again</Button>}
    </div>
  )
}
