import asyncHandler from 'express-async-handler'; // Changed require to import
import Dispute from '../models/Dispute.js'; // Changed require to import, added .js
import Gig from '../models/Gig.js'; // Changed require to import, added .js
import { createGigEscrowContract } from '../lib/ethUtil.js';
import { ethers } from 'ethers';

const VOTING_PERIOD_HOURS = 48;

// Cache the contract
let gigEscrow = null;

const initiateDispute = asyncHandler(async (req, res) => {
  const { gigId: contractGigId } = req.params; // Assuming gigId passed is the contractGigId
  const { reason } = req.body;
  const userAddress = req.user.walletAddress; // Changed from req.user.address

  if (!reason) {
    res.status(400);
    throw new Error('Reason for dispute is required');
  }

  const gig = await Gig.findOne({ contractGigId });

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  if (gig.clientAddress !== userAddress && gig.freelancerAddress !== userAddress) {
      res.status(403);
      throw new Error('User not authorized to initiate dispute for this gig');
  }

  if (!['InProgress'].includes(gig.status)) { // Disputes likely only relevant when InProgress
      res.status(400);
      throw new Error(`Gig status "${gig.status}" does not allow dispute initiation.`);
  }

  const existingDispute = await Dispute.findOne({ gig: gig._id, status: { $nin: ['Resolved', 'Cancelled'] } });
  if (existingDispute) {
      res.status(400);
      throw new Error('An active dispute already exists for this gig.');
  }

  const dispute = await Dispute.create({
    gig: gig._id,
    initiator: userAddress,
    reason: reason,
    status: 'Open',
  });

  gig.status = 'Disputed'; // Update backend Gig status
  await gig.save();

  res.status(201).json(dispute);
});

const getDisputesForGig = asyncHandler(async (req, res) => {
    try {
        const { gigId: contractGigId } = req.params;
        console.log(`Fetching disputes for gig: ${contractGigId}`);
        
        const userAddress = req.user.walletAddress; // Changed from req.user.address
        console.log(`Request from user: ${userAddress}`);
        
        const gig = await Gig.findOne({ contractGigId });
        if (!gig) {
            console.log(`Gig not found for contractGigId: ${contractGigId}`);
            res.status(404);
            throw new Error('Gig not found');
        }
        console.log(`Found gig: ${gig._id} with status: ${gig.status}`);
        
        // Commenting out authorization to allow all users to see disputes for now
        // if (gig.clientAddress !== userAddress && gig.freelancerAddress !== userAddress) {
        //     res.status(403);
        //     throw new Error('User not authorized to view disputes for this gig');
        // }

        const disputes = await Dispute.find({ gig: gig._id }).populate('gig');
        console.log(`Found ${disputes.length} dispute(s) for this gig`);
        
        res.status(200).json(disputes);
    } catch (error) {
        console.error('Error in getDisputesForGig:', error);
        res.status(500).json({ 
            message: 'Failed to fetch disputes',
            error: error.message
        });
    }
});

const getDisputeDetails = asyncHandler(async (req, res) => {
  const { disputeId } = req.params;
  const userAddress = req.user.walletAddress; // Changed from req.user.address

  const dispute = await Dispute.findById(disputeId).populate({
      path: 'gig',
      select: 'clientAddress freelancerAddress contractGigId'
  });

  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  const gig = dispute.gig;
  if (gig.clientAddress !== userAddress && gig.freelancerAddress !== userAddress) {
      res.status(403);
      throw new Error('User not authorized to view this dispute');
  }

  res.status(200).json(dispute);
});

const submitAISuggestion = asyncHandler(async (req, res) => {
  const { disputeId } = req.params;
  const { outcome, reasoning, confidenceScore } = req.body;

  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
      res.status(404); throw new Error('Dispute not found');
  }

  const votingDeadline = new Date();
  votingDeadline.setHours(votingDeadline.getHours() + VOTING_PERIOD_HOURS);
  dispute.aiSuggestion = { outcome, reasoning, confidenceScore };
  dispute.status = 'Voting_Period';
  dispute.votingEndsAt = votingDeadline;
  await dispute.save();

  res.status(200).json({ message: 'AI suggestion submitted successfully', dispute });
});

