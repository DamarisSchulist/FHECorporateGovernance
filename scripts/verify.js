const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("=".repeat(70));
    console.log("CONTRACT VERIFICATION");
    console.log("=".repeat(70));
    console.log();

    // Get network information
    const network = await ethers.provider.getNetwork();
    const networkName = network.name === "unknown" ? "localhost" : network.name;

    console.log(`Network: ${networkName}`);
    console.log();

    // Check if verification is supported for this network
    if (networkName === "localhost" || networkName === "hardhat") {
        console.log("Contract verification is not available for local networks.");
        console.log("Deploy to a public testnet (e.g., Sepolia) to verify contracts.");
        return;
    }

    // Load deployment info
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    const deploymentFilePath = path.join(deploymentsDir, `latest-${networkName}.json`);

    if (!fs.existsSync(deploymentFilePath)) {
        throw new Error(
            `No deployment found for network "${networkName}".\n` +
            `Expected file: ${deploymentFilePath}\n` +
            `Please deploy the contract first using: npx hardhat run scripts/deploy.js --network ${networkName}`
        );
    }

    console.log("Loading Deployment Info...");
    console.log("-".repeat(70));
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFilePath, "utf8"));

    console.log(`Contract: ${deploymentInfo.contractName}`);
    console.log(`Address: ${deploymentInfo.contractAddress}`);
    console.log(`Network: ${deploymentInfo.network}`);
    console.log(`Deployed: ${deploymentInfo.timestamp}`);
    console.log();

    // Verify the contract
    console.log("Verifying Contract on Etherscan...");
    console.log("-".repeat(70));

    try {
        await run("verify:verify", {
            address: deploymentInfo.contractAddress,
            constructorArguments: [], // CorporateGovernance has no constructor arguments
            contract: "contracts/CorporateGovernance.sol:CorporateGovernance"
        });

        console.log();
        console.log("=".repeat(70));
        console.log("VERIFICATION SUCCESSFUL");
        console.log("=".repeat(70));
        console.log();
        console.log(`Contract verified successfully!`);
        console.log(`View on Etherscan: ${deploymentInfo.explorerUrl}`);
        console.log("=".repeat(70));

    } catch (error) {
        // Handle common verification errors gracefully
        if (error.message.includes("Already Verified")) {
            console.log();
            console.log("=".repeat(70));
            console.log("ALREADY VERIFIED");
            console.log("=".repeat(70));
            console.log();
            console.log("This contract has already been verified on Etherscan.");
            console.log(`View on Etherscan: ${deploymentInfo.explorerUrl}`);
            console.log("=".repeat(70));
        } else if (error.message.includes("API key")) {
            console.error();
            console.error("=".repeat(70));
            console.error("VERIFICATION FAILED - API KEY MISSING");
            console.error("=".repeat(70));
            console.error();
            console.error("Etherscan API key is missing or invalid.");
            console.error("Please set ETHERSCAN_API_KEY in your .env file.");
            console.error();
            console.error("Get your API key from:");
            console.error("https://etherscan.io/myapikey");
            console.error("=".repeat(70));
            process.exit(1);
        } else if (error.message.includes("does not have bytecode")) {
            console.error();
            console.error("=".repeat(70));
            console.error("VERIFICATION FAILED - INVALID CONTRACT");
            console.error("=".repeat(70));
            console.error();
            console.error("The address does not contain a deployed contract.");
            console.error("Please check the contract address and network.");
            console.error("=".repeat(70));
            process.exit(1);
        } else {
            console.error();
            console.error("=".repeat(70));
            console.error("VERIFICATION FAILED");
            console.error("=".repeat(70));
            console.error();
            console.error(error.message);
            console.error();
            console.error("Common issues:");
            console.error("1. Make sure ETHERSCAN_API_KEY is set in .env");
            console.error("2. Wait a few minutes after deployment before verifying");
            console.error("3. Check that the contract was deployed successfully");
            console.error("4. Verify you're using the correct network");
            console.error("=".repeat(70));
            process.exit(1);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error();
        console.error("=".repeat(70));
        console.error("VERIFICATION ERROR");
        console.error("=".repeat(70));
        console.error(error);
        console.error("=".repeat(70));
        process.exit(1);
    });
