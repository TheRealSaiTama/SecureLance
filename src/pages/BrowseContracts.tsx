import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'; 
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { formatEther, type Log, Abi, decodeEventLog as viemDecodeEventLog, AbiEventNotFoundError } from 'viem';
import { useAccount, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { gigEscrowAddress, gigEscrowABI } from '@/config/contractConfig';
import { useNotifications } from '@/contexts/NotificationContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface Gig {
  _id: string;
  clientAddress: string;
  freelancerAddress?: string;
  description: string;
  budget: string;
  status: 'Open' | 'InProgress' | 'Completed' | 'Cancelled';
  contractGigId: string;
  escrowContractAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface GigAcceptedEventArgs {
  gigId: bigint;
  client: string;
  freelancer: string;
}

interface GigPostedEventArgs {
  gigId: bigint;
  client: string;
  description: string;
}

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const BrowseContracts: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventListenerError, setEventListenerError] = useState<string | null>(null);
  const { toast } = useToast();
  const { address: userAddress, chain } = useAccount();
  const { addNotification } = useNotifications();
  const { token } = useAuth();
  const [disputeIds, setDisputeIds] = useState<{ [gigId: string]: string }>({});
  const wagmiConfig = useConfig();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

  const fetchSingleGig = async (contractGigId: string): Promise<Gig | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/gigs`, {
        params: { contractGigId: contractGigId }
      });
      if (response.data && response.data.length > 0) {
        return response.data[0];
      } else {
        return null;
      }
    } catch (error: any) {
      toast({
        title: "Error Fetching New Gig",
        description: `Failed to fetch details for gig ${contractGigId} from backend: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchGigs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/gigs`, {
        params: { status: 'Open' }
      });
      setGigs(response.data);
    } catch (error: any) {
      toast({
        title: "Error Loading Gigs",
        description: error.response?.data?.message || error.message || "Could not fetch gigs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [API_BASE_URL]);

  const handleRefresh = () => {
    setEventListenerError(null);
    fetchGigs();
  };

  const { data: bidHash, error: bidError, isPending: isBidPending, writeContract } = useWriteContract();
  const { writeContract: writeBid } = useWriteContract();
  const { isLoading: isBidConfirming, isSuccess: isBidConfirmed } = useWaitForTransactionReceipt({ hash: bidHash });

  useEffect(() => {
    if (isBidPending) {
      toast({ title: 'Staking Bid...', description: `Waiting for your transaction...`, variant: 'default' });
    }
    if (isBidConfirmed) {
      toast({ title: 'Bid Staked!', description: 'You have staked tokens to bid on this gig.', variant: 'default' });
    }
    if (bidError) {
      toast({ title: 'Bid Failed', description: bidError.message, variant: 'destructive' });
    }
  }, [isBidPending, isBidConfirming, isBidConfirmed, bidError, toast]);

  useWatchContractEvent({
    address: gigEscrowAddress as `0x${string}`,
    abi: gigEscrowABI as Abi,
    eventName: 'GigAccepted',
    onLogs(logs: Log[]) {
      logs.forEach((log: Log) => {
        try {
          const decodedEvent = viemDecodeEventLog({ 
            abi: gigEscrowABI as Abi, 
            data: log.data,
            topics: log.topics
          });

          if (decodedEvent.eventName === 'GigAccepted') {
            const args = decodedEvent.args as Readonly<GigAcceptedEventArgs> | undefined;
            if (args && typeof args.gigId === 'bigint') {
              const contractGigId = args.gigId.toString();
              console.log('[Event] GigAccepted detected:', contractGigId);
              toast({ 
                title: "Gig Update Received", 
                description: `Gig ${contractGigId} was accepted on-chain.`,
                variant: 'default'
              });
              (async () => {
                const updatedGig = await fetchSingleGig(contractGigId);
                if (updatedGig) {
                  setGigs(prevGigs => prevGigs.map(g => g.contractGigId === contractGigId ? updatedGig : g));
                } else {
                  setGigs(prevGigs => prevGigs.filter(g => g.contractGigId !== contractGigId));
                }
              })();
            } else {
              console.warn('[Event] GigAccepted event decoded but args mismatch:', decodedEvent.args);
            }
          }
        } catch (error: any) {
          if (error instanceof AbiEventNotFoundError) {
            console.warn("ABI definition or event signature mismatch, skipping log:", log, error);
          } else {
            console.error("Error processing GigAccepted event:", error);
            setEventListenerError(`Error processing on-chain event: ${error.message}`);
          }
        }
      });
    },
    onError(error) {
      console.error("Error watching GigAccepted events:", error);
      setEventListenerError("Error listening to on-chain events. Some updates may be delayed.");
    }
  });

  useWatchContractEvent({
    address: gigEscrowAddress as `0x${string}`,
    abi: gigEscrowABI as Abi,
    eventName: 'GigPosted',
    onLogs(logs: Log[]) {
      logs.forEach((log: Log) => {
        try {
          const decodedEvent = viemDecodeEventLog({ 
            abi: gigEscrowABI as Abi, 
            data: log.data,
            topics: log.topics
          });

          if (decodedEvent.eventName === 'GigPosted') {
            const args = decodedEvent.args as Readonly<GigPostedEventArgs> | undefined;
            if (args && typeof args.gigId === 'bigint') {
              const contractGigId = args.gigId.toString();
              console.log('[Event] GigPosted detected:', contractGigId);
              toast({ 
                title: "New Gig Posted!", 
                description: `A new gig (ID: ${contractGigId}) has been posted on-chain.`,
                variant: "default"
              });
              (async () => {
                const newGig = await fetchSingleGig(contractGigId);
                if (newGig && newGig.status === 'Open') {
                  setGigs(prevGigs => [newGig, ...prevGigs.filter(g => g.contractGigId !== contractGigId)]);
                }
              })();
            } else {
               console.warn('[Event] GigPosted event decoded but args mismatch:', decodedEvent.args);
            }
          }
        } catch (error: any) {
           if (error instanceof AbiEventNotFoundError) {
            console.warn("ABI definition or event signature mismatch, skipping log:", log, error);
          } else {
            console.error("Error processing GigPosted event:", error);
            setEventListenerError(`Error processing on-chain event: ${error.message}`);
          }
        }
      });
    },
    onError(error) {
      console.error("Error watching GigPosted events:", error);
      setEventListenerError("Error listening to on-chain events. Some updates may be delayed.");
    }
  });

  const handleAcceptGig = async (gig: Gig) => {
    if (!userAddress) {
      toast({ title: "Not Connected", description: "Connect your wallet to accept gigs.", variant: "destructive" });
      return;
    }
    if (!token) {
      toast({ title: "Authentication Error", description: "You are not logged in. Please log in to accept gigs.", variant: "destructive" });
      return;
    }

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/v1/gigs/${gig.contractGigId}/accept?escrowContractAddress=${gig.escrowContractAddress}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast({ title: "Gig Accepted!", description: `You are now assigned to: ${gig.description}`, variant: "default" });
      setGigs(prev => prev.filter(g => g._id !== gig._id));
      addNotification({
        text: `You accepted gig: "${gig.description.substring(0, 30)}${gig.description.length > 30 ? '...' : ''}"`,
        type: 'gig_accepted',
        read: false,
        link: '/my-contracts'
      });
    } catch (err: any) {
      toast({
        title: "Error Accepting Gig",
        description: err.response?.data?.message || err.message || "Could not accept gig.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchDisputesForGigs = async () => {
      const ids: { [gigId: string]: string } = {};
      for (const gig_ of gigs) {
        try {
          if (gig_.contractGigId && typeof gig_.contractGigId === 'string') { 
            const res = await axios.get(`${API_BASE_URL}/api/v1/disputes/gig/${gig_.contractGigId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.data && res.data.length > 0) {
              ids[gig_._id] = res.data[0]._id;
            }
          }
        } catch (error) {
            console.error("Error fetching dispute for gig:", gig_.contractGigId, error);
        }
      }
      setDisputeIds(ids);
    };
    if (gigs.length > 0 && token) fetchDisputesForGigs();
  }, [gigs, token, API_BASE_URL]);

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading available gigs...</div>;
  }

  const validGigs = gigs.filter(gig => {
    try {
        if (!gig.contractGigId || typeof gig.contractGigId !== 'string') return false;
      const numericPart = gig.contractGigId.split('-')[0];
      BigInt(numericPart);
      return true;
    } catch {
      return false;
    }
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Gigs</h1>
      {eventListenerError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <div className="flex items-center justify-between">
            <AlertDescription>{eventListenerError}</AlertDescription>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-2 flex items-center">
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          </div>
        </Alert>
      )}
      {validGigs.length === 0 ? (
        <p className="text-center text-muted-foreground">No open gigs found at the moment. Check back later or post your own!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validGigs.map((gig) => (
            <Card key={gig._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg truncate" title={gig.description}>{gig.description}</CardTitle>
                <CardDescription>
                  Posted by: <span className="font-mono text-xs" title={gig.clientAddress}>{truncateAddress(gig.clientAddress)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div>
                  <p>Budget: <span className="font-semibold">{formatEther(BigInt(gig.budget))} ETH</span></p>
                </div>
                <div>
                  Status: <Badge variant={gig.status === 'Open' ? 'secondary' : 'default'}>{gig.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Blockchain ID: {gig.contractGigId}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {gig.status === 'Open' && userAddress && gig.clientAddress.toLowerCase() !== userAddress.toLowerCase() && (
                  <Button onClick={() => {
                    if (!userAddress || !chain) {
                        toast({title: "Wallet Error", description: "User address or chain not found.", variant: "destructive"});
                        return;
                    }
                    writeBid({
                        address: gigEscrowAddress as `0x${string}`,
                        abi: gigEscrowABI as Abi,
                        functionName: 'bidGig',
                        args: [BigInt(gig.contractGigId.split('-')[0])],
                        account: userAddress,
                        chain: chain,
                        config: wagmiConfig,
                      })
                    }
                  } disabled={isBidPending} className="w-full">
                    {isBidPending ? 'Staking...' : 'Bid on Gig'}
                  </Button>
                )}
                {gig.status === 'Open' && gig.clientAddress.toLowerCase() !== userAddress?.toLowerCase() && (
                  <Button onClick={() => handleAcceptGig(gig)} className="w-full">
                    Accept Gig
                  </Button>
                )}
                {gig.clientAddress.toLowerCase() === userAddress?.toLowerCase() && (
                  <p className="text-xs text-muted-foreground w-full text-center">This is your gig.</p>
                )}
                {disputeIds[gig._id] && (
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      window.location.href = `/disputes/${disputeIds[gig._id]}`;
                    }}
                  >
                    View Dispute
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseContracts;