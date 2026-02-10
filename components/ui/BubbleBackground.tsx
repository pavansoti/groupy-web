'use client'

import { useState, useEffect } from 'react'

const bubbles = [
  { size: 120, left: '10%', duration: 22, color: 'var(--bubble-1)' },
  { size: 80, left: '30%', duration: 18, color: 'var(--bubble-2)' },
  { size: 150, left: '55%', duration: 26, color: 'var(--bubble-3)' },
  { size: 60, left: '75%', duration: 16, color: 'var(--bubble-1)' },
  { size: 100, left: '90%', duration: 20, color: 'var(--bubble-2)' },
]

export function BubbleBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <div className="bubble-blobs" />
      <div className="bubble-bg">
        {bubbles.map((b, i) => (
          <span
            key={i}
            className="bubble"
            style={
                {
                    '--bubble-color': b.color,
                    width: b.size,
                    height: b.size,
                    left: b.left,
                    background: `radial-gradient(circle at 30% 30%, ${b.color}, transparent 60%)`,
                    animationDuration: `${b.duration}s`,
                } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  )
}
