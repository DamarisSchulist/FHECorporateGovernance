'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { FhevmProvider } from '@fhevm/sdk';
import VotingApp from '@/components/VotingApp';

export default function Home() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    if (typeof window !== 'undefined' && window.ethereum) {
      const web3Provider = new BrowserProvider(window.ethereum);
      const accounts = await web3Provider.listAccounts();

      if (accounts.length > 0) {
        setProvider(web3Provider);
        setAccount(accounts[0].address);
        setIsConnected(true);
      }
    }
  }

  async function connectWallet() {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to use this dApp');
      return;
    }

    try {
      const web3Provider = new BrowserProvider(window.ethereum);
      await web3Provider.send('eth_requestAccounts', []);
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();

      setProvider(web3Provider);
      setAccount(address);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet');
    }
  }

  if (!isConnected) {
    return (
      <div className="container">
        <div className="header">
          <h1>🔐 FHEVM SDK Demo</h1>
          <p>Confidential Voting powered by Fully Homomorphic Encryption</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Connect Your Wallet</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Connect your wallet to start voting with encrypted ballots
          </p>
          <button className="button" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <FhevmProvider
      config={{
        chainId: 11155111, // Sepolia
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
        publicKey: 'YOUR_FHE_PUBLIC_KEY',
      }}
    >
      <VotingApp provider={provider!} account={account} />
    </FhevmProvider>
  );
}
