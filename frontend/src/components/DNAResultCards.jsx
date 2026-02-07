import DNACard from './DNACard'

export default function DNAResultCards({ results }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
      {results.map((result, index) => (
        <DNACard key={index} result={result} />
      ))}
    </div>
  )
}