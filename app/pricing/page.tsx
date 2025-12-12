"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Pricing() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly")

  const plans = [
    {
      name: "Starter",
      price: interval === "monthly" ? 9 : 90,
      description: "Perfect for beginners",
      features: ["Up to 10 movement NFTs/month", "Basic AI detection", "Standard support", "Community access"],
    },
    {
      name: "Creator",
      price: interval === "monthly" ? 29 : 290,
      description: "For active creators",
      features: [
        "Up to 100 movement NFTs/month",
        "Advanced AI detection",
        "Priority support",
        "Creator analytics",
        "Revenue sharing",
      ],
      highlighted: true,
    },
    {
      name: "Pro",
      price: interval === "monthly" ? 99 : 990,
      description: "For serious athletes",
      features: [
        "Unlimited movement NFTs",
        "Premium AI detection",
        "24/7 dedicated support",
        "Advanced analytics",
        "Custom branding",
        "API access",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto">
          <h1 className="font-medium text-5xl md:text-6xl text-white mb-6 text-center">
            Simple, Transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300">Pricing</span>
          </h1>
          <p className="text-gray-400 text-lg text-center max-w-2xl mx-auto mb-12">
            Choose the plan that fits your fitness journey
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4 mb-16">
            <button
              onClick={() => setInterval("monthly")}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition ${
                interval === "monthly"
                  ? "bg-green-600 text-black"
                  : "bg-transparent text-gray-400 hover:text-white border border-green-900/30"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition relative ${
                interval === "yearly"
                  ? "bg-green-600 text-black"
                  : "bg-transparent text-gray-400 hover:text-white border border-green-900/30"
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-4 text-xs bg-green-600 text-black px-2 py-1 rounded font-bold">
                Save 17%
              </span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div key={i} className={`group relative rounded-xl transition ${plan.highlighted ? "md:scale-105" : ""}`}>
                {plan.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-400/10 rounded-xl blur-xl"></div>
                )}
                <div
                  className={`relative border rounded-xl p-8 backdrop-blur-sm ${
                    plan.highlighted
                      ? "bg-black border-green-600 shadow-lg shadow-green-500/20"
                      : "bg-black border-green-900/30 hover:border-green-600/50"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-gradient-to-r from-green-400 to-green-600 text-black text-xs font-bold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="font-medium text-2xl text-white mb-2 mt-4">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="font-bold text-4xl text-white">${plan.price}</span>
                    <span className="text-gray-400 text-sm">/month</span>
                  </div>

                  <Button
                    className={`w-full mb-8 transition ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium shadow-lg shadow-green-500/30"
                        : "bg-green-950/50 hover:bg-green-900/50 border border-green-600/50 text-green-400 hover:text-green-300"
                    }`}
                  >
                    Get Started
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="text-green-400 mt-0.5">✓</span>
                        {feature}
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
