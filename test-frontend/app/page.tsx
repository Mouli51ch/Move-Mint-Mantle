'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Contract address from environment variables
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x2CD0f925B6d2DDEA0D3FE3e0F6b3Ba5d87e17073"

// MoveMintNFT ABI - only the functions we need
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "danceStyle", "type": "string"},
      {"internalType": "string", "name": "choreographer", "type": "string"},
      {"internalType": "uint256", "name": "duration", "type": "uint256"},
      {"internalType": "string", "name": "ipfsMetadataHash", "type": "string"}
    ],
    "name": "mintDance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalMinted",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

// Mantle Sepolia Testnet configuration - Correct network for your deployed contract
const MANTLE_TESTNET = {
  chainId: '0x138b', // 5003 in hex (Mantle Sepolia Testnet)
  chainName: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
  blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz'],
}

export default function Home() {
  // State management
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<string>('')
  
  // Form state
  const [title, setTitle] = useState<string>('')
  const [danceStyle, setDanceStyle] = useState<string>('')
  const [choreographer, setChoreographer] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [ipfsHash, setIpfsHash] = useState<string>('')

  // Check if MetaMask is available
  const isMetaMaskAvailable = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  }

  // Check current network
  const checkNetwork = async () => {
    if (!isMetaMaskAvailable()) return false
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const isCorrect = chainId === MANTLE_TESTNET.chainId
      setIsCorrectNetwork(isCorrect)
      return isCorrect
    } catch (error) {
      console.error('Error checking network:', error)
      return false
    }
  }

  // Switch to Mantle Sepolia Testnet
  const switchToMantleTestnet = async () => {
    if (!isMetaMaskAvailable()) {
      setStatusMessage('MetaMask is not installed')
      return
    }
    
    try {
      setLoading(true)
      setStatusMessage('Switching to Mantle Sepolia Testnet...')
      
      // First try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MANTLE_TESTNET.chainId }],
      })
      
      setStatusMessage('✅ Successfully switched to Mantle Sepolia Testnet')
      await checkNetwork()
      
    } catch (switchError: any) {
      console.log('Switch error:', switchError)
      
      // Network not added to MetaMask
      if (switchError.code === 4902) {
        try {
          setStatusMessage('Adding Mantle Sepolia Testnet to MetaMask...')
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MANTLE_TESTNET],
          })
          setStatusMessage('✅ Mantle Sepolia Testnet added successfully')
          await checkNetwork()
        } catch (addError: any) {
          console.error('Error adding network:', addError)
          
          // Network already exists with same RPC
          if (addError.code === -32603 && addError.message.includes('same RPC endpoint')) {
            setStatusMessage('ℹ️ Network already exists in MetaMask. Please select it manually.')
          } else {
            setStatusMessage(`❌ Failed to add network: ${addError.message || 'Unknown error'}`)
          }
        }
      } 
      // Request already pending
      else if (switchError.code === -32002) {
        setStatusMessage('⏳ Please check MetaMask - there is a pending request')
      }
      // User rejected
      else if (switchError.code === 4001) {
        setStatusMessage('❌ Network switch cancelled by user')
      }
      else {
        console.error('Error switching network:', switchError)
        setStatusMessage(`❌ Failed to switch network: ${switchError.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress('')
    setIsCorrectNetwork(false)
    setStatusMessage('Wallet disconnected')
  }
  const connectWallet = async () => {
    if (!isMetaMaskAvailable()) {
      setStatusMessage('❌ MetaMask is not installed. Please install MetaMask extension.')
      return
    }

    try {
      setLoading(true)
      setStatusMessage('Connecting to MetaMask...')
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setStatusMessage('✅ Wallet connected successfully')
        await checkNetwork()
      } else {
        setStatusMessage('❌ No accounts found in MetaMask')
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      
      if (error.code === 4001) {
        setStatusMessage('❌ Connection cancelled by user')
      } else if (error.code === -32002) {
        setStatusMessage('❌ Please check MetaMask - there is a pending connection request')
      } else {
        setStatusMessage(`❌ Failed to connect wallet: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Mint Dance NFT
  const mintDance = async () => {
    if (!walletAddress || !isCorrectNetwork) return
    
    // Validate form
    if (!title || !danceStyle || !choreographer || !duration || !ipfsHash) {
      setStatusMessage('Please fill in all fields')
      return
    }

    if (isNaN(Number(duration)) || Number(duration) <= 0) {
      setStatusMessage('Duration must be a positive number')
      return
    }

    try {
      setLoading(true)
      setStatusMessage('Preparing transaction...')

      // Setup ethers
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      setStatusMessage('Minting dance NFT...')
      
      // Call mintDance function
      const tx = await contract.mintDance(
        title,
        danceStyle,
        choreographer,
        BigInt(duration),
        ipfsHash
      )

      setStatusMessage('Transaction submitted. Waiting for confirmation...')
      
      // Wait for transaction to be mined
      const receipt = await tx.wait()
      
      setStatusMessage(`✅ Dance NFT minted successfully! Tx: ${receipt.hash}`)
      
      // Clear form
      setTitle('')
      setDanceStyle('')
      setChoreographer('')
      setDuration('')
      setIpfsHash('')
      
    } catch (error: any) {
      console.error('Error minting NFT:', error)
      setStatusMessage(`❌ Minting failed: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Check wallet connection on load
  useEffect(() => {
    if (isMetaMaskAvailable()) {
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
            checkNetwork()
            setStatusMessage('Wallet already connected')
          }
        })
        .catch((error) => {
          console.error('Error checking accounts:', error)
        })

      // Listen for account changes
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          checkNetwork()
          setStatusMessage('Account changed')
        } else {
          setWalletAddress('')
          setIsCorrectNetwork(false)
          setStatusMessage('Wallet disconnected')
        }
      }

      // Listen for network changes
      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed to:', chainId)
        checkNetwork()
        if (chainId === MANTLE_TESTNET.chainId) {
          setStatusMessage('✅ Switched to Mantle Sepolia Testnet')
        } else {
          setStatusMessage('⚠️ Please switch to Mantle Sepolia Testnet')
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      // Cleanup listeners
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    } else {
      setStatusMessage('❌ MetaMask not detected. Please install MetaMask extension.')
    }
  }, [])

  // Check if mint button should be disabled
  const isMintDisabled = !walletAddress || !isCorrectNetwork || loading

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>MoveMint NFT Test</h1>
        <p style={styles.subtitle}>Test your MoveMint Dance NFT contract on Mantle Testnet</p>

        {/* Wallet Connection */}
        <div style={styles.section}>
          {!walletAddress ? (
            <button 
              onClick={connectWallet} 
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div>
              <div style={styles.walletConnected}>
                ✅ Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <button 
                onClick={disconnectWallet}
                style={styles.disconnectButton}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Network Check */}
        {walletAddress && (
          <div style={styles.section}>
            {isCorrectNetwork ? (
              <div style={styles.networkSuccess}>
                ✅ Connected to Mantle Sepolia Testnet
              </div>
            ) : (
              <div style={styles.networkWarning}>
                ⚠️ Wrong network detected. Please switch to Mantle Sepolia Testnet.
                <button 
                  onClick={switchToMantleTestnet}
                  disabled={loading}
                  style={{
                    ...styles.switchButton,
                    ...(loading ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {})
                  }}
                >
                  {loading ? 'Switching...' : 'Switch Network'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contract Address Info */}
        <div style={styles.section}>
          <p style={styles.contractInfo}>
            Contract: <code style={styles.code}>{CONTRACT_ADDRESS}</code>
          </p>
          <p style={styles.networkInfo}>
            ✅ Connected to verified MoveMintNFT contract on Mantle Sepolia Testnet
          </p>
        </div>

        {/* Mint Form */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Mint Dance NFT</h2>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sunset Ballet"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Dance Style:</label>
            <input
              type="text"
              value={danceStyle}
              onChange={(e) => setDanceStyle(e.target.value)}
              placeholder="e.g., Contemporary, Hip-Hop, Ballet"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Choreographer:</label>
            <input
              type="text"
              value={choreographer}
              onChange={(e) => setChoreographer(e.target.value)}
              placeholder="e.g., Jane Doe"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Duration (seconds):</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 180"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>IPFS Hash:</label>
            <input
              type="text"
              value={ipfsHash}
              onChange={(e) => setIpfsHash(e.target.value)}
              placeholder="e.g., QmXxx...abc123"
              style={styles.input}
            />
          </div>

          <button
            onClick={mintDance}
            disabled={isMintDisabled}
            style={{
              ...styles.button,
              ...styles.mintButton,
              ...(isMintDisabled ? styles.buttonDisabled : {})
            }}
          >
            {loading ? 'Minting...' : 'Mint Dance NFT'}
          </button>
        </div>

        {/* Debug Info */}
        <div style={styles.section}>
          <details style={styles.debugSection}>
            <summary style={styles.debugSummary}>🔧 Debug Info</summary>
            <div style={styles.debugContent}>
              <p><strong>MetaMask Available:</strong> {isMetaMaskAvailable() ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Wallet Address:</strong> {walletAddress || 'Not connected'}</p>
              <p><strong>Correct Network:</strong> {isCorrectNetwork ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Contract Address:</strong> {CONTRACT_ADDRESS}</p>
              <p><strong>Expected Chain ID:</strong> {MANTLE_TESTNET.chainId} (5003)</p>
            </div>
          </details>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div style={styles.status}>
            {statusMessage}
          </div>
        )}

        {/* Instructions */}
        <div style={styles.instructions}>
          <h3>Instructions:</h3>
          <ol>
            <li>Make sure you have MetaMask installed</li>
            <li>Connect your wallet</li>
            <li>Switch to Mantle Sepolia Testnet (Chain ID: 5003)</li>
            <li>Fill in the dance metadata</li>
            <li>Click "Mint Dance NFT"</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

// Minimal CSS styles
const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center' as const,
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#666',
    marginBottom: '30px',
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    color: '#333',
    marginBottom: '15px',
    borderBottom: '2px solid #eee',
    paddingBottom: '5px',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    transition: 'background-color 0.2s',
  },
  buttonConnected: {
    backgroundColor: '#28a745',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  mintButton: {
    backgroundColor: '#ff6b35',
    marginTop: '15px',
  },
  switchButton: {
    marginLeft: '10px',
    padding: '5px 10px',
    fontSize: '14px',
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  walletConnected: {
    padding: '10px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '5px',
    marginBottom: '10px',
    textAlign: 'center' as const,
  },
  disconnectButton: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  networkSuccess: {
    padding: '10px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '5px',
  },
  networkWarning: {
    padding: '10px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeaa7',
    borderRadius: '5px',
  },
  contractInfo: {
    fontSize: '14px',
    color: '#666',
    wordBreak: 'break-all' as const,
  },
  code: {
    backgroundColor: '#f8f9fa',
    padding: '2px 4px',
    borderRadius: '3px',
    fontSize: '12px',
  },
  networkInfo: {
    fontSize: '12px',
    color: '#28a745',
    fontStyle: 'italic',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold' as const,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  status: {
    padding: '15px',
    backgroundColor: '#e9ecef',
    border: '1px solid #dee2e6',
    borderRadius: '5px',
    fontSize: '14px',
    wordBreak: 'break-word' as const,
  },
  instructions: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    fontSize: '14px',
  },
  debugSection: {
    marginTop: '20px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '10px',
  },
  debugSummary: {
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    color: '#666',
  },
  debugContent: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#555',
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '3px',
  },
}