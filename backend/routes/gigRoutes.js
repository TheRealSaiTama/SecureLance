import express from 'express';
const router = express.Router();
import {
    createGig,
    getGigs,
    selectFreelancer,
    completeGig,
    createCollaborativeWorkspace,
    acceptGig,
} from '../controllers/gigController.js';
import { protect } from '../controllers/authController.js';

router.get('/', getGigs);
router.post('/', protect, createGig);
router.put('/:contractGigId/select', protect, selectFreelancer);
router.put('/:contractGigId/accept', protect, acceptGig);
router.put('/:contractGigId/complete', protect, completeGig);
router.get('/:contractGigId/workspace', protect, createCollaborativeWorkspace);

export default router;
