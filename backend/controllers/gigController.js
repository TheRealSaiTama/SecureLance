import Gig from '../models/Gig.js';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import crypto from 'crypto';

export const createGig = asyncHandler(async (req, res) => {
    const { clientAddress, description, budget, contractGigId, escrowContractAddress } = req.body;

    if (!clientAddress || !description || !budget || !contractGigId || !escrowContractAddress) {
        res.status(400);
        throw new Error('Please provide all required gig fields');
    }

    const gigExists = await Gig.findOne({ contractGigId, escrowContractAddress });

    if (gigExists) {
        res.status(400);
        throw new Error('Gig metadata already exists for this contract gig');
    }

    const gig = await Gig.create({
        clientAddress,
        description,
        budget, 
        contractGigId,
        escrowContractAddress,
    });

    if (gig) {
        res.status(201).json(gig);
    } else {
        res.status(400);
        throw new Error('Invalid gig data');
    }
});

export const getGigs = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) {
        filter.status = req.query.status;
    }
    if (req.query.clientAddress) {
        filter.clientAddress = { $regex: new RegExp(`^${req.query.clientAddress}$`, 'i') }; 
    }
    if (req.query.freelancerAddress) {
        filter.freelancerAddress = { $regex: new RegExp(`^${req.query.freelancerAddress}$`, 'i') };
    }
    if (req.query.contractGigId) {
        filter.contractGigId = req.query.contractGigId;
        if (req.query.escrowContractAddress) {
            filter.escrowContractAddress = { $regex: new RegExp(`^${req.query.escrowContractAddress}$`, 'i') };
        }
    }

    console.log(`[getGigs Request] Query: ${JSON.stringify(req.query)}`);
    console.log(`[getGigs Request] Constructed Filter: ${JSON.stringify(filter)}`);

    try {
        // Handle fetching a single gig by contractGigId
        if (filter.contractGigId && Object.keys(filter).length === 1) {
            const gig = await Gig.findOne(filter);
            if (gig) {
                console.log('[getGigs Response] Found single gig by contractGigId:', JSON.stringify(gig));
                res.status(200).json([gig]); // Return as array for consistency
            } else {
                console.log('[getGigs Response] Single gig not found with filter:', JSON.stringify(filter));
                res.status(404).json([]);
            }
        // Handle fetching potentially multiple gigs with other filters
        } else {
            const gigs = await Gig.find(filter).sort({ createdAt: -1 });
            console.log(`[getGigs Response] Found ${gigs.length} gigs matching filter: ${JSON.stringify(filter)}`);
            res.status(200).json(gigs);
        }
    } catch (error) {
        console.error("[getGigs Error] Error fetching gigs:", error);
        res.status(500).json({ message: "Error fetching gigs", error: error.message });
    }
});

export const selectFreelancer = asyncHandler(async (req, res) => {
    const { freelancerAddress } = req.body;
    const { contractGigId } = req.params;
    const { escrowContractAddress } = req.query; 

    if (!freelancerAddress || !escrowContractAddress) {
        res.status(400);
        throw new Error('Freelancer address and escrow contract address are required');
    }

    const gig = await Gig.findOne({ contractGigId, escrowContractAddress });

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.status !== 'Open') {
        res.status(400);
        throw new Error(`Gig is not Open, current status: ${gig.status}`);
    }

    gig.freelancerAddress = freelancerAddress.toLowerCase();
    gig.status = 'InProgress';
    const updatedGig = await gig.save();

    res.status(200).json(updatedGig);
});

export const completeGig = asyncHandler(async (req, res) => {
    const { contractGigId } = req.params;
    const { escrowContractAddress } = req.query; 

     if (!escrowContractAddress) {
        res.status(400);
        throw new Error('Escrow contract address is required');
    }

    const gig = await Gig.findOne({ contractGigId, escrowContractAddress });

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.status !== 'InProgress') {
         res.status(400);
        throw new Error(`Gig cannot be completed, current status: ${gig.status}`);
    }

    if (gig.freelancerAddress) {
        try {
            const freelancer = await User.findOne({ walletAddress: gig.freelancerAddress.toLowerCase() }); 
            if (freelancer) {
                freelancer.completedGigs = (freelancer.completedGigs || 0) + 1;
                const currentEarned = BigInt(freelancer.totalEarned || '0');
                const gigBudget = BigInt(gig.budget || '0');
                freelancer.totalEarned = (currentEarned + gigBudget).toString();
                await freelancer.save();
                console.log(`[completeGig] Updated reputation for freelancer: ${gig.freelancerAddress}`);
            } else {
                 console.warn(`[completeGig] Freelancer user not found for address: ${gig.freelancerAddress}`);
            }
        } catch (error) {
            console.error(`[completeGig] Error updating freelancer reputation: ${error.message}`);
        }
    } else {
         console.warn(`[completeGig] Gig ${contractGigId} has no freelancer address, cannot update reputation.`);
    }

    gig.status = 'Completed';
    const updatedGig = await gig.save();

    res.status(200).json(updatedGig);
});

export const createCollaborativeWorkspace = asyncHandler(async (req, res) => {
    const { contractGigId } = req.params;
    const { escrowContractAddress } = req.query;
    const userAddress = req.user.walletAddress.toLowerCase();

    if (!escrowContractAddress) {
        res.status(400);
        throw new Error('Escrow contract address is required');
    }

    // Find the gig
    const gig = await Gig.findOne({ contractGigId, escrowContractAddress });

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    // Verify that the user is either the client or the freelancer
    if (gig.clientAddress.toLowerCase() !== userAddress && 
        (!gig.freelancerAddress || gig.freelancerAddress.toLowerCase() !== userAddress)) {
        res.status(403);
        throw new Error('Only the client or assigned freelancer can access the collaborative workspace');
    }

    // Only allow collaboration for InProgress gigs
    if (gig.status !== 'InProgress') {
        res.status(400);
        throw new Error('Collaborative workspace is only available for active contracts');
    }

    // If workspace URL doesn't exist yet, create one
    if (!gig.collaborativeWorkspaceUrl) {
        // Generate a unique workspace ID based on the contract ID
        const workspaceId = crypto.createHash('sha256')
            .update(`${gig.contractGigId}-${Date.now()}`)
            .digest('hex')
            .substring(0, 12);
            
        // Use Etherpad as an example, but this could be any collaborative tool API
        // In a real implementation, you might want to use an actual API call to create the pad
        const etherpadBaseUrl = process.env.ETHERPAD_BASE_URL || 'https://etherpad.wikimedia.org/p/';
        gig.collaborativeWorkspaceUrl = `${etherpadBaseUrl}securelance-${workspaceId}`;
        
        await gig.save();
        console.log(`[createCollaborativeWorkspace] Created workspace for gig: ${gig.contractGigId}`);
    }

    res.status(200).json({ 
        collaborativeWorkspaceUrl: gig.collaborativeWorkspaceUrl,
        contractGigId: gig.contractGigId,
        message: 'Collaborative workspace accessed successfully'
    });
});
