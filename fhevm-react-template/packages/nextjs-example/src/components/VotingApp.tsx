'use client';

import { useState, useEffect } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import { useFhevm, useFhevmContract } from '@fhevm/sdk';

// Simple ABI for demonstration
const VOTING_ABI = [
  'function vote(bytes calldata encryptedVote, bytes calldata proof) external',
  'function getResolutionCount() external view returns (uint256)',
  'function chairperson() external view returns (address)',
];

interface VotingAppProps {
  provider: BrowserProvider;
  account: string;
}

export default function VotingApp({ provider, account }: VotingAppProps) {
  const { instance, isInitialized, error } = useFhevm();
  const [contractAddress, setContractAddress] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="status error">
            Error initializing FHEVM: {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Initializing FHEVM SDK...</p>
        </div>
      </div>
    );
  }

  async function handleVote(voteValue: number) {
    if (!instance || !contractAddress) {
      setStatus({ type: 'error', message: 'Please enter contract address' });
      return;
    }

    setIsVoting(true);
    setStatus({ type: 'info', message: 'Encrypting your vote...' });

    try {
      // Create encrypted input using FHEVM SDK
      const input = instance.createEncryptedInput(contractAddress, account);
      input.add8(voteValue); // Encrypt the vote (0 = No, 1 = Yes)
      const encryptedData = input.encrypt();

      setStatus({ type: 'info', message: 'Sending encrypted vote to blockchain...' });

      // Get contract instance
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, VOTING_ABI, signer);

      // Submit encrypted vote
      const tx = await contract.vote(
        encryptedData.handles[0],
        encryptedData.inputProof
      );

      setStatus({ type: 'info', message: 'Waiting for transaction confirmation...' });
      await tx.wait();

      setStatus({
        type: 'success',
        message: `Vote cast successfully! Your vote remains encrypted on-chain. Tx: ${tx.hash.slice(0, 10)}...`,
      });
    } catch (err: any) {
      console.error('Voting error:', err);
      setStatus({
        type: 'error',
        message: `Failed to cast vote: ${err.message || 'Unknown error'}`,
      });
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🔐 FHEVM SDK Demo</h1>
        <p>Confidential Voting Example</p>
        <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>About This Demo</h2>
        <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
          This Next.js application demonstrates the <strong>@fhevm/sdk</strong> in action.
          It showcases how to:
        </p>
        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Initialize the FHEVM SDK using the <code>FhevmProvider</code></li>
          <li>Access FHE capabilities via <code>useFhevm()</code> hook</li>
          <li>Encrypt user inputs client-side before submitting to blockchain</li>
          <li>Interact with encrypted smart contracts using wagmi-like patterns</li>
        </ul>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Cast Encrypted Vote</h2>

        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Contract Address:
        </label>
        <input
          type="text"
          className="input"
          placeholder="0x..."
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />

        {status && (
          <div className={`status ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="grid">
          <button
            className="button"
            onClick={() => handleVote(0)}
            disabled={isVoting || !contractAddress}
            style={{ background: '#dc3545' }}
          >
            {isVoting ? 'Processing...' : '❌ Vote No (Encrypted)'}
          </button>
          <button
            className="button"
            onClick={() => handleVote(1)}
            disabled={isVoting || !contractAddress}
            style={{ background: '#28a745' }}
          >
            {isVoting ? 'Processing...' : '✅ Vote Yes (Encrypted)'}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>How It Works</h2>
        <div style={{ lineHeight: '1.8' }}>
          <h3 style={{ marginTop: '1rem', color: '#667eea' }}>1. Encryption (Client-Side)</h3>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add8(voteValue); // Add encrypted vote
const encrypted = input.encrypt();`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', color: '#667eea' }}>2. Submit to Blockchain</h3>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`const tx = await contract.vote(
  encrypted.handles[0],
  encrypted.inputProof
);`}
          </pre>

          <h3 style={{ marginTop: '1.5rem', color: '#667eea' }}>3. On-Chain Processing</h3>
          <p style={{ marginTop: '0.5rem' }}>
            The smart contract performs computations on encrypted data without ever decrypting it.
            Results remain private until authorized decryption.
          </p>
        </div>
      </div>

      <div className="grid">
        <div className="stat-card">
          <h3>🔐</h3>
          <p>End-to-End Encryption</p>
        </div>
        <div className="stat-card">
          <h3>⚡</h3>
          <p>Framework Agnostic</p>
        </div>
        <div className="stat-card">
          <h3>🎯</h3>
          <p>Wagmi-like API</p>
        </div>
      </div>
    </div>
  );
}
