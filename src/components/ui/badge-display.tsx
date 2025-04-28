import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, MessageSquare, Clock, CheckCheck, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ethers } from 'ethers';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface BadgeDisplayProps {
  address: string | undefined;
  provider: any;
  badgeContract: any;
  gigEscrowContract: any;
}

interface BadgeInfo {
  id: string;
  type: number;
  level: number;
  name: string;
  description: string;
  icon: any;
  color: string;
}

export const BadgeDisplay = ({ address, provider, badgeContract, gigEscrowContract }: BadgeDisplayProps) => {
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { mintInitiativeBadge } = useAuth();

  // Badge type constants must match the enum values in the ReputationBadge contract
  const BADGE_TYPES = {
    COMPLETED_GIGS: 0,
    EARNINGS_MILESTONE: 1,
    STREAK: 2,
    DISPUTE_FREE: 3,
    SPECIAL: 4,
    INITIATIVE: 5
  };

  // Helper function to get badge details
  const getBadgeDetails = (type: number, level: number): { name: string, description: string, icon: any, color: string } => {
    switch (type) {
      case BADGE_TYPES.COMPLETED_GIGS:
        return {
          name: `Completion Master ${level > 1 ? 'Level ' + level : ''}`,
          description: getBadgeLevelDescription(type, level),
          icon: Trophy,
          color: 'bg-blue-500 text-blue-500 border-blue-300/50'
        };
      case BADGE_TYPES.EARNINGS_MILESTONE:
        return {
          name: `Top Earner ${level > 1 ? 'Level ' + level : ''}`,
          description: getBadgeLevelDescription(type, level),
          icon: Wallet,
          color: 'bg-amber-500 text-amber-500 border-amber-300/50'
        };
      case BADGE_TYPES.STREAK:
        return {
          name: `Consistency King ${level > 1 ? 'Level ' + level : ''}`,
          description: getBadgeLevelDescription(type, level),
          icon: Clock,
          color: 'bg-green-500 text-green-500 border-green-300/50'
        };
      case BADGE_TYPES.DISPUTE_FREE:
        return {
          name: `Harmony Expert ${level > 1 ? 'Level ' + level : ''}`,
          description: getBadgeLevelDescription(type, level),
          icon: CheckCheck,
          color: 'bg-purple-500 text-purple-500 border-purple-300/50'
        };
      case BADGE_TYPES.SPECIAL:
        return {
          name: 'Special Achievement',
          description: 'Awarded for extraordinary contributions',
          icon: Award,
          color: 'bg-rose-500 text-rose-500 border-rose-300/50'
        };
      case BADGE_TYPES.INITIATIVE:
        return {
          name: 'Initiative Badge',
          description: 'Awarded for joining SecureLance and taking the first step',
          icon: Zap,
          color: 'bg-yellow-500 text-yellow-500 border-yellow-300/50'
        };
      default:
        return {
          name: 'Unknown Badge',
          description: 'Mystery badge',
          icon: Award,
          color: 'bg-gray-500 text-gray-500 border-gray-300/50'
        };
    }
  };

  // Helper function to get level-specific descriptions
  const getBadgeLevelDescription = (type: number, level: number): string => {
    switch (type) {
      case BADGE_TYPES.COMPLETED_GIGS:
        if (level === 1) return 'Completed 5 gigs on SecureLance';
        if (level === 2) return 'Completed 15 gigs on SecureLance';
        if (level === 3) return 'Completed 30 gigs on SecureLance';
        if (level === 4) return 'Completed 50 gigs on SecureLance';
        if (level === 5) return 'Completed 100 gigs on SecureLance - Expert level!';
        return 'Completed multiple gigs on SecureLance';
        
      case BADGE_TYPES.EARNINGS_MILESTONE:
        if (level === 1) return 'Earned 1 ETH on SecureLance';
        if (level === 2) return 'Earned 5 ETH on SecureLance';
        if (level === 3) return 'Earned 10 ETH on SecureLance';
        if (level === 4) return 'Earned 25 ETH on SecureLance';
        if (level === 5) return 'Earned 50 ETH on SecureLance - Elite earner!';
        return 'Significant earnings on SecureLance';
        
      case BADGE_TYPES.STREAK:
        if (level === 1) return 'Completed 3 gigs in a row';
        if (level === 2) return 'Completed 5 gigs in a row';
        if (level === 3) return 'Completed 10 gigs in a row';
        if (level === 4) return 'Completed 15 gigs in a row';
        if (level === 5) return 'Completed 20 gigs in a row - Incredible consistency!';
        return 'Consistent completion streak on SecureLance';
        
      case BADGE_TYPES.DISPUTE_FREE:
        if (level === 1) return 'Completed 5 gigs with no disputes';
        if (level === 2) return 'Completed 15 gigs with no disputes';
        if (level === 3) return 'Completed 25 gigs with no disputes';
        if (level === 4) return 'Completed 40 gigs with no disputes';
        if (level === 5) return 'Completed 60 gigs with no disputes - Harmony master!';
        return 'Clean record with no disputes on SecureLance';
        
      default:
        return 'Achievement on SecureLance';
    }
  };

  // Get user badges from the blockchain
  const fetchBadges = async () => {
    if (!address || !badgeContract || !provider) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Check how many NFT badges the user owns
      const balance = await badgeContract.balanceOf(address);
      
      const userBadges: BadgeInfo[] = [];
      
      // Loop through each badge owned by the user
      for (let i = 0; i < balance; i++) {
        // Get badge ID and details
        const tokenId = await badgeContract.tokenOfOwnerByIndex(address, i);
        const badgeDetails = await badgeContract.getBadgeDetails(tokenId);
        
        // Extract badge information
        const { badgeType, level } = badgeDetails;
        const badgeDetailsInfo = getBadgeDetails(badgeType, level);
        
        userBadges.push({
          id: tokenId.toString(),
          type: badgeType,
          level,
          ...badgeDetailsInfo
        });
      }
      
      setBadges(userBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of badges
  useEffect(() => {
    fetchBadges();
  }, [address, badgeContract, provider]);

  // Mint initiative badge and refresh display
  const handleGetInitiativeBadge = async () => {
    await mintInitiativeBadge();
    // Wait a bit for the transaction to be mined
    setTimeout(() => {
      fetchBadges();
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Your Dynamic NFT Badges</h3>
        <Button onClick={fetchBadges} variant="outline" size="sm">
          Refresh Badges
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : badges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <Card key={badge.id} className="bg-card transform transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{badge.name}</CardTitle>
                  <div className={`p-2 rounded-full ${badge.color.split(' ')[0]} border ${badge.color.split(' ')[2]}`}>
                    <badge.icon className={`h-5 w-5 ${badge.color.split(' ')[1]}`} />
                  </div>
                </div>
                {badge.level > 1 && (
                  <Badge variant="outline" className="mt-1 bg-primary/10">Level {badge.level}</Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
                <p className="text-xs mt-2 text-muted-foreground/70">Badge #{badge.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-card/50 rounded-lg border border-border">
          <Zap className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">No NFT badges yet</h3>
          <p className="text-muted-foreground mb-4">Get your first badge by joining SecureLance</p>
          <Button onClick={handleGetInitiativeBadge} className="glow-btn">
            Get Initiative Badge
          </Button>
        </div>
      )}
    </div>
  );
};

interface WalletIcon {
  className?: string;
}

const Wallet = ({ className }: WalletIcon) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
);