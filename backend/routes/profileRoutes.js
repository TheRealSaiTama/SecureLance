import express from 'express';
import { protect } from '../controllers/authController.js';
import {
  getUserProfile,
  updateUserProfile,
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  upload, // Ensure multer instance is imported
  getUserGigHistory
} from '../controllers/profileController.js';

const router = express.Router();

// Get logged-in user's own profile
router.get('/me', protect, getMyProfile);

// Update logged-in user's own profile
router.put('/me', protect, updateMyProfile);

// Upload profile photo for logged-in user
router.post('/me/photo', protect, upload.single('photo'), uploadProfilePhoto);

// Get gig history for logged-in user
router.get('/me/gig-history', protect, getUserGigHistory);

// Get any user's profile by wallet address (publicly accessible)
router.get('/:id', getUserProfile);

// Update any user's profile by ID (ensure this is what you want - typically admin only or should use /me for self-update)
// If this is for admin, it should have admin-specific protection.
// If it's for self-update by ID, then the controller logic needs to handle that (getMyProfile/updateMyProfile uses req.user).
// For now, keeping it as is but flagging for review.
router.put('/:id', protect, updateUserProfile); // Added protect here, consider if this is the right controller/protection

export default router;
