import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers, formatEther } from 'ethers'; // Import formatEther directly
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star as LucideStar, Award, MessageSquare, Clock, CheckCheck, Wallet, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { BadgeDisplay } from '@/components/ui/badge-display';
import { gigEscrowABI, gigEscrowAddress, reputationBadgeABI, reputationBadgeAddress } from '@/config/contractConfig';
import { BrowserProvider, Contract } from 'ethers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

const trustScoreData = [
  { month: 'Jan', score: 78 },
  { month: 'Feb', score: 82 },
  { month: 'Mar', score: 85 },
  { month: 'Apr', score: 89 },
  { month: 'May', score: 93 },
  { month: 'Jun', score: 87 },
  { month: 'Jul', score: 92 },
  { month: 'Aug', score: 95 },
  { month: 'Sep', score: 96 },
  { month: 'Oct', score: 97 },
  { month: 'Nov', score: 98 },
  { month: 'Dec', score: 99 },
];

const badges = [
  { 
    id: '1', 
    name: 'Trusted Professional', 
    description: 'Awarded for consistently delivering high-quality work',
    icon: Award,
    color: 'bg-blue-500 text-blue-500 border-blue-300/50'
  },
  { 
    id: '2', 
    name: 'Communication Star', 
    description: 'Exceptional client communication skills',
    icon: MessageSquare,
    color: 'bg-purple-500 text-purple-500 border-purple-300/50'
  },
  { 
    id: '3', 
    name: 'Deadline Master', 
    description: 'Always completes projects on time',
    icon: Clock,
    color: 'bg-green-500 text-green-500 border-green-300/50'
  },
  { 
    id: '4', 
    name: 'Quality Expert', 
    description: 'Consistently achieves high ratings for quality',
    icon: CheckCheck,
    color: 'bg-yellow-500 text-yellow-500 border-yellow-300/50'
  },
];

const feedback = [
  { id: '1', project: 'DeFi Dashboard UI', client: 'Ethereum Labs', rating: 5, comment: 'Excellent work and communication throughout the project.', date: '2 weeks ago' },
  { id: '2', project: 'NFT Marketplace Integration', client: 'CryptoArt Inc', rating: 5, comment: 'Delivered ahead of schedule with exceptional quality.', date: '1 month ago' },
  { id: '3', project: 'Smart Contract Audit', client: 'SecureChain', rating: 4, comment: 'Very thorough analysis and clear reporting.', date: '2 months ago' },
];

