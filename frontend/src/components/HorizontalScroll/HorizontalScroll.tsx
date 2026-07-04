import type { Playlist } from '../../data/mock'
import './HorizontalScroll.css'

interface HorizontalScrollProps {
  title: string
  playlists: Playlist[]
  onPlaylistClick?: (playlist: Playlist) => void
}

export function HorizontalScroll({ title, playlists, onPlaylistClick }: HorizontalScrollProps) {
  return (
    <section className="h-scroll">
      <div className="h-scroll__header">
        <h2 className="h-scroll__title">{title}</h2>
        <button type="button" className="h-scroll__more">
          Все
        </button>
      </div>
      <div className="h-scroll__track">
        {playlists.map((playlist) => (
          <article 
            key={playlist.id} 
            className="h-scroll__card"
            style={{ cursor: onPlaylistClick ? 'pointer' : 'default' }}
            onClick={() => {
              console.log('HorizontalScroll: Clicked playlist:', playlist)
              onPlaylistClick?.(playlist)
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                console.log('HorizontalScroll: Keyboard click playlist:', playlist)
                onPlaylistClick?.(playlist)
              }
            }}
          >
            <div
              className="h-scroll__cover"
              style={{
                background: `linear-gradient(160deg, hsl(${playlist.coverHue}, 50%, 50%), hsl(${playlist.coverHue + 35}, 55%, 28%))`,
              }}
              role="img"
              aria-label={playlist.title}
            />
            <h3 className="h-scroll__card-title">{playlist.title}</h3>
            <p className="h-scroll__card-sub">{playlist.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
