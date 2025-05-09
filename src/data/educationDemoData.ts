export interface VideoData {
  id: string;
  title: string;
  embedUrl: string;
  description?: string;
  duration?: string; // e.g., '10:35'
}

export interface TopicData {
  id: string;
  title: string;
  description: string;
  // icon?: string; // Placeholder for an icon identifier if needed
  videos: VideoData[];
}

export const educationTopics: TopicData[] = [
  {
    id: 'web-dev-essentials',
    title: 'Web Development Essentials',
    description: 'Master the fundamentals of HTML, CSS, and JavaScript to build modern websites and web applications.',
    videos: [
      { id: 'wdv1', title: 'HTML Full Course - Build a Website Tutorial', embedUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg', duration: '4:37:52' },
      { id: 'wdv2', title: 'CSS Full Course - Includes Flexbox, Grid & Animations', embedUrl: 'https://www.youtube.com/embed/ieV606o21gU', duration: '11:44:50' },
      { id: 'wdv3', title: 'JavaScript Full Course - Beginner to Pro', embedUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg', duration: '6:53:09' },
      { id: 'wdv4', title: 'React JS Full Course for Beginners', embedUrl: 'https://www.youtube.com/embed/bMknfKXIFA8', duration: '12:13:14' },
    ],
  },
  {
    id: 'blockchain-fundamentals',
    title: 'Blockchain & Cryptocurrency Fundamentals',
    description: 'Understand the core concepts of blockchain technology, cryptocurrencies like Bitcoin, and their impact.',
    videos: [
      { id: 'bcf1', title: 'Blockchain Explained Simply', embedUrl: 'https://www.youtube.com/embed/2yJqjTiwpxM', duration: '23:29' },
      { id: 'bcf2', title: 'What is Bitcoin? (BTC)', embedUrl: 'https://www.youtube.com/embed/1LzggKOf24Y', duration: '10:01' },
      { id: 'bcf3', title: 'Smart Contracts - Simply Explained', embedUrl: 'https://www.youtube.com/embed/ZE2HxTmxfrI', duration: '18:18' },
    ],
  },
  {
    id: 'smart-contract-security',
    title: 'Smart Contract Security & Auditing',
    description: 'Learn to identify vulnerabilities and write secure smart contracts to protect digital assets.',
    videos: [
      { id: 'scs1', title: 'Top 10 Smart Contract Vulnerabilities', embedUrl: 'https://www.youtube.com/embed/m_SshD8ZPHo', duration: '34:05' },
      { id: 'scs2', title: 'Solidity Security: Common Vulnerabilities and Best Practices', embedUrl: 'https://www.youtube.com/embed/Ycr3eFR02PI', duration: '1:01:30' },
      { id: 'scs3', title: 'Smart Contract Auditing Tutorial', embedUrl: 'https://www.youtube.com/embed/Aa2kPza2j9A', duration: '47:12' },
    ],
  },
  {
    id: 'freelancing-success',
    title: 'Thriving as a Freelancer',
    description: 'Tips and strategies for finding clients, managing projects, and building a successful freelance career.',
    videos: [
      { id: 'fs1', title: 'How To Start Freelancing (Complete Guide)', embedUrl: 'https://www.youtube.com/embed/S4jhz2QfRkc', duration: '15:56' },
      { id: 'fs2', title: '7 Freelancing Mistakes I Made (So You Don\'t Have To)', embedUrl: 'https://www.youtube.com/embed/8zrp34gHzrA', duration: '12:31' },
      { id: 'fs3', title: 'How to Price Your Freelance Services', embedUrl: 'https://www.youtube.com/embed/REhA45rbycE', duration: '10:47' },
    ],
  },
  // ----- NEW TOPICS START HERE -----
  {
    id: 'react-native-dev',
    title: 'React Native Development',
    description: 'Build cross-platform mobile applications for iOS and Android using React Native.',
    videos: [
      { id: 'rnd1', title: 'React Native Full Course 2024', embedUrl: 'https://www.youtube.com/embed/AJ0QCl49wQQ', duration: '10:00:00' }, // Placeholder duration
      { id: 'rnd2', title: 'Expo Router V3 Crash Course', embedUrl: 'https://www.youtube.com/embed/sP6uUn-8v4w', duration: '1:00:00' }, // Placeholder duration
    ],
  },
  {
    id: 'vuejs-fundamentals',
    title: 'Vue.js Fundamentals',
    description: 'Learn the basics of Vue.js, a progressive JavaScript framework for building user interfaces.',
    videos: [
      { id: 'vue1', title: 'Vue.js 3 Tutorial for Beginners', embedUrl: 'https://www.youtube.com/embed/YrxBCBibVo0', duration: '2:00:00' }, // Placeholder duration
    ],
  },
   {
    id: 'angular-basics',
    title: 'Angular Basics',
    description: 'Get started with Angular, a platform for building mobile and desktop web applications.',
    videos: [
      { id: 'ang1', title: 'Angular Crash Course', embedUrl: 'https://www.youtube.com/embed/3qBXWUpoPHo', duration: '2:00:00' }, // Placeholder duration
    ],
  },
  {
    id: 'nodejs-backend',
    title: 'Node.js Backend Development',
    description: 'Build scalable and efficient server-side applications using Node.js and Express.',
    videos: [
      { id: 'node1', title: 'Node.js Full Course for Beginners', embedUrl: 'https://www.youtube.com/embed/f2EqECiTBL8', duration: '4:00:00' }, // Placeholder duration
      { id: 'node2', title: 'Express JS Crash Course', embedUrl: 'https://www.youtube.com/embed/SccSCuHhOw0', duration: '1:30:00' }, // Placeholder duration
    ],
  },
  {
    id: 'python-data-science',
    title: 'Python for Data Science',
    description: 'Learn essential Python libraries like Pandas, NumPy, and Matplotlib for data analysis and visualization.',
    videos: [
      { id: 'pyds1', title: 'Python for Data Science Course', embedUrl: 'https://www.youtube.com/embed/LHBE6Q9XlzI', duration: '6:00:00' }, // Placeholder duration
    ],
  },
  {
    id: 'machine-learning-concepts',
    title: 'Machine Learning Concepts',
    description: 'Understand the fundamental principles and algorithms of machine learning.',
    videos: [
      { id: 'mlc1', title: 'Machine Learning Basics', embedUrl: 'https://www.youtube.com/embed/ukzFI9rgwfU', duration: '10:00:00' }, // Placeholder duration
    ],
  },
  {
    id: 'ui-ux-principles',
    title: 'UI/UX Design Principles',
    description: 'Learn the core principles of user interface and user experience design for creating intuitive products.',
    videos: [
      { id: 'uiux1', title: 'UI Design Principles', embedUrl: 'https://www.youtube.com/embed/NTmh8l-Xl4c', duration: '1:00:00' }, // Placeholder duration
      { id: 'uiux2', title: 'Laws of UX - Design Principles', embedUrl: 'https://www.youtube.com/embed/fYs2Mdyasuc', duration: '30:00' }, // Placeholder duration
    ],
  },
  {
    id: 'figma-design',
    title: 'Figma for UI/UX Design',
    description: 'Master Figma, a popular collaborative interface design tool, from basics to advanced techniques.',
    videos: [
      { id: 'figma1', title: 'Figma UI Design Tutorial', embedUrl: 'https://www.youtube.com/embed/FTFaTuIK2zQ', duration: '2:00:00' }, // Placeholder duration
    ],
  },
  {
    id: 'solidity-advanced',
    title: 'Solidity Advanced Topics',
    description: 'Dive deeper into Solidity programming with advanced patterns, gas optimization, and upgradeability.',
    videos: [
      { id: 'soladv1', title: 'Advanced Solidity Concepts', embedUrl: 'https://www.youtube.com/embed/GKCZ-aG3pXg', duration: '1:00:00' }, // Placeholder duration
    ],
  },
   {
    id: 'defi-concepts',
    title: 'Decentralized Finance (DeFi) Concepts',
    description: 'Explore the world of DeFi, including lending, borrowing, DEXs, yield farming, and more.',
    videos: [
      { id: 'defi1', title: 'DeFi Explained', embedUrl: 'https://www.youtube.com/embed/qFBYB4W2tq8', duration: '30:00' }, // Placeholder duration
    ],
  },
  {
    id: 'nft-development',
    title: 'NFT Development (ERC-721)',
    description: 'Learn how to create, deploy, and manage Non-Fungible Tokens (NFTs) using the ERC-721 standard.',
    videos: [
      { id: 'nft1', title: 'Build your own NFT Collection', embedUrl: 'https://www.youtube.com/embed/UrUjsQcwwQ8', duration: '2:00:00' }, // Placeholder duration
    ],
  },
  {
    id: 'cybersecurity-basics',
    title: 'Cybersecurity Basics',
    description: 'Understand fundamental cybersecurity concepts, common threats, and best practices for protection.',
    videos: [
      { id: 'cyber1', title: 'Cybersecurity Full Course for Beginners', embedUrl: 'https://www.youtube.com/embed/U_P23SqJaDc', duration: '4:00:00' }, // Placeholder duration
    ],
  },
  {
    id: 'communication-skills',
    title: 'Effective Communication for Freelancers',
    description: 'Improve your client communication, negotiation, and presentation skills for better project outcomes.',
    videos: [
      { id: 'comm1', title: 'Communication Skills For Freelancers', embedUrl: 'https://www.youtube.com/embed/5oSaZP82Mxk', duration: '15:00' }, // Placeholder duration
    ],
  },
  {
    id: 'time-management',
    title: 'Time Management Techniques',
    description: 'Learn effective techniques like time blocking, Pomodoro, and prioritization to boost productivity.',
    videos: [
      { id: 'time1', title: 'Time Management Tips for Freelancers', embedUrl: 'https://www.youtube.com/embed/5wYZaluSnDs', duration: '10:00' }, // Placeholder duration
      { id: 'time2', title: 'How To Manage Your Time & Get More Done', embedUrl: 'https://www.youtube.com/embed/Gxdk27u9UwM', duration: '12:00' }, // Placeholder duration
    ],
  },
  {
    id: 'online-portfolio',
    title: 'Building Your Online Portfolio',
    description: 'Create a compelling online portfolio to showcase your skills and attract potential clients or employers.',
    videos: [
      { id: 'port1', title: 'How to Build a Portfolio Website', embedUrl: 'https://www.youtube.com/embed/KkOEWCR9AIQ', duration: '20:00' }, // Placeholder duration
    ],
  },
  {
    id: 'client-management',
    title: 'Client Relationship Management',
    description: 'Strategies for building strong client relationships, managing expectations, and handling difficult situations.',
    videos: [
       { id: 'crm1', title: 'Client Management Tips for Freelancers', embedUrl: 'https://www.youtube.com/embed/J9UaL4F0vWk', duration: '15:00' }, // Placeholder duration
    ],
  },
];

// Function to get topic details by ID (can be expanded later)
export const getTopicById = (id: string): TopicData | undefined => {
  return educationTopics.find(topic => topic.id === id);
};
