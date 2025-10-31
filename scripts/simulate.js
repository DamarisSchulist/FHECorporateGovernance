const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

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

// Helper function to wait
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log();
    console.log("=".repeat(70));
    console.log("CORPORATE GOVERNANCE - FULL WORKFLOW SIMULATION");
    console.log("=".repeat(70));
    console.log();

    // Load contract
    console.log("Loading contract...");
    const { contract, deploymentInfo, networkName } = await loadContract();
    console.log(`Connected to contract on ${networkName}: ${deploymentInfo.contractAddress}`);
    console.log();

    // Get signers
    const signers = await ethers.getSigners();
    console.log(`Available signers: ${signers.length}`);
    console.log();

    // Use first 5 signers for simulation
    const chairperson = signers[0];
    const member1 = signers[1];
    const member2 = signers[2];
    const member3 = signers[3];
    const member4 = signers[4];

    console.log("Simulation Participants:");
    console.log("-".repeat(70));
    console.log(`Chairperson: ${await chairperson.getAddress()}`);
    console.log(`Member 1: ${await member1.getAddress()}`);
    console.log(`Member 2: ${await member2.getAddress()}`);
    console.log(`Member 3: ${await member3.getAddress()}`);
    console.log(`Member 4: ${await member4.getAddress()}`);
    console.log();

    // STEP 1: Add Board Members
    console.log("=".repeat(70));
    console.log("STEP 1: ADDING BOARD MEMBERS");
    console.log("=".repeat(70));
    console.log();

    const boardMembers = [
        { signer: member1, name: "Alice Johnson", position: "CFO", votingPower: 3 },
        { signer: member2, name: "Bob Smith", position: "CTO", votingPower: 3 },
        { signer: member3, name: "Carol Williams", position: "COO", votingPower: 2 },
        { signer: member4, name: "David Brown", position: "General Counsel", votingPower: 2 }
    ];

    for (const member of boardMembers) {
        console.log(`Adding: ${member.name} (${member.position})`);
        try {
            const tx = await contract.connect(chairperson).addBoardMember(
                await member.signer.getAddress(),
                member.name,
                member.position,
                member.votingPower
            );
            console.log(`  Transaction: ${tx.hash}`);
            await tx.wait();
            console.log(`  Status: Success`);
            console.log();
        } catch (error) {
            console.error(`  Error: ${error.message}`);
            console.log();
        }
    }

    // Check total voting power
    const totalVotingPower = await contract.getTotalVotingPower();
    console.log("-".repeat(70));
    console.log(`Total Voting Power: ${totalVotingPower}`);
    console.log("=".repeat(70));
    console.log();

    await sleep(1000);

    // STEP 2: Create Sample Resolutions
    console.log("=".repeat(70));
    console.log("STEP 2: CREATING RESOLUTIONS");
    console.log("=".repeat(70));
    console.log();

    const resolutions = [
        {
            title: "Approve Annual Budget 2024",
            description: "Approve the proposed annual budget of $5,000,000 for fiscal year 2024",
            quorum: 6,
            creator: chairperson
        },
        {
            title: "Expand to European Market",
            description: "Authorize expansion into European markets with an initial investment of $2M",
            quorum: 7,
            creator: member1
        },
        {
            title: "Approve Executive Compensation Plan",
            description: "Approve the revised executive compensation plan for senior leadership",
            quorum: 5,
            creator: member2
        }
    ];

    const createdResolutionIds = [];

    for (let i = 0; i < resolutions.length; i++) {
        const res = resolutions[i];
        console.log(`Creating Resolution: "${res.title}"`);
        console.log(`  Description: ${res.description}`);
        console.log(`  Required Quorum: ${res.quorum}`);
        console.log(`  Creator: ${await res.creator.getAddress()}`);

        try {
            const tx = await contract.connect(res.creator).createResolution(
                res.title,
                res.description,
                res.quorum
            );
            console.log(`  Transaction: ${tx.hash}`);

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

            if (event) {
                const parsed = contract.interface.parseLog(event);
                const resolutionId = parsed.args[0].toString();
                createdResolutionIds.push(resolutionId);
                console.log(`  Resolution ID: ${resolutionId}`);
                console.log(`  Status: Success`);
            } else {
                console.log(`  Status: Success (ID not found in events)`);
            }
        } catch (error) {
            console.error(`  Error: ${error.message}`);
        }
        console.log();
    }

    const resolutionCount = await contract.getResolutionCount();
    console.log("-".repeat(70));
    console.log(`Total Resolutions Created: ${resolutionCount}`);
    console.log("=".repeat(70));
    console.log();

    await sleep(1000);

    // STEP 3: Display Resolutions
    console.log("=".repeat(70));
    console.log("STEP 3: DISPLAYING RESOLUTIONS");
    console.log("=".repeat(70));
    console.log();

    for (let i = 0; i < resolutionCount; i++) {
        try {
            const [id, title, description, startTime, endTime, active, creator, requiredQuorum] =
                await contract.getResolution(i);

            console.log(`Resolution #${id}:`);
            console.log(`  Title: ${title}`);
            console.log(`  Description: ${description}`);
            console.log(`  Creator: ${creator}`);
            console.log(`  Active: ${active}`);
            console.log(`  Start: ${new Date(Number(startTime) * 1000).toLocaleString()}`);
            console.log(`  End: ${new Date(Number(endTime) * 1000).toLocaleString()}`);
            console.log(`  Required Quorum: ${requiredQuorum}`);
            console.log("-".repeat(70));
        } catch (error) {
            console.error(`Error fetching resolution ${i}:`, error.message);
        }
    }
    console.log();

    await sleep(1000);

    // STEP 4: Simulate Voting (Note: This requires FHE setup)
    console.log("=".repeat(70));
    console.log("STEP 4: SIMULATING VOTES");
    console.log("=".repeat(70));
    console.log();
    console.log("NOTE: Encrypted voting requires FHE (Fully Homomorphic Encryption) setup.");
    console.log("This simulation will demonstrate the vote casting interface.");
    console.log("For actual encrypted voting, you need:");
    console.log("  1. FHEVM-compatible network (e.g., Zama's testnet)");
    console.log("  2. FHE encryption setup");
    console.log("  3. Proper encryption keys");
    console.log();
    console.log("Voting Pattern (if FHE was enabled):");
    console.log("-".repeat(70));

    const votingScenarios = [
        {
            resolutionId: 0,
            title: "Annual Budget 2024",
            votes: [
                { voter: "Chairperson", vote: "YES", power: 1 },
                { voter: "Alice (CFO)", vote: "YES", power: 3 },
                { voter: "Bob (CTO)", vote: "YES", power: 3 },
                { voter: "Carol (COO)", vote: "NO", power: 2 },
            ]
        },
        {
            resolutionId: 1,
            title: "European Expansion",
            votes: [
                { voter: "Chairperson", vote: "YES", power: 1 },
                { voter: "Alice (CFO)", vote: "YES", power: 3 },
                { voter: "Bob (CTO)", vote: "NO", power: 3 },
                { voter: "Carol (COO)", vote: "YES", power: 2 },
                { voter: "David (Legal)", vote: "NO", power: 2 },
            ]
        },
        {
            resolutionId: 2,
            title: "Executive Compensation",
            votes: [
                { voter: "Chairperson", vote: "YES", power: 1 },
                { voter: "Alice (CFO)", vote: "YES", power: 3 },
                { voter: "Bob (CTO)", vote: "YES", power: 3 },
                { voter: "Carol (COO)", vote: "YES", power: 2 },
                { voter: "David (Legal)", vote: "YES", power: 2 },
            ]
        }
    ];

    for (const scenario of votingScenarios) {
        console.log(`Resolution #${scenario.resolutionId}: ${scenario.title}`);

        let yesTotal = 0;
        let noTotal = 0;

        for (const vote of scenario.votes) {
            console.log(`  ${vote.voter}: ${vote.vote} (Power: ${vote.power})`);
            if (vote.vote === "YES") {
                yesTotal += vote.power;
            } else {
                noTotal += vote.power;
            }
        }

        console.log(`  ---`);
        console.log(`  Total YES: ${yesTotal}`);
        console.log(`  Total NO: ${noTotal}`);
        console.log(`  Result: ${yesTotal > noTotal ? "PASSED" : "FAILED"}`);
        console.log("-".repeat(70));
    }
    console.log();

    console.log("In production with FHE:");
    console.log("- Votes would be encrypted on-chain");
    console.log("- Only aggregated results visible after resolution closes");
    console.log("- Individual votes remain private");
    console.log("- Decryption happens through FHE Gateway");
    console.log();

    await sleep(1000);

    // STEP 5: Close Resolutions (if possible)
    console.log("=".repeat(70));
    console.log("STEP 5: CLOSING RESOLUTIONS");
    console.log("=".repeat(70));
    console.log();
    console.log("NOTE: Resolutions can only be closed after voting period ends");
    console.log("or by the resolution creator.");
    console.log();
    console.log("To close a resolution in production:");
    console.log("  1. Wait for voting period to end (7 days by default)");
    console.log("  2. Call closeResolution(resolutionId)");
    console.log("  3. Results will be decrypted via FHE Gateway");
    console.log();

    // Try to close as creator (should work)
    if (createdResolutionIds.length > 0) {
        const resId = createdResolutionIds[0];
        console.log(`Attempting to close Resolution #${resId} as creator...`);
        try {
            const tx = await contract.connect(chairperson).closeResolution(resId);
            console.log(`  Transaction: ${tx.hash}`);
            await tx.wait();
            console.log(`  Status: Success`);
            console.log(`  Resolution closed successfully`);
        } catch (error) {
            console.log(`  Note: ${error.message}`);
            console.log(`  This is expected if FHE Gateway is not available`);
        }
    }

    console.log();
    console.log("=".repeat(70));
    console.log("SIMULATION COMPLETE");
    console.log("=".repeat(70));
    console.log();

    // Final Summary
    console.log("Summary:");
    console.log("-".repeat(70));
    console.log(`Contract Address: ${deploymentInfo.contractAddress}`);
    console.log(`Network: ${networkName}`);
    console.log(`Total Board Members: 5 (including chairperson)`);
    console.log(`Total Voting Power: ${totalVotingPower}`);
    console.log(`Resolutions Created: ${resolutionCount}`);
    console.log("-".repeat(70));
    console.log();

    console.log("Next Steps:");
    console.log("-".repeat(70));
    console.log("1. For encrypted voting, deploy to FHE-compatible network");
    console.log("2. Use interact.js to manually interact with the contract");
    console.log("3. Wait for voting periods to expire to close resolutions");
    console.log("4. View results after decryption");
    console.log("=".repeat(70));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error();
        console.error("=".repeat(70));
        console.error("SIMULATION ERROR");
        console.error("=".repeat(70));
        console.error(error);
        console.error("=".repeat(70));
        process.exit(1);
    });
