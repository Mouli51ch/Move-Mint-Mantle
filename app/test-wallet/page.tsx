"use client"

import { WalletConnection } from "@/components/ui/wallet-connection"

export default function TestWallet() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Wallet Connection Test</h1>
        
        <div className="bg-black border border-green-900/30 p-6 rounded-xl">
          <h2 className="text-xl font-medium mb-4">Test Wallet Component</h2>
          <WalletConnection 
            onConnect={(address) => {
              console.log('Wallet connected:', address)
              alert(`Wallet connected: ${address}`)
            }}
            onDisconnect={() => {
              console.log('Wallet disconnected')
              alert('Wallet disconnected')
            }}
            showBalance={true}
            showNetworkWarning={true}
          />
        </div>

        <div className="mt-8 p-4 bg-blue-950/20 border border-blue-900/30 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-2">Instructions:</h3>
          <ol className="text-blue-300 text-sm space-y-1">
            <li>1. You should see a "Connect Wallet" button above</li>
            <li>2. Click it to open the wallet selection modal</li>
            <li>3. Select MetaMask to connect</li>
            <li>4. Approve the connection in MetaMask</li>
            <li>5. Your wallet address should appear</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-gray-950/20 border border-gray-800 rounded-lg">
          <h3 className="text-gray-400 font-medium mb-2">Troubleshooting:</h3>
          <ul className="text-gray-500 text-sm space-y-1">
            <li>• Make sure MetaMask is installed and unlocked</li>
            <li>• Check browser console for any errors</li>
            <li>• Try refreshing the page if button doesn't appear</li>
          </ul>
        </div>
      </div>
    </div>
  )
}