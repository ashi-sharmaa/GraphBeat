import { useState, useEffect } from 'react'

const STEPS = [
  { id: 1, label: 'Ingesting', description: 'Loading seed tracks into the graph' },
  { id: 2, label: 'Traversing', description: 'Walking the knowledge graph' },
  { id: 3, label: 'Reasoning', description: 'Scoring your matches' }
]

const EQUALIZER_BARS = 24

function EqualizerBar({ index }) {
  return (
    <div
      className="equalizer-bar w-1 rounded-full"
      style={{
        animationDelay: `${index * 0.07}s`,
        background: 'linear-gradient(to top, #f97316, #ec4899)',
      }}
    />
  )
}

export default function ThinkingState({ currentStep }) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-900 rounded-xl p-8 my-8 text-white min-h-96 flex flex-col items-center justify-center shadow-lg border border-gray-800 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pulse-glow-delayed" />
      </div>

      {/* Equalizer */}
      <div className="flex items-end justify-center gap-0.75 h-20 mb-8 relative z-10">
        {Array.from({ length: EQUALIZER_BARS }).map((_, i) => (
          <EqualizerBar key={i} index={i} />
        ))}
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold mb-2 relative z-10 bg-linear-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
        Building your bridge{dots}
      </h2>
      <p className="text-base text-gray-500 mb-10 relative z-10">Analyzing musical DNA across the graph</p>

      {/* Steps — circles + connectors in one row, labels below */}
      <div className="relative z-10 w-full flex justify-center">
        <div className="grid grid-cols-3 max-w-md w-full">
          {/* Row 1: circles + connectors */}
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id
            const isActive = currentStep === step.id

            return (
              <div key={step.id} className="flex items-center">
                {/* Left connector */}
                {idx > 0 && (
                  <div className="h-0.5 flex-1 relative">
                    <div className="absolute inset-0 bg-gray-700 rounded-full" />
                    <div
                      className="absolute inset-y-0 left-0 bg-linear-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: currentStep > step.id ? '100%' : currentStep === step.id ? '50%' : '0%' }}
                    />
                  </div>
                )}

                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-500 ${
                    isCompleted
                      ? 'bg-linear-to-br from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
                      : isActive
                      ? 'border-2 border-orange-500 text-orange-400 step-pulse scale-110'
                      : 'border-2 border-gray-700 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>

                {/* Right connector */}
                {idx < STEPS.length - 1 && (
                  <div className="h-0.5 flex-1 relative">
                    <div className="absolute inset-0 bg-gray-700 rounded-full" />
                    <div
                      className="absolute inset-y-0 left-0 bg-linear-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            )
          })}

          {/* Row 2: labels (same grid so they align under circles) */}
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id
            const isActive = currentStep === step.id

            return (
              <div key={`label-${step.id}`} className="flex flex-col items-center mt-3 text-center">
                <span className={`text-sm font-semibold transition-colors duration-300 ${
                  isActive ? 'text-orange-400' : isCompleted ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
                <span className={`text-xs mt-0.5 transition-colors duration-300 ${
                  isActive ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  {step.description}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
