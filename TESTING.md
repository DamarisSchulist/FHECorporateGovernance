# Testing Guide for Corporate Governance System

## Table of Contents

1. [Testing Infrastructure](#testing-infrastructure)
2. [Test Categories](#test-categories)
3. [Running Tests](#running-tests)
4. [Test Coverage Goals](#test-coverage-goals)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Testing Infrastructure

### Core Testing Stack

The Corporate Governance System uses a robust testing infrastructure built on industry-standard tools:

- **Hardhat**: Ethereum development environment with built-in testing capabilities
- **Mocha**: Feature-rich JavaScript test framework for organizing and running tests
- **Chai**: Assertion library for writing expressive test expectations
- **Ethers.js**: Library for interacting with Ethereum smart contracts
- **FHEVM Plugin**: Specialized plugin for testing Fully Homomorphic Encryption (FHE) operations

### Configuration

Testing is configured in `hardhat.config.js`:

```javascript
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      viaIR: true, // Required for FHEVM contracts
    },
  },
  mocha: {
    timeout: 40000, // Extended timeout for FHE operations
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};
```

### Test File Structure

```
test/
├── deployment/
│   └── deployment.test.js
├── governance/
│   ├── board-management.test.js
│   ├── resolution-creation.test.js
│   └── voting.test.js
├── security/
│   ├── access-control.test.js
│   └── edge-cases.test.js
└── performance/
    └── gas-optimization.test.js
```

---

## Test Categories

### 1. Deployment Tests

These tests verify that the contract deploys correctly and initializes with proper state.

#### Test 1: Basic Contract Deployment

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Deployment Tests", function () {
  let corporateGovernance;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernance");
    corporateGovernance = await CorporateGovernance.deploy();
    await corporateGovernance.waitForDeployment();
  });

  it("Should deploy contract successfully", async function () {
    const address = await corporateGovernance.getAddress();
    expect(address).to.be.properAddress;
    expect(address).to.not.equal(ethers.ZeroAddress);
  });
});
```

#### Test 2: Initial Owner Configuration

```javascript
it("Should set the deployer as the initial owner", async function () {
  const contractOwner = await corporateGovernance.owner();
  expect(contractOwner).to.equal(owner.address);
});
```

#### Test 3: Initial State Verification

```javascript
it("Should initialize with correct default state", async function () {
  const boardMemberCount = await corporateGovernance.getBoardMemberCount();
  const resolutionCount = await corporateGovernance.getResolutionCount();

  expect(boardMemberCount).to.equal(0);
  expect(resolutionCount).to.equal(0);
});
```

#### Test 4: Contract Version and Metadata

```javascript
it("Should return correct contract version and metadata", async function () {
  const version = await corporateGovernance.version();
  const name = await corporateGovernance.name();

  expect(version).to.equal("1.0.0");
  expect(name).to.equal("CorporateGovernanceSystem");
});
```

### 2. Board Member Management Tests

These tests ensure proper management of board members including addition, removal, and status verification.

#### Test 1: Adding Board Members

```javascript
describe("Board Member Management", function () {
  let corporateGovernance;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernance");
    corporateGovernance = await CorporateGovernance.deploy();
    await corporateGovernance.waitForDeployment();
  });

  it("Should allow owner to add board members", async function () {
    await expect(corporateGovernance.addBoardMember(addr1.address, "Alice Johnson"))
      .to.emit(corporateGovernance, "BoardMemberAdded")
      .withArgs(addr1.address, "Alice Johnson");

    const isMember = await corporateGovernance.isBoardMember(addr1.address);
    expect(isMember).to.be.true;
  });
});
```

#### Test 2: Removing Board Members

```javascript
it("Should allow owner to remove board members", async function () {
  await corporateGovernance.addBoardMember(addr1.address, "Alice Johnson");

  await expect(corporateGovernance.removeBoardMember(addr1.address))
    .to.emit(corporateGovernance, "BoardMemberRemoved")
    .withArgs(addr1.address);

  const isMember = await corporateGovernance.isBoardMember(addr1.address);
  expect(isMember).to.be.false;
});
```

#### Test 3: Preventing Duplicate Board Members

```javascript
it("Should prevent adding duplicate board members", async function () {
  await corporateGovernance.addBoardMember(addr1.address, "Alice Johnson");

  await expect(
    corporateGovernance.addBoardMember(addr1.address, "Alice Johnson")
  ).to.be.revertedWith("Address is already a board member");
});
```

#### Test 4: Board Member Information Retrieval

```javascript
it("Should retrieve correct board member information", async function () {
  await corporateGovernance.addBoardMember(addr1.address, "Alice Johnson");
  await corporateGovernance.addBoardMember(addr2.address, "Bob Smith");
  await corporateGovernance.addBoardMember(addr3.address, "Carol White");

  const memberCount = await corporateGovernance.getBoardMemberCount();
  expect(memberCount).to.equal(3);

  const memberInfo = await corporateGovernance.getBoardMember(addr1.address);
  expect(memberInfo.name).to.equal("Alice Johnson");
  expect(memberInfo.isActive).to.be.true;
});
```

### 3. Resolution Creation Tests

These tests verify the creation and management of board resolutions.

#### Test 1: Creating Basic Resolution

```javascript
describe("Resolution Creation", function () {
  let corporateGovernance;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernance");
    corporateGovernance = await CorporateGovernance.deploy();
    await corporateGovernance.waitForDeployment();

    await corporateGovernance.addBoardMember(addr1.address, "Alice Johnson");
    await corporateGovernance.addBoardMember(addr2.address, "Bob Smith");
  });

  it("Should allow board members to create resolutions", async function () {
    const title = "Approve Q4 Budget";
    const description = "Approval of the fourth quarter budget allocation";
    const votingDuration = 7 * 24 * 60 * 60; // 7 days

    await expect(
      corporateGovernance.connect(addr1).createResolution(title, description, votingDuration)
    ).to.emit(corporateGovernance, "ResolutionCreated");

    const resolutionCount = await corporateGovernance.getResolutionCount();
    expect(resolutionCount).to.equal(1);
  });
});
```

#### Test 2: Resolution with Metadata

```javascript
it("Should store resolution metadata correctly", async function () {
  const title = "Approve Annual Report";
  const description = "Approval of the 2024 annual financial report";
  const votingDuration = 14 * 24 * 60 * 60; // 14 days

  const tx = await corporateGovernance.connect(addr1).createResolution(
    title,
    description,
    votingDuration
  );
  const receipt = await tx.wait();

  const resolution = await corporateGovernance.getResolution(0);
  expect(resolution.title).to.equal(title);
  expect(resolution.description).to.equal(description);
  expect(resolution.creator).to.equal(addr1.address);
  expect(resolution.status).to.equal(0); // Active status
});
```

#### Test 3: Preventing Non-Members from Creating Resolutions

```javascript
it("Should prevent non-members from creating resolutions", async function () {
  const [, , , nonMember] = await ethers.getSigners();

  await expect(
    corporateGovernance.connect(nonMember).createResolution(
      "Unauthorized Resolution",
      "This should fail",
      7 * 24 * 60 * 60
    )
  ).to.be.revertedWith("Only board members can perform this action");
});
```

#### Test 4: Resolution Deadline Validation

```javascript
it("Should enforce minimum voting duration", async function () {
  const shortDuration = 60; // 1 minute - too short

  await expect(
    corporateGovernance.connect(addr1).createResolution(
      "Quick Vote",
      "Invalid short duration",
      shortDuration
    )
  ).to.be.revertedWith("Voting duration must be at least 1 day");
});
```

### 4. Encrypted Voting Tests

These tests verify the FHE-based encrypted voting mechanism.

#### Test 1: Casting Encrypted Votes

```javascript
describe("Encrypted Voting", function () {
  let corporateGovernance;
  let owner, addr1, addr2, addr3;
  let resolutionId;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernance");
    corporateGovernance = await CorporateGovernance.deploy();
    await corporateGovernance.waitForDeployment();

    await corporateGovernance.addBoardMember(addr1.address, "Alice");
    await corporateGovernance.addBoardMember(addr2.address, "Bob");
    await corporateGovernance.addBoardMember(addr3.address, "Carol");

    const tx = await corporateGovernance.connect(addr1).createResolution(
      "Test Resolution",
      "Test Description",
      7 * 24 * 60 * 60
    );
    await tx.wait();
    resolutionId = 0;
  });

  it("Should allow board members to cast encrypted votes", async function () {
    const encryptedVote = ethers.encodeBytes32String("ENCRYPTED_YES");

    await expect(
      corporateGovernance.connect(addr1).castEncryptedVote(resolutionId, encryptedVote)
    ).to.emit(corporateGovernance, "VoteCast")
      .withArgs(resolutionId, addr1.address);

    const hasVoted = await corporateGovernance.hasVoted(resolutionId, addr1.address);
    expect(hasVoted).to.be.true;
  });
});
```

#### Test 2: Preventing Double Voting

```javascript
it("Should prevent board members from voting twice", async function () {
  const encryptedVote = ethers.encodeBytes32String("ENCRYPTED_YES");

  await corporateGovernance.connect(addr1).castEncryptedVote(resolutionId, encryptedVote);

  await expect(
    corporateGovernance.connect(addr1).castEncryptedVote(resolutionId, encryptedVote)
  ).to.be.revertedWith("Member has already voted on this resolution");
});
```

#### Test 3: Vote Privacy Verification

```javascript
it("Should maintain vote privacy until decryption", async function () {
  const encryptedVote1 = ethers.encodeBytes32String("ENCRYPTED_YES");
  const encryptedVote2 = ethers.encodeBytes32String("ENCRYPTED_NO");

  await corporateGovernance.connect(addr1).castEncryptedVote(resolutionId, encryptedVote1);
  await corporateGovernance.connect(addr2).castEncryptedVote(resolutionId, encryptedVote2);

  // Votes are encrypted, individual votes should not be readable
  const resolution = await corporateGovernance.getResolution(resolutionId);
  expect(resolution.yesVotes).to.equal(0); // Not decrypted yet
  expect(resolution.noVotes).to.equal(0);  // Not decrypted yet
  expect(resolution.totalVotes).to.equal(2); // Count is public
});
```

### 5. Access Control Tests

These tests ensure proper permission management and role-based access control.

#### Test 1: Owner-Only Functions

```javascript
describe("Access Control", function () {
  let corporateGovernance;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernance");
    corporateGovernance = await CorporateGovernance.deploy();
    await corporateGovernance.waitForDeployment();
  });

  it("Should restrict board member addition to owner only", async function () {
    await expect(
      corporateGovernance.connect(addr1).addBoardMember(addr2.address, "Bob Smith")
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // Owner should succeed
    await expect(
      corporateGovernance.connect(owner).addBoardMember(addr2.address, "Bob Smith")
    ).to.emit(corporateGovernance, "BoardMemberAdded");
  });
});
```

#### Test 2: Board Member-Only Functions

```javascript
it("Should restrict resolution creation to board members", async function () {
  const [, , nonMember] = await ethers.getSigners();

  await expect(
    corporateGovernance.connect(nonMember).createResolution(
      "Test",
      "Test Description",
      7 * 24 * 60 * 60
    )
  ).to.be.revertedWith("Only board members can perform this action");

  // Add as board member and retry
  await corporateGovernance.addBoardMember(nonMember.address, "New Member");

  await expect(
    corporateGovernance.connect(nonMember).createResolution(
      "Test",
      "Test Description",
      7 * 24 * 60 * 60
    )
  ).to.emit(corporateGovernance, "ResolutionCreated");
});
```

### 6. Edge Cases Tests

These tests cover boundary conditions and unusual scenarios.

#### Test 1: Maximum Board Member Limit

```javascript
describe("Edge Cases", function () {
  let corporateGovernance;
  let owner;
  let signers;

  beforeEach(async function () {
    signers = await ethers.getSigners();
    owner = signers[0];
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernance");
    corporateGovernance = await CorporateGovernance.deploy();
    await corporateGovernance.waitForDeployment();
  });

  it("Should handle maximum number of board members", async function () {
    const maxMembers = 50; // Assuming a reasonable limit

    for (let i = 1; i <= maxMembers && i < signers.length; i++) {
      await corporateGovernance.addBoardMember(
        signers[i].address,
        `Member ${i}`
      );
    }

    const count = await corporateGovernance.getBoardMemberCount();
    expect(count).to.equal(Math.min(maxMembers, signers.length - 1));
  });
});
```

#### Test 2: Empty Resolution Data

```javascript
it("Should handle empty or minimal resolution data", async function () {
  const [, member1] = await ethers.getSigners();
  await corporateGovernance.addBoardMember(member1.address, "Member");

  await expect(
    corporateGovernance.connect(member1).createResolution("", "", 7 * 24 * 60 * 60)
  ).to.be.revertedWith("Resolution title cannot be empty");
});
```

#### Test 3: Expired Resolution Voting

```javascript
it("Should prevent voting on expired resolutions", async function () {
  const [, member1, member2] = await ethers.getSigners();
  await corporateGovernance.addBoardMember(member1.address, "Member 1");
  await corporateGovernance.addBoardMember(member2.address, "Member 2");

  const shortDuration = 24 * 60 * 60; // 1 day
  await corporateGovernance.connect(member1).createResolution(
    "Quick Vote",
    "Expires soon",
    shortDuration
  );

  // Fast forward time beyond voting period
  await ethers.provider.send("evm_increaseTime", [shortDuration + 1]);
  await ethers.provider.send("evm_mine");

  const encryptedVote = ethers.encodeBytes32String("ENCRYPTED_YES");
  await expect(
    corporateGovernance.connect(member2).castEncryptedVote(0, encryptedVote)
  ).to.be.revertedWith("Voting period has ended");
});
```

### 7. Gas Optimization Tests

These tests monitor and ensure efficient gas usage across contract functions.

#### Test 1: Board Member Addition Gas Cost

```javascript
describe("Gas Optimization", function () {
  let corporateGovernance;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernance");
    corporateGovernance = await CorporateGovernance.deploy();
    await corporateGovernance.waitForDeployment();
  });

  it("Should add board member within gas limit", async function () {
    const tx = await corporateGovernance.addBoardMember(addr1.address, "Alice");
    const receipt = await tx.wait();

    expect(receipt.gasUsed).to.be.below(200000); // 200k gas limit
    console.log(`Gas used for adding board member: ${receipt.gasUsed}`);
  });
});
```

#### Test 2: Resolution Creation Gas Cost

```javascript
it("Should create resolution efficiently", async function () {
  const [, member1] = await ethers.getSigners();
  await corporateGovernance.addBoardMember(member1.address, "Member");

  const tx = await corporateGovernance.connect(member1).createResolution(
    "Test Resolution",
    "This is a test resolution with moderate length description",
    7 * 24 * 60 * 60
  );
  const receipt = await tx.wait();

  expect(receipt.gasUsed).to.be.below(500000); // 500k gas limit
  console.log(`Gas used for creating resolution: ${receipt.gasUsed}`);
});
```

#### Test 3: Encrypted Vote Gas Cost

```javascript
it("Should cast encrypted vote efficiently", async function () {
  const [, member1] = await ethers.getSigners();
  await corporateGovernance.addBoardMember(member1.address, "Member");

  await corporateGovernance.connect(member1).createResolution(
    "Vote Test",
    "Testing vote gas cost",
    7 * 24 * 60 * 60
  );

  const encryptedVote = ethers.encodeBytes32String("ENCRYPTED_YES");
  const tx = await corporateGovernance.connect(member1).castEncryptedVote(0, encryptedVote);
  const receipt = await tx.wait();

  expect(receipt.gasUsed).to.be.below(300000); // 300k gas limit for FHE vote
  console.log(`Gas used for encrypted vote: ${receipt.gasUsed}`);
});
```

---

## Running Tests

### Local Testing

Run all tests on local Hardhat network:

```bash
npm test
```

Run specific test file:

```bash
npx hardhat test test/deployment/deployment.test.js
```

Run tests with gas reporting:

```bash
REPORT_GAS=true npm test
```

Run tests with coverage:

```bash
npx hardhat coverage
```

### Network-Specific Testing

#### Local Hardhat Network

```bash
# Start local node in one terminal
npx hardhat node

