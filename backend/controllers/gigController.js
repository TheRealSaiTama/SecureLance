import Gig from '../models/Gig.js';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import crypto from 'crypto';

const GIG_POST_REWARD = 10; // Define the reward amount
const GIG_ACCEPT_REWARD = 5; // Define the reward amount for accepting

export const createGig = asyncHandler(async (req, res) => {
    const { clientAddress, description, budget, contractGigId, escrowContractAddress, location } = req.body;
    // Assuming req.user is populated by authentication middleware and contains the user ID
    const clientId = req.user?._id;

    if (!clientId) {
        res.status(401); // Unauthorized
        throw new Error('User not authenticated');
    }

    if (!clientAddress || !description || !budget || !contractGigId || !escrowContractAddress) {
        res.status(400);
        throw new Error('Please provide all required gig details');
    }

    const gig = new Gig({
        client: clientId, // Store user reference instead of just address
        clientAddress, // Keep address too for potential filtering/display
        description,
        budget, 
        contractGigId,
        escrowContractAddress,
        location,
    });

    const createdGig = await gig.save();

    if (createdGig) {
        // Award tokens to the client for posting
        try {
            const clientUser = await User.findById(clientId);
            if (clientUser) {
                clientUser.tokenBalance = (clientUser.tokenBalance || 0) + GIG_POST_REWARD;
                await clientUser.save();
                console.log(`Awarded ${GIG_POST_REWARD} SLT to user ${clientId} for posting gig ${createdGig._id}`);
            } else {
                console.error(`Could not find user ${clientId} to award tokens.`);
            }
        } catch (tokenError) {
            console.error(`Error awarding tokens for gig ${createdGig._id}:`, tokenError);
            // Don't fail the whole request, just log the token error
        }

        res.status(201).json(createdGig);
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

    if (!freelancerAddress || !escrowContractAddress || !contractGigId) {
        res.status(400);
        throw new Error('Missing required fields: freelancerAddress, escrowContractAddress, contractGigId');
    }

    const gig = await Gig.findOne({ contractGigId, escrowContractAddress });

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    // Log the fetched gig and its clientAddress field for debugging
    console.log('[selectFreelancer] Fetched gig:', JSON.stringify(gig, null, 2));
    console.log('[selectFreelancer] gig.clientAddress value:', gig.clientAddress);

    // Log the walletAddress of the user making the request for debugging
    if (req.user && req.user.walletAddress) {
        console.log('[selectFreelancer] User making request walletAddress:', req.user.walletAddress);
    } else {
        console.log('[selectFreelancer] User making request or walletAddress is undefined.');
    }

    // Check if the user making the request is the client
    const clientId = req.user?._id;
    // Defensive check for gig.clientAddress before proceeding
    if (!gig.clientAddress) {
        console.error(`[selectFreelancer] Critical: Gig with contractGigId ${contractGigId} has no clientAddress defined.`);
        res.status(500);
        throw new Error('Gig data is inconsistent: clientAddress not defined.');
    }
    
    // Check if user is the client by comparing clientAddress with user's walletAddress
    if (!req.user || !req.user.walletAddress || gig.clientAddress.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
        res.status(403);
        throw new Error('Only the client can select a freelancer for their gig.');
    }

    if (gig.status !== 'Open') {
        res.status(400);
        throw new Error(`Gig is not Open, current status: ${gig.status}`);
    }

    // Check if freelancer exists (optional but good practice)
    const freelancerUser = await User.findOne({ walletAddress: freelancerAddress.toLowerCase() });
    if (!freelancerUser) {
        console.warn(`Attempted to assign non-existent user ${freelancerAddress} as freelancer.`);
        // Depending on requirements, you might throw an error or just proceed
        // For now, let's proceed but log a warning.
    }

    gig.freelancerAddress = freelancerAddress.toLowerCase();
    gig.status = 'InProgress';
    const updatedGig = await gig.save();

    // Award tokens to the freelancer upon selection
    if (updatedGig && freelancerUser) { // Only award if user exists
        try {
            freelancerUser.tokenBalance = (freelancerUser.tokenBalance || 0) + GIG_ACCEPT_REWARD;
            await freelancerUser.save();
            console.log(`Awarded ${GIG_ACCEPT_REWARD} SLT to user ${freelancerUser._id} (${freelancerAddress}) for accepting gig ${updatedGig.contractGigId}`);
        } catch (tokenError) {
            console.error(`Error awarding tokens to freelancer for gig ${updatedGig.contractGigId}:`, tokenError);
            // Don't fail the selection, just log error
        }
    }

    res.status(200).json(updatedGig);
});

export const acceptGig = asyncHandler(async (req, res) => {
    const { contractGigId } = req.params;
    const { escrowContractAddress } = req.query;
    const freelancerAddress = req.user.walletAddress; // Authenticated freelancer

    if (!freelancerAddress || !escrowContractAddress || !contractGigId) {
        res.status(400);
        throw new Error('Missing required fields: freelancerAddress, escrowContractAddress, contractGigId');
    }

    const gig = await Gig.findOne({ contractGigId, escrowContractAddress });

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.clientAddress.toLowerCase() === freelancerAddress.toLowerCase()) {
        res.status(400);
        throw new Error('Client cannot accept their own gig as a freelancer.');
    }

    if (gig.status !== 'Open') {
        res.status(400);
        throw new Error(`Gig is not Open, current status: ${gig.status}`);
    }

    if (gig.freelancerAddress) {
        res.status(400);
        throw new Error('Gig has already been accepted by another freelancer.');
    }

    const freelancerUser = await User.findById(req.user._id);
    if (!freelancerUser) {
        // This should ideally not happen if user is authenticated via protect middleware
        console.error(`[acceptGig] Authenticated user ${req.user._id} not found in User collection.`);
        res.status(404);
        throw new Error('Freelancer user profile not found.');
    }

    gig.freelancerAddress = freelancerAddress.toLowerCase();
    gig.status = 'InProgress';
    const updatedGig = await gig.save();

    // Award tokens to the freelancer upon selection
    if (updatedGig && freelancerUser) {
        try {
            freelancerUser.tokenBalance = (freelancerUser.tokenBalance || 0) + GIG_ACCEPT_REWARD;
            await freelancerUser.save();
            console.log(`Awarded ${GIG_ACCEPT_REWARD} SLT to user ${freelancerUser._id} (${freelancerAddress}) for accepting gig ${updatedGig.contractGigId}`);
        } catch (tokenError) {
            console.error(`Error awarding tokens to freelancer for gig ${updatedGig.contractGigId}:`, tokenError);
            // Don't fail the acceptance, just log error
        }
    }

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
