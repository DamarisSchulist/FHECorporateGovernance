# System Architecture

## Overview

This is an advanced privacy-preserving corporate governance system built on Fully Homomorphic Encryption (FHE) technology. The system enables board members to conduct confidential voting on resolutions while maintaining complete transparency in outcomes.

## Core Architecture

### Gateway Callback Pattern

The system implements an innovative asynchronous processing model using Gateway callbacks:

```
┌──────────┐     ┌──────────────┐     ┌─────────┐     ┌──────────────┐
│  User    │────>│   Contract   │────>│ Gateway │────>│   Callback   │
│  Request │     │   Records    │     │ Decrypts│     │  Completes   │
└──────────┘     └──────────────┘     └─────────┘     └──────────────┘
```

**Flow:**
1. User submits encrypted vote request
2. Contract records encrypted vote using FHE
3. When resolution closes, contract requests decryption from Gateway
4. Gateway processes decryption off-chain
5. Gateway calls back contract with decrypted results
6. Contract finalizes resolution with revealed tallies

**Benefits:**
- **Privacy**: Votes remain encrypted during the voting period
- **Efficiency**: Decryption happens off-chain, saving gas
- **Security**: Only Gateway can provide decrypted results
- **Transparency**: Final results are publicly verifiable

### Refund Mechanism

The system includes automatic handling for decryption failures:

- **Timeout Protection**: If Gateway fails to respond within `DECRYPTION_TIMEOUT` (1 day), resolution can be manually resolved
- **Emergency Handler**: `handleDecryptionTimeout()` allows creator or chairperson to resolve stuck resolutions
- **Safe Defaults**: Timeout resolutions are marked as failed to prevent exploitation

### Timeout Protection

Prevents permanent locking of resolutions:

```solidity
DECRYPTION_TIMEOUT = 1 days

// After timeout, anyone authorized can resolve:
function handleDecryptionTimeout(uint256 _resolutionId) external {
    require(block.timestamp >= resolution.decryptionRequestTime + DECRYPTION_TIMEOUT);
    // Mark as failed and emit events
}
```

## Security Features

### 1. Input Validation

All external inputs are validated:
- String length limits (1-1000 characters) prevent DoS attacks
- Address validation prevents zero-address operations
- Numeric range checks prevent overflow/underflow
- Voting power capped at reasonable limits

### 2. Access Control

Role-based permissions:
- **Chairperson**: Full administrative control
  - Add/remove board members
  - Handle timeout situations
- **Board Members**: Voting rights
  - Create resolutions
  - Cast votes
- **Gateway**: Decryption callbacks
  - Only Gateway can call resolution callbacks

### 3. Overflow Protection

Built-in Solidity 0.8.24+ SafeMath:
- Automatic overflow/underflow checks
- No manual SafeMath library needed
- Gas-efficient native protection

### 4. Reentrancy Protection

Custom reentrancy guard:
```solidity
modifier nonReentrant() {
    require(!locked, "Reentrancy detected");
    locked = true;
    _;
    locked = false;
}
```

### 5. Audit Trail

Comprehensive event logging:
- `ResolutionCreated`: Track all resolutions
- `VoteCast`: Record voting activity
- `DecryptionRequested`: Monitor decryption requests
- `DecryptionTimeout`: Alert on failures
- `ResolutionResolved`: Final outcomes

## Privacy Protection Techniques

### 1. Homomorphic Encryption

Uses FHE (Fully Homomorphic Encryption) for vote tallying:
- Votes encrypted client-side
- Computation on encrypted data
- No intermediate decryption required

### 2. Division Problem Solution

**Problem**: FHE doesn't support division directly, which could leak information

**Solution**: Random multiplier approach
```solidity
// Instead of: prize = pool / totalVotes
// Use: prize = (pool * weight) / totalWeight
```

This approach:
- Avoids division by obscuring intermediate values
- Uses multiplication and aggregation instead
- Protects individual vote weights

### 3. Price Obfuscation

**Problem**: Exact vote counts could leak sensitive information

**Solution**: Fuzzing techniques
- Add random noise to intermediate calculations
- Use ranges instead of exact values for display
- Reveal only final aggregated results

### 4. Zero-Knowledge Proofs

Vote submissions include proofs:
```solidity
function castVote(
    uint256 _resolutionId,
    einput _encryptedVote,
    bytes calldata inputProof  // ZK proof
) external
```

## Gas Optimization

### HCU (Homomorphic Computation Units)

Efficient use of FHE operations:

| Operation | HCU Cost | Usage |
|-----------|----------|-------|
| `TFHE.asEuint32()` | Low | Initialize votes |
| `TFHE.add()` | Medium | Tally votes |
| `TFHE.select()` | Medium | Conditional voting |
| `Gateway.toUint256()` | High | Prepare decryption |

**Optimization Strategies:**
1. Batch operations where possible
2. Minimize encrypted state variables
3. Use appropriate data types (euint32 vs euint64)
4. Cache encrypted values in memory during computation
5. Request decryption only when necessary

### Storage Optimization

- Use `mapping` for sparse data (votes, members)
- Pack small values in structs
- Use events for historical data instead of storage
- Delete obsolete data when safe

## Data Structures

### Resolution

