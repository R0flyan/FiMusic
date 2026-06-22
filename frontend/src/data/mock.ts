export interface Track {
  id: number
  title: string
  artist: string
  album: string | null
  duration: string | null
  audioUrl: string
  coverUrl: string | null
  coverHue: number
}

export interface Playlist {
  id: string
  title: string
  subtitle: string
  trackCount: number
  coverHue: number
  size?: 'hero' | 'small'
}

export const featuredPlaylist: Playlist = {
  id: '1',
  title: 'Midnight Currents',
  subtitle: 'Плавный поток для поздней ночи',
  trackCount: 42,
  coverHue: 24,
  size: 'hero',
}

export const sidePlaylists: Playlist[] = [
  {
    id: '2',
    title: 'Fresh Drops',
    subtitle: 'Новинки недели',
    trackCount: 18,
    coverHue: 200,
    size: 'small',
  },
  {
    id: '3',
    title: 'For You',
    subtitle: 'Подобрано алгоритмом',
    trackCount: 30,
    coverHue: 320,
    size: 'small',
  },
]

// export const recentTracks: Track[] = [
//   {
//     id: 't1',
//     title: 'Glass Horizon',
//     artist: 'Nova Pulse',
//     album: 'Currents',
//     duration: '3:42',
//     coverHue: 180,
//   },
//   {
//     id: 't2',
//     title: 'Amber Tide',
//     artist: 'Lumen',
//     album: 'Flux State',
//     duration: '4:18',
//     coverHue: 30,
//   },
//   {
//     id: 't3',
//     title: 'Static Bloom',
//     artist: 'Echo Frame',
//     album: 'Sharp Edges',
//     duration: '2:56',
//     coverHue: 280,
//   },
//   {
//     id: 't4',
//     title: 'Undertow',
//     artist: 'Maris',
//     album: 'Deep Flow',
//     duration: '5:03',
//     coverHue: 210,
//   },
//   {
//     id: 't5',
//     title: 'Cut Wave',
//     artist: 'Syllable',
//     album: 'Mono',
//     duration: '3:11',
//     coverHue: 0,
//   },
// ]

export const scrollPlaylists: Playlist[] = [
  {
    id: 'p1',
    title: 'Indie Flow',
    subtitle: '42 трека',
    trackCount: 42,
    coverHue: 150,
  },
  {
    id: 'p2',
    title: 'Electronic Ripples',
    subtitle: '28 треков',
    trackCount: 28,
    coverHue: 260,
  },
  {
    id: 'p3',
    title: 'Jazz Current',
    subtitle: '35 треков',
    trackCount: 35,
    coverHue: 40,
  },
  {
    id: 'p4',
    title: 'Ambient Stream',
    subtitle: '50 треков',
    trackCount: 50,
    coverHue: 190,
  },
  {
    id: 'p5',
    title: 'Post-Rock Tide',
    subtitle: '22 трека',
    trackCount: 22,
    coverHue: 340,
  },
]

// export const nowPlaying: Track = recentTracks[0]
