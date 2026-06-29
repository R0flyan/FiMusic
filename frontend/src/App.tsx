import { useCallback, useEffect, useState } from 'react'
import { MainLayout } from './layouts/MainLayout'
import { DiscoverPage } from './pages/DiscoverPage'
import { FavoriteTracksPage } from './pages/FavoriteTracksPage'
import { PlaylistsPage } from './pages/PlaylistsPage'
import { SearchPage } from './pages/SearchPage'
import { FloatingPlayer } from './components/FloatingPlayer/FloatingPlayer'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { useAuth } from './context/AuthContext'
import type { Track } from './data/mock'

interface ApiTrack {
  id: number
  title: string
  artist: string
  album: string | null
  duration: string | null
  file_path: string
  cover_path: string | null
  is_favorite: boolean
}

const API_URL = 'http://localhost:8080'
type MainPage = 'home' | 'search' | 'playlists' | 'liked'
type AppPage = MainPage | 'login' | 'register'

export interface Playlist {
  id: number
  title: string
  description: string | null
  coverPath: string | null
  coverUrl: string | null
  trackCount: number
}

interface ApiPlaylist {
  id: number
  title: string
  description: string | null
  cover_path: string | null
  track_count: number
}

interface ApiPlaylistDetail extends ApiPlaylist {
  tracks: ApiTrack[]
}

const mapApiTrack = (track: ApiTrack, index: number): Track => ({
  id: track.id,
  title: track.title,
  artist: track.artist,
  album: track.album,
  duration: track.duration,
  audioUrl: `${API_URL}${track.file_path}`,
  coverUrl: track.cover_path ? `${API_URL}${track.cover_path}` : null,
  coverHue: index * 55,
  isFavorite: track.is_favorite,
})

const mapApiPlaylist = (playlist: ApiPlaylist): Playlist => ({
  id: playlist.id,
  title: playlist.title,
  description: playlist.description,
  coverPath: playlist.cover_path,
  coverUrl: playlist.cover_path ? `${API_URL}${playlist.cover_path}` : null,
  trackCount: playlist.track_count,
})

