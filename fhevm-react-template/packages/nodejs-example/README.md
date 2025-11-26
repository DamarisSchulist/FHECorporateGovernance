# Node.js FHEVM CLI Example

A command-line tool demonstrating **@fhevm/sdk** in pure Node.js environment.

## Features

- ✅ Framework-agnostic SDK usage in Node.js
- ✅ CLI commands for encryption/decryption
- ✅ Test suite for SDK functionality
- ✅ Built with TypeScript & Commander.js

## Installation

```bash
npm install
npm run build
```

## Usage

### Test SDK

```bash
npm start test-sdk
```

### Encrypt Value

```bash
npm start encrypt 42 --type uint32
npm start encrypt true --type bool
npm start encrypt 255 --type uint8
```

### Get Info

```bash
npm start info
```

## Configuration

Create `.env` file:

```env
CHAIN_ID=11155111
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
FHE_PUBLIC_KEY=your_public_key
PRIVATE_KEY=your_private_key
```

## Code Example

```typescript
import { createFhevmClient, encryptInput } from '@fhevm/sdk';

// Initialize client
const client = await createFhevmClient({
  chainId: 11155111,
  rpcUrl: 'https://sepolia.infura.io/v3/KEY',
  publicKey: 'PUBLIC_KEY',
});

// Encrypt value
const instance = client.getInstance();
const encrypted = await encryptInput(
  instance,
  contractAddress,
  userAddress,
  42,
  'uint32'
);

console.log('Encrypted:', encrypted);
```

## Why This Matters

This example proves the SDK is truly **framework-agnostic**:
- Same API as React/Vue examples
- Works in any Node.js environment
- No framework-specific dependencies
- Can be used in backends, scripts, CLIs, etc.
