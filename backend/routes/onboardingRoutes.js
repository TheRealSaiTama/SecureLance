import express from 'express';
import { getOnboardingSteps } from '../controllers/onboardingController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Protected route that requires authentication
router.get('/steps', protect, getOnboardingSteps);

// Public route for testing (no authentication required)
router.get('/steps-public', getOnboardingSteps);

export default router;