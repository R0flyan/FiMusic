import { useCallback, useEffect, useState } from 'react'
import { MainLayout } from './layouts/MainLayout'
import { DiscoverPage } from './pages/DiscoverPage'
import { FavoriteTracksPage } from './pages/FavoriteTracksPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { FloatingPlayer } from './components/FloatingPlayer/FloatingPlayer'
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
type AppPage = 'home' | 'liked' | 'login' | 'register'

function App() {
  const { user, isLoading } = useAuth()
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [activePage, setActivePage] = useState<AppPage>('home')
  const currentTrack = tracks[currentTrackIndex] ?? null
  const favoriteTracks = tracks.filter((track) => track.isFavorite)

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    // Показываем страницу входа только если пользователь не авторизован
    if (!isLoading && !user && (activePage === 'home' || activePage === 'liked')) {
      setActivePage('login')
    }
    // Если пользователь авторизован и на странице auth, переходим на home
    if (!isLoading && user && (activePage === 'login' || activePage === 'register')) {
      setActivePage('home')
    }
  }, [isLoading, user, activePage])

  useEffect(() => {
    if (!user) return // Не загружаем треки, если пользователь не авторизован

    fetch(`${API_URL}/tracks`)
      .then((res) => res.json())
      .then((data: ApiTrack[]) => {
        const mappedTracks: Track[] = data.map((track, index) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album,
          duration: track.duration,
          audioUrl: `${API_URL}${track.file_path}`,
          coverUrl: track.cover_path ? `${API_URL}${track.cover_path}` : null,
          coverHue: index * 55,
          isFavorite: track.is_favorite,
        }))

        const savedTrackId = localStorage.getItem('currentTrackId')
        const savedIndex = savedTrackId
          ? mappedTracks.findIndex((track) => track.id === Number(savedTrackId))
          : 0

        setTracks(mappedTracks)
        setCurrentTrackIndex(savedIndex >= 0 ? savedIndex : 0)
      })
  }, [user])

  const handlePlayTrack = (track: Track) => {
    const index = tracks.findIndex((item) => item.id === track.id)
    if (index === -1) return

    setCurrentTrackIndex(index)
    localStorage.setItem('currentTrackId', track.id.toString())
    localStorage.removeItem('currentTrackTime')
    setIsPlaying(true)
  }

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((v) => !v)
  }, [])

  const handleNextTrack = () => {
    if (tracks.length === 0) return

    setCurrentTrackIndex((index) => {
      const nextIndex = (index + 1) % tracks.length
      localStorage.setItem('currentTrackId', tracks[nextIndex].id.toString())
      localStorage.removeItem('currentTrackTime')
      return nextIndex
    })
    setIsPlaying(true)
  }

  const handlePreviousTrack = () => {
    if (tracks.length === 0) return

    setCurrentTrackIndex((index) => {
      const previousIndex = (index - 1 + tracks.length) % tracks.length
      localStorage.setItem('currentTrackId', tracks[previousIndex].id.toString())
      localStorage.removeItem('currentTrackTime')
      return previousIndex
    })
    setIsPlaying(true)
  }

  const getRandomTrackIndex = () => {
    if (tracks.length <= 1) return 0

    let randomIndex = currentTrackIndex

    while (randomIndex === currentTrackIndex) {
      randomIndex = Math.floor(Math.random() * tracks.length)
    }

    return randomIndex
  }

  const handleRandomTrack = () => {
    if (tracks.length === 0) return

    const randomIndex = getRandomTrackIndex()

    setCurrentTrackIndex(randomIndex)
    localStorage.setItem('currentTrackId', tracks[randomIndex].id.toString())
    localStorage.removeItem('currentTrackTime')
    setIsPlaying(true)
  }

  const handlePlaybackEnd = () => {
    if (isShuffle) {
      handleRandomTrack()
      return
    }

    handleNextTrack()
  }

  const handleToggleFavorite = async (track: Track) => {
    const nextIsFavorite = !track.isFavorite

    setTracks((currentTracks) =>
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
    }
  }

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Загрузка...</div>
  }

  // Показываем страницы авторизации
  if (activePage === 'login') {
    return <LoginPage onSwitchToRegister={() => setActivePage('register')} />
  }

  if (activePage === 'register') {
    return <RegisterPage onSwitchToLogin={() => setActivePage('login')} />
  }

  return (
    <MainLayout
      activePage={activePage}
      isDark={isDark}
      onNavigate={setActivePage}
      onThemeToggle={() => setIsDark((v) => !v)}
    >
      {currentTrack && (
        <>
          {activePage === 'liked' ? (
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