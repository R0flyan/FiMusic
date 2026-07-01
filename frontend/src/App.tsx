import { useCallback, useEffect, useMemo, useState } from 'react'
import { MainLayout } from './layouts/MainLayout'
import { DiscoverPage } from './pages/DiscoverPage'
import { FavoriteTracksPage } from './pages/FavoriteTracksPage'
import { PlaylistsPage } from './pages/PlaylistsPage'
import { SearchPage } from './pages/SearchPage'
import { FloatingPlayer } from './components/FloatingPlayer/FloatingPlayer'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { useAuth } from './context/AuthContext'
import { API_URL } from './config'
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

const toMediaUrl = (path: string, cacheKey?: string | number) => {
  const encodedPath = path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')

  return `${API_URL}${encodedPath}${cacheKey ? `?v=${cacheKey}` : ''}`
}

const mapApiTrack = (track: ApiTrack, index: number): Track => ({
  id: track.id,
  title: track.title,
  artist: track.artist,
  album: track.album,
  duration: track.duration,
  audioUrl: toMediaUrl(track.file_path, track.id),
  coverUrl: track.cover_path ? toMediaUrl(track.cover_path, track.id) : null,
  coverHue: index * 55,
  isFavorite: track.is_favorite,
})

const mapApiPlaylist = (playlist: ApiPlaylist): Playlist => ({
  id: playlist.id,
  title: playlist.title,
  description: playlist.description,
  coverPath: playlist.cover_path,
  coverUrl: playlist.cover_path ? toMediaUrl(playlist.cover_path, playlist.id) : null,
  trackCount: playlist.track_count,
})

function App() {
  const { user, token, isLoading } = useAuth()
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
  const authHeaders = useMemo<HeadersInit | undefined>(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  )
  const jsonAuthHeaders = useMemo<HeadersInit>(
    () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (!token) {
        return headers
      }

      headers.Authorization = `Bearer ${token}`
      return headers
    },
    [token],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    if (!user || !token) {
      setTracks([])
      setPlaybackQueue([])
      setPlaylists([])
      setSelectedPlaylist(null)
      setPlaylistTracks([])
      setIsPlaying(false)
      return
    }

    fetch(`${API_URL}/tracks`, {
      headers: authHeaders,
    })
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
  }, [authHeaders, token, user])

  const loadPlaylists = useCallback(() => {
    if (!user || !token) return

    fetch(`${API_URL}/playlists`, {
      headers: authHeaders,
    })
      .then((res) => res.json())
      .then((data: ApiPlaylist[]) => {
        setPlaylists(data.map(mapApiPlaylist))
      })
  }, [authHeaders, token, user])

  useEffect(() => {
    loadPlaylists()
  }, [loadPlaylists])

  const handleOpenPlaylist = async (playlist: Playlist) => {
    const response = await fetch(`${API_URL}/playlists/${playlist.id}`, {
      headers: authHeaders,
    })
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
      headers: jsonAuthHeaders,
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
      headers: authHeaders,
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
      headers: authHeaders,
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

  const updateCurrentTrack = (nextIndex: number) => {
    const nextTrack = playbackQueue[nextIndex]
    if (!nextTrack) return

    setCurrentTrackIndex(nextIndex)
    localStorage.setItem('currentTrackId', nextTrack.id.toString())
    localStorage.removeItem('currentTrackTime')
    setIsPlaying(true)
  }

  const getActualCurrentTrackIndex = () => {
    if (!currentTrack) return currentTrackIndex

    const actualIndex = playbackQueue.findIndex((track) => track.id === currentTrack.id)
    return actualIndex >= 0 ? actualIndex : currentTrackIndex
  }

  const handleNextTrack = () => {
    if (playbackQueue.length === 0) return

    if (isShuffle) {
      handleRandomTrack()
      return
    }

    const actualIndex = getActualCurrentTrackIndex()
    const nextIndex = (actualIndex + 1) % playbackQueue.length
    updateCurrentTrack(nextIndex)
  }

  const handlePreviousTrack = () => {
    if (playbackQueue.length === 0) return

    const actualIndex = getActualCurrentTrackIndex()
    const previousIndex = (actualIndex - 1 + playbackQueue.length) % playbackQueue.length
    updateCurrentTrack(previousIndex)
  }

  const getRandomTrackIndex = () => {
    if (playbackQueue.length <= 1) return 0

    const actualIndex = getActualCurrentTrackIndex()
    let randomIndex = actualIndex

    while (randomIndex === actualIndex) {
      randomIndex = Math.floor(Math.random() * playbackQueue.length)
    }

    return randomIndex
  }

  const handleRandomTrack = () => {
    if (playbackQueue.length === 0) return

    const randomIndex = getRandomTrackIndex()

    updateCurrentTrack(randomIndex)
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
        headers: authHeaders,
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