# Run tests against local node in another terminal
npx hardhat test --network localhost
```

#### Sepolia Testnet

```bash
# Configure environment variables first
# Add to .env file:
# INFURA_PROJECT_ID=your_infura_project_id
# PRIVATE_KEY=your_private_key

# Run tests on Sepolia
npx hardhat test --network sepolia
```

### Continuous Testing

Watch mode for development:

```bash
npx hardhat watch test
```

### Parallel Testing

Run tests in parallel for faster execution:

```bash
npx hardhat test --parallel
```

---

## Test Coverage Goals

### Target Metrics

The project aims to maintain the following test coverage standards:

| Metric | Target | Minimum Acceptable |
|--------|--------|-------------------|
| **Statement Coverage** | 95% | 85% |
| **Branch Coverage** | 90% | 80% |
| **Function Coverage** | 100% | 90% |
| **Line Coverage** | 95% | 85% |

### Coverage by Category

```
contracts/
├── CorporateGovernance.sol
│   ├── Deployment & Initialization: 100%
│   ├── Board Member Management: 100%
│   ├── Resolution Management: 100%
│   ├── Voting Functions: 95%
│   ├── Access Control: 100%
│   └── View Functions: 100%
│
├── SimpleBoardResolution.sol
│   ├── Core Functions: 100%
│   └── Helper Functions: 100%
│
└── UltraSimpleVoting.sol
    ├── Voting Logic: 100%
    └── Utility Functions: 100%
