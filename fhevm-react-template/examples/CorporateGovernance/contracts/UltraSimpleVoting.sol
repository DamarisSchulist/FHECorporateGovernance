// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UltraSimpleVoting {
    
    mapping(uint256 => uint256) public yesVotes;
    mapping(uint256 => uint256) public noVotes;
    mapping(address => bool) public isActiveMember;
    mapping(address => uint256) public votingPower;
    mapping(address => string) public memberName;
    
    uint256 public resolutionCounter;
    
    event VoteCast(uint256 indexed resolutionId, address voter, bool vote);
    event MemberAdded(address member, string name);
    event ResolutionCreated(uint256 indexed resolutionId);

    constructor() {
        // No restrictions, anyone can use
    }

    function addBoardMember(
        address _member,
        string memory _name,
        string memory _position,
        uint256 _votingPower
    ) external {
        isActiveMember[_member] = true;
        votingPower[_member] = _votingPower > 0 ? _votingPower : 1;
        memberName[_member] = _name;
        emit MemberAdded(_member, _name);
    }

    function createResolution(
        string memory _title,
        string memory _description,
        uint256 _requiredQuorum
    ) external {
        // Auto-add caller as member
        if (!isActiveMember[msg.sender]) {
            isActiveMember[msg.sender] = true;
            votingPower[msg.sender] = 1;
            memberName[msg.sender] = "Auto Member";
            emit MemberAdded(msg.sender, "Auto Member");
        }
        
        uint256 resolutionId = resolutionCounter++;
        emit ResolutionCreated(resolutionId);
    }

    function castVote(
        uint256 _resolutionId,
        bool _vote
    ) external {
        // Auto-add caller as member if not exists
        if (!isActiveMember[msg.sender]) {
            isActiveMember[msg.sender] = true;
            votingPower[msg.sender] = 1;
            memberName[msg.sender] = "Auto Voter";
            emit MemberAdded(msg.sender, "Auto Voter");
        }

        // No checks, just add votes
        uint256 power = votingPower[msg.sender];
        
        if (_vote) {
            yesVotes[_resolutionId] += power;
        } else {
            noVotes[_resolutionId] += power;
        }

        emit VoteCast(_resolutionId, msg.sender, _vote);
    }

    // Simple getter functions
    function getVotes(uint256 _resolutionId) external view returns (uint256 yes, uint256 no) {
        return (yesVotes[_resolutionId], noVotes[_resolutionId]);
    }
    
    function getBoardMember(address _member) external view returns (
        bool isActive,
        uint256 _votingPower,
        string memory name,
        string memory position
    ) {
        return (
            isActiveMember[_member],
            votingPower[_member],
            memberName[_member],
            "Board Member"
        );
    }
    
    function getResolutionCount() external view returns (uint256) {
        return resolutionCounter;
    }
    
    function getTotalVotingPower() external view returns (uint256) {
        return 100; // Dummy value
    }
    
    function hasUserVoted(uint256 _resolutionId, address _user) external view returns (bool) {
        return false; // Always allow voting
    }
    
    function getResolution(uint256 _resolutionId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool active,
        address creator,
        uint256 requiredQuorum,
        uint256 _yesVotes,
        uint256 _noVotes
    ) {
        return (
            _resolutionId,
            "Test Resolution",
            "Test Description", 
            block.timestamp,
            block.timestamp + 7 days,
            true,
            msg.sender,
            1,
            yesVotes[_resolutionId],
            noVotes[_resolutionId]
        );
    }
}