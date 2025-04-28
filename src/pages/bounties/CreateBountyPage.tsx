import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { parseEther, isAddress } from 'viem';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(100),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }),
  category: z.enum(['BugFix', 'Feature', 'Documentation', 'UX', 'Other']),
  amount: z.string().refine(value => {
    try {
      const amount = parseFloat(value);
      return amount > 0;
    } catch {
      return false;
    }
  }, { message: 'Amount must be greater than 0' }),
  tokenAddress: z.string().optional().refine(
    value => {
      if (!value || value === '') return true;
      return isAddress(value);
    }, 
    { message: 'Invalid token address' }
  ),
  tags: z.string().optional(),
  deadline: z.date().min(new Date(), { message: 'Deadline must be in the future' }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateBountyPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Other',
      amount: '0.01',
      tokenAddress: '',
      tags: '',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  React.useEffect(() => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to create a bounty',
        variant: 'destructive',
      });
      navigate('/bounties');
    }
  }, [isConnected, navigate, toast]);

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      toast({
        title: 'Authentication required',
        description: 'Please connect your wallet and sign in to create a bounty',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse the values and prepare for API submission
      const bountyData = {
        ...values,
        // Convert amount to Wei (smallest unit)
        amount: parseEther(values.amount).toString(),
        // Parse comma-separated tags into an array
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        // Use empty string for default ETH (will be converted to zero address in backend)
        tokenAddress: values.tokenAddress || '0x0000000000000000000000000000000000000000',
      };

      // Submit to the API
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/bounties`,
        bountyData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Bounty created!',
        description: 'Your micro-bounty has been created successfully.',
        variant: 'default',
      });

      // Navigate to the bounty detail page
      navigate(`/bounties/${response.data._id}`);
    } catch (error: any) {
      toast({
        title: 'Error creating bounty',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <Button 
        variant="outline" 
        onClick={() => navigate('/bounties')} 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Bounties
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">Create a Micro-Bounty</h1>
      
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bounty Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Fix login page responsiveness" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the issue or feature in detail..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BugFix">Bug Fix</SelectItem>
                        <SelectItem value="Feature">Feature</SelectItem>
                        <SelectItem value="Documentation">Documentation</SelectItem>
                        <SelectItem value="UX">UX/Design</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward Amount (ETH)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.001" min="0.001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="tokenAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Address (Optional, leave empty for ETH)</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="frontend, ui, design" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  'Create Bounty'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreateBountyPage;