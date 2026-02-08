export default function DNACard({ result }) {
  const {
    title,
    artist,
    matchScore,
    shared_traits = [],
    explanation
  } = result

  return (
    <div className="relative overflow-hidden rounded-xl p-6 bg-gray-900 border border-gray-800 transition-all duration-300 hover:shadow-2xl hover:shadow-[#ff914d]/10 hover:-translate-y-2 w-full max-w-sm flex flex-col">
      {/* Accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#ff914d] to-pink-500"></div>

      {/* Card Header */}
      <div className="mb-4 relative z-10">
        <h3 className="m-0 text-2xl font-bold text-white">{title}</h3>
        <p className="m-0 mt-1 text-base text-gray-400">{artist}</p>
      </div>

      {/* Match Score */}
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="bg-[#ff914d] text-white px-4 py-2 rounded-full font-bold text-xl min-w-fit">
          {Math.round(matchScore)}%
        </div>
        <span className="text-base text-gray-400 font-medium">Match</span>
      </div>

      {/* Shared Traits */}
      {shared_traits.length > 0 && (
        <div className="relative z-10 mb-5">
          <p className="text-sm uppercase text-gray-500 font-semibold tracking-wider mb-2">Shared DNA</p>
          <div className="flex flex-wrap gap-1.5">
            {shared_traits.map((trait, idx) => (
              <span
                key={idx}
                className="text-sm text-[#ff914d]/80 px-2.5 py-1 rounded-md bg-[#ff914d]/5 border border-[#ff914d]/15"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div className="bg-gray-800/60 rounded-lg p-4 relative z-10 grow mb-4 border-l-2 border-[#ff914d]/30">
          <p className="text-base text-gray-300 leading-relaxed m-0">{explanation}</p>
        </div>
      )}

      {/* Listen Link */}
      <div className="relative z-10 mt-2">
        <a
          href={`https://open.spotify.com/search/${encodeURIComponent(title + ' ' + artist)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-gray-300 hover:text-[#ff914d] bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/50 hover:border-[#ff914d]/30 rounded-lg text-sm transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"></path>
          </svg>
          Listen on Spotify
        </a>
      </div>
    </div>
  )
}
