import type { Track } from '../data/mock'
import {
  featuredPlaylist,
  scrollPlaylists,
  sidePlaylists,
} from '../data/mock'
import { BentoGrid } from '../components/BentoGrid/BentoGrid'
import { WaveDivider } from '../components/WaveDivider/WaveDivider'
import { TrackRow } from '../components/TrackRow/TrackRow'
import { HorizontalScroll } from '../components/HorizontalScroll/HorizontalScroll'
import './DiscoverPage.css'

interface DiscoverPageProps {
  tracks: Track[]
  currentTrack: Track
  isPlaying: boolean
  onPlayTrack: (track: Track) => void
}

export function DiscoverPage({ tracks, currentTrack, isPlaying, onPlayTrack }: DiscoverPageProps) {
  return (
    <div className="discover">
      <div className="discover__hero-text">
        <h1 className="discover__heading">Рекомендация</h1>
        <p className="discover__tagline">Поток музыки, подобранный для вас</p>
      </div>

      <BentoGrid hero={featuredPlaylist} side={sidePlaylists} />

      <WaveDivider />

      <section className="discover__tracks">
        <h2 className="discover__section-title">Недавно слушали</h2>
        <div className="discover__track-list" role="table">
          {tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i + 1}
              isPlaying={isPlaying && currentTrack.id === track.id}
              onPlay={onPlayTrack}
            />
          ))}
        </div>
      </section>

      <HorizontalScroll title="Подборки" playlists={scrollPlaylists} />
    </div>
  )
}
