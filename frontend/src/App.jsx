import { useRecommendationStore } from './store/recommendationStore'
import SeedInput from './components/SeedInput'
import ThinkingState from './components/ThinkingState'
import DNAResultCards from './components/DNAResultCards'
import logo from './assets/graphbeatlogo.png'

function App() {
  const { thinking, currentStep, results, error, searchAndRecommend } = useRecommendationStore()

  return (
    <div className="min-h-screen w-full bg-gray-950">
      {/* Header */}
      <header className="w-full pt-16 pb-10">
        <div className="flex flex-col items-center text-center">
            <img src={logo} alt="GraphBeat logo" className="h-44 mb-1" />
            <p className="text-xl text-gray-400 tracking-wider font-light">Discover the <span className="bg-linear-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent font-medium">underlying connections</span> between your favorite songs!</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-8 pb-8">
        <SeedInput onSearch={searchAndRecommend} />

        {thinking && <ThinkingState currentStep={currentStep} />}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 my-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {results.length > 0 && (
          <section className="mt-8">
            <DNAResultCards results={results} />
          </section>
        )}
      </main>
    </div>
  )
}

export default App
