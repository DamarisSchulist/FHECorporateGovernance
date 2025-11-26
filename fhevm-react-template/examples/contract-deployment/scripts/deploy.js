const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("=".repeat(70));
    console.log("FHEVM VOTING CONTRACT DEPLOYMENT");
    console.log("=".repeat(70));
    console.log();

    const network = await ethers.provider.getNetwork();
    const networkName = network.name === "unknown" ? "localhost" : network.name;
    const chainId = network.chainId;

    console.log("Network Information:");
    console.log("-".repeat(70));
    console.log(`Network: ${networkName}`);
    console.log(`Chain ID: ${chainId}`);
    console.log();

    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const balance = await ethers.provider.getBalance(deployerAddress);
    const balanceInEth = ethers.formatEther(balance);

    console.log("Deployer Information:");
    console.log("-".repeat(70));
    console.log(`Address: ${deployerAddress}`);
    console.log(`Balance: ${balanceInEth} ETH`);
    console.log();

    if (balance === 0n) {
        throw new Error("Deployer account has no funds.");
    }

    console.log("Deploying Contract...");
    console.log("-".repeat(70));
    const VotingContract = await ethers.getContractFactory("CorporateGovernance");

    const contract = await VotingContract.deploy();
    console.log("Waiting for deployment...");

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

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

    const timestamp = new Date().toISOString();
    const deploymentInfo = {
        contractName: "VotingContract",
        contractAddress: contractAddress,
        deployer: deployerAddress,
        network: networkName,
        chainId: chainId.toString(),
        timestamp: timestamp,
        txHash: txHash,
        blockNumber: blockNumber ? blockNumber.toString() : "N/A",
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filePath = path.join(deploymentsDir, `latest-${networkName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

    console.log("Deployment saved to:", filePath);
    console.log("=".repeat(70));

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("DEPLOYMENT FAILED:", error);
        process.exit(1);
    });
