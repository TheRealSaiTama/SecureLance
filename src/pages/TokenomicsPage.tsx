import React from 'react';
import { Coins, Zap, Users, HelpCircle } from 'lucide-react';

const TokenomicsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            SecureLance Token (SLT)
          </span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Powering the SecureLance Ecosystem: Rewards, Governance, and Utility.
        </p>
      </header>

      <section className="mb-12 space-y-8">
        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-3 flex items-center">
            <Coins className="w-6 h-6 mr-3 text-primary" />
            What is SLT?
          </h2>
          <p className="text-muted-foreground">
            SecureLance Token (SLT) is the native utility token of the SecureLance platform. It's designed to incentivize participation, reward contributions, and eventually enable community governance.
          </p>
          <p className="mt-4 text-muted-foreground">
            Think of it as the fuel that drives the SecureLance economy, rewarding users who actively contribute to the platform's success and growth.
          </p>
           <p className="mt-4 text-sm text-muted-foreground italic">
            (Note: The token functionality is currently simulated within the platform's database and not yet deployed as a live cryptocurrency on a blockchain.)
          </p>
        </div>

        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-3 flex items-center">
            <Zap className="w-6 h-6 mr-3 text-primary" />
            How to Earn SLT?
          </h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>
              <strong>Post a Gig:</strong> Clients receive <span className="font-semibold text-foreground">10 SLT</span> (simulated) for successfully posting a new gig on the platform.
            </li>
            <li>
              <strong>Accept a Gig:</strong> Freelancers receive <span className="font-semibold text-foreground">5 SLT</span> (simulated) when they are selected by a client for a gig.
            </li>
            <li>
              <strong>Future Rewards:</strong> We plan to introduce more ways to earn SLT, such as completing milestones, participating in dispute resolution, referring new users, and engaging with educational content.
            </li>
          </ul>
        </div>

        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-3 flex items-center">
            <Users className="w-6 h-6 mr-3 text-primary" />
            Future Utility & Governance
          </h2>
          <p className="text-muted-foreground">
            As SecureLance evolves, SLT is envisioned to play a key role in:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 text-muted-foreground">
            <li>
              <strong>Platform Governance:</strong> Token holders may be able to vote on platform upgrades, feature proposals, and parameter changes.
            </li>
            <li>
              <strong>Premium Features:</strong> Access to exclusive features, enhanced visibility, or reduced platform fees.
            </li>
            <li>
              <strong>Staking Rewards:</strong> Potential opportunities to stake SLT for additional rewards.
            </li>
            <li>
              <strong>Dispute Resolution Staking:</strong> Potential use in the dispute resolution mechanism (details TBD).
            </li>
          </ul>
        </div>
         <div className="p-6 bg-secondary/20 border border-dashed rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-3 flex items-center">
            <HelpCircle className="w-6 h-6 mr-3 text-secondary-foreground" />
            Important Note
          </h2>
          <p className="text-secondary-foreground">
           SLT is currently an **off-chain, simulated token** used for internal rewards tracking. It does not have real-world monetary value and cannot be traded on external exchanges at this time. Our long-term vision includes migrating to a live, on-chain token, but this requires significant development and auditing.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TokenomicsPage; 