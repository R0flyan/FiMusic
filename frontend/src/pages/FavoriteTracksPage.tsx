import { TrackRow } from '../components/TrackRow/TrackRow'
import type { Track } from '../data/mock'
import './FavoriteTracksPage.css'

interface FavoriteTracksPageProps {
  tracks: Track[]
  currentTrack: Track
  isPlaying: boolean
  onPlayTrack: (track: Track) => void
  onToggleFavorite: (track: Track) => void
}

export function FavoriteTracksPage({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
}: FavoriteTracksPageProps) {
  return (
    <div className="favorite-page">
      <div className="favorite-page__header">
        <h1 className="favorite-page__heading">Избранное</h1>
        <p className="favorite-page__tagline">Треки, которые ты отметил сердцем</p>
      </div>

      <section className="favorite-page__tracks">
        <div className="favorite-page__track-list" role="table">
          {tracks.length > 0 ? (
            tracks.map((track, index) => (
              <TrackRow
                key={track.id}
                track={track}
                index={index + 1}
                isPlaying={isPlaying && currentTrack.id === track.id}
                onPlay={onPlayTrack}
                onToggleFavorite={onToggleFavorite}
              />
            ))
          ) : (
            <p className="favorite-page__empty">Пока нет избранных треков</p>
          )}
        </div>
      </section>
    </div>
  )
}
