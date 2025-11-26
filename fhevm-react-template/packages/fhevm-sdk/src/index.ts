/**
 * @fhevm/sdk - Universal FHEVM SDK
 * Framework-agnostic SDK for building confidential dApps with FHE
 */

export { FhevmClient, createFhevmClient } from './client';
export { FhevmProvider, useFhevm, useFhevmContract } from './react';
export { encryptInput, decryptValue, createEncryptedInput } from './encryption';
export { createContractInstance, deployContract } from './contract';
export type {
  FhevmConfig,
  FhevmInstance,
  EncryptedInput,
  DecryptOptions,
  ContractConfig,
  DeploymentResult,
} from './types';