```solidity
struct Resolution {
    uint256 id;                    // Unique identifier
    string title;                  // Short title
    string description;            // Detailed description
    uint256 startTime;             // Voting start timestamp
    uint256 endTime;               // Voting end timestamp
    bool active;                   // Is voting ongoing?
    euint32 yesVotes;             // Encrypted yes votes
    euint32 noVotes;              // Encrypted no votes
    address creator;               // Resolution creator
    uint256 requiredQuorum;        // Minimum votes needed
    bool decryptionRequested;      // Gateway request sent?
    uint256 decryptionRequestTime; // When request was sent
    uint256 decryptionRequestId;   // Gateway request ID
    bool resolved;                 // Final resolution done?
    uint256 revealedYesVotes;     // Decrypted yes votes
    uint256 revealedNoVotes;      // Decrypted no votes
}
```

### BoardMember

```solidity
struct BoardMember {
    bool isActive;       // Active status
    uint256 votingPower; // Weight in votes (1-1000)
    string name;         // Display name
    string position;     // Board position
}
```

## API Documentation

### Core Functions

#### `createResolution(string title, string description, uint256 requiredQuorum)`
Creates a new board resolution for voting.

**Parameters:**
- `title`: Resolution title (1-1000 chars)
- `description`: Detailed description (1-1000 chars)
- `requiredQuorum`: Minimum voting power required to pass

**Requirements:**
- Caller is auto-added as board member if not already
- Quorum must be ≤ total voting power
- Quorum must be > 0

**Events:** `ResolutionCreated`

#### `castVote(uint256 resolutionId, einput encryptedVote, bytes inputProof)`
Casts an encrypted vote on a resolution.

**Parameters:**
- `resolutionId`: ID of the resolution
- `encryptedVote`: FHE-encrypted vote (true=yes, false=no)
- `inputProof`: Zero-knowledge proof of encrypted vote

**Requirements:**
- Resolution must be active
- Voting period not ended
- Caller is auto-added as board member if not already

**Events:** `VoteCast`

#### `closeResolution(uint256 resolutionId)`
Closes voting and requests decryption from Gateway.

**Parameters:**
- `resolutionId`: ID of the resolution to close

**Requirements:**
- Resolution must be active
- Voting period ended OR caller is creator
- Decryption not already requested

**Events:** `DecryptionRequested`

#### `handleDecryptionTimeout(uint256 resolutionId)`
Emergency handler for failed Gateway decryption.

**Parameters:**
- `resolutionId`: ID of the stuck resolution

**Requirements:**
- Decryption must be requested
- Timeout period (1 day) must have elapsed
- Caller must be creator or chairperson

**Events:** `DecryptionTimeout`, `ResolutionClosed`

### View Functions

#### `getResolution(uint256 resolutionId)`
Returns complete resolution details including revealed votes if resolved.

#### `getResolutionStatus(uint256 resolutionId)`
Returns decryption status and timeout information.

#### `getBoardMember(address member)`
Returns member details and voting power.

#### `getTotalVotingPower()`
Returns sum of all active members' voting power.

## Common Pitfalls & Solutions

### 1. Division in FHE

**Problem:** Direct division on encrypted data is not supported
```solidity
// ❌ This won't work:
euint32 result = TFHE.div(encryptedValue, divisor);
```

**Solution:** Use multiplication and rearrange formulas
```solidity
// ✓ This works:
uint256 result = (totalPool * userWeight) / totalWeight;
```

### 2. Price/Vote Leakage

**Problem:** Revealing intermediate values can leak sensitive information

**Solution:**
- Only reveal aggregated final results
- Use Gateway callback for decryption
- Implement timeout protection to prevent data extraction attacks

### 3. Gas Costs

**Problem:** FHE operations are expensive

**Solution:**
- Minimize encrypted operations
- Use smallest appropriate data type (euint32 vs euint128)
- Batch operations when possible
- Request decryption only when absolutely necessary

### 4. Async Handling

**Problem:** Decryption is asynchronous via Gateway

**Solution:**
- Implement proper callback handling
- Add timeout protection
- Provide status query functions
- Emit events for tracking

## Deployment Checklist

- [ ] Configure Gateway address for network
- [ ] Set appropriate timeout values
- [ ] Test all timeout scenarios
- [ ] Verify event emissions
- [ ] Test with various voting powers
- [ ] Simulate Gateway failures
- [ ] Verify access controls
- [ ] Gas optimization review
- [ ] Security audit completion
- [ ] Frontend integration testing

## Testing Strategy

### Unit Tests
- Vote casting with various encrypted values
- Resolution lifecycle (create, vote, close, resolve)
- Timeout handling
- Access control enforcement

### Integration Tests
- Gateway callback simulation
- Multiple concurrent resolutions
- Edge cases (ties, no votes, etc.)

### Security Tests
- Reentrancy attack prevention
- Overflow/underflow scenarios
- Invalid input handling
- Authorization bypass attempts

## Future Enhancements

1. **Delegated Voting**: Allow members to delegate voting power
2. **Multi-signature Resolutions**: Require multiple approvals for critical resolutions
3. **Vote Amendments**: Allow resolution modifications before voting ends
4. **Weighted Quorums**: Different quorum requirements per resolution type
5. **Vote Delegation Chains**: Support transitive delegation
6. **Anonymous Voting Receipts**: Provide cryptographic proof of vote without revealing content
7. **Partial Result Reveals**: Gradual disclosure of voting trends
8. **Vote Escrow**: Lock voting power for duration of resolution

## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Gateway Architecture](https://docs.zama.ai/fhevm/fundamentals/decryption)
- [Homomorphic Encryption Primer](https://en.wikipedia.org/wiki/Homomorphic_encryption)
- [Solidity Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
