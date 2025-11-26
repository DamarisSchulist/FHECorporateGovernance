# Quick Start Guide - FHEVM SDK

Get started with the FHEVM SDK in less than 5 minutes!

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MetaMask or compatible wallet (for frontend examples)

## Installation

```bash
# Clone the repository
git clone https://github.com/zama-ai/fhevm-react-template.git
cd fhevm-react-template

# Install all dependencies
npm install
```

That's it! You're ready to use the SDK.

## Run Examples

### Option 1: Next.js Example (Recommended)

**Encrypted voting dApp with React hooks**

```bash
npm run dev:nextjs
```

Open [http://localhost:3000](http://localhost:3000)

What you'll see:
- Connect wallet button
- Encrypted vote submission
- SDK usage with React hooks
- Working example of FHE encryption

### Option 2: Vue.js Example

**Encrypted counter with Vue 3**

```bash
npm run dev:vue
```

Open [http://localhost:5173](http://localhost:5173)

### Option 3: Node.js CLI

**Command-line tool for testing SDK**

```bash
# Run SDK tests
npm run start:cli test-sdk

# Encrypt a value
npm run start:cli encrypt 42 --type uint32

# Get help
npm run start:cli info
```

## Use the SDK in Your Project

### Step 1: Install

```bash
npm install @fhevm/sdk ethers
```

### Step 2: Initialize

```typescript
import { createFhevmClient } from '@fhevm/sdk';

const client = await createFhevmClient({
  chainId: 11155111, // Sepolia
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  publicKey: 'YOUR_FHE_PUBLIC_KEY',
});
```

### Step 3: Encrypt & Use

```typescript
const instance = client.getInstance();

// Create encrypted input
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add32(42); // Add encrypted value
const { handles, inputProof } = input.encrypt();

// Use in contract call
const tx = await contract.vote(handles[0], inputProof);
```

## For React/Next.js

### Wrap Your App

```typescript
import { FhevmProvider } from '@fhevm/sdk';

function App() {
  return (
    <FhevmProvider config={{
      chainId: 11155111,
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
      publicKey: 'YOUR_PUBLIC_KEY',
    }}>
      <YourComponents />
    </FhevmProvider>
  );
}
```

### Use Hooks

```typescript
import { useFhevm } from '@fhevm/sdk';

function Component() {
  const { instance, isInitialized } = useFhevm();

  async function encrypt() {
    const input = instance.createEncryptedInput(address, user);
    input.add32(42);
    return input.encrypt();
  }
}
```

## Deploy Contracts

```bash
cd examples/contract-deployment

# Copy environment file
cp .env.example .env

# Add your keys to .env
# INFURA_PROJECT_ID=...
# PRIVATE_KEY=...

# Deploy
npm run deploy
```

## Build SDK

If you want to modify the SDK:

```bash
cd packages/fhevm-sdk
npm run build
```

## Common Tasks

### Run All Tests

```bash
npm run test:sdk
```

### Build Everything

```bash
npm run build
```

### Clean Install

```bash
npm run clean
npm install
npm run build
```

## Next Steps

1. **Explore Examples**: Check out `packages/nextjs-example/`, `packages/vue-example/`, `packages/nodejs-example/`
2. **Read Docs**: See `packages/fhevm-sdk/README.md` for full API reference
3. **Deploy Contracts**: Try `examples/contract-deployment/`
4. **Watch Demo**: See `demo.mp4` for complete walkthrough

## Troubleshooting

### "FHEVM instance not initialized"

Make sure to await client initialization:
```typescript
const client = await createFhevmClient({...});
```

### "Cannot find module '@fhevm/sdk'"

Build the SDK first:
```bash
npm run build:sdk
```

### Wallet Connection Issues

- Ensure MetaMask is installed
- Switch to Sepolia testnet
- Check you have test ETH

## Getting Help

- 📖 [Full Documentation](README.md)
- 💬 [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues)
- 🎥 [Video Demo](demo.mp4)

---

Happy Building with FHEVM! 🔐
