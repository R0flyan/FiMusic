import { useCallback, useEffect, useState } from 'react'
import { MainLayout } from './layouts/MainLayout'
import { DiscoverPage } from './pages/DiscoverPage'
import { FloatingPlayer } from './components/FloatingPlayer/FloatingPlayer'
import type { Track } from './data/mock'

interface ApiTrack {
  id: number
  title: string
  artist: string
  album: string | null
  duration: string | null
  file_path: string
  cover_path: string | null
}

const API_URL = 'http://localhost:8080'

function App() {
  const [isDark, setIsDark] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const currentTrack = tracks[currentTrackIndex] ?? null

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  useEffect(() => {
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
        }))

        setTracks(mappedTracks)
        setCurrentTrackIndex(0)
      })
  }, [])

  const handlePlayTrack = (track: Track) => {
    const index = tracks.findIndex((item) => item.id === track.id)
    if (index === -1) return

    setCurrentTrackIndex(index)
    setIsPlaying(true)
  }

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((v) => !v)
  }, [])

  const handleNextTrack = () => {
    if (tracks.length === 0) return

    setCurrentTrackIndex((index) => (index + 1) % tracks.length)
    setIsPlaying(true)
  }

  const handlePreviousTrack = () => {
    if (tracks.length === 0) return

    setCurrentTrackIndex((index) => (index - 1 + tracks.length) % tracks.length)
    setIsPlaying(true)
  }

  return (
    <MainLayout isDark={isDark} onThemeToggle={() => setIsDark((v) => !v)}>
      {currentTrack && (
        <>
          <DiscoverPage
            tracks={tracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
          />
          <FloatingPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onPlaybackEnd={handleNextTrack}
            onNextTrack={handleNextTrack}
            onPreviousTrack={handlePreviousTrack}
          />
        </>
      )}
    </MainLayout>
  )
}

export default App
