import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import BountyCard, { BountyType } from './BountyCard';
import { useAuth } from '@/contexts/AuthContext';

const BountyList: React.FC = () => {
  const [bounties, setBounties] = useState<BountyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { address } = useAccount();
  const { toast } = useToast();
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

  useEffect(() => {
    fetchBounties();
  }, [filterStatus, filterCategory, sortBy]);

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filterStatus !== 'all') {
        queryParams.append('status', filterStatus);
      }
      
      if (filterCategory !== 'all') {
        queryParams.append('category', filterCategory);
      }
      
      if (sortBy) {
        queryParams.append('sortBy', sortBy);
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/bounties?${queryParams.toString()}`);
      setBounties(response.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch bounties');
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch bounties',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id: string) => {
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please connect your wallet to upvote bounties',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/bounties/${id}/upvote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the bounty in state
      setBounties(prevBounties => 
        prevBounties.map(bounty => 
          bounty._id === id ? { ...bounty, upvotes: bounty.upvotes + 1 } : bounty
        )
      );
      
      toast({
        title: 'Upvoted!',
        description: 'You have successfully upvoted this bounty.',
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

  const filteredBounties = bounties.filter(bounty => {
    return bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           bounty.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (bounty.tags && bounty.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
  });

  const userBounties = filteredBounties.filter(bounty => 
    address && bounty.creatorAddress.toLowerCase() === address.toLowerCase()
  );

  const participatingBounties = filteredBounties.filter(bounty => 
    address && bounty.submissions && bounty.submissions.some(sub => 
      sub.address.toLowerCase() === address?.toLowerCase()
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bounties by title, description, or tags..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="BugFix">Bug Fix</SelectItem>
              <SelectItem value="Feature">Feature</SelectItem>
              <SelectItem value="Documentation">Documentation</SelectItem>
              <SelectItem value="UX">UX</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="InProgress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest First</SelectItem>
              <SelectItem value="upvotes">Most Popular</SelectItem>
              <SelectItem value="amount">Highest Value</SelectItem>
              <SelectItem value="deadline">Deadline Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Bounties</TabsTrigger>
          {address && <TabsTrigger value="yours">Your Bounties</TabsTrigger>}
          {address && <TabsTrigger value="participating">Participating</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="all" className="py-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBounties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBounties.map((bounty) => (
                <BountyCard 
                  key={bounty._id}
                  bounty={bounty}
                  onView={(id) => navigate(`/bounties/${id}`)}
                  onUpvote={handleUpvote}
                  onClaim={(id) => navigate(`/bounties/${id}/submit`)}
                  isOwner={address ? bounty.creatorAddress.toLowerCase() === address.toLowerCase() : false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bounties found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
        
        {address && (
          <TabsContent value="yours" className="py-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userBounties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBounties.map((bounty) => (
                  <BountyCard 
                    key={bounty._id}
                    bounty={bounty}
                    onView={(id) => navigate(`/bounties/${id}`)}
                    isOwner={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't created any bounties yet.</p>
              </div>
            )}
          </TabsContent>
        )}
        
        {address && (
          <TabsContent value="participating" className="py-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : participatingBounties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {participatingBounties.map((bounty) => (
                  <BountyCard 
                    key={bounty._id}
                    bounty={bounty}
                    onView={(id) => navigate(`/bounties/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">You haven't submitted work to any bounties yet.</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default BountyList;