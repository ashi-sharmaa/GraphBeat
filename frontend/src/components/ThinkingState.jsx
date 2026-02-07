const STEPS = [
  { id: 1, label: 'Ingesting', description: 'Loading your seed tracks' },
  { id: 2, label: 'Traversing', description: 'Exploring the knowledge graph' },
  { id: 3, label: 'Reasoning', description: 'Computing recommendations' }
]

export default function ThinkingState({ currentStep }) {
  return (
    <div className="bg-linear-to-br from-blue-900 to-blue-700 rounded-xl p-8 my-8 text-white min-h-80 flex items-center justify-center shadow-2xl shadow-blue-900">
      <div className="text-center w-full">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-4 border-blue-300 border-t-white rounded-full animate-spin"></div>
        </div>

        <h2 className="text-2xl font-semibold mb-8">Finding your perfect match...</h2>

        {/* Stepper */}
        <div className="flex flex-col gap-6 max-w-md mx-auto">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id
            const isActive = currentStep === step.id
            const isUpcoming = currentStep < step.id

            return (
              <div key={step.id} className="flex items-start gap-4 relative">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 transition-all border-2 ${
                    isCompleted
                      ? 'border-green-400 bg-green-400 bg-opacity-20 text-green-400'
                      : isActive
                      ? 'border-green-400 bg-green-400 bg-opacity-20 text-green-400 shadow-lg shadow-green-400'
                      : 'border-white border-opacity-30 bg-blue-800 bg-opacity-50 text-white text-opacity-50'
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-lg">✓</span>
                  ) : (
                    <span className="text-base">{step.id}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="pt-1">
                  <div className="font-semibold text-base">{step.label}</div>
                  <div className="text-sm text-blue-100 mt-1">{step.description}</div>
                </div>

                {/* Connector Line */}
                {step.id < STEPS.length && (
                  <div
                    className={`absolute left-5 top-10 w-0.5 h-12 transition-colors ${
                      isCompleted ? 'bg-green-400' : 'bg-white bg-opacity-20'
                    }`}
                  ></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}