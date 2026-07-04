import type { Track } from '../data/mock'
import { API_URL } from '../config'

interface TrackResponse {
  id: number
  title: string
  artist: string
  album: string | null
  duration: string | null
  file_path: string
  cover_path: string | null
  is_favorite: boolean
  created_at: string
}

export interface RecommendationResponse {
  id: number
  title: string
  description: string
  track_count: number
  tracks: TrackResponse[]
}

function mapTrackResponseToTrack(response: TrackResponse, index: number): Track {
  return {
    id: response.id,
    title: response.title,
    artist: response.artist,
    album: response.album,
    duration: response.duration,
    audioUrl: `${API_URL}${response.file_path}`,
    coverUrl: response.cover_path ? `${API_URL}${response.cover_path}` : null,
    coverHue: index * 55,
    isFavorite: response.is_favorite,
  }
}

export async function getRecommendationPlaylist(): Promise<{ playlist: RecommendationResponse; tracks: Track[] }> {
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('No authentication token found')
  }

  console.log('Fetching recommendations from:', `${API_URL}/recommendations/playlist`)
  
  const response = await fetch(`${API_URL}/recommendations/playlist`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  console.log('Recommendations response:', response.status, response.statusText)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error response body:', errorText)
    throw new Error(`Failed to get recommendations: ${response.statusText}`)
  }
  
  const data: RecommendationResponse = await response.json()
  console.log('Recommendations data:', data)
  
  return {
    playlist: data,
    tracks: data.tracks.map((track, index) => mapTrackResponseToTrack(track, index)),
  }
}

export async function regenerateRecommendations(): Promise<{ playlist: RecommendationResponse; tracks: Track[] }> {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_URL}/recommendations/regenerate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to regenerate recommendations')
  }
  
  const data: RecommendationResponse = await response.json()
  
  return {
    playlist: data,
    tracks: data.tracks.map((track, index) => mapTrackResponseToTrack(track, index)),
  }
}
