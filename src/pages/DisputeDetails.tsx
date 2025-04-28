import React, { useEffect, useState, useCallback } from 'react';
import DisputeVotePanel from '../components/dispute/DisputeVotePanel';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DisputeDetails: React.FC = () => {
  const { disputeId } = useParams<{ disputeId: string }>();
  const { user, token } = useAuth();
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  const fetchDispute = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/disputes/${disputeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch dispute');
      const data = await res.json();
      setDispute(data);
      setHasVoted(data.votes?.some((v: any) => v.voter.toLowerCase() === user?.walletAddress?.toLowerCase()));
    } catch (e: any) {
      setError(e.message || 'Error loading dispute');
    } finally {
      setLoading(false);
    }
  }, [disputeId, token, user]);

  useEffect(() => { fetchDispute(); }, [fetchDispute]);

  const handleVote = async (vote: 'SupportClient' | 'SupportFreelancer') => {
    const res = await fetch(`/api/v1/disputes/${disputeId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ vote })
    });
    if (!res.ok) throw new Error('Failed to submit vote');
    await fetchDispute();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!dispute) return <div>Dispute not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">Dispute Details</h2>
      <div className="mb-2">Reason: <span className="font-semibold">{dispute.reason}</span></div>
      <div className="mb-2">Status: <span className="font-semibold">{dispute.status}</span></div>
      {dispute.aiSuggestion && (
        <div className="mb-2 p-2 bg-gray-100 rounded">
          <div className="font-semibold">AI Suggestion:</div>
          <div>Outcome: {dispute.aiSuggestion.outcome}</div>
          <div>Reasoning: {dispute.aiSuggestion.reasoning}</div>
        </div>
      )}
      {dispute.status === 'Voting_Period' && user?.isVerifiedVoter && (
        <DisputeVotePanel
          disputeId={disputeId!}
          votingEndsAt={dispute.votingEndsAt}
          hasVoted={hasVoted}
          onVote={handleVote}
        />
      )}
      <div className="mt-4">
        <div className="font-semibold mb-1">Votes:</div>
        <ul className="list-disc ml-6">
          {dispute.votes?.map((v: any, idx: number) => (
            <li key={idx}>{v.voter}: {v.vote}</li>
          ))}
        </ul>
      </div>
      {dispute.resolution && (
        <div className="mt-4 p-2 bg-green-100 rounded">
          <div className="font-semibold">Resolution:</div>
          <div>Outcome: {dispute.resolution.outcome}</div>
          <div>Details: {dispute.resolution.details}</div>
        </div>
      )}
    </div>
  );
};

export default DisputeDetails;
