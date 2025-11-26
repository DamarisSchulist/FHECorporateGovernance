// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleBoardResolution {
    struct Resolution {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 yesVotes;
        uint256 noVotes;
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
    event VoteCast(uint256 indexed resolutionId, address voter, bool vote);
    event ResolutionClosed(uint256 indexed resolutionId, bool passed);
    event BoardMemberAdded(address member, string name, uint256 votingPower);

    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Only chairperson can perform this action");
        _;
    }

    modifier onlyBoardMember() {
        require(boardMembers[msg.sender].isActive, "Only active board members can vote");
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
    ) external onlyChairperson {
        require(!boardMembers[_member].isActive, "Member already exists");
        require(_votingPower > 0, "Voting power must be greater than 0");

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
    }

    function createResolution(
        string memory _title,
        string memory _description,
        uint256 _requiredQuorum
    ) external onlyBoardMember {
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
            yesVotes: 0,
            noVotes: 0,
            creator: msg.sender,
            requiredQuorum: _requiredQuorum
        });

        emit ResolutionCreated(resolutionId, _title, msg.sender);
    }

    function castVote(
        uint256 _resolutionId,
        bool _vote
    ) external onlyBoardMember resolutionExists(_resolutionId) {
        Resolution storage resolution = resolutions[_resolutionId];
        
        require(resolution.active, "Resolution is not active");
        require(block.timestamp <= resolution.endTime, "Voting period has ended");
        require(!hasVoted[_resolutionId][msg.sender], "Already voted");

        // Mark as voted
        hasVoted[_resolutionId][msg.sender] = true;

        // Add voting power to appropriate counter
        uint256 votingPower = boardMembers[msg.sender].votingPower;
        
        if (_vote) {
            resolution.yesVotes += votingPower;
        } else {
            resolution.noVotes += votingPower;
        }

        emit VoteCast(_resolutionId, msg.sender, _vote);
    }

    function closeResolution(uint256 _resolutionId) external resolutionExists(_resolutionId) {
        Resolution storage resolution = resolutions[_resolutionId];
        
        require(resolution.active, "Resolution is already closed");
        require(
            block.timestamp > resolution.endTime || msg.sender == resolution.creator,
            "Voting period not ended or not creator"
        );

        resolution.active = false;
        
        bool passed = resolution.yesVotes > resolution.noVotes && 
                     (resolution.yesVotes + resolution.noVotes) >= resolution.requiredQuorum;

        emit ResolutionClosed(_resolutionId, passed);
    }

    function getResolution(uint256 _resolutionId) external view resolutionExists(_resolutionId) returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool active,
        address creator,
        uint256 requiredQuorum,
        uint256 yesVotes,
        uint256 noVotes
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
            resolution.requiredQuorum,
            resolution.yesVotes,
            resolution.noVotes
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

    function hasUserVoted(uint256 _resolutionId, address _user) external view returns (bool) {
        return hasVoted[_resolutionId][_user];
    }
}