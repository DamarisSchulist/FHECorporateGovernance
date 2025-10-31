const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("=".repeat(70));
    console.log("CORPORATE GOVERNANCE CONTRACT DEPLOYMENT");
    console.log("=".repeat(70));
    console.log();

    // Get network information
    const network = await ethers.provider.getNetwork();
    const networkName = network.name === "unknown" ? "localhost" : network.name;
    const chainId = network.chainId;

    console.log("Network Information:");
    console.log("-".repeat(70));
    console.log(`Network: ${networkName}`);
    console.log(`Chain ID: ${chainId}`);
    console.log();

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const balance = await ethers.provider.getBalance(deployerAddress);
    const balanceInEth = ethers.formatEther(balance);

    console.log("Deployer Information:");
    console.log("-".repeat(70));
    console.log(`Address: ${deployerAddress}`);
    console.log(`Balance: ${balanceInEth} ETH`);
    console.log();

    // Check balance
    if (balance === 0n) {
        throw new Error("Deployer account has no funds. Please fund the account before deploying.");
    }

    // Get the contract factory
    console.log("Deploying Contract...");
    console.log("-".repeat(70));
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernance");

    // Deploy the contract
    const contract = await CorporateGovernance.deploy();
    console.log("Waiting for deployment transaction to be mined...");

    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    // Get deployment transaction details
    const deployTx = contract.deploymentTransaction();
    const txHash = deployTx ? deployTx.hash : "N/A";
    const blockNumber = deployTx ? deployTx.blockNumber : "N/A";

    console.log();
    console.log("Deployment Successful!");
    console.log("-".repeat(70));
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Transaction Hash: ${txHash}`);
    console.log(`Block Number: ${blockNumber}`);
    console.log();

    // Verify initial state
    console.log("Verifying Initial Contract State...");
    console.log("-".repeat(70));

    try {
        const chairperson = await contract.chairperson();
        const totalVotingPower = await contract.getTotalVotingPower();
        const resolutionCount = await contract.getResolutionCount();

        console.log(`Chairperson: ${chairperson}`);
        console.log(`Total Voting Power: ${totalVotingPower}`);
        console.log(`Resolution Count: ${resolutionCount}`);

        // Get chairperson board member info
        const [isActive, votingPower, name, position] = await contract.getBoardMember(chairperson);
        console.log();
        console.log("Initial Board Member (Chairperson):");
        console.log(`  Active: ${isActive}`);
        console.log(`  Name: ${name}`);
        console.log(`  Position: ${position}`);
        console.log(`  Voting Power: ${votingPower}`);
    } catch (error) {
        console.log("Warning: Could not verify initial state:", error.message);
    }

    console.log();

    // Generate explorer URLs based on network
    let explorerUrl = "";
    let apiUrl = "";

    if (networkName === "sepolia") {
        explorerUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;
        apiUrl = "https://api-sepolia.etherscan.io/api";
    } else if (networkName === "mainnet") {
        explorerUrl = `https://etherscan.io/address/${contractAddress}`;
        apiUrl = "https://api.etherscan.io/api";
    } else if (networkName === "localhost" || networkName === "hardhat") {
        explorerUrl = "N/A (Local Network)";
        apiUrl = "N/A";
    } else {
        explorerUrl = "N/A";
        apiUrl = "N/A";
    }

    console.log("Explorer Links:");
    console.log("-".repeat(70));
    console.log(`Contract: ${explorerUrl}`);
    if (txHash !== "N/A" && networkName === "sepolia") {
        console.log(`Transaction: https://sepolia.etherscan.io/tx/${txHash}`);
    } else if (txHash !== "N/A" && networkName === "mainnet") {
        console.log(`Transaction: https://etherscan.io/tx/${txHash}`);
    }
    console.log();

    // Prepare deployment info
    const timestamp = new Date().toISOString();
    const deploymentInfo = {
        contractName: "CorporateGovernance",
        contractAddress: contractAddress,
        deployer: deployerAddress,
        deployerBalance: balanceInEth,
        network: networkName,
        chainId: chainId.toString(),
        timestamp: timestamp,
        txHash: txHash,
        blockNumber: blockNumber ? blockNumber.toString() : "N/A",
        explorerUrl: explorerUrl,
        apiUrl: apiUrl,
        compiler: {
            version: "0.8.24",
            optimizer: true
        }
    };

    // Save deployment info to file
    const deploymentsDir = path.join(__dirname, "..", "deployments");

    // Create deployments directory if it doesn't exist
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save as latest deployment for this network
    const latestFilePath = path.join(deploymentsDir, `latest-${networkName}.json`);
    fs.writeFileSync(latestFilePath, JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment Info Saved:");
    console.log("-".repeat(70));
    console.log(`File: ${latestFilePath}`);

    // Also save with timestamp for history
    const timestampedFileName = `deployment-${networkName}-${Date.now()}.json`;
    const timestampedFilePath = path.join(deploymentsDir, timestampedFileName);
    fs.writeFileSync(timestampedFilePath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Archive: ${timestampedFilePath}`);
    console.log();

    // Print summary
    console.log("=".repeat(70));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(70));
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log("=".repeat(70));
    console.log();

    if (networkName === "sepolia" || networkName === "mainnet") {
        console.log("Next Steps:");
        console.log("-".repeat(70));
        console.log("1. Verify the contract on Etherscan:");
        console.log(`   npx hardhat run scripts/verify.js --network ${networkName}`);
        console.log();
        console.log("2. Interact with the contract:");
        console.log(`   npx hardhat run scripts/interact.js --network ${networkName}`);
        console.log();
        console.log("3. Run simulation:");
        console.log(`   npx hardhat run scripts/simulate.js --network ${networkName}`);
        console.log("=".repeat(70));
    }

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error();
        console.error("=".repeat(70));
        console.error("DEPLOYMENT FAILED");
        console.error("=".repeat(70));
        console.error(error);
        console.error("=".repeat(70));
        process.exit(1);
    });