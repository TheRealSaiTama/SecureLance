import express from 'express';
const router = express.Router();
import {
    createGig,
    getGigs,
    selectFreelancer,
    completeGig,
    createCollaborativeWorkspace,
} from '../controllers/gigController.js';
import { protect } from '../controllers/authController.js';

router.get('/', getGigs);
router.post('/', createGig);
router.put('/:contractGigId/select', selectFreelancer);
router.put('/:contractGigId/complete', completeGig);
router.get('/:contractGigId/workspace', protect, createCollaborativeWorkspace);

export default router;
