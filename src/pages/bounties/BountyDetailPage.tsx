import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { formatEther, parseEther } from 'viem';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  Users, 
  ThumbsUp, 
  ExternalLink, 
  Send, 
  Upload, 
  Check,
  Loader2
} from 'lucide-react';
import { BountyType } from '@/components/bounty/BountyCard';

const CategoryColors: Record<string, string> = {
  BugFix: 'bg-red-100 text-red-800 border-red-200',
  Feature: 'bg-blue-100 text-blue-800 border-blue-200',
  Documentation: 'bg-green-100 text-green-800 border-green-200',
  UX: 'bg-purple-100 text-purple-800 border-purple-200',
  Other: 'bg-gray-100 text-gray-800 border-gray-200',
};

const StatusColors: Record<string, string> = {
  Open: 'bg-green-100 text-green-800 border-green-200',
  InProgress: 'bg-blue-100 text-blue-800 border-blue-200',
  Completed: 'bg-purple-100 text-purple-800 border-purple-200',
  Cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

const BountyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { toast } = useToast();
  const { token } = useAuth();
  const [bounty, setBounty] = useState<BountyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionDescription, setSubmissionDescription] = useState("");
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [fundAmount, setFundAmount] = useState("0.01");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';
  
  // Wagmi hooks for contract interactions
  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const isOwner = bounty && address?.toLowerCase() === bounty.creatorAddress.toLowerCase();
  const hasSubmitted = bounty?.submissions?.some(
    sub => address?.toLowerCase() === sub.address.toLowerCase()
  );
  const deadlineDate = bounty?.deadline ? new Date(bounty.deadline) : null;
  const isExpired = deadlineDate ? deadlineDate < new Date() : false;
  const daysLeft = deadlineDate ? Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const isNativeToken = bounty?.tokenAddress === '0x0000000000000000000000000000000000000000';

  useEffect(() => {
    if (id) {
      fetchBounty(id);
    }
  }, [id]);

  const fetchBounty = async (bountyId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/bounties/${bountyId}`);
      setBounty(response.data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch bounty',
        variant: 'destructive',
      });
      navigate('/bounties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please connect your wallet to submit work',
        variant: 'destructive',
      });
      return;
    }

    if (!submissionUrl || !submissionDescription) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide both a URL and description for your submission',
        variant: 'destructive',
      });
      return;
    }

    setSubmissionLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/bounties/${id}/submissions`,
        { submissionUrl, description: submissionDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast({
        title: 'Work Submitted Successfully',
        description: 'Your submission has been recorded',
        variant: 'default',
      });
      
      setOpenSubmitDialog(false);
      fetchBounty(id as string); // Refresh bounty data
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit work',
        variant: 'destructive',
      });
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please connect your wallet to upvote',
        variant: 'destructive',
      });
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/bounties/${id}/upvote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the bounty in state
      setBounty(prevBounty => {
        if (!prevBounty) return null;
        return { ...prevBounty, upvotes: prevBounty.upvotes + 1 };
      });
      
      toast({
        title: 'Upvoted!',
        description: 'You have successfully upvoted this bounty',
        variant: 'default',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to upvote bounty',
        variant: 'destructive',
      });
    }
  };

  // This is a placeholder for the actual contract interaction
  // In a real implementation, you would need to connect to the specific contract
  const handleFundBounty = () => {
    if (!address) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to fund this bounty',
        variant: 'destructive',
      });
      return;
    }

    // Here you would call the smart contract to fund the bounty
    toast({
      title: 'Funding',
      description: 'This is a placeholder. In a real implementation, this would open a transaction to fund the bounty.',
      variant: 'default',
    });
  };

  const handleAcceptSubmission = async (submissionId: string) => {
    if (!token || !isOwner) {
      toast({
        title: 'Not Authorized',
        description: 'Only the bounty creator can accept submissions',
        variant: 'destructive',
      });
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/bounties/${id}/submissions/${submissionId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast({
        title: 'Submission Accepted',
        description: 'The submission has been accepted and the bounty will be marked as completed',
        variant: 'default',
      });
      
      fetchBounty(id as string); // Refresh bounty data
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to accept submission',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bounty not found.</p>
          <Button onClick={() => navigate('/bounties')} className="mt-4">
            Back to Bounties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Button 
        variant="outline" 
        onClick={() => navigate('/bounties')} 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Bounties
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className={CategoryColors[bounty.category]}>
              {bounty.category}
            </Badge>
            <Badge variant="outline" className={StatusColors[bounty.status]}>
              {bounty.status}
            </Badge>
            {isExpired && bounty.status === 'Open' && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                Expired
              </Badge>
            )}
          </div>
          
          <h1 className="text-2xl font-bold">{bounty.title}</h1>
          
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <span>Posted by {truncateAddress(bounty.creatorAddress)}</span>
            <span className="mx-2">•</span>
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(bounty.createdAt).toLocaleDateString()}</span>
            {bounty.deadline && (
              <>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1" />
                {isExpired ? (
                  <span className="text-red-500">Expired</span>
                ) : (
                  <span>{daysLeft} days left</span>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-2xl font-bold text-web3-primary">
            {formatEther(BigInt(bounty.amount))} {isNativeToken ? 'ETH' : 'Token'}
          </div>
          <div className="flex items-center mt-1 space-x-3">
            {bounty.status === 'Open' && !isOwner && !hasSubmitted && (
              <Button onClick={() => setOpenSubmitDialog(true)}>
                Submit Work
              </Button>
            )}
            {bounty.status === 'Open' && (
              <Button variant="outline" onClick={handleUpvote}>
                <ThumbsUp className="h-4 w-4 mr-1" /> Upvote ({bounty.upvotes})
              </Button>
            )}
            {isOwner && bounty.status === 'Open' && (
              <Button variant="outline" onClick={handleFundBounty}>
                Fund Bounty
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p>{bounty.description}</p>
          </div>
          
          {bounty.tags && bounty.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {bounty.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-muted">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="submissions">
        <TabsList className="mb-4">
          <TabsTrigger value="submissions">
            <Users className="h-4 w-4 mr-2" /> 
            Submissions ({bounty.submissions ? bounty.submissions.length : 0})
          </TabsTrigger>
          <TabsTrigger value="details">
            Details
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="submissions">
          {bounty.submissions && bounty.submissions.length > 0 ? (
            <div className="space-y-4">
              {bounty.submissions.map((submission, index) => (
                <Card key={index} className={submission.status === 'Accepted' ? 'border-green-500/50' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">
                          Submission by {truncateAddress(submission.address)}
                        </CardTitle>
                        <CardDescription>
                          Submitted {new Date(submission.submittedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        submission.status === 'Accepted' ? 'default' :
                        submission.status === 'Rejected' ? 'destructive' : 'outline'
                      }>
                        {submission.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{submission.description}</p>
                    <div className="flex justify-between items-center">
                      <a 
                        href={submission.submissionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-sm flex items-center"
                      >
                        View Submission <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                      
                      {isOwner && bounty.status !== 'Completed' && submission.status === 'Pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleAcceptSubmission(submission._id)}
                        >
                          <Check className="h-4 w-4 mr-1" /> Accept
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No submissions yet.</p>
              {bounty.status === 'Open' && !isOwner && !hasSubmitted && (
                <Button onClick={() => setOpenSubmitDialog(true)} className="mt-4">
                  Be the First to Submit
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <Badge variant="outline" className={StatusColors[bounty.status]}>
                      {bounty.status}
                    </Badge>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Creator</dt>
                  <dd className="mt-1">{bounty.creatorAddress}</dd>
                </div>
                
                {bounty.claimerAddress && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Claimed By</dt>
                    <dd className="mt-1">{bounty.claimerAddress}</dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                  <dd className="mt-1">{bounty.category}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Reward Amount</dt>
                  <dd className="mt-1">{formatEther(BigInt(bounty.amount))} {isNativeToken ? 'ETH' : bounty.tokenAddress}</dd>
                </div>
                
                {bounty.deadline && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Deadline</dt>
                    <dd className="mt-1">
                      {new Date(bounty.deadline).toLocaleDateString()} 
                      {isExpired ? " (Expired)" : `(${daysLeft} days left)`}
                    </dd>
                  </div>
                )}
                
                {bounty.txHash && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Transaction Hash</dt>
                    <dd className="mt-1">
                      <a 
                        href={`https://etherscan.io/tx/${bounty.txHash}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary break-all"
                      >
                        {bounty.txHash}
                      </a>
                    </dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                  <dd className="mt-1">{new Date(bounty.createdAt).toLocaleString()}</dd>
                </div>
                
                {bounty.updatedAt !== bounty.createdAt && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                    <dd className="mt-1">{new Date(bounty.updatedAt).toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={openSubmitDialog} onOpenChange={setOpenSubmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Work for Bounty</DialogTitle>
            <DialogDescription>
              Provide details about your submission for this bounty.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Submission URL
              </label>
              <Input
                id="url"
                placeholder="https://github.com/yourusername/repo/pull/123"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Link to your pull request, GitHub issue, or other relevant work
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Explain your solution..."
                value={submissionDescription}
                onChange={(e) => setSubmissionDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSubmitDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitWork} 
              disabled={submissionLoading}
            >
              {submissionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BountyDetailPage;