import type { Track } from '../../data/mock'
import './TrackRow.css'

interface TrackRowProps {
  track: Track
  index: number
  isPlaying?: boolean
  onPlay?: (track: Track) => void
  onToggleFavorite?: (track: Track) => void
}

export function TrackRow({
  track,
  index,
  isPlaying = false,
  onPlay,
  onToggleFavorite,
}: TrackRowProps) {
  const coverStyle = track.coverUrl
    ? { backgroundImage: `url("${track.coverUrl}")` }
    : {
        background: `linear-gradient(135deg, hsl(${track.coverHue}, 50%, 50%), hsl(${track.coverHue + 40}, 55%, 30%))`,
      }

  return (
    <div
      className={`track-row${isPlaying ? ' track-row--playing' : ''}`}
      role="row"
      onDoubleClick={() => onPlay?.(track)}
    >
      <span className="track-row__index">{isPlaying ? <WaveIcon /> : index}</span>

      <div
        className="track-row__cover"
        style={coverStyle}
        aria-hidden="true"
      />

      <div className="track-row__info">
        <span className="track-row__title">{track.title}</span>
        <span className="track-row__meta">
          {track.artist} · {track.album}
        </span>
      </div>

      <span className="track-row__duration">{track.duration ?? '--:--'}</span>

      <div className="track-row__actions">
        <button
          type="button"
          className={`track-row__btn${track.isFavorite ? ' track-row__btn--active' : ''}`}
          aria-label={track.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          onClick={() => onToggleFavorite?.(track)}
        >
          <HeartIcon />
        </button>
        <button type="button" className="track-row__btn" aria-label="Ещё">
          <MoreIcon />
        </button>
      </div>

      <button
        type="button"
        className="track-row__play"
        aria-label={`Воспроизвести ${track.title}`}
        onClick={() => onPlay?.(track)}
      >
        <PlayIcon />
      </button>
    </div>
  )
}

function WaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="track-row__wave">
      <rect x="1" y="5" width="2" height="4" fill="var(--color-accent)" />
      <rect x="4" y="3" width="2" height="8" fill="var(--color-accent)" />
      <rect x="7" y="1" width="2" height="12" fill="var(--color-accent)" />
      <rect x="10" y="4" width="2" height="6" fill="var(--color-accent)" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.5-9-8.5C1.5 8.5 3.5 5 7 5c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 3.5 0 5.5 3.5 4 6.5-2 4-9 8.5-9 8.5z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}
