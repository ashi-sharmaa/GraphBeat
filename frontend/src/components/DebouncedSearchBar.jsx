import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'

const DEBOUNCE_DELAY = 300

export default function DebouncedSearchBar({
  value,
  onChange,
  onSearch,
  placeholder,
  results = [],
  onSelectResult
}) {
  const [isOpen, setIsOpen] = useState(false)
  const debounceTimer = useRef(null)

  useEffect(() => {
    clearTimeout(debounceTimer.current)
    if (value.trim()) {
      debounceTimer.current = setTimeout(() => {
        onSearch(value)
      }, DEBOUNCE_DELAY)
    }
    return () => clearTimeout(debounceTimer.current)
  }, [value, onSearch])

  const handleSelect = (result) => {
    onSelectResult(result)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className="text-white bg-gray-700 border-gray-600 placeholder:text-gray-400"
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-gray-800 border z-50 border-gray-600 border-t-0 rounded-b-md list-none m-0 p-0 max-h-64 overflow-y-auto shadow-lg">
          {results.map((result, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(result)}
              className="px-3 py-3 cursor-pointer border-b border-gray-700 transition-colors hover:bg-gray-700 last:border-b-0"
            >
              <div className="font-semibold text-white text-base">{result.name}</div>
              <div className="text-gray-400 text-sm mt-1">{result.artist}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}