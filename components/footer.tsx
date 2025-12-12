import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black border-t border-green-900/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-medium text-sm text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-xs text-gray-400 hover:text-green-400 transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-xs text-gray-400 hover:text-green-400 transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-green-400 transition">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-sm text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-green-400 transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-green-400 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-green-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-sm text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-green-400 transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-green-400 transition">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-green-400 transition">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-sm text-white mb-4">Social</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-green-400 transition">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-green-400 transition">
                  Discord
                </Link>
              </li>
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-green-400 transition">
                  GitHub
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-green-900/20 pt-8 flex justify-between items-center">
          <p className="text-xs text-gray-500">© 2025 MoveMint. All rights reserved.</p>
          <p className="text-xs text-gray-500">Built with green energy ♻️</p>
        </div>
      </div>
    </footer>
  )
}
