/**
 * Contract interaction utilities
 */

import { Contract, ContractFactory } from 'ethers';
import type { ContractConfig, DeploymentResult } from './types';
import type { Signer } from 'ethers';

/**
 * Create a contract instance
 */
export function createContractInstance(config: ContractConfig): Contract {
  const { address, abi, signerOrProvider } = config;
  return new Contract(address, abi, signerOrProvider);
}

/**
 * Deploy a contract
 */
export async function deployContract(
  abi: any[],
  bytecode: string,
  signer: Signer,
  constructorArgs: any[] = []
): Promise<DeploymentResult> {
  const factory = new ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(...constructorArgs);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const deploymentTx = contract.deploymentTransaction();

  if (!deploymentTx) {
    throw new Error('Deployment transaction not found');
  }

  const receipt = await deploymentTx.wait();

  if (!receipt) {
    throw new Error('Deployment receipt not found');
  }

  return {
    contract,
    address,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Call a contract method with encrypted inputs
 */
export async function callContractMethod(
  contract: Contract,
  methodName: string,
  args: any[] = [],
  encryptedInputs?: { handles: Uint8Array[]; inputProof: string }
): Promise<any> {
  // If encrypted inputs provided, append them to args
  if (encryptedInputs) {
    const encryptedArgs = [...args, ...encryptedInputs.handles, encryptedInputs.inputProof];
    return await contract[methodName](...encryptedArgs);
  }

  return await contract[methodName](...args);
}

/**
 * Get contract event logs
 */
export async function getContractEvents(
  contract: Contract,
  eventName: string,
  fromBlock: number = 0,
  toBlock: number | string = 'latest'
): Promise<any[]> {
  const filter = contract.filters[eventName]();
  return await contract.queryFilter(filter, fromBlock, toBlock);
}
