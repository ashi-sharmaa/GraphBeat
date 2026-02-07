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
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border z-50 border-gray-300 border-t-0 rounded-b-md list-none m-0 p-0 max-h-64 overflow-y-auto shadow-md">
          {results.map((result, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(result)}
              className="px-3 py-3 cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-100 last:border-b-0"
            >
              <div className="font-semibold text-gray-900 text-sm">{result.name}</div>
              <div className="text-gray-600 text-xs mt-1">{result.artist}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}