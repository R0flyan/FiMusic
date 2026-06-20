import { useEffect, useState } from 'react'
import { MainLayout } from './layouts/MainLayout'
import { DiscoverPage } from './pages/DiscoverPage'
import { FloatingPlayer } from './components/FloatingPlayer/FloatingPlayer'
import { nowPlaying, type Track } from './data/mock'

function App() {
  const [isDark, setIsDark] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<Track>(nowPlaying)

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  return (
    <MainLayout isDark={isDark} onThemeToggle={() => setIsDark((v) => !v)}>
      <DiscoverPage
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayTrack={handlePlayTrack}
      />
      <FloatingPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((v) => !v)}
      />
    </MainLayout>
  )
}

export default App
