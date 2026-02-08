import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import DebouncedSearchBar from './DebouncedSearchBar'

const SEED_LIMIT = 3
const AUTOCOMPLETE_LIMIT = 20

async function searchTracks(query) {
  const apiKey = import.meta.env.VITE_LASTFM_API_KEY
  if (!apiKey) return []

  const response = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${apiKey}&format=json&limit=${AUTOCOMPLETE_LIMIT}`
  )
  if (!response.ok) return []

  const data = await response.json()
  return (data.results?.trackmatches?.track || []).filter(
    track => track.name && track.artist && parseInt(track.listeners) > 0
  )
}

export default function SeedInput({ onSearch }) {
  const [seeds, setSeeds] = useState([null])
  const [searchQueries, setSearchQueries] = useState({})
  const [searchResults, setSearchResults] = useState({})

  const handleSearch = useCallback(async (query, slotIndex) => {
    if (!query.trim()) {
      setSearchResults(prev => ({ ...prev, [slotIndex]: [] }))
      return
    }

    try {
      const tracks = await searchTracks(query)
      setSearchResults(prev => ({ ...prev, [slotIndex]: tracks }))
    } catch (error) {
      console.error('Search failed:', error)
    }
  }, [])

  const handleSelectTrack = useCallback((slotIndex, track) => {
    const newSeeds = [...seeds]
    newSeeds[slotIndex] = track
    setSeeds(newSeeds)
    setSearchQueries(prev => ({ ...prev, [slotIndex]: '' }))
    setSearchResults(prev => ({ ...prev, [slotIndex]: [] }))
  }, [seeds])

  const handleAddSeed = () => {
    if (seeds.length < SEED_LIMIT) {
      setSeeds([...seeds, null])
    }
  }

  const handleRemoveSeed = (index) => {
    const newSeeds = seeds.filter((_, i) => i !== index)
    setSeeds(newSeeds)
  }

  const handleSubmit = () => {
    const validSeeds = seeds.filter(s => s !== null)
    if (validSeeds.length >= 2) {
      onSearch(validSeeds)
    }
  }

  return (
    <div className="bg-transparent rounded-xl p-8 mb-8 border border-transparent">
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {seeds.map((seed, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-3 flex flex-col border border-gray-700 w-full sm:w-72">
            <div className="flex items-center justify-between mb-2 h-5">
              <div className="text-sm font-semibold bg-linear-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent uppercase tracking-wider">
                Seed {index + 1}
              </div>
              {seeds.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSeed(index)}
                  className="h-5 w-5 p-0 cursor-pointer text-gray-500 hover:text-white"
                >
                  ✕
                </Button>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <DebouncedSearchBar
                value={searchQueries[index] || ''}
                onChange={(query) => {
                  setSearchQueries(prev => ({ ...prev, [index]: query }))
                }}
                onSearch={(query) => handleSearch(query, index)}
                placeholder={`Add track ${index + 1}...`}
                results={searchResults[index] || []}
                onSelectResult={(result) => handleSelectTrack(index, result)}
              />
            {seed && (
              <div className="relative bg-gray-700 rounded-md p-2 mt-2 text-xs text-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSeeds = [...seeds]
                    newSeeds[index] = null
                    setSeeds(newSeeds)
                  }}
                  className="absolute top-1 right-1 h-5 w-5 p-0 cursor-pointer text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
                <div className="font-semibold truncate pr-5 text-sm">{seed.name}</div>
                <div className="text-gray-400 truncate text-sm">{seed.artist}</div>
              </div>
            )}
            </div>
          </div>
        ))}
        {seeds.length < SEED_LIMIT && (
          <Button
            onClick={handleAddSeed}
            className="group rounded-lg p-3 h-auto cursor-pointer border-2 border-dashed border-gray-600 hover:border-orange-400 bg-gray-800 hover:bg-gray-750 transition-colors w-full sm:w-72"
            variant="ghost"
          >
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl mb-2 text-gray-500 group-hover:text-orange-400 transition-colors">+</span>
              <span className="text-sm font-semibold text-gray-500 group-hover:text-orange-400 transition-colors">Add Seed</span>
            </div>
          </Button>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={seeds.filter(s => s !== null).length < 2}
          className="cursor-pointer bg-[#ff914d] hover:bg-[#ff914d] text-white font-semibold px-10 py-3 rounded-full text-base tracking-wide disabled:opacity-40 transition-all hover:shadow-lg hover:shadow-[#ff914d]/25"
        >
          Build your Bridge!
        </Button>
      </div>
    </div>
  )
}
