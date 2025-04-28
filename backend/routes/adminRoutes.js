import express from 'express';
import { protect } from '../controllers/authController.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import { setUserVerifiedVoter, setUserAdminStatus } from '../controllers/adminController.js';

const router = express.Router();

router.put('/users/:userId/verify-voter', protect, isAdmin, setUserVerifiedVoter);
router.put('/users/:userId/set-admin', protect, isAdmin, setUserAdminStatus);

export default router;