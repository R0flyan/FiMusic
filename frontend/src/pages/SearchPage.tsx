import { useEffect, useMemo, useState } from 'react'
import { TrackRow } from '../components/TrackRow/TrackRow'
import type { Playlist } from '../App'
import type { Track } from '../data/mock'
import './SearchPage.css'

interface SearchPageProps {
  tracks: Track[]
  currentTrack: Track
  isPlaying: boolean
  playlists: Playlist[]
  playlistTrackIdsByPlaylist: Record<number, number[]>
  onPlayTrack: (track: Track) => void
  onToggleFavorite: (track: Track) => void
  onAddTrackToPlaylist: (playlist: Playlist, track: Track) => void | Promise<void>
}

export function SearchPage({
  tracks,
  currentTrack,
  isPlaying,
  playlists,
  playlistTrackIdsByPlaylist,
  onPlayTrack,
  onToggleFavorite,
  onAddTrackToPlaylist,
}: SearchPageProps) {
  const [query, setQuery] = useState('')
  const [showAllTracks, setShowAllTracks] = useState(false)
  const normalizedQuery = query.trim().toLowerCase()
  const filteredTracks = useMemo(() => {
    if (!normalizedQuery) return tracks

    return tracks.filter((track) => {
      const values = [track.title, track.artist, track.album ?? '']
      return values.some((value) => value.toLowerCase().includes(normalizedQuery))
    })
  }, [normalizedQuery, tracks])
  const visibleTracks = showAllTracks ? filteredTracks : filteredTracks.slice(0, 12)

  useEffect(() => {
    setShowAllTracks(false)
  }, [normalizedQuery])

  return (
    <div className="search-page">
      <div className="search-page__header">
        <h1 className="search-page__heading">Поиск</h1>
        <div className="search-page__field">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Треки, исполнители, альбомы"
            aria-label="Поиск"
          />
        </div>
      </div>

      <section className="search-page__section">
        <h2 className="search-page__section-title">
          {normalizedQuery ? 'Результаты' : 'Все треки'}
        </h2>
        {filteredTracks.length > 12 && (
          <button
            type="button"
            className="search-page__more"
            onClick={() => setShowAllTracks((value) => !value)}
          >
            {showAllTracks ? 'Скрыть' : 'Все'}
          </button>
        )}
        <div className="search-page__track-list" role="table">
          {visibleTracks.length > 0 ? (
            visibleTracks.map((track, index) => (
              <TrackRow
                key={track.id}
                track={track}
                index={index + 1}
                isPlaying={isPlaying && currentTrack.id === track.id}
                playlists={playlists}
                playlistTrackIdsByPlaylist={playlistTrackIdsByPlaylist}
                onPlay={onPlayTrack}
                onToggleFavorite={onToggleFavorite}
                onAddToPlaylist={onAddTrackToPlaylist}
              />
            ))
          ) : (
            <p className="search-page__empty">Ничего не найдено</p>
          )}
        </div>
      </section>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