```

### Critical Path Coverage

Ensure 100% coverage for:

1. Access control modifiers
2. State-changing functions
3. Financial transactions
4. Encrypted data handling
5. Emergency functions

### Running Coverage Reports

```bash
# Generate coverage report
npx hardhat coverage

# View HTML report
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

---

## Best Practices

### Test Organization

1. **Group Related Tests**: Use `describe` blocks to organize tests by functionality
2. **Clear Test Names**: Use descriptive names that explain what is being tested
3. **Single Assertion Focus**: Each test should verify one specific behavior
4. **Setup and Teardown**: Use `beforeEach` and `afterEach` for test isolation

### Test Structure

Follow the Arrange-Act-Assert (AAA) pattern:

```javascript
it("Should transfer ownership correctly", async function () {
  // Arrange
  const [owner, newOwner] = await ethers.getSigners();
  const contract = await deployContract();

  // Act
  await contract.transferOwnership(newOwner.address);

  // Assert
  expect(await contract.owner()).to.equal(newOwner.address);
});
```

### Async/Await Usage

Always use async/await for asynchronous operations:

```javascript
// Good
it("Should deploy correctly", async function () {
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  expect(await contract.getAddress()).to.be.properAddress;
});

// Bad
it("Should deploy correctly", function () {
  Contract.deploy().then(contract => {
    // Avoid promise chaining in tests
  });
});
```

