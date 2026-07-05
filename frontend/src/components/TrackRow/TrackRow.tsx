import { useEffect, useRef, useState } from 'react'
import type { Playlist } from '../../App'
import type { Track } from '../../data/mock'
import './TrackRow.css'

interface TrackRowProps {
  track: Track
  index: number
  isPlaying?: boolean
  playlists?: Playlist[]
  playlistTrackIdsByPlaylist?: Record<number, number[]>
  onPlay?: (track: Track) => void
  onToggleFavorite?: (track: Track) => void
  onAddToPlaylist?: (playlist: Playlist, track: Track) => void | Promise<void>
}

export function TrackRow({
  track,
  index,
  isPlaying = false,
  playlists = [],
  playlistTrackIdsByPlaylist = {},
  onPlay,
  onToggleFavorite,
  onAddToPlaylist,
}: TrackRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [didCopy, setDidCopy] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const coverStyle = track.coverUrl
    ? { backgroundImage: `url("${track.coverUrl}")` }
    : {
        background: `linear-gradient(135deg, hsl(${track.coverHue}, 50%, 50%), hsl(${track.coverHue + 40}, 55%, 30%))`,
      }
  const availablePlaylists = playlists.filter((playlist) => {
    const playlistTrackIds = playlistTrackIdsByPlaylist[playlist.id]
    return !playlistTrackIds?.includes(track.id)
  })

  useEffect(() => {
    if (!isMenuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isMenuOpen])

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/track/${track.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: track.title,
          text: `${track.artist} - ${track.title}`,
          url: shareUrl,
        })
        setIsMenuOpen(false)
        return
      } catch {
        return
      }
    }

    await navigator.clipboard.writeText(shareUrl)
    setDidCopy(true)
    window.setTimeout(() => setDidCopy(false), 1600)
  }

  const handleAddToPlaylist = (playlist: Playlist) => {
    void onAddToPlaylist?.(playlist, track)
    setIsMenuOpen(false)
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
        <div className="track-row__menu-wrap" ref={menuRef}>
          <button
            type="button"
            className={`track-row__btn${isMenuOpen ? ' track-row__btn--active' : ''}`}
            aria-label="Еще"
            aria-expanded={isMenuOpen}
            onClick={(event) => {
              event.stopPropagation()
              setIsMenuOpen((value) => !value)
            }}
          >
            <MoreIcon />
          </button>

          {isMenuOpen && (
            <div className="track-row__menu" role="menu">
              <button type="button" className="track-row__menu-item" onClick={handleShare}>
                {didCopy ? 'Ссылка скопирована' : 'Поделиться треком'}
              </button>

              <div className="track-row__menu-label">Добавить в плейлист</div>
              {availablePlaylists.length > 0 ? (
                availablePlaylists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    className="track-row__menu-item"
                    onClick={() => handleAddToPlaylist(playlist)}
                  >
                    {playlist.title}
                  </button>
                ))
              ) : (
                <span className="track-row__menu-empty">Плейлистов пока нет</span>
              )}
            </div>
          )}
        </div>
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
