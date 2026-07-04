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

const getSharedTrackId = () => {
  const match = window.location.pathname.match(/^\/track\/(\d+)$/)
  return match ? Number(match[1]) : null
}

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
  const [playlistTrackIdsByPlaylist, setPlaylistTrackIdsByPlaylist] = useState<
    Record<number, number[]>
  >({})
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([])
  const [recommendationTracks, setRecommendationTracks] = useState<Track[]>([])
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
      setPlaylistTrackIdsByPlaylist({})
      setSelectedPlaylist(null)
      setPlaylistTracks([])
      setRecommendationTracks([])
      setIsPlaying(false)
      return
    }

    fetch(`${API_URL}/tracks`, {
      headers: authHeaders,
    })
      .then((res) => res.json())
      .then((data: ApiTrack[]) => {
        const mappedTracks = data.map(mapApiTrack)
        const sharedTrackId = getSharedTrackId()

        const sharedIndex = sharedTrackId
          ? mappedTracks.findIndex((track) => track.id === sharedTrackId)
          : -1

        const savedTrackId = localStorage.getItem('currentTrackId')
        const savedIndex = savedTrackId
          ? mappedTracks.findIndex((track) => track.id === Number(savedTrackId))
          : 0

        setTracks(mappedTracks)
        setPlaybackQueue(mappedTracks)

        if (sharedIndex >= 0) {
          setCurrentTrackIndex(sharedIndex)
          setActivePage('home')
          return
        }

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
        const mappedPlaylists = data.map(mapApiPlaylist)
        setPlaylists(mappedPlaylists)

        return Promise.all(
          mappedPlaylists.map((playlist) =>
            fetch(`${API_URL}/playlists/${playlist.id}`, {
              headers: authHeaders,
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((detail: ApiPlaylistDetail | null) => [
                playlist.id,
                detail?.tracks.map((track) => track.id) ?? [],
              ] as const),
          ),
        )
      })
      .then((entries) => {
        if (!entries) return

        setPlaylistTrackIdsByPlaylist(Object.fromEntries(entries))
      })
  }, [authHeaders, token, user])

  useEffect(() => {
    loadPlaylists()
  }, [loadPlaylists])

  const loadRecommendations = useCallback(() => {
    if (!user || !token) {
      console.log('Skipping recommendations - no user or token')
      return
    }

    console.log('Loading recommendations...')
    fetch(`${API_URL}/recommendations/playlist`, {
      headers: authHeaders,
    })
      .then((res) => {
        console.log('Recommendations API response:', res.status)
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        console.log('Recommendations data received:', data)
        const mapped = data.tracks.map(mapApiTrack)
        console.log('Mapped tracks:', mapped.length)
        setRecommendationTracks(mapped)
      })
      .catch((err) => {
        console.error('Failed to load recommendations:', err)
      })
  }, [token, user, authHeaders])

  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  const getMockPlaylistTracks = (playlistId: number): Track[] => {
    if (tracks.length === 0) return []
    
    // Create a deterministic mapping of playlist ID to track indices
    const startIndex = ((playlistId - 100) * 5) % tracks.length
    const endIndex = Math.min(startIndex + 15, tracks.length)
    
    return tracks.slice(startIndex, endIndex)
  }

  const handleOpenPlaylist = async (playlist: Playlist) => {
    // Check if it's a mock playlist (IDs 100-112)
    const isMockPlaylist = typeof playlist.id === 'number' && playlist.id >= 100 && playlist.id <= 112
    
    if (isMockPlaylist) {
      // Set the mock playlist with tracks from the main library
      setSelectedPlaylist(playlist)
      setPlaylistTracks(getMockPlaylistTracks(playlist.id as number))
      setActivePage('playlists')
      return
    }

    const response = await fetch(`${API_URL}/playlists/${playlist.id}`, {
      headers: authHeaders,
    })
    if (!response.ok) return

    const data: ApiPlaylistDetail = await response.json()
    setSelectedPlaylist(mapApiPlaylist(data))
    const mappedTracks = data.tracks.map(mapApiTrack)
    setPlaylistTracks(mappedTracks)
    setPlaylistTrackIdsByPlaylist((current) => ({
      ...current,
      [data.id]: mappedTracks.map((track) => track.id),
    }))
    setActivePage('playlists')
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
    const mappedPlaylist = mapApiPlaylist(playlist)
    setPlaylists((currentPlaylists) => [mappedPlaylist, ...currentPlaylists])
    setPlaylistTrackIdsByPlaylist((current) => ({
      ...current,
      [mappedPlaylist.id]: [],
    }))
  }

  const handleDeletePlaylist = async (playlist: Playlist) => {
    const shouldDelete = window.confirm(`Вы уверены, что хотите удалить плейлист "${playlist.title}"?`)
    if (!shouldDelete) return

    const response = await fetch(`${API_URL}/playlists/${playlist.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    })

    if (!response.ok) return

    setPlaylists((currentPlaylists) =>
      currentPlaylists.filter((item) => item.id !== playlist.id),
    )
    setPlaylistTrackIdsByPlaylist((current) => {
      const next = { ...current }
      delete next[playlist.id]
      return next
    })
    setSelectedPlaylist(null)
    setPlaylistTracks([])
  }

  const handleAddTrackToPlaylist = async (playlist: Playlist, track: Track) => {
    const response = await fetch(`${API_URL}/playlists/${playlist.id}/tracks/${track.id}`, {
      method: 'POST',
      headers: authHeaders,
    })

    if (!response.ok) return

    const data: ApiPlaylistDetail = await response.json()
    const updatedPlaylist = mapApiPlaylist(data)
    const updatedTracks = data.tracks.map(mapApiTrack)

    setSelectedPlaylist(updatedPlaylist)
    setPlaylistTracks(updatedTracks)
    setPlaylistTrackIdsByPlaylist((current) => ({
      ...current,
      [updatedPlaylist.id]: updatedTracks.map((item) => item.id),
    }))
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
    setPlaylistTrackIdsByPlaylist((current) => ({
      ...current,
      [playlist.id]: nextTracks.map((item) => item.id),
    }))
    setPlaylists((currentPlaylists) =>
      currentPlaylists.map((item) => (item.id === updatedPlaylist.id ? updatedPlaylist : item)),
    )
  }

  const getQueueForTrack = (track: Track) => {
    if (recommendationTracks.some((item) => item.id === track.id)) {
      return recommendationTracks
    }

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
    setRecommendationTracks((currentTracks) =>
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
      setRecommendationTracks((currentTracks) =>
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
              playlists={playlists}
              playlistTrackIdsByPlaylist={playlistTrackIdsByPlaylist}
              onPlayTrack={handlePlayTrack}
              onToggleFavorite={handleToggleFavorite}
              onAddTrackToPlaylist={handleAddTrackToPlaylist}
            />
          ) : visiblePage === 'playlists' ? (
            <PlaylistsPage
              tracks={tracks}
              playlists={playlists}
              selectedPlaylist={selectedPlaylist}
              playlistTracks={playlistTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playlistTrackIdsByPlaylist={playlistTrackIdsByPlaylist}
              onCreatePlaylist={handleCreatePlaylist}
              onOpenPlaylist={handleOpenPlaylist}
              onClosePlaylist={handleClosePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
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
              playlists={playlists}
              playlistTrackIdsByPlaylist={playlistTrackIdsByPlaylist}
              onPlayTrack={handlePlayTrack}
              onToggleFavorite={handleToggleFavorite}
              onAddTrackToPlaylist={handleAddTrackToPlaylist}
            />
          ) : (
            <DiscoverPage
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playlists={playlists}
              playlistTrackIdsByPlaylist={playlistTrackIdsByPlaylist}
              onPlayTrack={handlePlayTrack}
              onToggleFavorite={handleToggleFavorite}
              onAddTrackToPlaylist={handleAddTrackToPlaylist}
              onOpenPlaylist={handleOpenPlaylist}
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