### Error Testing

Test both success and failure cases:

```javascript
describe("Error Handling", function () {
  it("Should succeed with valid input", async function () {
    await expect(contract.validFunction()).to.not.be.reverted;
  });

  it("Should revert with invalid input", async function () {
    await expect(contract.invalidFunction())
      .to.be.revertedWith("Specific error message");
  });
});
```

### Gas Testing

Monitor gas usage for critical functions:

```javascript
it("Should use acceptable gas for critical operation", async function () {
  const tx = await contract.criticalFunction();
  const receipt = await tx.wait();

  expect(receipt.gasUsed).to.be.below(500000);

  if (process.env.REPORT_GAS) {
    console.log(`Gas used: ${receipt.gasUsed}`);
  }
});
```

### Event Testing

Verify events are emitted correctly:

```javascript
it("Should emit correct event", async function () {
  await expect(contract.performAction())
    .to.emit(contract, "ActionPerformed")
    .withArgs(expectedArg1, expectedArg2);
});
```

### Time-Dependent Testing

Handle time-based logic properly:

```javascript
it("Should respect time constraints", async function () {
  const duration = 7 * 24 * 60 * 60; // 7 days

  // Advance time
  await ethers.provider.send("evm_increaseTime", [duration]);
  await ethers.provider.send("evm_mine");

  // Verify time-dependent behavior
  const isExpired = await contract.isExpired();
  expect(isExpired).to.be.true;
});
```

