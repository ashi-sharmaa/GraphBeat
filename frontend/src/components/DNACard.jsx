import { useState } from 'react'

export default function DNACard({ result }) {
  const {
    title,
    artist,
    bpm,
    energy,
    valence,
    musical_key,
    matchScore,
    dnaOverlap
  } = result

  return (
    <div className="relative overflow-hidden rounded-xl p-6 bg-linear-to-br from-blue-50 via-slate-100 to-blue-200 border border-white border-opacity-50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 min-h-96 flex flex-col">
      {/* Radial gradient overlay */}
      <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-radial-gradient pointer-events-none opacity-10"></div>

      {/* Card Header */}
      <div className="mb-4 relative z-10">
        <h3 className="m-0 text-xl font-bold text-gray-900">{title}</h3>
        <p className="m-0 mt-1 text-sm text-gray-600">{artist}</p>
      </div>

      {/* Match Score */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="bg-linear-to-br from-purple-500 to-violet-600 text-white px-4 py-2 rounded-full font-bold text-lg min-w-fit">
          {Math.round(matchScore || 85)}%
        </div>
        <span className="text-sm text-gray-600 font-medium">Match</span>
      </div>

      {/* DNA Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        {/* BPM */}
        <div className="flex items-center gap-3 bg-white bg-opacity-70 p-3 rounded-lg backdrop-blur-md">
          <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 rounded-full text-white text-base">
            ♪
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase text-gray-600 font-semibold tracking-wider">BPM</span>
            <span className="text-base font-bold text-gray-900">{bpm || '—'}</span>
          </div>
        </div>

        {/* Energy */}
        <div className="flex items-center gap-3 bg-white bg-opacity-70 p-3 rounded-lg backdrop-blur-md">
          <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 rounded-full text-white text-base">
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase text-gray-600 font-semibold tracking-wider">Energy</span>
            <span className="text-base font-bold text-gray-900">
              {energy ? (energy * 100).toFixed(0) + '%' : '—'}
            </span>
          </div>
        </div>

        {/* Valence */}
        <div className="flex items-center gap-3 bg-white bg-opacity-70 p-3 rounded-lg backdrop-blur-md">
          <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 rounded-full text-white text-base">
            😊
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase text-gray-600 font-semibold tracking-wider">Valence</span>
            <span className="text-base font-bold text-gray-900">
              {valence ? (valence * 100).toFixed(0) + '%' : '—'}
            </span>
          </div>
        </div>

        {/* Key */}
        <div className="flex items-center gap-3 bg-white bg-opacity-70 p-3 rounded-lg backdrop-blur-md">
          <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 rounded-full text-white text-base">
            🎼
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase text-gray-600 font-semibold tracking-wider">Key</span>
            <span className="text-base font-bold text-gray-900">{musical_key || '—'}</span>
          </div>
        </div>
      </div>

      {/* DNA Overlap */}
      {dnaOverlap && (
        <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4 relative z-10 flex-grow">
          <h4 className="m-0 mb-3 text-sm text-gray-800 font-semibold">Why This Match?</h4>
          <ul className="list-none p-0 m-0 space-y-1">
            {dnaOverlap.map((reason, idx) => (
              <li key={idx} className="text-sm text-gray-700 py-1 flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Play Button */}
      <button className="self-start bg-gradient-to-br from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-300 relative z-10">
        ▶ Listen
      </button>
    </div>
  )
}