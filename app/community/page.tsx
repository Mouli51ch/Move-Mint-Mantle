import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Community() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fitness Influencer",
      quote: "MoveMint changed how I think about my fitness content. I can actually own and monetize my movements.",
      avatar: "SC",
    },
    {
      name: "Marcus Johnson",
      role: "Personal Trainer",
      quote: "My clients love seeing their routines minted as NFTs. It's a game-changer for motivation.",
      avatar: "MJ",
    },
    {
      name: "Emma Rodriguez",
      role: "Yoga Instructor",
      quote: "The AI detection is incredibly accurate. It recognizes every pose and movement I do.",
      avatar: "ER",
    },
  ]

  const stats = [
    { label: "Active Users", value: "50K+" },
    { label: "NFTs Minted", value: "250K+" },
    { label: "Total Volume", value: "$5M+" },
    { label: "Countries", value: "150+" },
  ]

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto">
          <h1 className="font-medium text-5xl md:text-6xl text-white mb-6 text-center">
            Join Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300">
              Community
            </span>
          </h1>
          <p className="text-gray-400 text-lg text-center max-w-2xl mx-auto mb-16">
            Join thousands of fitness creators worldwide
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {stats.map((stat, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-lg blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-black p-6 rounded-lg border border-green-900/30 hover:border-green-600/50 transition text-center">
                  <p className="font-bold text-3xl text-green-400 mb-2">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <h2 className="font-medium text-3xl text-white mb-12 text-center">What Creators Say</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-black p-8 rounded-xl border border-green-900/30 hover:border-green-600/50 transition">
                  <p className="text-gray-300 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-black">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{testimonial.name}</p>
                      <p className="text-gray-400 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Community Features */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-black border border-green-900/30 p-12 rounded-2xl">
              <h2 className="font-medium text-3xl text-white mb-12 text-center">Community Features</h2>
              <div className="grid md:grid-cols-3 gap-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-600/30">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="font-medium text-lg text-white mb-2">Creator Profiles</h3>
                  <p className="text-gray-400 text-sm">Showcase your movements and build your following</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-600/30">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="font-medium text-lg text-white mb-2">Weekly Challenges</h3>
                  <p className="text-gray-400 text-sm">Compete for rewards and recognition</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-600/30">
                    <span className="text-2xl">💎</span>
                  </div>
                  <h3 className="font-medium text-lg text-white mb-2">Marketplace</h3>
                  <p className="text-gray-400 text-sm">Buy, sell, and trade movement NFTs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
