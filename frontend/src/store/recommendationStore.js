import { create } from 'zustand'

export const useRecommendationStore = create((set) => ({
  thinking: false,
  results: [],
  currentStep: 0,

  setThinking: (thinking) => set({ thinking }),
  setResults: (results) => set({ results }),
  setCurrentStep: (currentStep) => set({ currentStep }),

  searchAndRecommend: async (seedTracks) => {
    set({ thinking: true, currentStep: 0, results: [] })

    try {
      // Step 1: Ingesting
      set({ currentStep: 1 })
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 2: Traversing
      set({ currentStep: 2 })
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 3: Reasoning
      set({ currentStep: 3 })
      const response = await fetch('/api/recommend/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seeds: seedTracks })
      })
      const data = await response.json()
      set({ results: data.recommendations || [] })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      set({ thinking: false })
    }
  }
}))