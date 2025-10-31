const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Helper function to get user input
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

// Helper function to load contract
async function loadContract() {
    const network = await ethers.provider.getNetwork();
    const networkName = network.name === "unknown" ? "localhost" : network.name;

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    const deploymentFilePath = path.join(deploymentsDir, `latest-${networkName}.json`);

    if (!fs.existsSync(deploymentFilePath)) {
        throw new Error(
            `No deployment found for network "${networkName}".\n` +
            `Please deploy the contract first using: npx hardhat run scripts/deploy.js --network ${networkName}`
        );
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFilePath, "utf8"));
    const CorporateGovernance = await ethers.getContractFactory("CorporateGovernance");
    const contract = CorporateGovernance.attach(deploymentInfo.contractAddress);

    return { contract, deploymentInfo, networkName };
}

// Menu options
async function displayMenu() {
    console.log();
    console.log("=".repeat(70));
    console.log("CORPORATE GOVERNANCE - INTERACTION MENU");
    console.log("=".repeat(70));
    console.log();
    console.log("1. View Board Member Info");
    console.log("2. View Total Voting Power");
    console.log("3. List All Resolutions");
    console.log("4. View Specific Resolution");
    console.log("5. Add Board Member");
    console.log("6. Create Resolution");
    console.log("7. View Contract Info");
    console.log("0. Exit");
    console.log();
    console.log("=".repeat(70));

    const choice = await askQuestion("Enter your choice: ");
    return choice.trim();
}

// 1. View Board Member Info
async function viewBoardMemberInfo(contract) {
    console.log();
    console.log("-".repeat(70));
    const address = await askQuestion("Enter board member address: ");

    try {
        const [isActive, votingPower, name, position] = await contract.getBoardMember(address);

        console.log();
        console.log("Board Member Information:");
        console.log("-".repeat(70));
        console.log(`Address: ${address}`);
        console.log(`Name: ${name}`);
        console.log(`Position: ${position}`);
        console.log(`Active: ${isActive}`);
        console.log(`Voting Power: ${votingPower}`);
        console.log("-".repeat(70));
    } catch (error) {
        console.error("Error fetching board member info:", error.message);
    }
}

// 2. View Total Voting Power
async function viewTotalVotingPower(contract) {
    try {
        const totalVotingPower = await contract.getTotalVotingPower();
        console.log();
        console.log("-".repeat(70));
        console.log(`Total Voting Power: ${totalVotingPower}`);
        console.log("-".repeat(70));
    } catch (error) {
        console.error("Error fetching total voting power:", error.message);
    }
}

// 3. List All Resolutions
async function listAllResolutions(contract) {
    try {
        const resolutionCount = await contract.getResolutionCount();
        console.log();
        console.log("-".repeat(70));
        console.log(`Total Resolutions: ${resolutionCount}`);
        console.log("-".repeat(70));

        if (resolutionCount === 0n) {
            console.log("No resolutions have been created yet.");
            return;
        }

        for (let i = 0; i < resolutionCount; i++) {
            const [id, title, description, startTime, endTime, active, creator, requiredQuorum] =
                await contract.getResolution(i);

            console.log();
            console.log(`Resolution #${id}:`);
            console.log(`  Title: ${title}`);
            console.log(`  Description: ${description}`);
            console.log(`  Creator: ${creator}`);
            console.log(`  Active: ${active}`);
            console.log(`  Start Time: ${new Date(Number(startTime) * 1000).toLocaleString()}`);
            console.log(`  End Time: ${new Date(Number(endTime) * 1000).toLocaleString()}`);
            console.log(`  Required Quorum: ${requiredQuorum}`);
            console.log("-".repeat(70));
        }
    } catch (error) {
        console.error("Error listing resolutions:", error.message);
    }
}

// 4. View Specific Resolution
async function viewResolution(contract) {
    console.log();
    console.log("-".repeat(70));
    const resolutionId = await askQuestion("Enter resolution ID: ");

    try {
        const [id, title, description, startTime, endTime, active, creator, requiredQuorum] =
            await contract.getResolution(resolutionId);

        console.log();
        console.log("Resolution Details:");
        console.log("-".repeat(70));
        console.log(`ID: ${id}`);
        console.log(`Title: ${title}`);
        console.log(`Description: ${description}`);
        console.log(`Creator: ${creator}`);
        console.log(`Active: ${active}`);
        console.log(`Start Time: ${new Date(Number(startTime) * 1000).toLocaleString()}`);
        console.log(`End Time: ${new Date(Number(endTime) * 1000).toLocaleString()}`);
        console.log(`Required Quorum: ${requiredQuorum}`);
        console.log("-".repeat(70));
    } catch (error) {
        console.error("Error fetching resolution:", error.message);
    }
}

