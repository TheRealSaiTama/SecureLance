// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./ReputationBadge.sol";

contract GigEscrow is ERC2771Context, ReentrancyGuard {

    using SafeERC20 for IERC20;

    // Interface for the ReputationBadge contract
    ReputationBadge public reputationBadge;
    bool public badgesEnabled = false;
    
    // Streak tracking for freelancers
    mapping(address => uint256) public freelancerCurrentStreak;
    mapping(address => uint256) public freelancerMaxStreak;
    // Track if a freelancer has had disputes
    mapping(address => bool) public freelancerHasHadDispute;
    // Track consecutive completed gigs without disputes
    mapping(address => uint256) public freelancerDisputeFreeGigs;

    struct Milestone {
        string description;
        uint value;
        bool completed;
    }

    struct Gig {
        uint gigId;
        address payable client;
        address payable freelancer;
        uint totalBudget;
        string description;
        State state;
        bool exists;
        Milestone[] milestones;
        uint completedMilestoneCount;
        address token;  // ERC20 token address (zero for ETH)
    }

    enum State { Open, InProgress, Disputed, Completed, CancelledByClient, CancelledByFreelancer, AwaitingResolution }

    address public arbitrator;
    mapping(uint => string) public badgeUrisByCount;

    struct Dispute {
        address raisedBy;
        string reason;
        bool exists;
        bool resolved;
        address resolutionAuthority; // Address authorized to submit final resolution
        bytes resolutionData; // Optional data related to off-chain resolution (e.g., IPFS hash)
    }

    mapping(uint => Dispute) public disputes;

    mapping(uint => Gig) public gigs;
    uint public nextGigId;

    mapping(address => uint) public freelancerCompletedGigs;
    mapping(address => uint) public freelancerTotalEarned;

    address public stakeToken;
    uint public stakeAmount;
    mapping(uint => mapping(address => bool)) public hasBid;
    mapping(uint => address[]) public bidders;

    // Leaderboard: track start and completion times
    mapping(uint => uint) public gigStartTime;
    mapping(uint => uint) public gigCompletionTime;

    event GigPosted(uint indexed gigId, address indexed client, uint totalBudget, string description, uint milestoneCount);
    event FreelancerSelected(uint indexed gigId, address indexed freelancer);
    event MilestonePaymentReleased(uint indexed gigId, uint indexed milestoneIndex, address indexed freelancer, uint amount);
    event GigCancelledByClient(uint indexed gigId, uint refundAmount);
    event GigCancelledByFreelancer(uint indexed gigId, uint refundAmount);
    event FreelancerReputationUpdated(address indexed freelancer, uint completedGigs, uint totalEarned);
    event DisputeRaised(uint indexed gigId, address indexed by, string reason);
    event DisputeResolutionSubmitted(uint indexed gigId, address indexed authority, bytes resolutionData, uint amountReleasedToFreelancer, uint amountReturnedToClient);
    event GigStarted(uint indexed gigId, address indexed freelancer, uint startTime);
    event GigCompletedDetailed(uint indexed gigId, address indexed freelancer, uint startTime, uint completionTime, uint duration);
    event ResolutionAuthorityUpdated(address indexed newAuthority);
    event BadgeContractUpdated(address indexed badgeContract);
    event BadgeMinted(address indexed freelancer, uint256 indexed tokenId, uint8 badgeType, uint256 level);
    event BadgesToggled(bool enabled);

    modifier onlyClient(uint _gigId) {
        require(gigs[_gigId].exists, "GigEscrow: Gig does not exist");
        require(_msgSender() == gigs[_gigId].client, "GigEscrow: Only the client can call this");
        _;
    }

    modifier onlyFreelancer(uint _gigId) {
        require(gigs[_gigId].exists, "GigEscrow: Gig does not exist");
        require(gigs[_gigId].freelancer != address(0), "GigEscrow: Freelancer not assigned");
        require(_msgSender() == gigs[_gigId].freelancer, "GigEscrow: Only the freelancer can call this");
        _;
    }

    modifier inState(uint _gigId, State _state) {
        require(gigs[_gigId].exists, "GigEscrow: Gig does not exist");
        require(gigs[_gigId].state == _state, "GigEscrow: Gig is not in the required state");
        _;
    }

    modifier onlyArbitrator() {
        require(_msgSender() == arbitrator, "GigEscrow: Only arbitrator can call");
        _;
    }

    modifier onlyResolutionAuthority(uint _gigId) {
        require(disputes[_gigId].exists, "GigEscrow: Dispute does not exist");
        require(_msgSender() == disputes[_gigId].resolutionAuthority, "GigEscrow: Only the resolution authority can call this");
        _;
    }

    constructor() ERC2771Context(address(0)) {
        arbitrator = _msgSender();
    }

    function setResolutionAuthority(address _newAuthority) external onlyArbitrator {
        arbitrator = _newAuthority; // Re-using arbitrator for simplicity, could be a separate variable
        emit ResolutionAuthorityUpdated(_newAuthority);
    }

    // Admin config for staking
    function setStakeParams(address _stakeToken, uint _stakeAmount) external onlyArbitrator {
        stakeToken = _stakeToken;
        stakeAmount = _stakeAmount;
    }

    // New function to set the badge contract address
    function setReputationBadgeContract(address _badgeContract) external onlyArbitrator {
        reputationBadge = ReputationBadge(_badgeContract);
        emit BadgeContractUpdated(_badgeContract);
    }
    
    // Toggle badges functionality
    function toggleBadges(bool _enabled) external onlyArbitrator {
        badgesEnabled = _enabled;
        emit BadgesToggled(_enabled);
    }

    // New function to grant initiative badge to a user
    function grantInitiativeBadge(address _user) external {
        require(badgesEnabled && address(reputationBadge) != address(0), "GigEscrow: Badges not enabled");
        
        uint256 badgeId = reputationBadge.mintInitiativeBadge(_user);
        
        if (badgeId > 0) {
            emit BadgeMinted(_user, badgeId, uint8(ReputationBadge.BadgeType.INITIATIVE), 1);
        }
    }

    function postGig(
        address _token,
        string memory _description,
        string[] memory _milestoneDescriptions,
        uint[] memory _milestoneValues
    ) public payable nonReentrant {
        require(_milestoneDescriptions.length > 0, "GigEscrow: Must have at least one milestone");
        require(_milestoneDescriptions.length == _milestoneValues.length, "GigEscrow: Milestone descriptions and values count mismatch");

        uint calculatedTotalBudget = 0;
        for (uint i = 0; i < _milestoneValues.length; i++) {
            require(_milestoneValues[i] > 0, "GigEscrow: Milestone value must be positive");
            calculatedTotalBudget += _milestoneValues[i];
        }

        // Handle ETH vs ERC20 deposit
        if (_token == address(0)) {
            require(msg.value == calculatedTotalBudget, "GigEscrow: Sent ETH must match total milestone values");
        } else {
            require(msg.value == 0, "GigEscrow: Do not send ETH for ERC20 gigs");
            IERC20(_token).safeTransferFrom(_msgSender(), address(this), calculatedTotalBudget);
        }

        uint currentGigId = nextGigId;
        Gig storage newGig = gigs[currentGigId];

        newGig.token = _token;
        newGig.gigId = currentGigId;
        newGig.client = payable(_msgSender());
        newGig.freelancer = payable(address(0));
        newGig.totalBudget = calculatedTotalBudget;
        newGig.description = _description;
        newGig.state = State.Open;
        newGig.exists = true;
        newGig.completedMilestoneCount = 0;

        for (uint i = 0; i < _milestoneDescriptions.length; i++) {
            newGig.milestones.push(Milestone({
                description: _milestoneDescriptions[i],
                value: _milestoneValues[i],
                completed: false
            }));
        }

        nextGigId++;
        emit GigPosted(currentGigId, _msgSender(), calculatedTotalBudget, _description, newGig.milestones.length);
        
        // Automatically grant initiative badge to client posting a gig
        if (badgesEnabled && address(reputationBadge) != address(0)) {
            reputationBadge.mintInitiativeBadge(_msgSender());
        }
    }

    // Freelancer stakes to bid on a gig
    function bidGig(uint _gigId) external inState(_gigId, State.Open) nonReentrant {
        require(stakeToken != address(0) && stakeAmount > 0, "GigEscrow: Staking not configured");
        require(!hasBid[_gigId][_msgSender()], "GigEscrow: Already bid");
        IERC20(stakeToken).safeTransferFrom(_msgSender(), address(this), stakeAmount);
        hasBid[_gigId][_msgSender()] = true;
        bidders[_gigId].push(_msgSender());
        
        // Automatically grant initiative badge when a freelancer places a bid
        if (badgesEnabled && address(reputationBadge) != address(0)) {
            reputationBadge.mintInitiativeBadge(_msgSender());
        }
    }

    function selectFreelancer(uint _gigId, address payable _freelancer)
        public
        onlyClient(_gigId)
        inState(_gigId, State.Open)
        nonReentrant
    {
        require(_freelancer != address(0), "GigEscrow: Freelancer address cannot be zero");
        require(hasBid[_gigId][_freelancer], "GigEscrow: Freelancer did not bid");
        gigs[_gigId].freelancer = _freelancer;
        gigs[_gigId].state = State.InProgress;
        // record start time
        gigStartTime[_gigId] = block.timestamp;
        emit GigStarted(_gigId, _freelancer, block.timestamp);
        emit FreelancerSelected(_gigId, _freelancer);
    }

    function releaseMilestonePayment(uint _gigId, uint _milestoneIndex)
        public
        onlyClient(_gigId)
        inState(_gigId, State.InProgress)
        nonReentrant
    {
        Gig storage gig = gigs[_gigId];
        require(_milestoneIndex < gig.milestones.length, "GigEscrow: Invalid milestone index");
        require(!gig.milestones[_milestoneIndex].completed, "GigEscrow: Milestone already completed");

        uint amount = gig.milestones[_milestoneIndex].value;
        gig.milestones[_milestoneIndex].completed = true;
        gig.completedMilestoneCount++;

        if (gig.completedMilestoneCount == gig.milestones.length) {
            // record completion
            uint start = gigStartTime[_gigId];
            uint endTime = block.timestamp;
            gigCompletionTime[_gigId] = endTime;
            emit GigCompletedDetailed(_gigId, gig.freelancer, start, endTime, endTime - start);

            gig.state = State.Completed;
            address freelancer = gig.freelancer;
            freelancerCompletedGigs[freelancer]++;
            freelancerTotalEarned[freelancer] += gig.totalBudget;
            
            // Update freelancer's streak
            freelancerCurrentStreak[freelancer]++;
            if (freelancerCurrentStreak[freelancer] > freelancerMaxStreak[freelancer]) {
                freelancerMaxStreak[freelancer] = freelancerCurrentStreak[freelancer];
            }
            
            // Update dispute-free count if freelancer has never had a dispute
            if (!freelancerHasHadDispute[freelancer]) {
                freelancerDisputeFreeGigs[freelancer]++;
            }
            
            // Check for badge eligibility and mint/upgrade if appropriate
            if (badgesEnabled && address(reputationBadge) != address(0)) {
                // Check for completed gigs badge
                uint256 badgeId = reputationBadge.mintBadge(
                    freelancer,
                    ReputationBadge.BadgeType.COMPLETED_GIGS,
                    freelancerCompletedGigs[freelancer]
                );
                if (badgeId > 0) {
                    emit BadgeMinted(freelancer, badgeId, uint8(ReputationBadge.BadgeType.COMPLETED_GIGS), reputationBadge.getBadgeDetails(badgeId).level);
                }
                
                // Check for earnings milestone badge
                badgeId = reputationBadge.mintBadge(
                    freelancer,
                    ReputationBadge.BadgeType.EARNINGS_MILESTONE,
                    freelancerTotalEarned[freelancer]
                );
                if (badgeId > 0) {
                    emit BadgeMinted(freelancer, badgeId, uint8(ReputationBadge.BadgeType.EARNINGS_MILESTONE), reputationBadge.getBadgeDetails(badgeId).level);
                }
                
                // Check for streak badge
                badgeId = reputationBadge.mintBadge(
                    freelancer,
                    ReputationBadge.BadgeType.STREAK,
                    freelancerMaxStreak[freelancer]
                );
                if (badgeId > 0) {
                    emit BadgeMinted(freelancer, badgeId, uint8(ReputationBadge.BadgeType.STREAK), reputationBadge.getBadgeDetails(badgeId).level);
                }
                
                // Check for dispute-free badge
                if (!freelancerHasHadDispute[freelancer]) {
                    badgeId = reputationBadge.mintBadge(
                        freelancer,
                        ReputationBadge.BadgeType.DISPUTE_FREE,
                        freelancerDisputeFreeGigs[freelancer]
                    );
                    if (badgeId > 0) {
                        emit BadgeMinted(freelancer, badgeId, uint8(ReputationBadge.BadgeType.DISPUTE_FREE), reputationBadge.getBadgeDetails(badgeId).level);
                    }
                }
            }
            
            emit FreelancerReputationUpdated(freelancer, freelancerCompletedGigs[freelancer], freelancerTotalEarned[freelancer]);
            
            // Return stake to freelancer
            if (stakeToken != address(0) && stakeAmount > 0) {
                IERC20(stakeToken).safeTransfer(freelancer, stakeAmount);
            }
        }

        // Release payment in ETH or ERC20
        if (gig.token == address(0)) {
            (bool success, ) = gig.freelancer.call{value: amount}("");
            require(success, "GigEscrow: Failed to send ETH to freelancer");
        } else {
            IERC20(gig.token).safeTransfer(gig.freelancer, amount);
        }

        emit MilestonePaymentReleased(_gigId, _milestoneIndex, gig.freelancer, amount);
    }

    function cancelGigByClient(uint _gigId)
        public
        onlyClient(_gigId)
        nonReentrant
    {
        Gig storage gig = gigs[_gigId];
        require(gig.state == State.Open || gig.state == State.InProgress, "GigEscrow: Gig cannot be cancelled in its current state");

        uint refundAmount = 0;
        if (gig.state == State.Open) {
            refundAmount = gig.totalBudget;
        } else {
            for (uint i = 0; i < gig.milestones.length; i++) {
                if (!gig.milestones[i].completed) {
                    refundAmount += gig.milestones[i].value;
                }
            }
        }

        gig.state = State.CancelledByClient;

        if (refundAmount > 0) {
            if (gig.token == address(0)) {
                (bool success, ) = gig.client.call{value: refundAmount}("");
                require(success, "GigEscrow: Failed to refund ETH to client");
            } else {
                IERC20(gig.token).safeTransfer(gig.client, refundAmount);
            }
        }

        emit GigCancelledByClient(_gigId, refundAmount);
    }

    function cancelGigByFreelancer(uint _gigId)
        public
        onlyFreelancer(_gigId)
        inState(_gigId, State.InProgress)
        nonReentrant
    {
        Gig storage gig = gigs[_gigId];

        uint refundAmount = 0;
        for (uint i = 0; i < gig.milestones.length; i++) {
            if (!gig.milestones[i].completed) {
                refundAmount += gig.milestones[i].value;
            }
        }

        gig.state = State.CancelledByFreelancer;
        
        // Reset streak on cancellation
        address freelancer = gig.freelancer;
        freelancerCurrentStreak[freelancer] = 0;

        if (refundAmount > 0) {
            if (gig.token == address(0)) {
                (bool success, ) = gig.client.call{value: refundAmount}("");
                require(success, "GigEscrow: Failed to refund ETH to client");
            } else {
                IERC20(gig.token).safeTransfer(gig.client, refundAmount);
            }
        }

        emit GigCancelledByFreelancer(_gigId, refundAmount);
    }

    function raiseDispute(uint _gigId, string memory _reason)
        public
        inState(_gigId, State.InProgress)
        nonReentrant
    {
        Gig storage gig = gigs[_gigId];
        require(_msgSender() == gig.client || _msgSender() == gig.freelancer, "GigEscrow: Only gig parties can raise dispute");
        require(!disputes[_gigId].exists, "GigEscrow: Dispute already raised");

        disputes[_gigId] = Dispute({
            raisedBy: _msgSender(),
            reason: _reason,
            exists: true,
            resolved: false,
            resolutionAuthority: arbitrator, // Initially set to arbitrator, can be updated
            resolutionData: ""
        });
        gig.state = State.Disputed; // Backend handles AI/Voting, contract awaits resolution
        
        // Mark freelancer as having had a dispute
        freelancerHasHadDispute[gig.freelancer] = true;
        // Reset streak since there is a dispute
        freelancerCurrentStreak[gig.freelancer] = 0;
        
        emit DisputeRaised(_gigId, _msgSender(), _reason);
    }

    function submitDisputeResolution(uint _gigId, bool _releaseToFreelancer, bytes memory _resolutionData)
        public
        onlyResolutionAuthority(_gigId)
        inState(_gigId, State.Disputed)
        nonReentrant
    {
        Gig storage gig = gigs[_gigId];
        Dispute storage d = disputes[_gigId];
        require(d.exists && !d.resolved, "GigEscrow: No active dispute or already resolved");

        uint remainingAmount = 0;
        for (uint i = 0; i < gig.milestones.length; i++) {
            if (!gig.milestones[i].completed) {
                remainingAmount += gig.milestones[i].value;
            }
        }

        d.resolved = true;
        d.resolutionData = _resolutionData;

        uint amountToFreelancer = 0;
        uint amountToClient = 0;

        if (_releaseToFreelancer) {
            amountToFreelancer = remainingAmount;
            gig.state = State.Completed; // Considered completed if freelancer paid
            gig.completedMilestoneCount = gig.milestones.length; // Mark all as completed
            for (uint i = 0; i < gig.milestones.length; i++) {
                 if (!gig.milestones[i].completed) { gig.milestones[i].completed = true; }
            }

            address freelancer = gig.freelancer;
            freelancerCompletedGigs[freelancer]++;
            freelancerTotalEarned[freelancer] += remainingAmount;
            emit FreelancerReputationUpdated(freelancer, freelancerCompletedGigs[freelancer], freelancerTotalEarned[freelancer]);

            if (stakeToken != address(0) && stakeAmount > 0) {
                IERC20(stakeToken).safeTransfer(freelancer, stakeAmount);
            }
        } else {
            amountToClient = remainingAmount;
            gig.state = State.CancelledByClient; // Or a new 'ResolvedAgainstFreelancer' state?
            if (stakeToken != address(0) && stakeAmount > 0) {
                IERC20(stakeToken).safeTransfer(gig.client, stakeAmount);
            }
        }

        if (amountToFreelancer > 0) {
             if (gig.token == address(0)) {
                (bool success, ) = payable(gig.freelancer).call{value: amountToFreelancer}("");
                require(success, "GigEscrow: Dispute transfer to freelancer failed");
            } else {
                IERC20(gig.token).safeTransfer(gig.freelancer, amountToFreelancer);
            }
        }
        if (amountToClient > 0) {
             if (gig.token == address(0)) {
                (bool success, ) = payable(gig.client).call{value: amountToClient}("");
                require(success, "GigEscrow: Dispute transfer to client failed");
            } else {
                IERC20(gig.token).safeTransfer(gig.client, amountToClient);
            }
        }

        emit DisputeResolutionSubmitted(_gigId, _msgSender(), _resolutionData, amountToFreelancer, amountToClient);
    }

    function getGig(uint _gigId) public view returns (Gig memory) {
        require(gigs[_gigId].exists, "GigEscrow: Gig does not exist");
        return gigs[_gigId];
    }

    function getMilestone(uint _gigId, uint _milestoneIndex) public view returns (Milestone memory) {
        require(gigs[_gigId].exists, "GigEscrow: Gig does not exist");
        require(_milestoneIndex < gigs[_gigId].milestones.length, "GigEscrow: Invalid milestone index");
        return gigs[_gigId].milestones[_milestoneIndex];
    }

    function getFreelancerCompletedGigs(address _freelancer) public view returns (uint) {
        return freelancerCompletedGigs[_freelancer];
    }

    function getFreelancerTotalEarned(address _freelancer) public view returns (uint) {
        return freelancerTotalEarned[_freelancer];
    }

    // Additional view functions for badge-related data
    function getFreelancerStreakInfo(address _freelancer) external view returns (uint256 currentStreak, uint256 maxStreak) {
        return (freelancerCurrentStreak[_freelancer], freelancerMaxStreak[_freelancer]);
    }
    
    function getFreelancerDisputeInfo(address _freelancer) external view returns (bool hasHadDispute, uint256 disputeFreeGigs) {
        return (freelancerHasHadDispute[_freelancer], freelancerDisputeFreeGigs[_freelancer]);
    }

    // Special badges can be granted by the arbitrator for exceptional achievements
    function grantSpecialBadge(address _freelancer, string memory _badgeURI) external onlyArbitrator {
        require(badgesEnabled && address(reputationBadge) != address(0), "GigEscrow: Badges not enabled");
        
        // First set the URI for the special badge
        reputationBadge.setBadgeURI(ReputationBadge.BadgeType.SPECIAL, 1, _badgeURI);
        
        // Then mint the badge
        uint256 badgeId = reputationBadge.mintBadge(
            _freelancer,
            ReputationBadge.BadgeType.SPECIAL,
            1  // Special badges all have value of 1
        );
        
        if (badgeId > 0) {
            emit BadgeMinted(_freelancer, badgeId, uint8(ReputationBadge.BadgeType.SPECIAL), 1);
        }
    }

    // Ensure you add this somewhere in your contract code to mint initiative badges when someone connects their wallet
    function connectUser(address _user) external {
        if (badgesEnabled && address(reputationBadge) != address(0)) {
            reputationBadge.mintInitiativeBadge(_user);
        }
    }

    receive() external payable {}
    fallback() external payable {}
}