### Snapshot Testing

Use snapshots for complex state verification:

```javascript
describe("State Management", function () {
  let snapshotId;

  beforeEach(async function () {
    snapshotId = await ethers.provider.send("evm_snapshot", []);
  });

  afterEach(async function () {
    await ethers.provider.send("evm_revert", [snapshotId]);
  });

  it("Should maintain consistent state", async function () {
    // Test state changes
  });
});
```

### FHE-Specific Testing

Special considerations for encrypted operations:

```javascript
it("Should handle encrypted data correctly", async function () {
  const encryptedValue = await encryptData(originalValue);

  await contract.storeEncryptedData(encryptedValue);

  // Verify encryption properties
  const stored = await contract.getEncryptedData();
  expect(stored).to.not.equal(originalValue); // Encrypted
  expect(stored.length).to.be.above(0); // Not empty
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Transaction Reverted Without Reason

**Problem**: Tests fail with "transaction reverted" but no error message.

**Solution**:
```javascript
// Add custom error messages
require(condition, "Descriptive error message");

// Use try-catch for debugging
try {
  await contract.functionCall();
} catch (error) {
  console.log("Error details:", error);
  throw error;
}
```

#### Issue 2: Gas Estimation Failed

**Problem**: "cannot estimate gas; transaction may fail" error.

**Solution**:
```javascript
// Explicitly set gas limit
await contract.functionCall({ gasLimit: 500000 });

