// Simple controller without async handler to avoid potential issues
const getOnboardingSteps = (req, res) => {
  try {
    const steps = [
      { id: 1, title: 'Welcome to SecureLance!', description: 'Let\'s get you started.', targetElement: '.dashboard-container', order: 1 },
      { id: 2, title: 'Browse Contracts', description: 'Find your first gig or post a new one.', targetElement: 'a[href="/browse"]', order: 2 },
      { id: 3, title: 'Your Profile', description: 'Complete your profile to attract more clients or freelancers.', targetElement: 'a[href="/profile"]', order: 3 },
      { id: 4, title: 'How it Works', description: 'Understand the SecureLance workflow.', targetElement: '.how-it-works-section', order: 4 },
      { id: 5, title: 'Need Help?', description: 'Use our AI Assistant for any questions.', targetElement: '.ai-chat-button', order: 5 }
    ];
    return res.status(200).json(steps);
  } catch (error) {
    console.error('Error in getOnboardingSteps:', error);
    return res.status(500).json({ message: 'Failed to fetch onboarding steps', error: error.message });
  }
};

export { getOnboardingSteps };