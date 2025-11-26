#!/usr/bin/env node

/**
 * FHEVM CLI - Node.js example using @fhevm/sdk
 * Demonstrates framework-agnostic usage in pure Node.js
 */

import { Command } from 'commander';
import { createFhevmClient, encryptInput, decryptValue } from '@fhevm/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const program = new Command();

program
  .name('fhevm-cli')
  .description('CLI tool for FHEVM operations using @fhevm/sdk')
  .version('1.0.0');

program
  .command('encrypt')
  .description('Encrypt a value using FHEVM')
  .argument('<value>', 'Value to encrypt')
  .option('-t, --type <type>', 'Value type (uint8, uint16, uint32, uint64, bool)', 'uint32')
  .option('-c, --contract <address>', 'Contract address')
  .option('-u, --user <address>', 'User address')
  .action(async (value, options) => {
    try {
      console.log('🔐 Initializing FHEVM SDK...\n');

      const client = await createFhevmClient({
        chainId: parseInt(process.env.CHAIN_ID || '11155111'),
        rpcUrl: process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY',
        publicKey: process.env.FHE_PUBLIC_KEY || '',
      });

      const instance = client.getInstance();

      console.log('✨ Encrypting value...\n');

      const encrypted = await encryptInput(
        instance,
        options.contract || '0x0000000000000000000000000000000000000000',
        options.user || '0x0000000000000000000000000000000000000000',
        value,
        options.type
      );

      console.log('✅ Encryption successful!\n');
      console.log('Encrypted handles:', encrypted.handles);
      console.log('Input proof:', encrypted.inputProof.slice(0, 50) + '...');
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('test-sdk')
  .description('Test FHEVM SDK initialization and basic operations')
  .action(async () => {
    try {
      console.log('='.repeat(60));
      console.log('FHEVM SDK Test Suite');
      console.log('='.repeat(60));
      console.log();

      console.log('1️⃣  Testing SDK initialization...');
      const client = await createFhevmClient({
        chainId: 11155111,
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
        publicKey: process.env.FHE_PUBLIC_KEY || '',
      });
      console.log('   ✅ Client initialized successfully');
      console.log();

      console.log('2️⃣  Testing instance creation...');
      const instance = client.getInstance();
      console.log('   ✅ Instance created');
      console.log();

      console.log('3️⃣  Testing encryption...');
      const testAddress = '0x0000000000000000000000000000000000000000';

      // Test different types
      const tests = [
        { value: 42, type: 'uint32' as const, name: 'uint32' },
        { value: true, type: 'bool' as const, name: 'boolean' },
        { value: 255, type: 'uint8' as const, name: 'uint8' },
      ];

      for (const test of tests) {
        try {
          const encrypted = await encryptInput(
            instance,
            testAddress,
            testAddress,
            test.value,
            test.type
          );
          console.log(`   ✅ ${test.name} encryption successful`);
        } catch (err: any) {
          console.log(`   ❌ ${test.name} encryption failed: ${err.message}`);
        }
      }

      console.log();
      console.log('='.repeat(60));
      console.log('✨ All tests completed!');
      console.log('='.repeat(60));
    } catch (error: any) {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Display SDK information and usage examples')
  .action(() => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    FHEVM SDK CLI Tool                      ║
╚════════════════════════════════════════════════════════════╝

A Node.js CLI demonstrating the @fhevm/sdk package.

📦 Framework-Agnostic
   The same SDK works in React, Vue, Next.js, and Node.js!

🔐 Features:
   • Client initialization
   • Input encryption (uint8, uint16, uint32, uint64, bool, address)
   • Value decryption (user & public)
   • Contract interaction helpers

📚 Usage Examples:

   # Test the SDK
   npm start test-sdk

   # Encrypt a value
   npm start encrypt 42 --type uint32

   # Encrypt with contract context
   npm start encrypt 100 --contract 0x123... --user 0xabc...

🔗 Environment Variables (.env):

   CHAIN_ID=11155111
   RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   FHE_PUBLIC_KEY=your_public_key
   PRIVATE_KEY=your_private_key

📖 Documentation:
   See packages/fhevm-sdk/README.md for full API reference.

`);
  });

program.parse();
