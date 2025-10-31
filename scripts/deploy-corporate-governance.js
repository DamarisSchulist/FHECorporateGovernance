const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying Board Resolution System to Sepolia...");

    // Get the contract factory
    const BoardResolution = await ethers.getContractFactory("UltraSimpleVoting");

    // Deploy the contract
    const boardResolution = await BoardResolution.deploy();

    // Wait for deployment
    await boardResolution.waitForDeployment();

    const contractAddress = await boardResolution.getAddress();

    console.log("✅ Board Resolution System deployed successfully!");
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🌐 Sepolia Explorer: https://sepolia.etherscan.io/address/${contractAddress}`);

    // Get deployment info
    const deployer = await boardResolution.runner.getAddress();
    console.log(`👤 Deployed by: ${deployer}`);

    // Verify initial state
    const totalVotingPower = await boardResolution.getTotalVotingPower();
    const resolutionCount = await boardResolution.getResolutionCount();
    
    console.log(`🗳️  Initial voting power: ${totalVotingPower}`);
    console.log(`📜 Initial resolution count: ${resolutionCount}`);
    
    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress,
        deployer: deployer,
        network: "sepolia",
        timestamp: new Date().toISOString(),
        txHash: boardResolution.deploymentTransaction()?.hash,
        blockNumber: boardResolution.deploymentTransaction()?.blockNumber
    };

    console.log("\n=== Deployment Summary ===");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });