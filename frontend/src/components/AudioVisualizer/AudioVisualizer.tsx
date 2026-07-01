import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import './AudioVisualizer.css'

interface AudioVisualizerProps {
  audioRef: RefObject<HTMLAudioElement | null>
  isPlaying: boolean
  className?: string
}

interface AudioGraph {
  analyser: AnalyserNode
  data: Uint8Array<ArrayBuffer>
}

let audioContext: AudioContext | null = null
const audioGraphs = new WeakMap<HTMLMediaElement, AudioGraph>()
const BAR_COUNT = 24
const BAR_COLORS = ['#8b5cf6', '#d946ef', '#22d3ee']

function getAudioContext() {
  const AudioContextConstructor =
    window.AudioContext ||
    (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext

  if (!AudioContextConstructor) {
    return null
  }

  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContextConstructor()
  }

  return audioContext
}

function getAudioGraph(audio: HTMLAudioElement) {
  const existingGraph = audioGraphs.get(audio)
  if (existingGraph) return existingGraph

  const context = getAudioContext()
  if (!context) return null

  const source = context.createMediaElementSource(audio)
  const analyser = context.createAnalyser()

  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.68

  source.connect(analyser)
  analyser.connect(context.destination)

  const graph = {
    analyser,
    data: new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>,
  }

  audioGraphs.set(audio, graph)
  return graph
}

export function AudioVisualizer({ audioRef, isPlaying, className = '' }: AudioVisualizerProps) {
  const [audioVersion, setAudioVersion] = useState(0)
  const barsRef = useRef<Array<HTMLSpanElement | null>>([])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const refresh = () => setAudioVersion((value) => value + 1)

    audio.addEventListener('playing', refresh)
    audio.addEventListener('pause', refresh)
    audio.addEventListener('ended', refresh)
    audio.addEventListener('loadeddata', refresh)

    return () => {
      audio.removeEventListener('playing', refresh)
      audio.removeEventListener('pause', refresh)
      audio.removeEventListener('ended', refresh)
      audio.removeEventListener('loadeddata', refresh)
    }
  }, [audioRef, audioRef.current?.src])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio || !isPlaying || audio.paused || audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      barsRef.current.forEach((bar) => {
        if (bar) bar.style.transform = 'scaleY(0.35)'
      })
      return
    }

    let graph: AudioGraph | null = null

    try {
      graph = getAudioGraph(audio)
    } catch (error) {
      console.warn('Audio visualizer failed:', error)
      return
    }

    if (!graph) return

    if (audioContext?.state === 'suspended') {
      void audioContext.resume()
    }

    let frameId = 0

    const draw = () => {
      if (!isPlaying || audio.paused) {
        return
      }

      graph.analyser.getByteFrequencyData(graph.data)

      const bars = barsRef.current.filter(Boolean)
      const barValues = bars.map((_, index) => {
        const minBin = 1
        const maxBin = graph.data.length - 1
        const logMin = Math.log(minBin)
        const logMax = Math.log(maxBin)
        const startIndex = Math.floor(Math.exp(logMin + (index / bars.length) * (logMax - logMin)))
        const endIndex = Math.max(
          startIndex + 1,
          Math.floor(Math.exp(logMin + ((index + 1) / bars.length) * (logMax - logMin))),
        )
        let total = 0

        for (let dataIndex = startIndex; dataIndex <= Math.min(endIndex, maxBin); dataIndex += 1) {
          total += graph.data[dataIndex]
        }

        const average = total / (endIndex - startIndex + 1) / 255
        const position = index / Math.max(1, bars.length - 1)
        const frequencyWeight = 0.76 + position * 0.28

        return average * frequencyWeight
      })
      const framePeak = Math.max(0.16, ...barValues)

      bars.forEach((bar, index) => {
        if (!bar) return

        const normalizedValue = barValues[index] / framePeak
        const scale = Math.min(1.08, Math.max(0.16, normalizedValue ** 0.82 * 1.04))

        bar.style.transform = `scaleY(${scale})`
      })

      frameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [audioRef, audioVersion, isPlaying, audioRef.current?.src])

  return (
    <div
      className={`audio-visualizer audio-visualizer--realtime${isPlaying ? ' audio-visualizer--playing' : ''} ${className}`.trim()}
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }).map((_, index) => (
        <span
          key={index}
          style={{
            '--bar-color': BAR_COLORS[Math.floor((index / BAR_COUNT) * BAR_COLORS.length)],
          } as CSSProperties}
          ref={(element) => {
            barsRef.current[index] = element
          }}
        />
      ))}
    </div>
  )
}
