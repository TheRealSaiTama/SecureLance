import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import BrowseContracts from "./pages/BrowseContracts";
import Dashboard from "./pages/Dashboard";
import MyContracts from "./pages/MyContracts";
import SubmitWork from "./pages/SubmitWork";
import Reputation from "./pages/Reputation";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Profile from "./pages/Profile";
import FAQ from "./pages/FAQ";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PostGig from "./pages/PostGig";
import DisputeDetails from './pages/DisputeDetails';
import HowToUse from "./pages/HowToUse";
import GigsMapPage from "./pages/GigsMapPage";
import EducationMarketplacePage from "./pages/EducationMarketplacePage";
import TopicDetailsPage from "./pages/TopicDetailsPage";
import TokenomicsPage from "./pages/TokenomicsPage";

// Import Bounty pages
import BountiesPage from "./pages/bounties/BountiesPage";
import CreateBountyPage from "./pages/bounties/CreateBountyPage";
import BountyDetailPage from "./pages/bounties/BountyDetailPage";

import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import React from "react";
import AiAssistantButton from "@/components/ai/AiAssistantButton";
import { OnboardingTour } from "./components/layout/OnboardingTour";

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/browse" element={<BrowseContracts />} />
                  <Route path="/my-contracts" element={<MyContracts />} />
                  <Route path="/submit-work" element={<SubmitWork />} />
                  <Route path="/reputation" element={<Reputation />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/post-gig" element={<PostGig />} />
                  <Route path="/disputes/:disputeId" element={<DisputeDetails />} />
                  <Route path="/how-to-use" element={<HowToUse />} />
                  <Route path="/gigs-map" element={<GigsMapPage />} />
                  <Route path="/education" element={<EducationMarketplacePage />} />
                  <Route path="/education/:topicId" element={<TopicDetailsPage />} />
                  <Route path="/tokenomics" element={<TokenomicsPage />} />
                  
                  {/* Bounty Routes */}
                  <Route path="/bounties" element={<BountiesPage />} />
                  <Route path="/bounties/create" element={<CreateBountyPage />} />
                  <Route path="/bounties/:id" element={<BountyDetailPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <AiAssistantButton />
            <OnboardingTour />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
