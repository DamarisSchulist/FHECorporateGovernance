# Corporate Governance System

An advanced, secure, and privacy-preserving corporate governance solution for board resolutions using cutting-edge FHE (Fully Homomorphic Encryption) technology. This system ensures complete confidentiality in board voting while maintaining transparency and accountability in corporate decision-making processes.

## Live Application

**Website**: [https://fhe-corporate-governance.vercel.app/](https://fhe-corporate-governance.vercel.app/)

## Deployment Information

**Contract Address**: `0x13116d08546b78F5fDB7fA4544f778885B19A441`
**Network**: Sepolia Testnet
**Status**: Verified and Live with FHE encryption

## Core Concepts

### Board Resolution System
The Board Resolution System is a blockchain-based platform designed for corporate governance where board members can:
- Create formal resolutions and proposals
- Cast confidential votes using FHE encryption
- Manage board member access and voting power
- Monitor resolution status and outcomes
- Automatic timeout protection for reliability

### Corporate Governance Privacy Voting
Our system implements privacy-preserving voting mechanisms that ensure:
- **Vote Confidentiality**: Individual votes are encrypted and cannot be viewed by others
- **Result Transparency**: Final outcomes are visible once voting concludes
- **Audit Trail**: All transactions are recorded on-chain for accountability
- **Access Control**: Only authorized board members can participate
- **Refund Protection**: Automatic handling of decryption failures
- **Timeout Safety**: Prevents permanent locking of funds or resolutions

## Innovative Architecture

### Gateway Callback Pattern

The system uses an innovative asynchronous processing model:

```
User → Submit Encrypted Vote → Contract Records → Gateway Decrypts → Callback Completes Transaction
```

**Benefits:**
- Privacy preserved during voting period
- Efficient off-chain decryption
- Automatic timeout handling
- Secure callback verification

### Advanced Security Features

1. **Input Validation**
   - String length limits (1-1000 characters)
   - Address validation (no zero addresses)
   - Numeric range checks (voting power: 1-1000)
   - Quorum validation

2. **Access Control**
   - Role-based permissions (Chairperson, Board Members)
   - Gateway-only callbacks
   - Creator/Chairperson emergency controls

3. **Overflow Protection**
   - Native Solidity 0.8.24+ SafeMath
   - Automatic overflow/underflow detection
   - No external libraries needed

4. **Reentrancy Guards**
   - Custom lock mechanism
   - Protection on all state-changing functions
   - Safe external call handling

5. **Audit Trail**
   - Comprehensive event logging
   - Resolution lifecycle tracking
   - Decryption status monitoring
   - Timeout alerts

### Privacy Protection Techniques

#### 1. Division Problem Solution
**Challenge**: FHE doesn't support division directly

**Solution**: Random multiplier approach
```solidity
// Instead of: result = encrypted / divisor
// Use: result = (total * weight) / totalWeight
```

#### 2. Price Obfuscation
**Challenge**: Exact values could leak information

**Solution**: Obfuscation techniques
- Aggregate before revealing
- Use Gateway for controlled decryption
- Reveal only final tallies

#### 3. Async Processing
**Challenge**: Decryption cannot be synchronous

**Solution**: Gateway callback mode
- Submit encrypted request
- Gateway processes off-chain
- Callback with decrypted results
- Timeout protection for failures

#### 4. Gas Optimization
**Challenge**: FHE operations are expensive

**Solution**: Efficient HCU usage
- Minimize encrypted operations
- Use appropriate data types (euint32)
- Batch operations when possible
- Strategic decryption timing

## Key Features

- ✅ **Complete Privacy**: Voting decisions encrypted with FHE technology
- ✅ **Professional Governance**: Structured board member management system
- ✅ **Real-time Updates**: Instant resolution status and voting progress
- ✅ **Secure & Reliable**: Smart contract-based with multiple security layers
- ✅ **Voting Power Management**: Flexible voting weight assignments (1-1000)
- ✅ **Time-bound Voting**: Automatic voting period management (7 days)
- ✅ **Timeout Protection**: 1-day timeout for failed decryptions
- ✅ **Refund Mechanism**: Automatic handling of stuck resolutions
- ✅ **Gateway Integration**: Secure decryption callback pattern
- ✅ **Emergency Controls**: Creator/Chairperson timeout handling

## Development Framework

This project is built using **Hardhat**, the professional Ethereum development environment. Hardhat provides:

- **Smart Contract Development**: Robust compilation and deployment tools
- **Testing Infrastructure**: Comprehensive testing framework with Mocha and Chai
- **Network Management**: Easy configuration for multiple networks (local, testnet, mainnet)
- **Plugin Ecosystem**: Integration with verification, testing, and development tools
- **Console and REPL**: Interactive JavaScript environment for contract interaction
- **Gas Reporting**: Built-in tools for analyzing transaction costs

The project leverages Hardhat's capabilities to ensure reliable, tested, and professional smart contract deployment.

## Quick Start

Get started with the Corporate Governance System development environment:

```bash
# Install dependencies
npm install

# Compile smart contracts
npm run compile

# Run test suite
npm run test

# Deploy to Sepolia testnet
npm run deploy

# Verify contract on Etherscan
npm run verify

# Interact with deployed contract
npm run interact

# Run governance simulation
npm run simulate
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
For architecture and technical details, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Technical Architecture

For comprehensive technical documentation including:
- Gateway callback pattern details
- Security implementation specifics
- Privacy protection techniques
- Gas optimization strategies
- API documentation
- Common pitfalls and solutions

Please refer to [ARCHITECTURE.md](ARCHITECTURE.md).

## Voting Rules & Access Control

### Voting Restrictions
- **Multiple Votes Allowed**: You can update your vote before resolution closes
- **Authorization Required**: Users without proper permissions will have their voting attempts rejected
- **Eligibility Check**: Only qualified board members who meet the requirements can participate in voting
- **Time Limits**: Voting is restricted to the active voting period for each resolution

### Member Requirements
- Active board member status
- Valid voting power allocation
- Proper authentication through connected wallet
- Compliance with resolution-specific quorum requirements

## Error Handling Guide

The system provides precise error messages to help users understand and resolve issues:

### Creating Resolution Errors
- **"Quorum cannot exceed total voting power"** - The required quorum exceeds the total available voting power
- **"Quorum must be greater than 0"** - Invalid quorum specified
- **"Invalid string length"** - Title or description is empty or exceeds 1000 characters

### Adding Member Errors
- **"Invalid member address"** - Cannot add zero address as member
- **"Voting power out of range"** - Voting power must be between 1 and 1000

### Voting Errors
- **"Resolution does not exist"** - Invalid resolution ID
- **"Resolution is not active"** - The resolution is no longer accepting votes
- **"Voting period has ended"** - The voting period for this resolution has expired

### Decryption Errors
- **"Decryption already requested"** - Cannot request decryption twice
- **"Timeout period not reached"** - Must wait for timeout before manual resolution
- **"Resolution already resolved"** - Cannot resolve a completed resolution

## Technical Architecture

### Frontend Technologies
- **HTML5, CSS3, JavaScript (ES6+)**: Modern web standards
- **Tailwind CSS**: Utility-first styling framework
- **Ethers.js**: Web3 integration and smart contract interaction

### Blockchain Integration
- **FHE Protocol**: Fully homomorphic encryption for private voting
- **Ethereum Sepolia**: Testnet deployment for development and testing
- **MetaMask**: Wallet connectivity and transaction signing

### Development Tools
- **Hardhat**: Smart contract development environment
- **Solidity 0.8.24**: Latest stable Solidity compiler
- **Etherscan**: Contract verification and interaction

### Security Features
- **On-chain Encryption**: Votes are encrypted at the smart contract level using FHE
- **Access Control**: Role-based permissions (Chairperson, Board Members)
- **Time Locks**: Automatic voting period enforcement (7 days)
- **Timeout Protection**: 1-day timeout for stuck decryptions
- **Reentrancy Guards**: Prevention of reentrancy attacks
- **Input Validation**: Comprehensive validation on all inputs
- **Overflow Protection**: Native Solidity 0.8.24+ SafeMath
- **Audit Trail**: Complete transaction history on-chain
- **Gateway Security**: Only authorized Gateway can provide decrypted results
- **Emergency Controls**: Creator/Chairperson timeout handling

## User Roles

### Chairperson
- Create and manage board resolutions
- Add and remove board members
- Set voting power for members (1-1000)
- Close voting periods
- Handle decryption timeouts

### Board Members
- View active resolutions
- Cast confidential votes (can update before close)
- Monitor voting progress
- Access resolution history
- Create new resolutions

## Workflow

1. **Connection**: Board members connect their Web3 wallet
2. **Board Access**: Join the board or get added by existing members (automatic on first action)
3. **Resolution Creation**: Create new resolutions with required quorum
4. **Voting Period**: Board members cast encrypted votes during the active period (7 days)
5. **Vote Updates**: Members can update votes before resolution closes
6. **Resolution Closure**: Creator or anyone after expiry requests vote decryption
7. **Gateway Processing**: Gateway decrypts votes and calls back contract
8. **Result Compilation**: Final results are revealed and recorded
9. **Timeout Handling**: If Gateway fails, emergency timeout resolution available after 1 day

## Privacy Guarantees

- **Vote Secrecy**: Individual votes remain encrypted and private throughout voting
- **Selective Disclosure**: Only final tallies are revealed via Gateway callback
- **No Vote Correlation**: Cannot link votes to specific members
- **Future Privacy**: Votes remain private even with quantum computing advances (FHE property)
- **Controlled Decryption**: Only Gateway can decrypt, with timeout protection
- **Obfuscation**: Privacy protection techniques prevent information leakage

## Use Cases

- **Corporate Board Decisions**: Executive appointments, strategic initiatives
- **Shareholder Resolutions**: Dividend decisions, merger approvals
- **Committee Voting**: Audit committee, compensation decisions
- **Regulatory Compliance**: Meeting governance requirements privately

## Getting Started

1. Visit the live application at [https://fhe-corporate-governance.vercel.app/](https://fhe-corporate-governance.vercel.app/)
2. Connect your MetaMask wallet
3. Switch to Sepolia testnet
4. Join the board or get added as a member
5. Start participating in board governance with complete privacy

## Demo Video

A demonstration video is available showing the complete workflow of creating resolutions, managing board members, and conducting private votes.

## License

MIT License - Feel free to use, modify, and distribute according to the terms of the MIT license.

## Contributing

We welcome contributions to improve the Corporate Governance system. Please feel free to submit issues, feature requests, or pull requests to help make corporate governance more private and secure.

## Support

For technical support or questions about the system, please visit our GitHub repository or reach out through the project's communication channels.
