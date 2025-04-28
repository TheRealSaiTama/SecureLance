import React, { useState } from 'react';

interface DisputeVotePanelProps {
  disputeId: string;
  votingEndsAt: string;
  hasVoted: boolean;
  onVote: (vote: 'SupportClient' | 'SupportFreelancer') => Promise<void>;
}

const DisputeVotePanel: React.FC<DisputeVotePanelProps> = ({ disputeId, votingEndsAt, hasVoted, onVote }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVote = async (vote: 'SupportClient' | 'SupportFreelancer') => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await onVote(vote);
      setSuccess('Your vote has been submitted.');
    } catch (e: any) {
      setError(e.message || 'Failed to submit vote.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded p-4 mt-4">
      <div className="mb-2 text-sm text-gray-500">Voting ends at: {new Date(votingEndsAt).toLocaleString()}</div>
      {hasVoted ? (
        <div className="text-green-600">You have already voted on this dispute.</div>
      ) : (
        <div className="flex gap-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
            onClick={() => handleVote('SupportClient')}
          >
            Support Client
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={loading}
            onClick={() => handleVote('SupportFreelancer')}
          >
            Support Freelancer
          </button>
        </div>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </div>
  );
};

export default DisputeVotePanel;
