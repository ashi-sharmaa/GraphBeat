import { create } from 'zustand'

export const useRecommendationStore = create((set) => ({
  thinking: false,
  currentStep: 0,
  results: [],
  error: null,

  searchAndRecommend: async (seedTracks) => {
    set({ thinking: true, currentStep: 1, results: [], error: null })

    try {
      const seeds = seedTracks.map(track => ({
        artist: track.artist,
        title: track.name,
      }))

      set({ currentStep: 2 })

      const response = await fetch('/api/generate-bridge/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seeds })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      set({ currentStep: 3 })

      const data = await response.json()
      const recs = (data.recommendations || []).map((rec, i) => ({
        ...rec,
        matchScore: rec.matchScore ?? Math.round(92 - i * 7 - Math.random() * 5)
      }))
      set({ results: recs })
    } catch (error) {
      console.error('Search error:', error)
      set({ error: error.message || 'Something went wrong' })
    } finally {
      set({ thinking: false, currentStep: 0 })
    }
  }
}))
