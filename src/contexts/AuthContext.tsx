import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { jwtDecode } from "jwt-decode"; 
import axios from 'axios'; 
import { ethers } from 'ethers';
import { gigEscrowABI, gigEscrowAddress } from '@/config/contractConfig';

type User = {
  id: string; 
  address: string;
  username: string;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  mintInitiativeBadge: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwtToken')); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('jwtToken');
      if (storedToken) {
        try {
          const decodedToken: { id: string; exp: number } = jwtDecode(storedToken);
          if (decodedToken.exp * 1000 < Date.now()) {
            // Token expired
            localStorage.removeItem('jwtToken');
            setToken(null);
            setUser(null);
          } else {
            // Valid token, fetch user data
            try {
              const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002'}/api/v1/auth/profile`, { 
                headers: { Authorization: `Bearer ${storedToken}` } 
              });
              setUser(response.data);
              setToken(storedToken);
            } catch (error) {
              console.error('Error fetching user profile:', error);
              localStorage.removeItem('jwtToken');
              setToken(null);
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('jwtToken');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: User, newToken: string) => {
    localStorage.setItem('jwtToken', newToken);
    setToken(newToken);
    setUser(userData);
    
    // Mint initiative badge when user logs in
    mintInitiativeBadge();
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
  };

  // Function to mint initiative badge
  const mintInitiativeBadge = async () => {
    try {
      if (!window.ethereum || !user?.address) return;
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(
        gigEscrowAddress,
        gigEscrowABI,
        signer
      );

      // Call the connectUser function to grant initiative badge
      const tx = await contract.connectUser(user.address);
      await tx.wait();
      
      toast({
        title: "Welcome Badge Granted!",
        description: "You've received an Initiative badge for joining SecureLance.",
      });
    } catch (error) {
      console.error("Error minting initiative badge:", error);
      // Don't show error toast as this should be a background operation
      // User will still see their badge in the UI when it's available
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout, setUser, mintInitiativeBadge }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
