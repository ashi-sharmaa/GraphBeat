import { useRecommendationStore } from './store/recommendationStore'
import SeedInput from './components/SeedInput'
import ThinkingState from './components/ThinkingState'
import DNAResultCards from './components/DNAResultCards'

function App() {
  const { thinking, results, currentStep, searchAndRecommend } = useRecommendationStore()

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-blue-50 via-slate-100 to-blue-200">
      {/* Header */}
      <header className="w-full bg-linear-to-br from-blue-900 to-blue-700 text-white py-8 mb-8">
        <div className="px-8">
          <h1 className="text-4xl font-bold">Seed AI</h1>
          <p className="text-lg opacity-90 mt-1">Music recommendations powered by Graph-RAG</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-8 pb-8">
        <SeedInput onSearch={searchAndRecommend} />

        {thinking && <ThinkingState currentStep={currentStep} />}

        {results.length > 0 && (
          <section className="mt-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Your DNA Matches</h2>
            <DNAResultCards results={results} />
          </section>
        )}
      </main>
    </div>
  )
}

export default App
