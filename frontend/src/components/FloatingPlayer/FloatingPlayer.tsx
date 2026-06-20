import { useEffect, useState } from 'react'
import type { Track } from '../../data/mock'
import { WaveProgress } from '../WaveProgress/WaveProgress'
import './FloatingPlayer.css'

interface FloatingPlayerProps {
  track: Track
  isPlaying: boolean
  onTogglePlay: () => void
}

export function FloatingPlayer({ track, isPlaying, onTogglePlay }: FloatingPlayerProps) {
  const [progress, setProgress] = useState(38)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.3))
    }, 300)

    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <>
      <div
        className={`floating-player${expanded ? ' floating-player--expanded' : ''}`}
        role="region"
        aria-label="Плеер"
      >
        <div className="floating-player__compact">
          <div
            className="floating-player__cover"
            style={{
              background: `linear-gradient(135deg, hsl(${track.coverHue}, 50%, 50%), hsl(${track.coverHue + 40}, 55%, 30%))`,
            }}
            aria-hidden="true"
          />

          <div className="floating-player__info">
            <span className="floating-player__title">{track.title}</span>
            <span className="floating-player__artist">{track.artist}</span>
          </div>

          <div className="floating-player__controls">
            <button type="button" className="floating-player__ctrl" aria-label="Предыдущий">
              <PrevIcon />
            </button>
            <button
              type="button"
              className="floating-player__play"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button type="button" className="floating-player__ctrl" aria-label="Следующий">
              <NextIcon />
            </button>
          </div>

          <button
            type="button"
            className="floating-player__expand"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Свернуть' : 'Развернуть'}
          >
            <ChevronIcon up={expanded} />
          </button>
        </div>

        <WaveProgress progress={progress} />

        {expanded && (
          <div className="floating-player__expanded">
            <div
              className="floating-player__art"
              style={{
                background: `linear-gradient(160deg, hsl(${track.coverHue}, 50%, 45%), hsl(${track.coverHue + 40}, 55%, 22%))`,
              }}
            />
            <div className="floating-player__queue">
              <h3 className="floating-player__queue-title">Сейчас играет</h3>
              <p className="floating-player__queue-track">{track.title}</p>
              <p className="floating-player__queue-artist">{track.artist}</p>
              <p className="floating-player__queue-album">{track.album}</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  )
}

function PrevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  )
}

function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ transform: up ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
