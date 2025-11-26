/**
 * React hooks and provider for FHEVM
 * Wagmi-like API for React applications
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { FhevmClient } from './client';
import type { FhevmConfig, FhevmInstance, ContractConfig } from './types';
import { Contract } from 'ethers';

/**
 * Context for FHEVM provider
 */
interface FhevmContextValue {
  client: FhevmClient | null;
  instance: FhevmInstance | null;
  isInitialized: boolean;
  error: Error | null;
}

const FhevmContext = createContext<FhevmContextValue>({
  client: null,
  instance: null,
  isInitialized: false,
  error: null,
});

/**
 * FHEVM Provider Props
 */
interface FhevmProviderProps {
  config: FhevmConfig;
  children: React.ReactNode;
}

/**
 * FHEVM Provider Component
 * Wrap your app with this to enable FHEVM hooks
 */
export function FhevmProvider({ config, children }: FhevmProviderProps) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const fhevmClient = new FhevmClient(config);
        await fhevmClient.init();

        if (mounted) {
          setClient(fhevmClient);
          setInstance(fhevmClient.getInstance());
          setIsInitialized(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize FHEVM'));
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [config]);

  return (
    <FhevmContext.Provider value={{ client, instance, isInitialized, error }}>
      {children}
    </FhevmContext.Provider>
  );
}

/**
 * Hook to access FHEVM instance
 */
export function useFhevm() {
  const context = useContext(FhevmContext);

  if (!context) {
    throw new Error('useFhevm must be used within FhevmProvider');
  }

  return {
    client: context.client,
    instance: context.instance,
    isInitialized: context.isInitialized,
    error: context.error,
  };
}

/**
 * Hook to interact with FHEVM contracts
 */
export function useFhevmContract(config: ContractConfig) {
  const { instance, isInitialized } = useFhevm();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      const contractInstance = new Contract(
        config.address,
        config.abi,
        config.signerOrProvider
      );
      setContract(contractInstance);
      setLoading(false);
    }
  }, [config.address, config.abi, config.signerOrProvider, isInitialized]);

  /**
   * Encrypt input for contract call
   */
  const encryptInput = useCallback(
    (contractAddress: string, userAddress: string) => {
      if (!instance) {
        throw new Error('FHEVM instance not initialized');
      }
      return instance.createEncryptedInput(contractAddress, userAddress);
    },
    [instance]
  );

  /**
   * Decrypt value from contract
   */
  const decrypt = useCallback(
    async (handle: string, contractAddress: string, isPublic = false) => {
      if (!instance) {
        throw new Error('FHEVM instance not initialized');
      }

      if (isPublic) {
        return await instance.publicDecrypt(handle);
      }

      return await instance.userDecrypt(handle, contractAddress);
    },
    [instance]
  );

  return {
    contract,
    loading,
    encryptInput,
    decrypt,
    instance,
  };
}

/**
 * Hook for encrypted input creation
 */
export function useEncryptedInput(contractAddress: string, userAddress: string) {
  const { instance } = useFhevm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createInput = useCallback(() => {
    if (!instance) {
      throw new Error('FHEVM instance not initialized');
    }
    return instance.createEncryptedInput(contractAddress, userAddress);
  }, [instance, contractAddress, userAddress]);

  const encrypt = useCallback(
    async (builder: any) => {
      setLoading(true);
      setError(null);
      try {
        const result = builder.encrypt();
        setLoading(false);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  return {
    createInput,
    encrypt,
    loading,
    error,
  };
}
