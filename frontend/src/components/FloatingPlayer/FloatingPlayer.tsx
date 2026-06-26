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
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
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

    setCurrentTime(audio.currentTime)
    setDuration(audio.duration)
    setProgress((audio.currentTime / audio.duration) * 100)
    localStorage.setItem('currentTrackId', track.id.toString())
    localStorage.setItem('currentTrackTime', audio.currentTime.toString())
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (!audio) return

    setDuration(audio.duration || 0)

    const savedTrackId = localStorage.getItem('currentTrackId')
    const savedTime = localStorage.getItem('currentTrackTime')

    if (savedTrackId !== track.id.toString()) return

    if (savedTime) {
      audio.currentTime = Math.min(Number(savedTime), audio.duration)
      setCurrentTime(audio.currentTime)
      setProgress((audio.currentTime / audio.duration) * 100)
    }
  }

  const handleSeek = (nextProgress: number) => {
    const audio = audioRef.current

    if (!audio || !audio.duration) return

    audio.currentTime = (nextProgress / 100) * audio.duration
    setCurrentTime(audio.currentTime)
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
            <div className="floating-player__title-row">
              <span className="floating-player__title">{track.title}</span>
              <button type="button" className="floating-player__like" aria-label="Добавить в избранное">
                <HeartIcon />
              </button>
            </div>
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
          </div>

          <div className="floating-player__volume">
              <VolumeIcon />
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

          <button
            type="button"
            className="floating-player__expand"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Свернуть' : 'Развернуть'}
          >
            <QueueIcon />
          </button>
        </div>

        <div className="floating-player__progress-row">
          <span className="floating-player__time">{formatTime(currentTime)}</span>
          <WaveProgress progress={progress} onSeek={handleSeek} />
          <span className="floating-player__time">{formatTime(duration)}</span>
        </div>

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

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'

  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  )
}

function PrevIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.5-9-8.5C1.5 8.5 3.5 5 7 5c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 3.5 0 5.5 3.5 4 6.5-2 4-9 8.5-9 8.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VolumeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M17 9.5a4 4 0 010 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function QueueIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h12M4 12h12M4 17h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="19" cy="7" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="17" r="1.5" fill="currentColor" />
    </svg>
  )
}
