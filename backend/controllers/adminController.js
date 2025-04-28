import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const setUserVerifiedVoter = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
        res.status(400);
        throw new Error('Invalid value for isVerified. Must be true or false.');
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isVerifiedVoter = isVerified;
    await user.save();

    res.status(200).json({
        message: `User ${user.username || user.walletAddress} voter status set to ${isVerified}`,
        user: {
            _id: user._id,
            walletAddress: user.walletAddress,
            username: user.username,
            isVerifiedVoter: user.isVerifiedVoter,
            isAdmin: user.isAdmin,
        }
    });
});

const setUserAdminStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
        res.status(400);
        throw new Error('Invalid value for isAdmin. Must be true or false.');
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isAdmin = isAdmin;
    await user.save();

     res.status(200).json({
        message: `User ${user.username || user.walletAddress} admin status set to ${isAdmin}`,
        user: {
             _id: user._id,
            walletAddress: user.walletAddress,
            username: user.username,
            isVerifiedVoter: user.isVerifiedVoter,
            isAdmin: user.isAdmin,
        }
    });
});


export { setUserVerifiedVoter, setUserAdminStatus };