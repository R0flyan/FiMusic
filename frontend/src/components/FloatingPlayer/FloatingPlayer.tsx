import { useEffect, useRef, useState } from 'react'
import type { Track } from '../../data/mock'
import { WaveProgress } from '../WaveProgress/WaveProgress'
import './FloatingPlayer.css'

interface FloatingPlayerProps {
  track: Track
  isPlaying: boolean
  onTogglePlay: () => void
  onPlaybackEnd: () => void
  onNextTrack: () => void
  onPreviousTrack: () => void
}

export function FloatingPlayer({ track, isPlaying, onTogglePlay, onPlaybackEnd, onNextTrack, onPreviousTrack }: FloatingPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('volume')
    return savedVolume ? parseFloat(savedVolume) : 0.5
  })
  const [expanded, setExpanded] = useState(false)
  const coverStyle = track.coverUrl
    ? { backgroundImage: `url("${track.coverUrl}")` }
    : {
        background: `linear-gradient(135deg, hsl(${track.coverHue}, 50%, 50%), hsl(${track.coverHue + 40}, 55%, 30%))`,
      }
  const expandedCoverStyle = track.coverUrl
    ? { backgroundImage: `url("${track.coverUrl}")` }
    : {
        background: `linear-gradient(160deg, hsl(${track.coverHue}, 50%, 45%), hsl(${track.coverHue + 40}, 55%, 22%))`,
      }

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) return

    if (isPlaying) {
      void audio.play().catch(() => {
        onPlaybackEnd()
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, onPlaybackEnd, track.audioUrl])

  useEffect(() => {
    localStorage.setItem('volume', volume.toString())
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleTimeUpdate = () => {
    const audio = audioRef.current

    if (!audio || !audio.duration) {
      setProgress(0)
      return
    }

    setProgress((audio.currentTime / audio.duration) * 100)
    localStorage.setItem('currentTrackId', track.id.toString())
    localStorage.setItem('currentTrackTime', audio.currentTime.toString())
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (!audio) return

    const savedTrackId = localStorage.getItem('currentTrackId')
    const savedTime = localStorage.getItem('currentTrackTime')

    if (savedTrackId !== track.id.toString()) return

    if (savedTime) {
      audio.currentTime = Math.min(Number(savedTime), audio.duration)
    }
  }

  const handleSeek = (nextProgress: number) => {
    const audio = audioRef.current

    if (!audio || !audio.duration) return

    audio.currentTime = (nextProgress / 100) * audio.duration
    setProgress(nextProgress)
    localStorage.setItem('currentTrackId', track.id.toString())
    localStorage.setItem('currentTrackTime', audio.currentTime.toString())
  }

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
            style={coverStyle}
            aria-hidden="true"
          />

          <div className="floating-player__info">
            <span className="floating-player__title">{track.title}</span>
            <span className="floating-player__artist">{track.artist}</span>
          </div>

          <div className="floating-player__controls">
            <button type="button" className="floating-player__ctrl" onClick={onPreviousTrack} aria-label="Предыдущий">
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
            <button type="button" className="floating-player__ctrl" onClick={onNextTrack} aria-label="Следующий">
              <NextIcon />
            </button>

            <div className="floating-player__volume">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => {
                  const nextVolume = Number(event.target.value)
                  setVolume(nextVolume)

                  if (audioRef.current) {
                    audioRef.current.volume = nextVolume
                  }
                }}
                aria-label="Громкость"
              />
            </div>
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

        <WaveProgress progress={progress} onSeek={handleSeek} />

        <audio
          ref={audioRef}
          src={track.audioUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={onPlaybackEnd}
        />

        {expanded && (
          <div className="floating-player__expanded">
            <div
              className="floating-player__art"
              style={expandedCoverStyle}
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