// 5. Add Board Member
async function addBoardMember(contract, signer) {
    console.log();
    console.log("-".repeat(70));
    console.log("Add New Board Member");
    console.log("-".repeat(70));

    const address = await askQuestion("Enter member address: ");
    const name = await askQuestion("Enter member name: ");
    const position = await askQuestion("Enter member position: ");
    const votingPower = await askQuestion("Enter voting power: ");

    console.log();
    console.log("Submitting transaction...");

    try {
        const tx = await contract.connect(signer).addBoardMember(
            address,
            name,
            position,
            votingPower
        );

        console.log(`Transaction hash: ${tx.hash}`);
        console.log("Waiting for confirmation...");

        await tx.wait();

        console.log();
        console.log("Board member added successfully!");
        console.log("-".repeat(70));
        console.log(`Address: ${address}`);
        console.log(`Name: ${name}`);
        console.log(`Position: ${position}`);
        console.log(`Voting Power: ${votingPower}`);
        console.log("-".repeat(70));
    } catch (error) {
        console.error("Error adding board member:", error.message);
    }
}

// 6. Create Resolution
async function createResolution(contract, signer) {
    console.log();
    console.log("-".repeat(70));
    console.log("Create New Resolution");
    console.log("-".repeat(70));

    const title = await askQuestion("Enter resolution title: ");
    const description = await askQuestion("Enter resolution description: ");
    const requiredQuorum = await askQuestion("Enter required quorum: ");

    console.log();
    console.log("Submitting transaction...");

    try {
        const tx = await contract.connect(signer).createResolution(
            title,
            description,
            requiredQuorum
        );

        console.log(`Transaction hash: ${tx.hash}`);
        console.log("Waiting for confirmation...");

        const receipt = await tx.wait();

        // Find the ResolutionCreated event
        const event = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === "ResolutionCreated";
            } catch {
                return false;
            }
        });

        let resolutionId = "N/A";
        if (event) {
            const parsed = contract.interface.parseLog(event);
            resolutionId = parsed.args[0].toString();
        }

        console.log();
        console.log("Resolution created successfully!");
        console.log("-".repeat(70));
        console.log(`Resolution ID: ${resolutionId}`);
        console.log(`Title: ${title}`);
        console.log(`Description: ${description}`);
        console.log(`Required Quorum: ${requiredQuorum}`);
        console.log("-".repeat(70));
    } catch (error) {
        console.error("Error creating resolution:", error.message);
    }
}

// 7. View Contract Info
async function viewContractInfo(contract, deploymentInfo) {
    try {
        const chairperson = await contract.chairperson();
        const totalVotingPower = await contract.getTotalVotingPower();
        const resolutionCount = await contract.getResolutionCount();

        console.log();
        console.log("=".repeat(70));
        console.log("CONTRACT INFORMATION");
        console.log("=".repeat(70));
        console.log();
        console.log("Deployment Info:");
        console.log("-".repeat(70));
        console.log(`Contract Address: ${deploymentInfo.contractAddress}`);
        console.log(`Network: ${deploymentInfo.network}`);
        console.log(`Chain ID: ${deploymentInfo.chainId}`);
        console.log(`Deployed: ${deploymentInfo.timestamp}`);
        console.log(`Deployer: ${deploymentInfo.deployer}`);
        console.log(`Explorer: ${deploymentInfo.explorerUrl}`);
        console.log();
        console.log("Current State:");
        console.log("-".repeat(70));
        console.log(`Chairperson: ${chairperson}`);
        console.log(`Total Voting Power: ${totalVotingPower}`);
        console.log(`Resolution Count: ${resolutionCount}`);
        console.log("=".repeat(70));
    } catch (error) {
        console.error("Error fetching contract info:", error.message);
    }
}

// Main function
async function main() {
    console.log();
    console.log("=".repeat(70));
    console.log("CORPORATE GOVERNANCE - CONTRACT INTERACTION");
    console.log("=".repeat(70));
    console.log();

    // Load contract
    console.log("Loading contract...");
    const { contract, deploymentInfo, networkName } = await loadContract();
    console.log(`Connected to contract on ${networkName}: ${deploymentInfo.contractAddress}`);

    // Get signer
    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();
    console.log(`Using account: ${signerAddress}`);

    let exit = false;

    while (!exit) {
        const choice = await displayMenu();

        switch (choice) {
            case "1":
                await viewBoardMemberInfo(contract);
                break;
            case "2":
                await viewTotalVotingPower(contract);
                break;
            case "3":
                await listAllResolutions(contract);
                break;
            case "4":
                await viewResolution(contract);
                break;
            case "5":
                await addBoardMember(contract, signer);
                break;
            case "6":
                await createResolution(contract, signer);
                break;
            case "7":
                await viewContractInfo(contract, deploymentInfo);
                break;
            case "0":
                exit = true;
                console.log();
                console.log("Goodbye!");
                console.log("=".repeat(70));
                break;
            default:
                console.log();
                console.log("Invalid choice. Please try again.");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error();
        console.error("=".repeat(70));
        console.error("INTERACTION ERROR");
        console.error("=".repeat(70));
        console.error(error);
        console.error("=".repeat(70));
        process.exit(1);
    });
