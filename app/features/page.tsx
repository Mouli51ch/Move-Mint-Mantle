import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Features() {
  const features = [
    {
      title: "Smart AI Detection",
      description:
        "Powered by state-of-the-art machine learning models that recognize hundreds of fitness movements in real-time.",
      items: ["Real-time analysis", "99% accuracy", "Continuous learning"],
      icon: "🧠",
    },
    {
      title: "Story Protocol Security",
      description:
        "All your NFTs are secured on Story Protocol with cryptographic proof of ownership and authenticity.",
      items: ["Immutable records", "True ownership", "Transparent verification"],
      icon: "🔐",
    },
    {
      title: "Creator Economy",
      description: "Earn rewards when your movement NFTs are viewed, traded, or featured in our community.",
      items: ["Revenue sharing", "Royalties", "Rewards program"],
      icon: "💰",
    },
    {
      title: "Community Features",
      description: "Connect with fitness creators, share routines, and collaborate on unique movement collections.",
      items: ["Social network", "Collaboration", "Community challenges"],
      icon: "👥",
    },
    {
      title: "Privacy Controls",
      description: "You decide what gets recorded, detected, and minted. Full control over your personal data.",
      items: ["Privacy first", "Selective sharing", "Data control"],
      icon: "🔒",
    },
    {
      title: "Multi-Platform",
      description: "Access MoveMint on web, mobile, and desktop. Your movements sync across all devices.",
      items: ["Responsive design", "Mobile optimized", "Cross-platform"],
      icon: "📱",
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-600/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto">
          <h1 className="font-medium text-5xl md:text-6xl text-white mb-6 text-center">
            Powerful{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300">Features</span>
          </h1>
          <p className="text-gray-400 text-lg text-center max-w-2xl mx-auto mb-16">
            Everything you need to record, detect, and mint your fitness movements
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-black border border-green-900/30 p-8 rounded-xl hover:border-green-600/50 transition">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h2 className="font-medium text-xl text-white mb-3">{feature.title}</h2>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
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
