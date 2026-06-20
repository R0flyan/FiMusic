import type { Playlist } from '../../data/mock'
import './BentoGrid.css'

interface BentoGridProps {
  hero: Playlist
  side: Playlist[]
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

export function BentoGrid({ hero, side }: BentoGridProps) {
  return (
    <section className="bento" aria-label="Рекомендации">
      <article className="bento__hero">
        <CoverArt hue={hero.coverHue} label={hero.title} />
        <div className="bento__hero-content">
          <span className="bento__label">Featured</span>
          <h2 className="bento__title">{hero.title}</h2>
          <p className="bento__subtitle">{hero.subtitle}</p>
          <div className="bento__meta">
            <span className="bento__count">{hero.trackCount} треков</span>
            <button type="button" className="bento__play">
              <PlayIcon />
              <span>Слушать</span>
            </button>
          </div>
        </div>
      </article>

      <div className="bento__side">
        {side.map((playlist) => (
          <article key={playlist.id} className="bento__card">
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
