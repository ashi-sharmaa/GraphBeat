import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import DebouncedSearchBar from './DebouncedSearchBar'

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
      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${import.meta.env.VITE_LASTFM_API_KEY}&format=json&limit=5`
      )
      const data = await response.json()
      const realSongs = (data.results?.trackmatches?.track || []).filter(
        track => track.name && track.artist && track.listeners
      )
      setSearchResults(prev => ({
        ...prev,
        [slotIndex]: realSongs
      }))
    } catch (error) {
      console.error('Search failed:', error)
    }
  }, [])

  const handleSelectTrack = useCallback((slotIndex, track) => {
    const newSeeds = [...seeds]
    newSeeds[slotIndex] = {
      name: track.name,
      artist: track.artist,
      track_id: track.mbid || track.name
    }
    setSeeds(newSeeds)
    setSearchQueries(prev => ({ ...prev, [slotIndex]: '' }))
    setSearchResults(prev => ({ ...prev, [slotIndex]: [] }))
  }, [seeds])

  const handleAddSeed = () => {
    if (seeds.length < 5) {
      setSeeds([...seeds, null])
    }
  }

  const handleRemoveSeed = (index) => {
    const newSeeds = seeds.filter((_, i) => i !== index)
    setSeeds(newSeeds)
  }

  const handleSubmit = () => {
    const validSeeds = seeds.filter(s => s !== null)
    if (validSeeds.length > 0) {
      onSearch(validSeeds)
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl p-8 mb-8 shadow-2xl shadow-purple-300">
      <div className="space-y-4 mb-6">
        {seeds.map((seed, index) => (
          <div key={index} className="bg-white bg-opacity-95 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3 h-6">
              <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                Seed {index + 1}
              </div>
              {seeds.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSeed(index)}
                  className="h-6 w-6 p-0"
                >
                  ✕
                </Button>
              )}
            </div>
            <DebouncedSearchBar
              value={seed ? `${seed.name} - ${seed.artist}` : (searchQueries[index] || '')}
              onChange={(query) => {
                setSearchQueries(prev => ({ ...prev, [index]: query }))
              }}
              onSearch={(query) => handleSearch(query, index)}
              placeholder={`Add track ${index + 1}...`}
              results={searchResults[index] || []}
              onSelectResult={(result) => handleSelectTrack(index, result)}
            />
            {seed && (
              <div className="flex items-center justify-between bg-gray-100 rounded-md p-3 mt-3 text-sm text-gray-800 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{seed.name}</div>
                  <div className="text-gray-600 text-xs truncate">{seed.artist}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSeeds = [...seeds]
                    newSeeds[index] = null
                    setSeeds(newSeeds)
                  }}
                  className="h-6 w-6 p-0"
                >
                  ✕
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {seeds.length < 5 && (
          <Button
            onClick={handleAddSeed}
            className="flex-1"
            variant="outline"
          >
            + Add Seed
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={seeds.every(s => s === null)}
          className="flex-1"
        >
          Find Recommendations
        </Button>
      </div>
    </div>
  )
}