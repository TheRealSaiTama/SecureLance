import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  targetElement: string;
  order: number;
}

interface JoyrideStep {
  target: string;
  content: React.ReactNode;
  title: string;
  disableBeacon?: boolean;
}

export const useOnboarding = () => {
  const [steps, setSteps] = useState<JoyrideStep[]>([]);
  const [run, setRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchOnboardingSteps = useCallback(async () => {
    setLoading(true);
    try {
      // Use our direct endpoint that bypasses all middleware
      const response = await axios.get('/api/v1/onboarding-direct');
      
      // Transform backend steps to Joyride format
      const joyrideSteps = response.data
        .sort((a: OnboardingStep, b: OnboardingStep) => a.order - b.order)
        .map((step: OnboardingStep) => ({
          target: step.targetElement,
          content: step.description,
          title: step.title,
          disableBeacon: true
        }));
      
      setSteps(joyrideSteps);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch onboarding steps');
      console.error('Error fetching onboarding steps:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startTour = useCallback(() => {
    fetchOnboardingSteps().then(() => {
      setRun(true);
    });
  }, [fetchOnboardingSteps]);

  const stopTour = useCallback(() => {
    setRun(false);
  }, []);

  return {
    steps,
    run,
    startTour,
    stopTour,
    loading,
    error
  };
};