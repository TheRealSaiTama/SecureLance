import express from 'express';
import { protect } from '../controllers/authController.js'; // Correct: Import protect from authController
import {
  initiateDispute,
  getDisputeDetails,
  submitAISuggestion, // Keep these imports separate
  castVote,
  getDisputesForGig
} from '../controllers/disputeController.js'; // Correct: Import dispute functions from disputeController

const router = express.Router();

router.post('/gig/:gigId/initiate', protect, initiateDispute);
router.get('/gig/:gigId', protect, getDisputesForGig);
router.get('/:disputeId', protect, getDisputeDetails);

export default router;