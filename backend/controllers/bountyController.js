import asyncHandler from 'express-async-handler';
import Bounty from '../models/Bounty.js';
import User from '../models/User.js';
import { ethers } from 'ethers';


export const createBounty = asyncHandler(async (req, res) => {
    const { title, description, category, amount, tokenAddress, tags, deadline } = req.body;
    const creatorAddress = req.user.walletAddress.toLowerCase();

    if (!title || !description || !amount) {
        res.status(400);
        throw new Error('Please provide title, description, and amount for the bounty');
    }

    const bounty = await Bounty.create({
        title,
        description,
        category: category || 'Other',
        creatorAddress,
        amount,
        tokenAddress: tokenAddress || "0x0000000000000000000000000000000000000000",
        tags: tags || [],
        deadline: deadline ? new Date(deadline) : undefined
    });

    if (bounty) {
        res.status(201).json(bounty);
    } else {
        res.status(400);
        throw new Error('Invalid bounty data');
    }
});

export const getBounties = asyncHandler(async (req, res) => {
    const {
        status,
        category,
        creatorAddress,
        claimerAddress,
        tag,
        sortBy = 'createdAt'
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (creatorAddress) filter.creatorAddress = creatorAddress.toLowerCase();
    if (claimerAddress) filter.claimerAddress = claimerAddress.toLowerCase();
    if (tag) filter.tags = tag;

    let sortOptions = {};
    if (sortBy === 'upvotes') {
        sortOptions = { upvotes: -1, createdAt: -1 };
    } else if (sortBy === 'amount') {
        sortOptions = { amount: -1, createdAt: -1 };
    } else if (sortBy === 'deadline') {
        sortOptions = { deadline: 1, createdAt: -1 };
    } else {
        sortOptions = { createdAt: -1 };
    }

    const bounties = await Bounty.find(filter)
        .sort(sortOptions)
        .limit(req.query.limit ? parseInt(req.query.limit) : 100);

    res.status(200).json(bounties);
});


export const getBountyById = asyncHandler(async (req, res) => {
    const bounty = await Bounty.findById(req.params.id);

    if (bounty) {
        res.status(200).json(bounty);
    } else {
        res.status(404);
        throw new Error('Bounty not found');
    }
});


export const fundBounty = asyncHandler(async (req, res) => {
    const { txHash, contractBountyId } = req.body;
    const userAddress = req.user.walletAddress.toLowerCase();
    
    const bounty = await Bounty.findById(req.params.id);

    if (!bounty) {
        res.status(404);
        throw new Error('Bounty not found');
    }

    if (bounty.creatorAddress !== userAddress) {
        res.status(403);
        throw new Error('You can only fund bounties you created');
    }

    bounty.txHash = txHash;
    if (contractBountyId) {
        bounty.contractBountyId = contractBountyId;
    }
    
    const updatedBounty = await bounty.save();
    res.status(200).json(updatedBounty);
});

export const submitBountyWork = asyncHandler(async (req, res) => {
    const { submissionUrl, description } = req.body;
    const userAddress = req.user.walletAddress.toLowerCase();

    if (!submissionUrl || !description) {
        res.status(400);
        throw new Error('Please provide a submission URL and description');
    }

    const bounty = await Bounty.findById(req.params.id);

    if (!bounty) {
        res.status(404);
        throw new Error('Bounty not found');
    }

    if (bounty.status !== 'Open') {
        res.status(400);
        throw new Error(`Bounty is not open for submissions, current status: ${bounty.status}`);
    }

    const existingSubmission = bounty.submissions.find(
        submission => submission.address === userAddress
    );

    if (existingSubmission) {
        res.status(400);
        throw new Error('You have already submitted work for this bounty');
    }

    bounty.submissions.push({
        address: userAddress,
        submissionUrl,
        description,
        submittedAt: Date.now(),
        status: 'Pending'
    });

    if (bounty.status === 'Open') {
        bounty.status = 'InProgress';
    }

    const updatedBounty = await bounty.save();
    res.status(201).json(updatedBounty);
});

export const acceptSubmission = asyncHandler(async (req, res) => {
    const { txHash } = req.body;
    const userAddress = req.user.walletAddress.toLowerCase();
    
    const bounty = await Bounty.findById(req.params.id);

    if (!bounty) {
        res.status(404);
        throw new Error('Bounty not found');
    }

    if (bounty.creatorAddress !== userAddress) {
        res.status(403);
        throw new Error('Only the bounty creator can accept submissions');
    }

    const submissionIndex = bounty.submissions.findIndex(
        submission => submission._id.toString() === req.params.submissionId
    );

    if (submissionIndex === -1) {
        res.status(404);
        throw new Error('Submission not found');
    }

    bounty.submissions[submissionIndex].status = 'Accepted';
    
    bounty.status = 'Completed';
    bounty.claimerAddress = bounty.submissions[submissionIndex].address;
    
    if (txHash) {
        bounty.payoutTxHash = txHash;
    }

    const updatedBounty = await bounty.save();

    try {
        const claimer = await User.findOne({ walletAddress: bounty.claimerAddress });
        if (claimer) {
        }
    } catch (error) {
        console.error('Error updating user stats:', error);
    }

    res.status(200).json(updatedBounty);
});


export const upvoteBounty = asyncHandler(async (req, res) => {
    const userAddress = req.user.walletAddress.toLowerCase();
    
    const bounty = await Bounty.findById(req.params.id);

    if (!bounty) {
        res.status(404);
        throw new Error('Bounty not found');
    }

    bounty.upvotes = bounty.upvotes + 1;
    
    const updatedBounty = await bounty.save();
    res.status(200).json(updatedBounty);
});


export const cancelBounty = asyncHandler(async (req, res) => {
    const userAddress = req.user.walletAddress.toLowerCase();
    
    const bounty = await Bounty.findById(req.params.id);

    if (!bounty) {
        res.status(404);
        throw new Error('Bounty not found');
    }

    if (bounty.creatorAddress !== userAddress) {
        res.status(403);
        throw new Error('Only the bounty creator can cancel it');
    }


    if (bounty.submissions.length > 0) {
        res.status(400);
        throw new Error('Cannot cancel a bounty with active submissions');
    }

    bounty.status = 'Cancelled';
    
    const updatedBounty = await bounty.save();
    res.status(200).json(updatedBounty);
});

export const getBountyStats = asyncHandler(async (req, res) => {
    const totalBounties = await Bounty.countDocuments({});
    const openBounties = await Bounty.countDocuments({ status: 'Open' });
    const inProgressBounties = await Bounty.countDocuments({ status: 'InProgress' });
    const completedBounties = await Bounty.countDocuments({ status: 'Completed' });
    
    const totalValueQuery = await Bounty.aggregate([
        { $match: { status: { $in: ['Open', 'InProgress'] } } },
        { $group: { _id: null, totalValue: { $sum: { $toDouble: "$amount" } } } }
    ]);
    
    const totalValue = totalValueQuery.length > 0 ? totalValueQuery[0].totalValue : 0;
    
    const categoryCounts = await Bounty.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
        totalBounties,
        openBounties,
        inProgressBounties,
        completedBounties,
        totalValue,
        categoryCounts
    });
});