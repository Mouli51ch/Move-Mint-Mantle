import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Record Your Movement",
      description: "Use your webcam or upload a video to capture your fitness routine. Any movement, anytime.",
      icon: "🎥",
    },
    {
      number: "2",
      title: "AI Detection",
      description: "Our advanced AI analyzes your video and identifies every movement with precision.",
      icon: "🤖",
    },
    {
      number: "3",
      title: "Review Results",
      description: "See the detected movements highlighted and verified before proceeding.",
      icon: "✓",
    },
    {
      number: "4",
      title: "Add Metadata",
      description: "Add title, description, and tags to personalize your movement NFT.",
      icon: "📝",
    },
    {
      number: "5",
      title: "Mint & Own",
      description: "Mint your movement as an NFT on Story Protocol. It's now permanently yours.",
      icon: "🔗",
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 -right-40 w-80 h-80 bg-green-600/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-5xl mx-auto">
          <h1 className="font-medium text-5xl md:text-6xl text-white mb-6 text-center text-balance">
            How It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300">Works</span>
          </h1>
          <p className="text-gray-400 text-lg text-center max-w-2xl mx-auto mb-20">
            Five simple steps to transform your fitness into NFTs
          </p>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-8 relative">
                {/* Timeline line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-16 top-32 w-px h-20 bg-gradient-to-b from-green-600/50 to-transparent"></div>
                )}

                {/* Step circle */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex flex-col items-center justify-center group hover:shadow-lg hover:shadow-green-500/50 transition-all">
                    <span className="text-4xl mb-1">{step.icon}</span>
                    <span className="text-lg font-bold text-black">{step.number}</span>
                  </div>
                </div>

                {/* Step content */}
                <div className="flex-grow pt-4">
                  <h2 className="font-medium text-2xl text-white mb-3">{step.title}</h2>
                  <p className="text-gray-400 text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
