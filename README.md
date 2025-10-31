# Corporate Governance - Privacy-Preserving Board Resolution System

A secure and private corporate governance solution for board resolutions using advanced FHE (Fully Homomorphic Encryption) technology. This system ensures complete confidentiality in board voting while maintaining transparency and accountability in corporate decision-making processes.

## 🌐 Live Application

**Website**: [https://corporate-governance.vercel.app/](https://corporate-governance.vercel.app/)  
**GitHub**: [https://github.com/DamarisSchulist/CorporateGovernance](https://github.com/DamarisSchulist/CorporateGovernance)

## 🏛️ Core Concepts

### Board Resolution System
The Board Resolution System is a blockchain-based platform designed for corporate governance where board members can:
- Create formal resolutions and proposals
- Cast confidential votes using FHE encryption
- Manage board member access and voting power
- Monitor resolution status and outcomes

### Corporate Governance Privacy Voting
Our system implements privacy-preserving voting mechanisms that ensure:
- **Vote Confidentiality**: Individual votes are encrypted and cannot be viewed by others
- **Result Transparency**: Final outcomes are visible once voting concludes
- **Audit Trail**: All transactions are recorded on-chain for accountability
- **Access Control**: Only authorized board members can participate

## ✨ Key Features

- 🔐 **Complete Privacy**: Voting decisions encrypted with FHE technology
- 🏛️ **Professional Governance**: Structured board member management system
- ⚡ **Real-time Updates**: Instant resolution status and voting progress
- 🛡️ **Secure & Reliable**: Smart contract-based with multiple security layers
- 📊 **Voting Power Management**: Flexible voting weight assignments
- ⏰ **Time-bound Voting**: Automatic voting period management

## 🎮 Demo Video

A demonstration video is available showing the complete workflow of creating resolutions, managing board members, and conducting private votes.

## 🔧 Smart Contract

**Contract Address**: `0x13116d08546b78F5fDB7fA4544f778885B19A441`  
**Network**: Sepolia Testnet  
**Verification**: ✅ Live with FHE encryption

## 🔒 Voting Rules & Access Control

### Voting Restrictions
- **Single Vote Policy**: If you have already voted on a resolution, you cannot vote again
- **Authorization Required**: Users without proper permissions will have their voting attempts rejected
- **Eligibility Check**: Only qualified board members who meet the requirements can participate in voting
- **Time Limits**: Voting is restricted to the active voting period for each resolution

### Member Requirements
- Active board member status
- Valid voting power allocation
- Proper authentication through connected wallet
- Compliance with resolution-specific quorum requirements

## 🚨 Error Handling Guide

The system provides precise error messages to help users understand and resolve issues:

### Creating Resolution Errors
- ⚠️ **"Quorum cannot exceed total voting power"** → The required quorum exceeds the total available voting power
- ⚠️ **"Only active board members"** → You must be an active board member to create resolutions

### Adding Member Errors
- ⚠️ **"Member already exists"** → This address is already registered as a board member
- ⚠️ **"Voting power must be greater than 0"** → Invalid voting power specified

### Voting Errors
- ⚠️ **"Only active board members"** → You must be an active board member to vote
- ⚠️ **"Already voted"** → You have already cast your vote for this resolution
- ⚠️ **"Voting period has ended"** → The voting period for this resolution has expired
- ⚠️ **"Resolution is not active"** → The resolution is no longer accepting votes

## 🛠️ Technical Architecture

### Frontend Technologies
- **HTML5, CSS3, JavaScript (ES6+)**: Modern web standards
- **Tailwind CSS**: Utility-first styling framework
- **Ethers.js**: Web3 integration and smart contract interaction

### Blockchain Integration
- **FHE Protocol**: Fully homomorphic encryption for private voting
- **Ethereum Sepolia**: Testnet deployment for development and testing
- **MetaMask**: Wallet connectivity and transaction signing

### Security Features
- **On-chain Encryption**: Votes are encrypted at the smart contract level
- **Access Control**: Role-based permissions (Chairperson, Board Members)
- **Time Locks**: Automatic voting period enforcement
- **Audit Trail**: Complete transaction history on-chain

## 📋 User Roles

### Chairperson
- Create and manage board resolutions
- Add and remove board members
- Set voting power for members
- Close voting periods

### Board Members
- View active resolutions
- Cast confidential votes
- Monitor voting progress
- Access resolution history

## 🎯 Workflow

1. **Connection**: Board members connect their Web3 wallet
2. **Board Access**: Join the board or get added by existing members
3. **Resolution Creation**: Create new resolutions with required quorum
4. **Voting Period**: Board members cast encrypted votes during the active period
5. **Result Compilation**: Votes are tallied using FHE computation
6. **Resolution Closure**: Final results are revealed and recorded

## 🔒 Privacy Guarantees

- **Vote Secrecy**: Individual votes remain encrypted and private
- **Selective Disclosure**: Only final tallies are revealed
- **No Vote Correlation**: Cannot link votes to specific members
- **Future Privacy**: Votes remain private even with quantum computing advances

## 🌟 Use Cases

- **Corporate Board Decisions**: Executive appointments, strategic initiatives
- **Shareholder Resolutions**: Dividend decisions, merger approvals
- **Committee Voting**: Audit committee, compensation decisions
- **Regulatory Compliance**: Meeting governance requirements privately

## 🚀 Getting Started

1. Visit the live application at [https://corporate-governance.vercel.app/](https://corporate-governance.vercel.app/)
2. Connect your MetaMask wallet
3. Switch to Sepolia testnet
4. Join the board or get added as a member
5. Start participating in board governance with complete privacy

## 📄 License

MIT License - Feel free to use, modify, and distribute according to the terms of the MIT license.

## 🤝 Contributing

We welcome contributions to improve the Corporate Governance system. Please feel free to submit issues, feature requests, or pull requests to help make corporate governance more private and secure.

## 📞 Support

For technical support or questions about the system, please visit our GitHub repository or reach out through the project's communication channels.