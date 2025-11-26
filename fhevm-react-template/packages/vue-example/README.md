# Vue.js FHEVM Example

Demonstrates **@fhevm/sdk** integration with Vue.js 3.

## Features

- ✅ Framework-agnostic SDK usage
- ✅ Composition API with `<script setup>`
- ✅ Encrypted counter example
- ✅ Vite build system

## Quick Start

```bash
npm install
npm run dev
```

## Usage

```typescript
import { createFhevmClient, encryptInput } from '@fhevm/sdk';

// Initialize
const client = await createFhevmClient({
  chainId: 11155111,
  rpcUrl: 'https://sepolia.infura.io/v3/KEY',
  publicKey: 'PUBLIC_KEY',
});

// Use in component
const instance = client.getInstance();
const encrypted = await encryptInput(instance, address, user, 42, 'uint32');
```

The SDK works identically across React, Vue, Next.js, and plain JavaScript!
