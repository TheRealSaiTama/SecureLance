import mongoose from 'mongoose';

const BountySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['BugFix', 'Feature', 'Documentation', 'UX', 'Other'],
        default: 'Other'
    },
    creatorAddress: {
        type: String,
        required: true,
        lowercase: true
    },
    amount: {
        type: String, // Storing as string to handle large numbers for Wei/Gwei
        required: true
    },
    tokenAddress: {
        type: String,
        required: true,
        lowercase: true,
        default: "0x0000000000000000000000000000000000000000" // Default to native ETH
    },
    status: {
        type: String,
        enum: ['Open', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Open'
    },
    claimerAddress: {
        type: String,
        lowercase: true,
        default: null
    },
    txHash: {
        type: String,
        default: null // Transaction hash when bounty is funded
    },
    contractBountyId: {
        type: String,
        default: null // ID from smart contract if applicable
    },
    deadline: {
        type: Date,
        default: () => {
            const date = new Date();
            date.setDate(date.getDate() + 30); // Default 30 day deadline
            return date;
        }
    },
    upvotes: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        default: []
    },
    submissions: [{
        address: {
            type: String,
            required: true,
            lowercase: true
        },
        submissionUrl: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

BountySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for efficient querying
BountySchema.index({ status: 1 });
BountySchema.index({ category: 1 });
BountySchema.index({ creatorAddress: 1 });
BountySchema.index({ claimerAddress: 1 });
BountySchema.index({ tags: 1 });
BountySchema.index({ upvotes: -1 }); // For sorting by popularity

export default mongoose.model('Bounty', BountySchema);