const castVote = asyncHandler(async (req, res) => {
  const { disputeId } = req.params;
  const { vote } = req.body;
  const userAddress = req.user.walletAddress; // Changed from req.user.address

  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
      res.status(404); throw new Error('Dispute not found');
  }

  if (dispute.status !== 'Voting_Period' || (dispute.votingEndsAt && new Date() > dispute.votingEndsAt)) {
      res.status(400);
      const message = dispute.status !== 'Voting_Period' ? 'Voting is not active for this dispute.' : 'The voting period for this dispute has ended.';
      throw new Error(message);
  }

  if (dispute.votes.some(v => v.voter === userAddress)) { res.status(400); throw new Error('User has already voted.'); }

  dispute.votes.push({ voter: userAddress, vote: vote });
  await dispute.save();

  res.status(200).json({ message: 'Vote cast successfully' });
});

async function submitResolutionToContract(contractGigId, releaseToFreelancer, resolutionData) {
  try {
    // Initialize contract if not already created
    if (!gigEscrow) {
      const rpcUrl = process.env.RPC_URL;
      const privateKey = process.env.RESOLUTION_AUTHORITY_PRIVATE_KEY;
      const contractAddress = process.env.GIG_ESCROW_CONTRACT_ADDRESS;
      
      if (!rpcUrl || !privateKey || !contractAddress) {
        throw new Error('Missing required environment variables for contract interaction');
      }
      
      gigEscrow = createGigEscrowContract(rpcUrl, privateKey, contractAddress);
    }
    
    const tx = await gigEscrow.submitDisputeResolution(
      contractGigId,
      releaseToFreelancer,
      ethers.encodeBytes32String(resolutionData || "")
    );
    
    console.log(`Transaction submitted: ${tx.hash}`);
    await tx.wait();
    console.log(`Transaction confirmed for dispute resolution: ${tx.hash}`);
    return true;
  } catch (err) {
    console.error('Smart contract resolution failed:', err);
    return false;
  }
}

const tallyVotesAndResolve = async (disputeId) => {
    const dispute = await Dispute.findById(disputeId).populate('gig');
    if (!dispute || dispute.status !== 'Voting_Period' || !dispute.votingEndsAt || new Date() < dispute.votingEndsAt) {
        return;
    }
    let clientVotes = 0;
    let freelancerVotes = 0;
    dispute.votes.forEach(v => {
        if (v.vote === 'SupportClient') clientVotes++;
        else if (v.vote === 'SupportFreelancer') freelancerVotes++;
    });
    let finalOutcome;
    let resolvedBy = 'CommunityVote';
    let resolutionDetails = `Votes: Client (${clientVotes}), Freelancer (${freelancerVotes}).`;
    if (clientVotes > freelancerVotes) {
        finalOutcome = 'ClientRefunded';
        resolutionDetails += " Community voted to refund client.";
    } else if (freelancerVotes > clientVotes) {
        finalOutcome = 'PaymentReleased';
        resolutionDetails += " Community voted to release payment to freelancer.";
    } else {
        if (dispute.aiSuggestion && dispute.aiSuggestion.outcome) {
             resolutionDetails += " Tie broken by AI suggestion.";
             resolvedBy = 'AI';
             if (dispute.aiSuggestion.outcome === 'ReleasePayment') finalOutcome = 'PaymentReleased';
             else if (dispute.aiSuggestion.outcome === 'RefundClient') finalOutcome = 'ClientRefunded';
             else {
                 finalOutcome = 'NoAction';
                 resolvedBy = 'Admin';
                 resolutionDetails += " AI suggestion was inconclusive. Requires admin review.";
             }
        } else {
            finalOutcome = 'NoAction';
            resolvedBy = 'Admin';
            resolutionDetails += " Tie vote and no AI suggestion available. Requires admin review.";
        }
    }
    dispute.status = 'Resolved';
    dispute.resolution = {
        outcome: finalOutcome,
        resolvedBy: resolvedBy,
        details: resolutionDetails,
        timestamp: new Date(),
    };
    await dispute.save();
    if (finalOutcome === 'PaymentReleased' || finalOutcome === 'ClientRefunded') {
        const contractGigId = dispute.gig.contractGigId;
        const releaseToFreelancer = finalOutcome === 'PaymentReleased';
        await submitResolutionToContract(contractGigId, releaseToFreelancer, resolutionDetails);
    }
};

// Export all functions
export {
    initiateDispute,
    getDisputesForGig,
    getDisputeDetails,
    submitAISuggestion,
    castVote,
    tallyVotesAndResolve
};