import DNACard from './DNACard'

export default function DNAResultCards({ results }) {
  return (
    <div className="flex flex-wrap justify-center gap-8 py-4">
      {results.map((result, index) => (
        <DNACard key={index} result={result} />
      ))}
    </div>
  )
}