function App() {
  const { user, isLoading } = useAuth()
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [playbackQueue, setPlaybackQueue] = useState<Track[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [activePage, setActivePage] = useState<AppPage>('home')
  const currentTrack = playbackQueue[currentTrackIndex] ?? null
  const favoriteTracks = tracks.filter((track) => track.isFavorite)
  const visiblePage: AppPage =
    !user && activePage !== 'login' && activePage !== 'register'
      ? 'login'
      : user && (activePage === 'login' || activePage === 'register')
        ? 'home'
        : activePage

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    if (!user) {
      setTracks([])
      setPlaybackQueue([])
      setPlaylists([])
      setSelectedPlaylist(null)
      setPlaylistTracks([])
      setIsPlaying(false)
      return
    }

    fetch(`${API_URL}/tracks`)
      .then((res) => res.json())
      .then((data: ApiTrack[]) => {
        const mappedTracks = data.map(mapApiTrack)

        const savedTrackId = localStorage.getItem('currentTrackId')
        const savedIndex = savedTrackId
          ? mappedTracks.findIndex((track) => track.id === Number(savedTrackId))
          : 0

        setTracks(mappedTracks)
        setPlaybackQueue(mappedTracks)
        setCurrentTrackIndex(savedIndex >= 0 ? savedIndex : 0)
      })
  }, [user])

  const loadPlaylists = useCallback(() => {
    if (!user) return

    fetch(`${API_URL}/playlists`)
      .then((res) => res.json())
      .then((data: ApiPlaylist[]) => {
        setPlaylists(data.map(mapApiPlaylist))
      })
  }, [user])

  useEffect(() => {
    loadPlaylists()
  }, [loadPlaylists])

  const handleOpenPlaylist = async (playlist: Playlist) => {
    const response = await fetch(`${API_URL}/playlists/${playlist.id}`)
    if (!response.ok) return

    const data: ApiPlaylistDetail = await response.json()
    setSelectedPlaylist(mapApiPlaylist(data))
    setPlaylistTracks(data.tracks.map(mapApiTrack))
  }

  const handleClosePlaylist = () => {
    setSelectedPlaylist(null)
    setPlaylistTracks([])
  }

  const handleCreatePlaylist = async (title: string) => {
    const response = await fetch(`${API_URL}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
      }),
    })

    if (!response.ok) return

    const playlist: ApiPlaylist = await response.json()
    setPlaylists((currentPlaylists) => [mapApiPlaylist(playlist), ...currentPlaylists])
  }

  const handleAddTrackToPlaylist = async (playlist: Playlist, track: Track) => {
    const response = await fetch(`${API_URL}/playlists/${playlist.id}/tracks/${track.id}`, {
      method: 'POST',
    })

    if (!response.ok) return

    const data: ApiPlaylistDetail = await response.json()
    const updatedPlaylist = mapApiPlaylist(data)

    setSelectedPlaylist(updatedPlaylist)
    setPlaylistTracks(data.tracks.map(mapApiTrack))
    setPlaylists((currentPlaylists) =>
      currentPlaylists.map((item) => (item.id === updatedPlaylist.id ? updatedPlaylist : item)),
    )
  }

  const handleRemoveTrackFromPlaylist = async (playlist: Playlist, track: Track) => {
    const response = await fetch(`${API_URL}/playlists/${playlist.id}/tracks/${track.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) return

    const nextTracks = playlistTracks.filter((item) => item.id !== track.id)
    const updatedPlaylist = {
      ...playlist,
      trackCount: Math.max(playlist.trackCount - 1, 0),
    }

    setSelectedPlaylist(updatedPlaylist)
    setPlaylistTracks(nextTracks)
    setPlaylists((currentPlaylists) =>
      currentPlaylists.map((item) => (item.id === updatedPlaylist.id ? updatedPlaylist : item)),
    )
  }

  const getQueueForTrack = (track: Track) => {
    if (visiblePage === 'playlists' && selectedPlaylist && playlistTracks.length > 0) {
      return playlistTracks
    }

    if (visiblePage === 'liked' && favoriteTracks.some((item) => item.id === track.id)) {
      return favoriteTracks
    }

    return tracks
  }

  const handlePlayTrack = (track: Track) => {
    const nextQueue = getQueueForTrack(track)
    const index = nextQueue.findIndex((item) => item.id === track.id)
    if (index === -1) return

    setPlaybackQueue(nextQueue)
    setCurrentTrackIndex(index)
    localStorage.setItem('currentTrackId', track.id.toString())
    localStorage.removeItem('currentTrackTime')
    setIsPlaying(true)
  }

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((v) => !v)
  }, [])

  const handleNextTrack = () => {
    if (playbackQueue.length === 0) return

    if (isShuffle) {
      handleRandomTrack()
      return
    }

    setCurrentTrackIndex((index) => {
      const nextIndex = (index + 1) % playbackQueue.length
      localStorage.setItem('currentTrackId', playbackQueue[nextIndex].id.toString())
      localStorage.removeItem('currentTrackTime')
      return nextIndex
    })
    setIsPlaying(true)
  }

  const handlePreviousTrack = () => {
    if (playbackQueue.length === 0) return

    setCurrentTrackIndex((index) => {
      const previousIndex = (index - 1 + playbackQueue.length) % playbackQueue.length
      localStorage.setItem('currentTrackId', playbackQueue[previousIndex].id.toString())
      localStorage.removeItem('currentTrackTime')
      return previousIndex
    })
    setIsPlaying(true)
  }

  const getRandomTrackIndex = () => {
    if (playbackQueue.length <= 1) return 0

    let randomIndex = currentTrackIndex

    while (randomIndex === currentTrackIndex) {
      randomIndex = Math.floor(Math.random() * playbackQueue.length)
    }

    return randomIndex
  }

  const handleRandomTrack = () => {
    if (playbackQueue.length === 0) return

    const randomIndex = getRandomTrackIndex()

    setCurrentTrackIndex(randomIndex)
    localStorage.setItem('currentTrackId', playbackQueue[randomIndex].id.toString())
    localStorage.removeItem('currentTrackTime')
    setIsPlaying(true)
  }

  const handlePlaybackEnd = () => {
    handleNextTrack()
  }

  const handleToggleFavorite = async (track: Track) => {
    const nextIsFavorite = !track.isFavorite

    setTracks((currentTracks) =>
      currentTracks.map((item) =>
        item.id === track.id ? { ...item, isFavorite: nextIsFavorite } : item,
      ),
    )
    setPlaylistTracks((currentTracks) =>
      currentTracks.map((item) =>
        item.id === track.id ? { ...item, isFavorite: nextIsFavorite } : item,
      ),
    )
    setPlaybackQueue((currentTracks) =>
      currentTracks.map((item) =>
        item.id === track.id ? { ...item, isFavorite: nextIsFavorite } : item,
      ),
    )

    try {
      const response = await fetch(`${API_URL}/tracks/${track.id}/favorite`, {
        method: nextIsFavorite ? 'POST' : 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to toggle favorite')
      }
    } catch {
      setTracks((currentTracks) =>
        currentTracks.map((item) =>
          item.id === track.id ? { ...item, isFavorite: track.isFavorite } : item,
        ),
      )
      setPlaylistTracks((currentTracks) =>
        currentTracks.map((item) =>
          item.id === track.id ? { ...item, isFavorite: track.isFavorite } : item,
        ),
      )
      setPlaybackQueue((currentTracks) =>
        currentTracks.map((item) =>
          item.id === track.id ? { ...item, isFavorite: track.isFavorite } : item,
        ),
      )
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        Загрузка...
      </div>
    )
  }

  if (visiblePage === 'login') {
    return <LoginPage onSwitchToRegister={() => setActivePage('register')} />
  }

  if (visiblePage === 'register') {
    return <RegisterPage onSwitchToLogin={() => setActivePage('login')} />
  }

  return (
    <MainLayout
      activePage={visiblePage}
      isDark={isDark}
      onNavigate={setActivePage}
      onThemeToggle={() => setIsDark((v) => !v)}
    >
      {currentTrack && (
        <>
          {visiblePage === 'search' ? (
            <SearchPage
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : visiblePage === 'playlists' ? (
            <PlaylistsPage
              tracks={tracks}
              playlists={playlists}
              selectedPlaylist={selectedPlaylist}
              playlistTracks={playlistTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onCreatePlaylist={handleCreatePlaylist}
              onOpenPlaylist={handleOpenPlaylist}
              onClosePlaylist={handleClosePlaylist}
              onAddTrackToPlaylist={handleAddTrackToPlaylist}
              onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
              onPlayTrack={handlePlayTrack}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : visiblePage === 'liked' ? (
            <FavoriteTracksPage
              tracks={favoriteTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <DiscoverPage
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          <FloatingPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            isShuffle={isShuffle}
            onToggleFavorite={handleToggleFavorite}
            onTogglePlay={handleTogglePlay}
            onPlaybackEnd={handlePlaybackEnd}
            onNextTrack={handleNextTrack}
            onPreviousTrack={handlePreviousTrack}
            onToggleShuffle={() => setIsShuffle((value) => !value)}
          />
        </>
      )}
    </MainLayout>
  )
}

export default App
