import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useOnboarding } from '@/hooks/use-onboarding';

export const OnboardingTour: React.FC = () => {
  const { steps, run, stopTour } = useOnboarding();
  
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      stopTour();
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton={false}
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#6366f1', 
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          arrowColor: '#ffffff',
        }
      }}
    />
  );
};