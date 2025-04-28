import cron from 'node-cron';
import Dispute from '../models/Dispute.js';
import { tallyVotesAndResolve } from '../controllers/disputeController.js';

const disputeResolutionJob = cron.schedule('0 * * * *', async () => {
  const now = new Date();
  const disputesToResolve = await Dispute.find({
    status: 'Voting_Period',
    votingEndsAt: { $lte: now }
  }).select('_id');
  for (const dispute of disputesToResolve) {
    tallyVotesAndResolve(dispute._id).catch(() => {});
  }
});

export default disputeResolutionJob;