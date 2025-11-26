# @fhevm/sdk

Universal FHEVM SDK for building confidential dApps with Fully Homomorphic Encryption.

## Features

- 🚀 **Framework Agnostic** - Works with React, Next.js, Vue, Node.js, or any JavaScript environment
- 🔐 **Complete FHE Workflow** - Initialize, encrypt, decrypt, and interact with encrypted contracts
- 🎯 **Wagmi-like API** - Familiar hooks and patterns for web3 developers
- 📦 **All-in-One Package** - Wraps all required dependencies (fhevmjs, ethers, etc.)
- 🛠️ **TypeScript First** - Full type safety and autocomplete
- 🔌 **Modular Design** - Use only what you need

## Installation

```bash
npm install @fhevm/sdk ethers
```

## Quick Start

### Node.js / Plain JavaScript

```typescript
import { createFhevmClient, encryptInput, decryptValue } from '@fhevm/sdk';

// Initialize FHEVM client
const client = await createFhevmClient({
  chainId: 11155111,
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  publicKey: 'YOUR_PUBLIC_KEY',
});

const instance = client.getInstance();

// Encrypt input
const encrypted = await encryptInput(
  instance,
  contractAddress,
  userAddress,
  42,
  'uint32'
);

// Decrypt value
const decrypted = await decryptValue(instance, handle, {
  contractAddress,
  signer,
});
```

### React / Next.js

```typescript
import { FhevmProvider, useFhevm, useFhevmContract } from '@fhevm/sdk';

// Wrap your app
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

// Use in components
function VotingComponent() {
  const { instance, isInitialized } = useFhevm();
  const { contract, encryptInput, decrypt } = useFhevmContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    signerOrProvider: signer,
  });

  async function castVote(vote: number) {
    if (!instance) return;

    // Create encrypted input
    const input = instance.createEncryptedInput(CONTRACT_ADDRESS, userAddress);
    input.add8(vote);
    const encrypted = input.encrypt();

    // Send encrypted vote
    const tx = await contract.vote(
      encrypted.handles[0],
      encrypted.inputProof
    );
    await tx.wait();
  }

  return <button onClick={() => castVote(1)}>Vote Yes</button>;
}
```

## API Reference

### Core Client

#### `createFhevmClient(config: FhevmConfig): Promise<FhevmClient>`

Create and initialize FHEVM client.

```typescript
const client = await createFhevmClient({
  chainId: 11155111,
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  publicKey: 'YOUR_PUBLIC_KEY',
  aclAddress: '0x...',
  kmsVerifierAddress: '0x...',
  gatewayAddress: '0x...',
});
```

### Encryption

#### `encryptInput(instance, contractAddress, userAddress, value, type)`

Encrypt a single value.

```typescript
const encrypted = await encryptInput(
  instance,
  '0xContractAddress',
  '0xUserAddress',
  42,
  'uint32'
);
// encrypted: { handles: Uint8Array[], inputProof: string }
```

Supported types: `uint8`, `uint16`, `uint32`, `uint64`, `uint128`, `bool`, `address`

#### `encryptMultiple(instance, contractAddress, userAddress, values)`

Encrypt multiple values at once.

```typescript
const encrypted = await encryptMultiple(
  instance,
  contractAddress,
  userAddress,
  [
    { value: 42, type: 'uint32' },
    { value: true, type: 'bool' },
    { value: '0x...', type: 'address' },
  ]
);
```

### Decryption

#### `decryptValue(instance, handle, options)`

Decrypt an encrypted value.

```typescript
// User decryption (with EIP-712 signature)
const value = await decryptValue(instance, handle, {
  contractAddress: '0x...',
  signer: signer,
});

// Public decryption (no signature)
const publicValue = await decryptValue(instance, handle, {
  contractAddress: '0x...',
  isPublic: true,
});
```

### React Hooks

#### `useFhevm()`

Access FHEVM instance in React components.

```typescript
const { client, instance, isInitialized, error } = useFhevm();
```

#### `useFhevmContract(config)`

Interact with FHEVM contracts.

```typescript
const { contract, loading, encryptInput, decrypt } = useFhevmContract({
  address: '0x...',
  abi: [...],
  signerOrProvider: signer,
});
```

#### `useEncryptedInput(contractAddress, userAddress)`

Helper for creating encrypted inputs.

```typescript
const { createInput, encrypt, loading, error } = useEncryptedInput(
  contractAddress,
  userAddress
);

const input = createInput();
input.add32(42);
const encrypted = await encrypt(input);
```

### Contract Utilities

#### `createContractInstance(config)`

Create an ethers Contract instance.

```typescript
const contract = createContractInstance({
  address: '0x...',
  abi: [...],
  signerOrProvider: signer,
});
```

#### `deployContract(abi, bytecode, signer, args)`

Deploy a new contract.

```typescript
const { contract, address, transactionHash } = await deployContract(
  abi,
  bytecode,
  signer,
  [constructorArg1, constructorArg2]
);
```

## Examples

See the `/examples` directory for complete working examples:

- **Next.js** - Full-featured voting dApp with encrypted votes
- **Vue** - Simple counter with encrypted state
- **Node.js** - CLI tool for contract deployment and interaction

## Architecture

```
@fhevm/sdk
├── client.ts          # Core FHEVM client
├── encryption.ts      # Encryption utilities
├── contract.ts        # Contract interaction helpers
├── react.tsx          # React hooks and provider
└── types.ts           # TypeScript definitions
```

## License

MIT
