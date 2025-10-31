# Corporate Governance System - Deployment Guide

This comprehensive guide covers everything you need to deploy, verify, and interact with the Corporate Governance smart contract on Ethereum networks.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Compilation](#compilation)
- [Deployment Steps](#deployment-steps)
- [Verification](#verification)
- [Post-Deployment](#post-deployment)
- [Current Deployment Information](#current-deployment-information)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

Before deploying the Corporate Governance System, ensure you have the following installed:

**Node.js and npm**
```bash
# Required versions
Node.js >= 18.0.0
npm >= 8.0.0

# Check your versions
node --version
npm --version
```

**Required npm Packages**

The project uses the following key dependencies:
- `hardhat` (^2.19.0) - Ethereum development environment
- `@nomicfoundation/hardhat-toolbox` (^4.0.0) - Essential Hardhat plugins
- `@nomicfoundation/hardhat-verify` (^2.0.0) - Contract verification
- `dotenv` (^16.0.0) - Environment variable management

### Network Requirements

**Sepolia Testnet**
- Network RPC URL (via Infura or Alchemy)
- Testnet ETH for gas fees (get from [Sepolia Faucet](https://sepoliafaucet.com/))
- MetaMask or compatible wallet

**Mainnet** (for production deployment)
- Mainnet RPC URL
- Real ETH for gas fees
- Production-ready private key management

### Required Accounts and API Keys

1. **Infura or Alchemy Account** - For blockchain RPC access
   - Infura: [https://infura.io/](https://infura.io/)
   - Alchemy: [https://www.alchemy.com/](https://www.alchemy.com/)

2. **Etherscan API Key** - For contract verification
   - Register at: [https://etherscan.io/register](https://etherscan.io/register)
   - Create API key at: [https://etherscan.io/myapikey](https://etherscan.io/myapikey)

3. **Wallet Private Key** - For transaction signing
   - Export from MetaMask (Account Details > Export Private Key)
   - **NEVER commit this to version control**

## Environment Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/corporate-governance.git
cd corporate-governance

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
# Copy the example file
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# Network Configuration - Choose ONE provider
# Option 1: Infura
INFURA_PROJECT_ID=your_infura_project_id_here

# Option 2: Alchemy
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Private Key (NEVER commit the actual .env file)
# Export from MetaMask: Account Details > Export Private Key
# Remove the 0x prefix if present
PRIVATE_KEY=your_private_key_without_0x_prefix

# Etherscan API Key for contract verification
# Get from: https://etherscan.io/myapikey
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Gas Reporting (optional)
REPORT_GAS=false
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here

# Deployed Contract Address (update after deployment)
CONTRACT_ADDRESS=

# Network Settings
NETWORK=sepolia
```

### Step 3: Security Best Practices

**Protect Your Private Key**

```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore

# Verify .env is ignored
git check-ignore .env
```

**Recommended: Use Hardware Wallet or Key Management Service**
- For production deployments, use hardware wallets (Ledger, Trezor)
- Consider using AWS KMS, Google Cloud KMS, or HashiCorp Vault
- Never share or commit private keys

### Step 4: Verify Configuration

Check that Hardhat can connect to the network:

```bash
# Test network connection
npx hardhat console --network sepolia

# In the console, test connection:
> const network = await ethers.provider.getNetwork()
> console.log(network)
> .exit
```

## Compilation

### Compile Smart Contracts

Compile the Solidity contracts before deployment:

```bash
# Compile contracts
npm run compile

# Or use hardhat directly
npx hardhat compile
```

**Expected Output:**
```
Compiled 1 Solidity file successfully
```

### Understanding FHE Dependencies

The Corporate Governance contract uses FHE (Fully Homomorphic Encryption) technology. Key points:

1. **FHE Library Requirements**
   - The contract may require specific FHE libraries
   - Ensure all FHE-related dependencies are properly installed
   - Check for any compiler warnings related to encryption libraries

2. **Compiler Version**
   - Solidity version: `0.8.24`
   - Optimizer enabled for gas efficiency
   - EVM target: Latest stable version

3. **Compilation Artifacts**
   ```
   artifacts/
   ├── contracts/
   │   └── CorporateGovernance.sol/
   │       ├── CorporateGovernance.json
   │       └── CorporateGovernance.dbg.json
   cache/
   └── solidity-files-cache.json
   ```

### Troubleshooting Compilation

If compilation fails:

```bash
# Clean build artifacts
npx hardhat clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Compile again
npm run compile
```

## Deployment Steps

### Local Deployment (Hardhat Network)

Test deployment on local Hardhat network first:

```bash
# Start local Hardhat node
npx hardhat node

# In a new terminal, deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

**Benefits of Local Testing:**
- Free (no gas costs)
- Instant transactions
- Full control over blockchain state
- Easy debugging

### Testnet Deployment (Sepolia)

Deploy to Sepolia testnet for public testing:

```bash
# Deploy to Sepolia
npm run deploy

# Or with explicit network flag
npx hardhat run scripts/deploy.js --network sepolia
```

**Deployment Process:**

1. **Pre-deployment Checks**
   - Verifies deployer account balance
   - Confirms network connection
   - Displays deployment parameters

2. **Contract Deployment**
   - Deploys CorporateGovernance contract
   - Waits for transaction confirmation
   - Returns contract address

3. **Post-deployment Verification**
   - Verifies initial contract state
   - Checks chairperson setup
   - Confirms total voting power

### Understanding the Deploy Script

The `deploy.js` script performs the following:

```javascript
// Key deployment steps:
1. Get deployer account and verify balance
2. Deploy CorporateGovernance contract
3. Wait for deployment transaction to be mined
4. Verify initial contract state
5. Save deployment information to JSON files
6. Display explorer links and next steps
```

**Deployment Output:**

```
======================================================================
CORPORATE GOVERNANCE CONTRACT DEPLOYMENT
======================================================================

Network Information:
----------------------------------------------------------------------
Network: sepolia
Chain ID: 11155111

Deployer Information:
----------------------------------------------------------------------
Address: 0x1234...5678
Balance: 0.5 ETH

Deploying Contract...
----------------------------------------------------------------------
Waiting for deployment transaction to be mined...

Deployment Successful!
----------------------------------------------------------------------
Contract Address: 0x13116d08546b78F5fDB7fA4544f778885B19A441
Transaction Hash: 0xabc...def
Block Number: 4567890

Verifying Initial Contract State...
----------------------------------------------------------------------
Chairperson: 0x1234...5678
Total Voting Power: 100
Resolution Count: 0

Initial Board Member (Chairperson):
  Active: true
  Name: Chairperson
  Position: Chair
  Voting Power: 100

Explorer Links:
----------------------------------------------------------------------
Contract: https://sepolia.etherscan.io/address/0x13116d08546b78F5fDB7fA4544f778885B19A441
Transaction: https://sepolia.etherscan.io/tx/0xabc...def

Deployment Info Saved:
----------------------------------------------------------------------
File: deployments/latest-sepolia.json
Archive: deployments/deployment-sepolia-1234567890.json
```

### Deployment Information Files

After deployment, two JSON files are created:

1. **latest-[network].json** - Current deployment
2. **deployment-[network]-[timestamp].json** - Historical record

**Example deployment JSON:**
```json
{
  "contractName": "CorporateGovernance",
  "contractAddress": "0x13116d08546b78F5fDB7fA4544f778885B19A441",
  "deployer": "0x1234...5678",
  "deployerBalance": "0.5",
  "network": "sepolia",
  "chainId": "11155111",
  "timestamp": "2025-10-30T12:00:00.000Z",
  "txHash": "0xabc...def",
  "blockNumber": "4567890",
  "explorerUrl": "https://sepolia.etherscan.io/address/0x13116d08546b78F5fDB7fA4544f778885B19A441",
  "apiUrl": "https://api-sepolia.etherscan.io/api",
  "compiler": {
    "version": "0.8.24",
    "optimizer": true
  }
}
```

## Verification

Contract verification on Etherscan allows users to read and interact with your contract directly from the blockchain explorer.

### Automatic Verification

Use the verify script after deployment:

```bash
# Verify on Sepolia
npm run verify

# Or with explicit network
npx hardhat run scripts/verify.js --network sepolia
```

**Verification Process:**

1. **Load Deployment Info**
   - Reads latest deployment JSON
   - Extracts contract address and network

2. **Submit to Etherscan**
   - Uploads source code
   - Provides constructor arguments
   - Specifies compiler settings

3. **Confirmation**
   - Waits for Etherscan verification
   - Displays verification status

**Successful Verification Output:**

```
======================================================================
CONTRACT VERIFICATION
======================================================================

Network: sepolia

Loading Deployment Info...
----------------------------------------------------------------------
Contract: CorporateGovernance
Address: 0x13116d08546b78F5fDB7fA4544f778885B19A441
Network: sepolia
Deployed: 2025-10-30T12:00:00.000Z

Verifying Contract on Etherscan...
----------------------------------------------------------------------
Successfully submitted source code for contract verification on Etherscan.
Waiting for verification result...

======================================================================
VERIFICATION SUCCESSFUL
======================================================================

Contract verified successfully!
View on Etherscan: https://sepolia.etherscan.io/address/0x13116d08546b78F5fDB7fA4544f778885B19A441
======================================================================
```

### Manual Verification

If automatic verification fails, verify manually on Etherscan:

1. **Visit Etherscan**
   - Go to your contract address
   - Click "Contract" tab
   - Click "Verify and Publish"

2. **Enter Contract Details**
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.24+commit.e11b9ed9
   - License: MIT

3. **Paste Contract Code**
   - Copy entire CorporateGovernance.sol
   - Include all imports and dependencies

4. **Constructor Arguments**
   - Leave empty (no constructor arguments)

5. **Optimization**
   - Enabled: Yes
   - Runs: 200 (default)

### Verification Troubleshooting

**Error: "Already Verified"**
```
This contract has already been verified.
No action needed.
```

**Error: "Missing API Key"**
```bash
# Solution: Add Etherscan API key to .env
ETHERSCAN_API_KEY=your_api_key_here
```

**Error: "Invalid API Key"**
```bash
# Solution: Verify API key at https://etherscan.io/myapikey
# Ensure no extra spaces or characters
```

**Error: "Contract does not have bytecode"**
```bash
# Solution: Wait 1-2 minutes after deployment
# Then retry verification
```

## Post-Deployment

### Using interact.js Script

The interact script allows you to perform operations on the deployed contract:

```bash
# Run interact script
npm run interact

# Or with explicit network
npx hardhat run scripts/interact.js --network sepolia
```

**Available Operations:**

1. **View Contract State**
   - Get chairperson address
   - Check total voting power
   - List all board members
   - View active resolutions

2. **Board Member Management**
   - Add new board member
   - Remove board member
   - Update voting power
   - Check member status

3. **Resolution Management**
   - Create new resolution
   - Vote on resolution
   - Close voting period
   - Check resolution results

**Example Interaction:**

```javascript
// interact.js usage example
const contract = await ethers.getContractAt(
  "CorporateGovernance",
  contractAddress
);

// Add board member
await contract.addBoardMember(
  "0x1234...5678",
  "John Doe",
  "CFO",
  50
);

// Create resolution
await contract.createResolution(
  "Approve Annual Budget",
  "Approve the 2026 annual budget of $10M",
  3600, // 1 hour voting period
  75    // 75% quorum required
);

// Cast vote
await contract.vote(0, true); // Vote YES on resolution 0
```
