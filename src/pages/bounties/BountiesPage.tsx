import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Award, Plus, Clock, Tag, Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Bounty {
  _id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  deadline: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  creator: {
    username: string;
    address: string;
  };
  upvotes: number;
  tags: string[];
  createdAt: string;
}

const BountiesPage = () => {
  const navigate = useNavigate();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<string>('newest');
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

  useEffect(() => {
    const fetchBounties = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {
          sortBy: filter
        };
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        const response = await axios.get(`${API_BASE_URL}/api/v1/bounties`, {
          params: params,
        });
        setBounties(response.data);
      } catch (error) {
        console.error('Error fetching bounties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBounties();
  }, [selectedCategory, filter, API_BASE_URL]);

  const filteredBounties = bounties.filter(bounty => {
    const matchesSearch = !searchTerm || 
                           bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           bounty.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bounty.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <Award className="mr-2 h-8 w-8 text-web3-primary" /> 
            Micro Bounties
          </h1>
          <p className="text-muted-foreground">Complete tokenized micro-tasks and earn rewards</p>
        </div>
        <Button onClick={() => navigate('/bounties/create')} className="glow-btn">
          <Plus className="mr-2 h-4 w-4" /> Create Bounty
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bounties..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="content">Content</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest-value">Highest Value</SelectItem>
              <SelectItem value="lowest-value">Lowest Value</SelectItem>
              <SelectItem value="most-popular">Most Popular</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, idx) => (
                <Card key={idx} className="border border-border/50 shadow-sm">
                  <CardHeader className="animate-pulse bg-muted h-24 rounded-t-lg"></CardHeader>
                  <CardContent className="pt-6">
                    <div className="animate-pulse bg-muted h-5 w-3/4 mb-3 rounded"></div>
                    <div className="animate-pulse bg-muted h-4 mb-2 rounded"></div>
                    <div className="animate-pulse bg-muted h-4 w-5/6 rounded"></div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-border/30 mt-4 pt-4">
                    <div className="animate-pulse bg-muted h-8 w-20 rounded"></div>
                    <div className="animate-pulse bg-muted h-8 w-24 rounded"></div>
                  </CardFooter>
                </Card>
              ))
            ) : filteredBounties.length > 0 ? (
              filteredBounties.map((bounty) => (
                <motion.div
                  key={bounty._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card 
                    className="border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md cursor-pointer transition-all" 
                    onClick={() => navigate(`/bounties/${bounty._id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge variant={
                          bounty.status === 'Open' ? 'success' : 
                          bounty.status === 'In Progress' ? 'info' : 
                          bounty.status === 'Completed' ? 'default' : 'destructive'
                        }>
                          {bounty.status}
                        </Badge>
                        <Badge variant="outline" className="font-medium">
                          {bounty.amount} MATIC
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mt-3 text-foreground">{bounty.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2 text-sm mb-4">
                        {bounty.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bounty.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" /> {tag}
                          </Badge>
                        ))}
                        {bounty.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{bounty.tags.length - 3} more</Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-border/30 pt-3">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {new Date(bounty.deadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className={
                          bounty.difficulty === 'Easy' ? 'text-green-500 border-green-200' : 
                          bounty.difficulty === 'Medium' ? 'text-yellow-500 border-yellow-200' : 
                          'text-red-500 border-red-200'
                        }>
                          {bounty.difficulty}
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="h-12 w-12 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium">No bounties found</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setFilter('newest');
                }}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="open" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!isLoading && filteredBounties
              .filter(bounty => bounty.status === 'Open')
              .map((bounty) => (
                <motion.div
                  key={bounty._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card 
                    className="border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md cursor-pointer transition-all" 
                    onClick={() => navigate(`/bounties/${bounty._id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary">Open</Badge>
                        <Badge variant="outline" className="font-medium">
                          {bounty.amount} MATIC
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mt-3 text-foreground">{bounty.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2 text-sm mb-4">
                        {bounty.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bounty.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" /> {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-border/30 pt-3">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {new Date(bounty.deadline).toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className={
                        bounty.difficulty === 'Easy' ? 'text-green-500 border-green-200' : 
                        bounty.difficulty === 'Medium' ? 'text-yellow-500 border-yellow-200' : 
                        'text-red-500 border-red-200'
                      }>
                        {bounty.difficulty}
                      </Badge>
                    </CardFooter>
                  </Card>
                </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!isLoading && filteredBounties
              .filter(bounty => bounty.status === 'In Progress')
              .map((bounty) => (
                <motion.div
                  key={bounty._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card 
                    className="border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md cursor-pointer transition-all" 
                    onClick={() => navigate(`/bounties/${bounty._id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="default">In Progress</Badge>
                        <Badge variant="outline" className="font-medium">
                          {bounty.amount} MATIC
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mt-3 text-foreground">{bounty.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2 text-sm mb-4">
                        {bounty.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bounty.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" /> {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-border/30 pt-3">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {new Date(bounty.deadline).toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className={
                        bounty.difficulty === 'Easy' ? 'text-green-500 border-green-200' : 
                        bounty.difficulty === 'Medium' ? 'text-yellow-500 border-yellow-200' : 
                        'text-red-500 border-red-200'
                      }>
                        {bounty.difficulty}
                      </Badge>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!isLoading && filteredBounties
              .filter(bounty => bounty.status === 'Completed')
              .map((bounty) => (
                <motion.div
                  key={bounty._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card 
                    className="border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md cursor-pointer transition-all" 
                    onClick={() => navigate(`/bounties/${bounty._id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge>Completed</Badge>
                        <Badge variant="outline" className="font-medium">
                          {bounty.amount} MATIC
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mt-3 text-foreground">{bounty.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2 text-sm mb-4">
                        {bounty.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bounty.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" /> {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-border/30 pt-3">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {new Date(bounty.deadline).toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className={
                        bounty.difficulty === 'Easy' ? 'text-green-500 border-green-200' : 
                        bounty.difficulty === 'Medium' ? 'text-yellow-500 border-yellow-200' : 
                        'text-red-500 border-red-200'
                      }>
                        {bounty.difficulty}
                      </Badge>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BountiesPage;