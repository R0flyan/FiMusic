import type { Playlist as ShowcasePlaylist, Track } from '../data/mock'
import type { Playlist } from '../App'
import { scrollPlaylists } from '../data/mock'
import { BentoGrid } from '../components/BentoGrid/BentoGrid'
import { WaveDivider } from '../components/WaveDivider/WaveDivider'
import { TrackRow } from '../components/TrackRow/TrackRow'
import { HorizontalScroll } from '../components/HorizontalScroll/HorizontalScroll'
import './DiscoverPage.css'

const uniqueById = (tracks: Track[]) => {
  const seen = new Set<number>()

  return tracks.filter((track) => {
    if (seen.has(track.id)) return false

    seen.add(track.id)
    return true
  })
}

const rotateTracks = (tracks: Track[], offset: number) => {
  if (tracks.length === 0) return []

  const normalizedOffset = ((offset % tracks.length) + tracks.length) % tracks.length
  return [...tracks.slice(normalizedOffset), ...tracks.slice(0, normalizedOffset)]
}

const getTrackSeconds = (duration: string | null) => {
  if (!duration) return 0

  const [minutes = '0', seconds = '0'] = duration.split(':')
  return Number(minutes) * 60 + Number(seconds)
}

const buildShowcasePlaylist = (
  id: number,
  title: string,
  subtitle: string,
  sourceTracks: Track[],
  coverHue: number,
  size?: 'hero' | 'small',
): ShowcasePlaylist => {
  const trackIds = uniqueById(sourceTracks).map((track) => track.id)

  return {
    id,
    title,
    subtitle,
    trackCount: trackIds.length,
    coverHue,
    size,
    trackIds,
  }
}

const buildShowcasePlaylists = (tracks: Track[]) => {
  const library = uniqueById(tracks)
  const favoriteTracks = library.filter((track) => track.isFavorite)
  const longTracks = library.filter((track) => getTrackSeconds(track.duration) >= 180)
  const shortTracks = library.filter((track) => {
    const seconds = getTrackSeconds(track.duration)
    return seconds > 0 && seconds < 180
  })
  const artistSpread = library.filter(
    (track, index, list) =>
      list.findIndex((item) => item.artist === track.artist) === index,
  )

  const heroSource = [
    ...favoriteTracks,
    ...rotateTracks(library, 2),
  ].slice(0, 12)
  const freshSource = rotateTracks(library, Math.max(library.length - 6, 0)).slice(0, 8)
  const focusSource = [
    ...longTracks,
    ...rotateTracks(library, 4),
  ].slice(0, 8)
  const discoverySource = [
    ...artistSpread,
    ...shortTracks,
    ...rotateTracks(library, 7),
  ].slice(0, 10)
  const roadSource = [
    ...shortTracks,
    ...rotateTracks(library, 1),
  ].slice(0, 8)
  const deepSource = rotateTracks(library, 5).slice(0, 10)

  return {
    hero: buildShowcasePlaylist(
      100,
      favoriteTracks.length > 0 ? 'Твой вайб' : 'Ночной поток',
      favoriteTracks.length > 0
        ? 'Микс из избранного и похожих треков'
        : 'Плавный поток для позднего вечера',
      heroSource,
      265,
      'hero',
    ),
    side: [
      buildShowcasePlaylist(
        101,
        'Свежий срез',
        'Новые позиции из медиатеки',
        freshSource,
        205,
        'small',
      ),
      buildShowcasePlaylist(
        102,
        'Фокус микс',
        'Более длинные треки без суеты',
        focusSource,
        320,
        'small',
      ),
    ],
    scroll: [
      buildShowcasePlaylist(
        103,
        'Открытия',
        'Разные исполнители',
        discoverySource,
        150,
      ),
      buildShowcasePlaylist(
        104,
        'Короткий маршрут',
        'Быстрый плейлист',
        roadSource,
        30,
      ),
      buildShowcasePlaylist(
        105,
        'Глубже в каталог',
        'Другой порядок знакомых треков',
        deepSource,
        215,
      ),
    ],
  }
}

interface DiscoverPageProps {
  tracks: Track[]
  title?: string
  emptyText?: string
  currentTrack: Track
  isPlaying: boolean
  playlists: Playlist[]
  playlistTrackIdsByPlaylist: Record<number, number[]>
  onPlayTrack: (track: Track) => void
  onToggleFavorite: (track: Track) => void
  onAddTrackToPlaylist: (playlist: Playlist, track: Track) => void | Promise<void>
  onOpenPlaylist?: (playlist: Playlist) => void
}

export function DiscoverPage({
  tracks,
  title,
  emptyText = 'Треки не найдены',
  currentTrack,
  isPlaying,
  playlists,
  playlistTrackIdsByPlaylist,
  onPlayTrack,
  onToggleFavorite,
  onAddTrackToPlaylist,
  onOpenPlaylist,
}: DiscoverPageProps) {
  const showcasePlaylists = buildShowcasePlaylists(tracks)

  const handleMockPlaylistClick = (mockPlaylist: ShowcasePlaylist) => {
    if (!onOpenPlaylist) return
    
    const playlist: Playlist = {
      id: Number(mockPlaylist.id),
      title: mockPlaylist.title,
      description: mockPlaylist.subtitle,
      coverPath: null,
      coverUrl: null,
      trackCount: mockPlaylist.trackCount,
      trackIds: mockPlaylist.trackIds,
    }

    onOpenPlaylist(playlist)
  }

  return (
    <div className="discover">
      <div className="discover__hero-text">
        <h1 className="discover__heading">Рекомендация</h1>
        <p className="discover__tagline">Поток музыки, подобранный для вас</p>
      </div>

      <BentoGrid 
        hero={showcasePlaylists.hero} 
        side={showcasePlaylists.side}
        onPlaylistClick={handleMockPlaylistClick}
      />

      <WaveDivider />

      <section className="discover__tracks">
        <h2 className="discover__section-title">Недавно слушали</h2>
        {title && <p className="discover__page-label">{title}</p>}
        <div className="discover__track-list" role="table">
          {tracks.length > 0 ? (
            tracks.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                index={i + 1}
                isPlaying={isPlaying && currentTrack.id === track.id}
                playlists={playlists}
                playlistTrackIdsByPlaylist={playlistTrackIdsByPlaylist}
                onPlay={onPlayTrack}
                onToggleFavorite={onToggleFavorite}
                onAddToPlaylist={onAddTrackToPlaylist}
              />
            ))
          ) : (
            <p className="discover__empty">{emptyText}</p>
          )}
        </div>
      </section>

      <HorizontalScroll 
        title="Подборки" 
        playlists={[...showcasePlaylists.scroll, ...scrollPlaylists]}
        onPlaylistClick={handleMockPlaylistClick}
      />
    </div>
  )
}
