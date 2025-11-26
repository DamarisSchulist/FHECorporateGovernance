/**
 * Core types for FHEVM SDK
 */

import type { Contract, Signer, Provider } from 'ethers';

/**
 * Configuration for FHEVM client initialization
 */
export interface FhevmConfig {
  /** Network chain ID */
  chainId: number;
  /** Network RPC URL */
  rpcUrl: string;
  /** ACL contract address (optional) */
  aclAddress?: string;
  /** KMS verifier address (optional) */
  kmsVerifierAddress?: string;
  /** Gateway contract address (optional) */
  gatewayAddress?: string;
  /** Public key for encryption */
  publicKey?: string;
}

/**
 * FHEVM instance with encryption/decryption capabilities
 */
export interface FhevmInstance {
  /** Get the instance object from fhevmjs */
  getInstance: () => any;
  /** Create encrypted input builder */
  createEncryptedInput: (contractAddress: string, userAddress: string) => EncryptedInputBuilder;
  /** Decrypt a value using user's private key (EIP-712) */
  userDecrypt: (handle: string, contractAddress: string) => Promise<bigint>;
  /** Decrypt a value publicly (no signature required) */
  publicDecrypt: (handle: string) => Promise<bigint>;
  /** Reencrypt a value for viewing */
  reencrypt: (
    handle: bigint,
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddress: string,
    userAddress: string
  ) => Promise<bigint>;
}

/**
 * Encrypted input builder interface
 */
export interface EncryptedInputBuilder {
  add8(value: number): EncryptedInputBuilder;
  add16(value: number): EncryptedInputBuilder;
  add32(value: number): EncryptedInputBuilder;
  add64(value: bigint): EncryptedInputBuilder;
  add128(value: bigint): EncryptedInputBuilder;
  addBool(value: boolean): EncryptedInputBuilder;
  addAddress(value: string): EncryptedInputBuilder;
  encrypt(): EncryptedInput;
}

/**
 * Result of input encryption
 */
export interface EncryptedInput {
  handles: Uint8Array[];
  inputProof: string;
}

/**
 * Options for decryption operations
 */
export interface DecryptOptions {
  /** Contract address where the encrypted value is stored */
  contractAddress: string;
  /** User address requesting decryption */
  userAddress?: string;
  /** Signer for EIP-712 signature (required for userDecrypt) */
  signer?: Signer;
  /** Use public decryption (no signature) */
  isPublic?: boolean;
}

/**
 * Contract configuration for initialization
 */
export interface ContractConfig {
  /** Contract address */
  address: string;
  /** Contract ABI */
  abi: any[];
  /** Signer or provider */
  signerOrProvider: Signer | Provider;
}

/**
 * Result of contract deployment
 */
export interface DeploymentResult {
  /** Deployed contract instance */
  contract: Contract;
  /** Contract address */
  address: string;
  /** Deployment transaction hash */
  transactionHash: string;
  /** Block number where contract was deployed */
  blockNumber: number;
}

/**
 * Contract call options with encryption
 */
export interface ContractCallOptions {
  /** Arguments for the contract method */
  args?: any[];
  /** Encrypted inputs */
  encryptedInputs?: EncryptedInput;
  /** Gas limit */
  gasLimit?: bigint;
  /** Value to send with transaction */
  value?: bigint;
}
