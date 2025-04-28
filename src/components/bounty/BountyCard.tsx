import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEther } from 'viem';
import { Calendar, ArrowUpRight, Tag, ThumbsUp, Users } from 'lucide-react';

export interface BountyType {
  _id: string;
  title: string;
  description: string;
  category: 'BugFix' | 'Feature' | 'Documentation' | 'UX' | 'Other';
  creatorAddress: string;
  amount: string;
  tokenAddress: string;
  status: 'Open' | 'InProgress' | 'Completed' | 'Cancelled';
  claimerAddress?: string;
  txHash?: string;
  contractBountyId?: string;
  deadline: string;
  upvotes: number;
  tags: string[];
  submissions: {
    _id: string;
    address: string;
    submissionUrl: string;
    description: string;
    submittedAt: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
  }[];
  createdAt: string;
  updatedAt: string;
}

interface BountyCardProps {
  bounty: BountyType;
  onView: (id: string) => void;
  onUpvote?: (id: string) => void;
  onClaim?: (id: string) => void;
  isOwner?: boolean;
}

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

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

const BountyCard: React.FC<BountyCardProps> = ({ bounty, onView, onUpvote, onClaim, isOwner = false }) => {
  const isNativeToken = bounty.tokenAddress === '0x0000000000000000000000000000000000000000';
  const deadlineDate = new Date(bounty.deadline);
  const isExpired = deadlineDate < new Date();
  const daysLeft = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  
  return (
    <Card className="overflow-hidden bg-card hover:border-primary/50 transition-all">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-2 mb-1">
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
        <CardTitle className="text-lg truncate" title={bounty.title}>
          {bounty.title}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center text-xs">
            <span>Posted by {truncateAddress(bounty.creatorAddress)}</span>
            <span className="mx-2">•</span>
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {isExpired ? (
              <span className="text-red-500">Expired</span>
            ) : (
              <span>{daysLeft} days left</span>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm line-clamp-2 mb-3">
          {bounty.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-web3-primary">
            {formatEther(BigInt(bounty.amount))} {isNativeToken ? 'ETH' : 'Token'}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {bounty.submissions && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{bounty.submissions.length}</span>
              </div>
            )}
            <div className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{bounty.upvotes}</span>
            </div>
          </div>
        </div>
        
        {bounty.tags && bounty.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {bounty.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-muted">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3">
        <div className="flex w-full justify-between">
          <Button variant="outline" size="sm" onClick={() => onView(bounty._id)}>
            View Details
          </Button>
          <div className="space-x-2">
            {bounty.status === 'Open' && onUpvote && (
              <Button variant="ghost" size="sm" onClick={() => onUpvote(bounty._id)}>
                <ThumbsUp className="h-4 w-4 mr-1" /> Upvote
              </Button>
            )}
            {bounty.status === 'Open' && onClaim && !isOwner && (
              <Button variant="default" size="sm" onClick={() => onClaim(bounty._id)}>
                <ArrowUpRight className="h-4 w-4 mr-1" /> Submit Work
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BountyCard;