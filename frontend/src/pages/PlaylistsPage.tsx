import { useState, type FormEvent } from 'react'
import { TrackRow } from '../components/TrackRow/TrackRow'
import type { Playlist } from '../App'
import type { Track } from '../data/mock'
import './PlaylistsPage.css'

interface PlaylistsPageProps {
  tracks: Track[]
  playlists: Playlist[]
  selectedPlaylist: Playlist | null
  playlistTracks: Track[]
  currentTrack: Track
  isPlaying: boolean
  onCreatePlaylist: (title: string) => void | Promise<void>
  onOpenPlaylist: (playlist: Playlist) => void | Promise<void>
  onClosePlaylist: () => void
  onAddTrackToPlaylist: (playlist: Playlist, track: Track) => void | Promise<void>
  onRemoveTrackFromPlaylist: (playlist: Playlist, track: Track) => void | Promise<void>
  onPlayTrack: (track: Track) => void
  onToggleFavorite: (track: Track) => void
}

export function PlaylistsPage({
  tracks,
  playlists,
  selectedPlaylist,
  playlistTracks,
  currentTrack,
  isPlaying,
  onCreatePlaylist,
  onOpenPlaylist,
  onClosePlaylist,
  onAddTrackToPlaylist,
  onRemoveTrackFromPlaylist,
  onPlayTrack,
  onToggleFavorite,
}: PlaylistsPageProps) {
  const [title, setTitle] = useState('')
  const [addQuery, setAddQuery] = useState('')
  const playlistTrackIds = new Set(playlistTracks.map((track) => track.id))
  const availableTracks = tracks
    .filter((track) => !playlistTrackIds.has(track.id))
    .filter((track) => {
      const query = addQuery.trim().toLowerCase()
      if (!query) return true

      return [track.title, track.artist, track.album ?? ''].some((value) =>
        value.toLowerCase().includes(query),
      )
    })

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) return

    void onCreatePlaylist(nextTitle)
    setTitle('')
  }

  if (selectedPlaylist) {
    return (
      <div className="playlists-page">
        <button type="button" className="playlists-page__back" onClick={onClosePlaylist}>
          Назад к плейлистам
        </button>

        <div className="playlists-page__detail-header">
          <PlaylistCover playlist={selectedPlaylist} />
          <div>
            <h1 className="playlists-page__heading">{selectedPlaylist.title}</h1>
            <p className="playlists-page__tagline">
              {selectedPlaylist.description ?? `${selectedPlaylist.trackCount} треков`}
            </p>
          </div>
        </div>

        <section className="playlists-page__section">
          <h2 className="playlists-page__section-title">Треки</h2>
          <div className="playlists-page__track-list">
            {playlistTracks.length > 0 ? (
              playlistTracks.map((track, index) => (
                <div key={track.id} className="playlists-page__track-item">
                  <TrackRow
                    track={track}
                    index={index + 1}
                    isPlaying={isPlaying && currentTrack.id === track.id}
                    onPlay={onPlayTrack}
                    onToggleFavorite={onToggleFavorite}
                  />
                  <button
                    type="button"
                    className="playlists-page__small-btn"
                    onClick={() => onRemoveTrackFromPlaylist(selectedPlaylist, track)}
                  >
                    Убрать
                  </button>
                </div>
              ))
            ) : (
              <p className="playlists-page__empty">В этом плейлисте пока нет треков</p>
            )}
          </div>
        </section>

        <section className="playlists-page__section">
          <div className="playlists-page__section-head">
            <h2 className="playlists-page__section-title">Добавить треки</h2>
            <input
              className="playlists-page__filter"
              value={addQuery}
              onChange={(event) => setAddQuery(event.target.value)}
              placeholder="Найти трек"
              aria-label="Найти трек для плейлиста"
            />
          </div>
          <div className="playlists-page__add-list">
            {availableTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className="playlists-page__add-row"
                onClick={() => onAddTrackToPlaylist(selectedPlaylist, track)}
              >
                <span>{track.title}</span>
                <span>{track.artist}</span>
              </button>
            ))}
            {availableTracks.length === 0 && (
              <p className="playlists-page__empty">Нет доступных треков для добавления</p>
            )}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="playlists-page">
      <div className="playlists-page__header">
        <div>
          <h1 className="playlists-page__heading">Плейлисты</h1>
          <p className="playlists-page__tagline">Собирай треки в отдельные подборки</p>
        </div>
        <form className="playlists-page__create" onSubmit={handleCreate}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Название плейлиста"
            aria-label="Название плейлиста"
          />
          <button type="submit">Создать</button>
        </form>
      </div>

      <div className="playlists-page__grid">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <button
              key={playlist.id}
              type="button"
              className="playlists-page__card"
              onClick={() => onOpenPlaylist(playlist)}
            >
              <PlaylistCover playlist={playlist} />
              <span className="playlists-page__card-title">{playlist.title}</span>
              <span className="playlists-page__card-sub">
                {playlist.trackCount} треков
              </span>
            </button>
          ))
        ) : (
          <p className="playlists-page__empty">Плейлистов пока нет</p>
        )}
      </div>
    </div>
  )
}

function PlaylistCover({ playlist }: { playlist: Playlist }) {
  const coverStyle = playlist.coverUrl
    ? { backgroundImage: `url("${playlist.coverUrl}")` }
    : {
        background: `linear-gradient(135deg, hsl(${playlist.id * 45}, 56%, 45%), hsl(${playlist.id * 45 + 60}, 64%, 24%))`,
      }

  return <span className="playlists-page__cover" style={coverStyle} aria-hidden="true" />
}
