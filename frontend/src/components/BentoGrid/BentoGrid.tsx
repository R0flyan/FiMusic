import type { Playlist } from '../../data/mock'
import './BentoGrid.css'

interface BentoGridProps {
  hero: Playlist
  side: Playlist[]
  onPlaylistClick?: (playlist: Playlist) => void
}

function CoverArt({ hue, label }: { hue: number; label: string }) {
  return (
    <div
      className="bento-cover"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 55%, 45%) 0%, hsl(${hue + 30}, 60%, 25%) 100%)`,
      }}
      role="img"
      aria-label={label}
    />
  )
}

export function BentoGrid({ hero, side, onPlaylistClick }: BentoGridProps) {
  return (
    <section className="bento" aria-label="Рекомендации">
      <article 
        className="bento__hero"
        style={{ cursor: onPlaylistClick ? 'pointer' : 'default' }}
        onClick={() => {
          console.log('BentoGrid: Clicked hero playlist:', hero)
          onPlaylistClick?.(hero)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            console.log('BentoGrid: Keyboard click hero playlist:', hero)
            onPlaylistClick?.(hero)
          }
        }}
      >
        <CoverArt hue={hero.coverHue} label={hero.title} />
        <div className="bento__hero-content">
          <span className="bento__label">Featured</span>
          <h2 className="bento__title">{hero.title}</h2>
          <p className="bento__subtitle">{hero.subtitle}</p>
          <div className="bento__meta">
            <span className="bento__count">{hero.trackCount} треков</span>
            <button type="button" className="bento__play" onClick={(e) => {
              e.stopPropagation()
              console.log('BentoGrid: Clicked play button:', hero)
              onPlaylistClick?.(hero)
            }}>
              <PlayIcon />
              <span>Слушать</span>
            </button>
          </div>
        </div>
      </article>

      <div className="bento__side">
        {side.map((playlist) => (
          <article 
            key={playlist.id} 
            className="bento__card"
            style={{ cursor: onPlaylistClick ? 'pointer' : 'default' }}
            onClick={() => {
              console.log('BentoGrid: Clicked side playlist:', playlist)
              onPlaylistClick?.(playlist)
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                console.log('BentoGrid: Keyboard click side playlist:', playlist)
                onPlaylistClick?.(playlist)
              }
            }}
          >
            <CoverArt hue={playlist.coverHue} label={playlist.title} />
            <div className="bento__card-content">
              <h3 className="bento__card-title">{playlist.title}</h3>
              <p className="bento__card-sub">{playlist.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
