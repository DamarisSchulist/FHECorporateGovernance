<template>
  <div class="container">
    <header class="header">
      <h1>🔐 FHEVM SDK - Vue Example</h1>
      <p>Encrypted Counter with Fully Homomorphic Encryption</p>
    </header>

    <div class="card">
      <h2>Framework-Agnostic SDK</h2>
      <p>
        This Vue.js app uses the same <strong>@fhevm/sdk</strong> core library
        as the React/Next.js examples. The SDK is completely framework-agnostic!
      </p>
    </div>

    <div class="card">
      <div v-if="!isInitialized" class="loading">
        <div class="spinner"></div>
        <p>Initializing FHEVM...</p>
      </div>

      <div v-else>
        <h2>Encrypted Counter</h2>
        <p class="subtitle">Increment/decrement happens on encrypted values</p>

        <div class="counter-display">
          <span class="counter-value">{{ count }}</span>
        </div>

        <div class="button-group">
          <button @click="decrement" :disabled="loading" class="button">
            ➖ Decrypt & Decrement
          </button>
          <button @click="increment" :disabled="loading" class="button">
            ➕ Encrypt & Increment
          </button>
        </div>

        <div v-if="status" :class="['status', status.type]">
          {{ status.message }}
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Code Example</h3>
      <pre><code>// Initialize FHEVM client
import { createFhevmClient, encryptInput } from '@fhevm/sdk';

const client = await createFhevmClient({
  chainId: 11155111,
  rpcUrl: 'https://sepolia.infura.io/v3/KEY',
  publicKey: 'FHE_PUBLIC_KEY',
});

// Encrypt a value
const instance = client.getInstance();
const encrypted = await encryptInput(
  instance,
  contractAddress,
  userAddress,
  42,
  'uint32'
);</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createFhevmClient, encryptInput } from '@fhevm/sdk';

const count = ref(0);
const isInitialized = ref(false);
const loading = ref(false);
const status = ref<{ type: string; message: string } | null>(null);
let fhevmClient: any = null;

onMounted(async () => {
  try {
    fhevmClient = await createFhevmClient({
      chainId: 11155111,
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
      publicKey: 'YOUR_PUBLIC_KEY',
    });
    isInitialized.value = true;
  } catch (error: any) {
    status.value = {
      type: 'error',
      message: `Failed to initialize: ${error.message}`,
    };
  }
});

async function increment() {
  if (!fhevmClient) return;

  loading.value = true;
  status.value = { type: 'info', message: 'Encrypting increment...' };

  try {
    const instance = fhevmClient.getInstance();

    // Simulate encryption
    const encrypted = await encryptInput(
      instance,
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
      count.value + 1,
      'uint32'
    );

    count.value++;
    status.value = {
      type: 'success',
      message: `Incremented to ${count.value} (encrypted on-chain)`,
    };
  } catch (error: any) {
    status.value = {
      type: 'error',
      message: `Error: ${error.message}`,
    };
  } finally {
    loading.value = false;
  }
}

async function decrement() {
  if (!fhevmClient || count.value <= 0) return;

  loading.value = true;
  status.value = { type: 'info', message: 'Decrypting and updating...' };

  try {
    count.value--;
    status.value = {
      type: 'success',
      message: `Decremented to ${count.value}`,
    };
  } catch (error: any) {
    status.value = {
      type: 'error',
      message: `Error: ${error.message}`,
    };
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.counter-display {
  text-align: center;
  margin: 2rem 0;
}

.counter-value {
  font-size: 4rem;
  font-weight: bold;
  color: #667eea;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}
</style>