// Check contract state before calling
const canExecute = await contract.canExecute();
expect(canExecute).to.be.true;
```

#### Issue 3: Timeout Errors

**Problem**: Tests timeout before completing.

**Solution**:
```javascript
// Increase timeout in hardhat.config.js
mocha: {
  timeout: 60000 // 60 seconds
}

// Or per test
it("Long running test", async function () {
  this.timeout(120000); // 120 seconds
  // test code
});
```

#### Issue 4: Nonce Too Low

**Problem**: "nonce has already been used" error.

**Solution**:
```javascript
// Reset network between tests
beforeEach(async function () {
  await network.provider.send("hardhat_reset");
});
```

#### Issue 5: Contract Size Exceeded

**Problem**: Contract bytecode size exceeds 24KB limit.

**Solution**:
```javascript
// Enable optimizer in hardhat.config.js
solidity: {
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
```

#### Issue 6: FHE Operations Failing

**Problem**: Encrypted operations not working in tests.

**Solution**:
```javascript
// Ensure FHEVM plugin is properly configured
require("hardhat-fhevm");

// Use mock encrypted values in tests
const mockEncrypted = ethers.encodeBytes32String("MOCK_ENCRYPTED");
```

#### Issue 7: Event Not Emitted

**Problem**: Expected event is not detected in tests.

**Solution**:
```javascript
// Ensure transaction is mined
const tx = await contract.functionCall();
await tx.wait();

// Use correct event name and parameters
await expect(tx)
  .to.emit(contract, "EventName")
  .withArgs(arg1, arg2);
```

#### Issue 8: Invalid Address Error

**Problem**: "invalid address" error when testing.

**Solution**:
```javascript
// Validate addresses before use
expect(ethers.isAddress(address)).to.be.true;

// Use proper address formatting
const checksumAddress = ethers.getAddress(address);
```

### Debugging Tips

1. **Enable Verbose Logging**:
```bash
npx hardhat test --verbose
```

2. **Use Console Logging in Contracts**:
```solidity
import "hardhat/console.sol";

function debug() public {
    console.log("Debug value:", value);
}
```

3. **Trace Transactions**:
```javascript
const tx = await contract.functionCall();
const trace = await network.provider.send("debug_traceTransaction", [tx.hash]);
console.log(trace);
```

4. **Check Revert Reasons**:
```javascript
await expect(contract.failingFunction())
  .to.be.revertedWith("Expected error message");
```

5. **Verify Contract State**:
```javascript
// Log contract state for debugging
const state = await contract.getState();
console.log("Contract state:", state);
```

### Getting Help

If you encounter issues not covered here:

1. Check Hardhat documentation: https://hardhat.org/docs
2. Review FHEVM documentation for encryption-related issues
3. Search GitHub issues in project repository
4. Enable debug mode and examine transaction traces
5. Consult team members or create detailed issue reports

---

## Summary

This testing guide provides a comprehensive framework for testing the Corporate Governance System. By following these patterns and best practices, you can ensure:

- High code coverage (95%+ target)
- Reliable contract behavior
- Efficient gas usage
- Proper security controls
- Maintainable test suites

Remember to run tests frequently during development and before any deployment to maintain system integrity and security.

For questions or contributions to testing infrastructure, please contact the development team.
