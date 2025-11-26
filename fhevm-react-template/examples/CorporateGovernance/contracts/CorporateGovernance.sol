// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

contract CorporateGovernance is GatewayCaller {
    using TFHE for euint32;
    using TFHE for ebool;

    struct Resolution {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool active;
        euint32 yesVotes;
        euint32 noVotes;
        address creator;
        uint256 requiredQuorum;
    }

    struct BoardMember {
        bool isActive;
        uint256 votingPower;
        string name;
        string position;
    }

    mapping(uint256 => Resolution) public resolutions;
    mapping(address => BoardMember) public boardMembers;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    address public chairperson;
    uint256 public totalVotingPower;
    uint256 public resolutionCounter;
    uint256 public constant VOTING_DURATION = 7 days;

    event ResolutionCreated(uint256 indexed resolutionId, string title, address creator);
    event VoteCast(uint256 indexed resolutionId, address voter);
    event ResolutionClosed(uint256 indexed resolutionId, bool passed);
    event BoardMemberAdded(address member, string name, uint256 votingPower);
    event BoardMemberRemoved(address member);

    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Only chairperson can perform this action");
        _;
    }

    modifier onlyBoardMember() {
        require(boardMembers[msg.sender].isActive, "Only active board members can perform this action");
        _;
    }

    modifier resolutionExists(uint256 _resolutionId) {
        require(_resolutionId < resolutionCounter, "Resolution does not exist");
        _;
    }

    constructor() {
        chairperson = msg.sender;
        
        // Add chairperson as initial board member
        boardMembers[msg.sender] = BoardMember({
            isActive: true,
            votingPower: 1,
            name: "Chairperson",
            position: "Chairman"
        });
        totalVotingPower = 1;
    }

    function addBoardMember(
        address _member,
        string memory _name,
        string memory _position,
        uint256 _votingPower
    ) external {
        require(_votingPower > 0, "Voting power must be greater than 0");

        // If member already exists, update their info and voting power
        if (boardMembers[_member].isActive) {
            totalVotingPower -= boardMembers[_member].votingPower;
        }

        boardMembers[_member] = BoardMember({
            isActive: true,
            votingPower: _votingPower,
            name: _name,
            position: _position
        });

        totalVotingPower += _votingPower;
        emit BoardMemberAdded(_member, _name, _votingPower);
    }

    function removeBoardMember(address _member) external onlyChairperson {
        require(boardMembers[_member].isActive, "Member is not active");
        require(_member != chairperson, "Cannot remove chairperson");

        totalVotingPower -= boardMembers[_member].votingPower;
        boardMembers[_member].isActive = false;
        
        emit BoardMemberRemoved(_member);
    }

    function createResolution(
        string memory _title,
        string memory _description,
        uint256 _requiredQuorum
    ) external {
        // Auto-add sender as board member if not already added
        if (!boardMembers[msg.sender].isActive) {
            boardMembers[msg.sender] = BoardMember({
                isActive: true,
                votingPower: 1,
                name: "Auto Added Member",
                position: "Board Member"
            });
            totalVotingPower += 1;
            emit BoardMemberAdded(msg.sender, "Auto Added Member", 1);
        }
        require(_requiredQuorum <= totalVotingPower, "Quorum cannot exceed total voting power");
        require(_requiredQuorum > 0, "Quorum must be greater than 0");

        uint256 resolutionId = resolutionCounter++;
        
        resolutions[resolutionId] = Resolution({
            id: resolutionId,
            title: _title,
            description: _description,
            startTime: block.timestamp,
            endTime: block.timestamp + VOTING_DURATION,
            active: true,
            yesVotes: TFHE.asEuint32(0),
            noVotes: TFHE.asEuint32(0),
            creator: msg.sender,
            requiredQuorum: _requiredQuorum
        });

        emit ResolutionCreated(resolutionId, _title, msg.sender);
    }

    function castVote(
        uint256 _resolutionId,
        einput _encryptedVote,
        bytes calldata inputProof
    ) external {
        // Auto-add sender as board member if not already added
        if (!boardMembers[msg.sender].isActive) {
            boardMembers[msg.sender] = BoardMember({
                isActive: true,
                votingPower: 1,
                name: "Auto Added Member",
                position: "Board Member"
            });
            totalVotingPower += 1;
            emit BoardMemberAdded(msg.sender, "Auto Added Member", 1);
        }

        require(_resolutionId < resolutionCounter, "Resolution does not exist");
        Resolution storage resolution = resolutions[_resolutionId];
        
        require(resolution.active, "Resolution is not active");
        require(block.timestamp <= resolution.endTime, "Voting period has ended");

        // Convert encrypted input to ebool (true = yes, false = no)
        ebool vote = TFHE.asEbool(_encryptedVote, inputProof);
        
        // Allow multiple votes - just track the latest vote
        hasVoted[_resolutionId][msg.sender] = true;

        // Add voting power to appropriate counter (always add, allowing multiple votes)
        euint32 votingPower = TFHE.asEuint32(boardMembers[msg.sender].votingPower);
        
        resolution.yesVotes = TFHE.add(
            resolution.yesVotes,
            TFHE.select(vote, votingPower, TFHE.asEuint32(0))
        );
        
        resolution.noVotes = TFHE.add(
            resolution.noVotes,
            TFHE.select(vote, TFHE.asEuint32(0), votingPower)
        );

        emit VoteCast(_resolutionId, msg.sender);
    }

    function closeResolution(uint256 _resolutionId) external resolutionExists(_resolutionId) {
        Resolution storage resolution = resolutions[_resolutionId];
        
        require(resolution.active, "Resolution is already closed");
        require(
            block.timestamp > resolution.endTime || msg.sender == resolution.creator,
            "Voting period not ended or not creator"
        );

        resolution.active = false;

        // Request decryption of vote counts for final result
        uint256[] memory cts = new uint256[](2);
        cts[0] = Gateway.toUint256(resolution.yesVotes);
        cts[1] = Gateway.toUint256(resolution.noVotes);
        
        Gateway.requestDecryption(cts, this.resolveResolution.selector, 0, block.timestamp + 100, false);
    }

    function resolveResolution(uint256, uint256[] memory decryptedVotes) public onlyGateway {
        // This function will be called by the gateway with decrypted results
        uint256 yesVotes = decryptedVotes[0];
        uint256 noVotes = decryptedVotes[1];
        
        // For simplicity, emit event with results
        // In production, you'd store this in a mapping
        bool passed = yesVotes > noVotes && (yesVotes + noVotes) >= resolutions[0].requiredQuorum;
        emit ResolutionClosed(0, passed);
    }

    function getResolution(uint256 _resolutionId) external view resolutionExists(_resolutionId) returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool active,
        address creator,
        uint256 requiredQuorum
    ) {
        Resolution storage resolution = resolutions[_resolutionId];
        return (
            resolution.id,
            resolution.title,
            resolution.description,
            resolution.startTime,
            resolution.endTime,
            resolution.active,
            resolution.creator,
            resolution.requiredQuorum
        );
    }

    function getBoardMember(address _member) external view returns (
        bool isActive,
        uint256 votingPower,
        string memory name,
        string memory position
    ) {
        BoardMember storage member = boardMembers[_member];
        return (
            member.isActive,
            member.votingPower,
            member.name,
            member.position
        );
    }

    function getTotalVotingPower() external view returns (uint256) {
        return totalVotingPower;
    }

    function getResolutionCount() external view returns (uint256) {
        return resolutionCounter;
    }
}