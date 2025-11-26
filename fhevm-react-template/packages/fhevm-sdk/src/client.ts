/**
 * FHEVM Client - Core client for FHE operations
 */

import { initFhevm, createInstance } from 'fhevmjs';
import type { FhevmConfig, FhevmInstance } from './types';

/**
 * FHEVM Client class
 */
export class FhevmClient {
  private instance: any = null;
  private config: FhevmConfig;
  private initialized: boolean = false;

  constructor(config: FhevmConfig) {
    this.config = config;
  }

  /**
   * Initialize the FHEVM instance
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize fhevmjs library
    await initFhevm();

    // Create instance with network configuration
    this.instance = await createInstance({
      chainId: this.config.chainId,
      publicKey: this.config.publicKey,
      gatewayUrl: this.config.gatewayAddress,
      aclAddress: this.config.aclAddress,
      kmsVerifierAddress: this.config.kmsVerifierAddress,
    });

    this.initialized = true;
  }

  /**
   * Get the FHEVM instance
   */
  getInstance(): FhevmInstance {
    if (!this.initialized || !this.instance) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }
    return {
      getInstance: () => this.instance,
      createEncryptedInput: (contractAddress: string, userAddress: string) => {
        return this.instance.createEncryptedInput(contractAddress, userAddress);
      },
      userDecrypt: async (handle: string, contractAddress: string) => {
        return await this.instance.decrypt(contractAddress, handle);
      },
      publicDecrypt: async (handle: string) => {
        return await this.instance.publicDecrypt(handle);
      },
      reencrypt: async (
        handle: bigint,
        privateKey: string,
        publicKey: string,
        signature: string,
        contractAddress: string,
        userAddress: string
      ) => {
        return await this.instance.reencrypt(
          handle,
          privateKey,
          publicKey,
          signature,
          contractAddress,
          userAddress
        );
      },
    };
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get configuration
   */
  getConfig(): FhevmConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create FHEVM client
 */
export async function createFhevmClient(config: FhevmConfig): Promise<FhevmClient> {
  const client = new FhevmClient(config);
  await client.init();
  return client;
}
