export interface Track {
  id: number
  title: string
  artist: string
  album: string | null
  duration: string | null
  audioUrl: string
  coverUrl: string | null
  coverHue: number
  isFavorite: boolean
}

export interface Playlist {
  id: string | number
  title: string
  subtitle: string
  trackCount: number
  coverHue: number
  size?: 'hero' | 'small'
}

export const featuredPlaylist: Playlist = {
  id: 100,
  title: 'Ночной вайб',
  subtitle: 'Плавный поток для поздней ночи',
  trackCount: 35,
  coverHue: 24,
  size: 'hero',
}

export const sidePlaylists: Playlist[] = [
  {
    id: 101,
    title: 'Свежие релизы',
    subtitle: 'Новинки недели',
    trackCount: 18,
    coverHue: 200,
    size: 'small',
  },
  {
    id: 102,
    title: 'Твой микс',
    subtitle: 'Подобрано алгоритмом',
    trackCount: 10,
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
    id: 103,
    title: 'Indie Flow',
    subtitle: '42 трека',
    trackCount: 42,
    coverHue: 150,
  },
  {
    id: 104,
    title: 'Electronic Ripples',
    subtitle: '28 треков',
    trackCount: 28,
    coverHue: 260,
  },
  {
    id: 105,
    title: 'Jazz Current',
    subtitle: '35 треков',
    trackCount: 35,
    coverHue: 40,
  },
  {
    id: 106,
    title: 'Ambient Stream',
    subtitle: '50 треков',
    trackCount: 50,
    coverHue: 190,
  },
  {
    id: 107,
    title: 'Post-Rock Tide',
    subtitle: '22 трека',
    trackCount: 22,
    coverHue: 340,
  },
  {
    id: 108,
    title: 'Lo-Fi Beats',
    subtitle: '38 треков',
    trackCount: 38,
    coverHue: 210,
  },
  {
    id: 109,
    title: 'Synthwave Dreams',
    subtitle: '31 трек',
    trackCount: 31,
    coverHue: 280,
  },
  {
    id: 110,
    title: 'Soul Classics',
    subtitle: '45 треков',
    trackCount: 45,
    coverHue: 30,
  },
  {
    id: 111,
    title: 'Deep House',
    subtitle: '52 трека',
    trackCount: 52,
    coverHue: 220,
  },
  {
    id: 112,
    title: 'Bedroom Pop',
    subtitle: '26 треков',
    trackCount: 26,
    coverHue: 310,
  },
]

// export const nowPlaying: Track = recentTracks[0]
