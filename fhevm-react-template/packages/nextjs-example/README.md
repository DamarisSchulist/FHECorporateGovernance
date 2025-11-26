# Next.js FHEVM Example

This is a complete Next.js application demonstrating the **@fhevm/sdk** integration.

## Features

- ✅ React hooks (`useFhevm`, `useFhevmContract`)
- ✅ Client-side encryption of user inputs
- ✅ Encrypted voting with FHE
- ✅ Modern Next.js 14 App Router
- ✅ TypeScript support
- ✅ Responsive UI

## Quick Start

### 1. Install Dependencies

From the root of the monorepo:

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_INFURA_KEY=your_infura_key
NEXT_PUBLIC_FHE_PUBLIC_KEY=your_fhe_public_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

### 1. Wrap Your App with FhevmProvider

```tsx
import { FhevmProvider } from '@fhevm/sdk';

<FhevmProvider config={{
  chainId: 11155111,
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  publicKey: 'YOUR_PUBLIC_KEY',
}}>
  <YourApp />
</FhevmProvider>
```

### 2. Use FHEVM Hooks in Components

```tsx
import { useFhevm } from '@fhevm/sdk';

function VotingComponent() {
  const { instance, isInitialized } = useFhevm();

  async function vote(value: number) {
    // Create encrypted input
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    input.add8(value);
    const encrypted = input.encrypt();

    // Submit to contract
    await contract.vote(encrypted.handles[0], encrypted.inputProof);
  }

  return <button onClick={() => vote(1)}>Vote</button>;
}
```

### 3. Interact with Encrypted Contracts

The SDK handles all encryption/decryption complexity:

- ✅ Automatic FHE instance initialization
- ✅ Type-safe encrypted input builders
- ✅ EIP-712 signature handling for decryption
- ✅ Contract interaction helpers

## SDK Usage Patterns

### Pattern 1: Direct Instance Access

```tsx
const { instance } = useFhevm();

const input = instance.createEncryptedInput(address, user);
input.add32(42);
const encrypted = input.encrypt();
```

### Pattern 2: Contract Hook

```tsx
const { contract, encryptInput, decrypt } = useFhevmContract({
  address: CONTRACT_ADDRESS,
  abi: ABI,
  signerOrProvider: signer,
});
```

### Pattern 3: Encrypted Input Hook

```tsx
const { createInput, encrypt } = useEncryptedInput(contractAddress, userAddress);

const input = createInput();
input.add8(1).addBool(true);
const result = await encrypt(input);
```

## Architecture

```
nextjs-example/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main page with wallet connection
│   │   ├── layout.tsx        # App layout
│   │   └── globals.css       # Global styles
│   └── components/
│       └── VotingApp.tsx     # Voting component using FHEVM SDK
├── package.json
└── next.config.js
```

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zama FHEVM](https://docs.zama.ai/fhevm)
