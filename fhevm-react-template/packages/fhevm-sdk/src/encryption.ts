/**
 * Encryption utilities for FHEVM
 */

import type { FhevmInstance, EncryptedInput, EncryptedInputBuilder, DecryptOptions } from './types';

/**
 * Create an encrypted input builder
 */
export function createEncryptedInput(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string
): EncryptedInputBuilder {
  return instance.createEncryptedInput(contractAddress, userAddress);
}

/**
 * Encrypt a single value
 */
export async function encryptInput(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  value: number | bigint | boolean | string,
  type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'bool' | 'address' = 'uint32'
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, userAddress);

  switch (type) {
    case 'uint8':
      input.add8(Number(value));
      break;
    case 'uint16':
      input.add16(Number(value));
      break;
    case 'uint32':
      input.add32(Number(value));
      break;
    case 'uint64':
      input.add64(BigInt(value));
      break;
    case 'uint128':
      input.add128(BigInt(value));
      break;
    case 'bool':
      input.addBool(Boolean(value));
      break;
    case 'address':
      input.addAddress(String(value));
      break;
    default:
      throw new Error(`Unsupported encryption type: ${type}`);
  }

  return input.encrypt();
}

/**
 * Decrypt a value from the blockchain
 */
export async function decryptValue(
  instance: FhevmInstance,
  handle: string,
  options: DecryptOptions
): Promise<bigint> {
  const { contractAddress, isPublic = false, signer } = options;

  if (isPublic) {
    // Public decryption (no signature required)
    return await instance.publicDecrypt(handle);
  }

  if (!signer) {
    throw new Error('Signer is required for user decryption');
  }

  // User decryption with EIP-712 signature
  return await instance.userDecrypt(handle, contractAddress);
}

/**
 * Helper to encrypt multiple values
 */
export async function encryptMultiple(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  values: Array<{
    value: number | bigint | boolean | string;
    type: 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'bool' | 'address';
  }>
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, userAddress);

  for (const { value, type } of values) {
    switch (type) {
      case 'uint8':
        input.add8(Number(value));
        break;
      case 'uint16':
        input.add16(Number(value));
        break;
      case 'uint32':
        input.add32(Number(value));
        break;
      case 'uint64':
        input.add64(BigInt(value));
        break;
      case 'uint128':
        input.add128(BigInt(value));
        break;
      case 'bool':
        input.addBool(Boolean(value));
        break;
      case 'address':
        input.addAddress(String(value));
        break;
    }
  }

  return input.encrypt();
}
