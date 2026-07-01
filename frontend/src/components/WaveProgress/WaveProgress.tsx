import type { KeyboardEvent, PointerEvent } from 'react'
import './WaveProgress.css'

interface WaveProgressProps {
  progress: number
  onSeek?: (progress: number) => void
  className?: string
}

export function WaveProgress({ progress, onSeek, className = '' }: WaveProgressProps) {
  const clamped = Math.min(100, Math.max(0, progress))
  const isInteractive = Boolean(onSeek)

  const seekFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!onSeek) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const nextProgress = ((event.clientX - bounds.left) / bounds.width) * 100
    onSeek(Math.min(100, Math.max(0, nextProgress)))
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!onSeek) return

    event.currentTarget.setPointerCapture(event.pointerId)
    seekFromPointer(event)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onSeek) return

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onSeek(Math.max(0, clamped - 5))
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      onSeek(Math.min(100, clamped + 5))
    }
  }

  return (
    <div
      className={`wave-progress${isInteractive ? ' wave-progress--interactive' : ''} ${className}`.trim()}
      role="slider"
      tabIndex={isInteractive ? 0 : undefined}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          seekFromPointer(event)
        }
      }}
    >
      <div className="wave-progress__track" aria-hidden="true">
        <div className="wave-progress__fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