const Reputation = () => {
  const { address, isConnected } = useAccount();
  const { token } = useAuth();
  const [completedGigs, setCompletedGigs] = useState(null);
  const [totalEarned, setTotalEarned] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [badgeContract, setBadgeContract] = useState(null);
  const [gigEscrowContract, setGigEscrowContract] = useState(null);

  useEffect(() => {
    // Initialize provider and contracts when address is available
    if (window.ethereum && isConnected) {
      try {
        const web3Provider = new BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        // Defensive check for gigEscrowABI
        if (!Array.isArray(gigEscrowABI) || gigEscrowABI.length === 0) {
          console.error("GigEscrow ABI is not loaded or is invalid.", gigEscrowABI);
          setError("Failed to load GigEscrow contract interface. Please refresh.");
          return; // Prevent contract instantiation with invalid ABI
        }
        const escrowContract = new Contract(
          gigEscrowAddress,
          gigEscrowABI,
          web3Provider
        );
        setGigEscrowContract(escrowContract);

        // Defensive check for reputationBadgeABI
        if (!Array.isArray(reputationBadgeABI) || reputationBadgeABI.length === 0) {
          console.error("ReputationBadge ABI is not loaded or is invalid.", reputationBadgeABI);
          setError("Failed to load Reputation Badge contract interface. Please refresh.");
          return; // Prevent contract instantiation with invalid ABI
        }
        const nftContract = new Contract(
          reputationBadgeAddress,
          reputationBadgeABI,
          web3Provider
        );
        setBadgeContract(nftContract);
        setError(null); // Clear any previous errors if successful
      } catch (e) {
        console.error("Error initializing contracts:", e);
        setError("Error setting up contracts. Please ensure your wallet is connected correctly and refresh.");
      }
    } else {
      // Clear contracts if not connected or no provider
      setProvider(null);
      setGigEscrowContract(null);
      setBadgeContract(null);
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (!isConnected || !address || !token) {
      setCompletedGigs(null);
      setTotalEarned(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/profile/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setCompletedGigs(data.completedGigs || 0);
        setTotalEarned(formatEther(data.totalEarned || '0')); // Use formatEther directly
        setError(null);
      } catch (e) {
        console.error('Error fetching reputation:', e);
        setError('Failed to fetch reputation data.');
        setCompletedGigs(null);
        setTotalEarned(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isConnected, address, token]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">My Reputation Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <TrustScoreCard 
          completedGigs={completedGigs}
          totalEarned={totalEarned}
          isLoading={isLoading}
          error={error}
          isConnected={isConnected}
        />
        <div className="col-span-3">
          <TrustScoreChart data={trustScoreData} /> 
        </div>
      </div>
      
      <Tabs defaultValue="badges" className="mb-8">
        <TabsList>
          <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          <TabsTrigger value="nftBadges">Dynamic NFT Badges</TabsTrigger>
          <TabsTrigger value="ratings">Client Feedback</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="nftBadges" className="mt-6">
          <BadgeDisplay 
            address={address}
            provider={provider}
            badgeContract={badgeContract}
            gigEscrowContract={gigEscrowContract}
          />
        </TabsContent>
        
        <TabsContent value="ratings" className="mt-6">
          <div className="space-y-6">
            {feedback.map((item) => (
              <FeedbackCard key={item.id} feedback={item} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard 
              title="On-Time Delivery" 
              value={98} 
              description="Projects delivered by the agreed deadline" 
            />
            <MetricCard 
              title="Quality Score" 
              value={96} 
              description="Based on client ratings and minimal revisions" 
            />
            <MetricCard 
              title="Communication" 
              value={94} 
              description="Responsiveness and clarity in client interactions" 
            />
            <MetricCard 
              title="Dispute Resolution" 
              value={100} 
              description="Successfully resolved without escalation" 
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TrustScoreCard = ({ completedGigs, totalEarned, isLoading, error, isConnected }) => {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Trust Score</CardTitle>
          <div className="bg-primary/20 p-2 rounded-full">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="text-center">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            ) : !isConnected ? (
              <div className="text-sm text-muted-foreground">
                Connect wallet to view your score
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <>
                <div className="text-5xl font-bold text-primary mb-1">96%</div>
                <div className="flex justify-center gap-1">
                  <RatingStar filled={true} />
                  <RatingStar filled={true} />
                  <RatingStar filled={true} />
                  <RatingStar filled={true} />
                  <RatingStar filled={true} />
                </div>
              </>
            )}
          </div>
          <div>
            <div className="text-sm font-medium mb-1 flex justify-between">
              <span>Completed Gigs</span>
              <span>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : completedGigs !== null ? completedGigs : "N/A"}</span>
            </div>
            <div className="text-sm font-medium mb-1 flex justify-between">
              <span>Total Earned</span>
              <span>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : totalEarned !== null ? `${totalEarned} ETH` : "N/A"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RatingStar = ({ filled }: { filled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "#9b87f5" : "none"}
    stroke={filled ? "#9b87f5" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const TrustScoreChart = ({ data }: { data: any[] }) => {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Trust Score Evolution</CardTitle>
        <CardDescription>Last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" tick={{ fill: '#8E9196' }} />
              <YAxis domain={[70, 100]} tick={{ fill: '#8E9196' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1F2C', 
                  borderColor: '#333',
                  color: '#fff'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#9b87f5" 
                fillOpacity={1}
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const BadgeCard = ({ badge }: { badge: any }) => {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{badge.name}</CardTitle>
          <div className={`p-2 rounded-full ${badge.color.split(' ')[0]} border ${badge.color.split(' ')[2]}`}>
            <badge.icon className={`h-5 w-5 ${badge.color.split(' ')[1]}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{badge.description}</p>
      </CardContent>
    </Card>
  );
};

const FeedbackCard = ({ feedback }: { feedback: any }) => {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-base">{feedback.project}</CardTitle>
            <CardDescription>Client: {feedback.client}</CardDescription>
          </div>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <RatingStar key={i} filled={i < feedback.rating} />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">"{feedback.comment}"</p>
        <p className="text-xs text-muted-foreground">{feedback.date}</p>
      </CardContent>
    </Card>
  );
};

const MetricCard = ({ title, value, description }: { title: string, value: number, description: string }) => {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">{value}%</span>
          </div>
          <Progress value={value} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default Reputation;
