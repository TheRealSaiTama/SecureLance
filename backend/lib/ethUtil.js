import { ethers } from 'ethers';
import GigEscrowArtifact from '../../src/contracts/GigEscrow.json' assert { type: 'json' };

export function createGigEscrowContract(rpcUrl, privateKey, contractAddress) {
  if (!rpcUrl || !privateKey || !contractAddress) {
    throw new Error('Missing required parameters: rpcUrl, privateKey, or contractAddress');
  }
  
  console.log("Creating contract with:");
  console.log("- RPC URL:", rpcUrl);
  console.log("- Contract Address:", contractAddress);
  console.log("- Private Key (first 4 chars):", privateKey.substring(0, 6) + "...");
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, GigEscrowArtifact.abi, wallet);
}

// No default exports - will be created when actually used