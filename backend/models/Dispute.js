import mongoose from 'mongoose'; // Changed require to import

const disputeSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  initiator: { type: String, required: true, lowercase: true }, // Store address
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['Open', 'Under_AI_Review', 'Voting_Period', 'Resolved', 'Cancelled'],
    default: 'Open',
  },
  aiSuggestion: {
    outcome: { type: String, enum: ['ReleasePayment', 'RefundClient', 'PartialPayment', 'Other'] },
    reasoning: String,
    confidenceScore: Number,
  },
  votingEndsAt: {
    type: Date,
  },
  votes: [{
    voter: { type: String, required: true, lowercase: true }, // Store address
    vote: { type: String, enum: ['SupportClient', 'SupportFreelancer'] },
    timestamp: { type: Date, default: Date.now },
  }],
  resolution: {
    outcome: { type: String, enum: ['PaymentReleased', 'ClientRefunded', 'PartialPaymentMade', 'NoAction'] },
    resolvedBy: { type: String, enum: ['AI', 'CommunityVote', 'Admin', 'Arbitrator'] },
    details: String,
    timestamp: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

disputeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Dispute', disputeSchema); // ES Module export