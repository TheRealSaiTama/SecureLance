import express from 'express';
const router = express.Router();
import {
    createBounty,
    getBounties,
    getBountyById,
    fundBounty,
    submitBountyWork,
    acceptSubmission,
    upvoteBounty,
    cancelBounty,
    getBountyStats
} from '../controllers/bountyController.js';
import { protect } from '../controllers/authController.js';

// Public routes
router.get('/', getBounties);
router.get('/stats', getBountyStats);
router.get('/:id', getBountyById);

// Protected routes (require authentication)
router.post('/', protect, createBounty);
router.put('/:id/fund', protect, fundBounty);
router.post('/:id/submissions', protect, submitBountyWork);
router.put('/:id/submissions/:submissionId/accept', protect, acceptSubmission);
router.put('/:id/upvote', protect, upvoteBounty);
router.put('/:id/cancel', protect, cancelBounty);

export default router;