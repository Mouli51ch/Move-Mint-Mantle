"use client"

import { AppNavbar } from "@/components/app-navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"

export default function Settings() {
  const [email, setEmail] = useState("creator@movemint.com")
  const [username, setUsername] = useState("yogamover")
  const [walletAddress, setWalletAddress] = useState("0x742d...0cbc")
  const [notifications, setNotifications] = useState(true)
  const [privacyPublic, setPrivacyPublic] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings saved successfully!")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-black">
      <AppNavbar />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-600/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="mb-12 animate-fade-in-down">
            <Link
              href="/app/dashboard"
              className="text-gray-400 hover:text-green-400 text-sm mb-6 inline-block transition duration-300"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="font-medium text-5xl text-white mb-3">Settings</h1>
            <p className="text-gray-400">Manage your account preferences</p>
          </div>

          <div className="space-y-8">
            <div
              className="bg-black border border-green-900/30 p-8 rounded-xl hover:border-green-600/50 transition duration-300 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="font-medium text-2xl text-white mb-6">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-black border-green-900/30 text-white placeholder:text-gray-600 hover:border-green-600/50 transition duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black border-green-900/30 text-white placeholder:text-gray-600 hover:border-green-600/50 transition duration-300"
                  />
                </div>
              </div>
            </div>

            <div
              className="bg-black border border-green-900/30 p-8 rounded-xl hover:border-green-600/50 transition duration-300 animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              <h2 className="font-medium text-2xl text-white mb-6">Wallet</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Connected Wallet</label>
                  <div className="flex items-center gap-3 bg-black border border-green-900/30 rounded-lg p-3 hover:border-green-600/50 transition duration-300">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-xs font-bold text-black">
                      Ξ
                    </div>
                    <span className="text-white">{walletAddress}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-gray-400 hover:text-green-400 transition duration-300"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-black border border-green-900/30 p-8 rounded-xl hover:border-green-600/50 transition duration-300 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h2 className="font-medium text-2xl text-white mb-6">Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="rounded border-green-600 bg-black transition duration-300"
                  />
                  <span className="text-sm text-gray-300">Email me about sales and interactions</span>
                </label>
              </div>
            </div>

            <div
              className="bg-black border border-green-900/30 p-8 rounded-xl hover:border-green-600/50 transition duration-300 animate-fade-in-up"
              style={{ animationDelay: "0.25s" }}
            >
              <h2 className="font-medium text-2xl text-white mb-6">Privacy</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyPublic}
                    onChange={(e) => setPrivacyPublic(e.target.checked)}
                    className="rounded border-green-600 bg-black transition duration-300"
                  />
                  <div>
                    <p className="text-sm text-gray-300">Public Profile</p>
                    <p className="text-xs text-gray-500">Others can view your collection and profile</p>
                  </div>
                </label>
              </div>
            </div>

            <div
              className="bg-red-950/20 border border-red-900/50 p-8 rounded-xl animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <h2 className="font-medium text-2xl text-red-400 mb-6">Danger Zone</h2>
              <Button
                variant="outline"
                className="border-red-900/50 text-red-400 hover:bg-red-950/30 bg-transparent transition duration-300"
              >
                Delete Account
              </Button>
            </div>

            <div
              className="flex gap-3 pt-6 border-t border-green-900/30 animate-fade-in-up"
              style={{ animationDelay: "0.35s" }}
            >
              <Link href="/app/dashboard" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-green-600/50 text-green-400 hover:bg-green-950/30 bg-black transition duration-300"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-medium shadow-lg shadow-green-500/30 disabled:opacity-50 transition-all duration-300"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
