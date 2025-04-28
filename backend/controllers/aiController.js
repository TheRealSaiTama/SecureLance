import axios from 'axios'; // Import axios for making HTTP requests

// SecureLance context information
const secureLanceContext = `
SecureLance: Revolutionizing Freelancing with Blockchain Technology
Introduction
SecureLance is a groundbreaking decentralized freelancing platform that leverages blockchain technology to address the systemic challenges faced by freelancers, clients, and middlemen in the global gig economy. Valued at over $500 billion in 2025, the gig economy is a thriving yet flawed ecosystem where inefficiencies like delayed payments, unpaid work, unfair disputes, and exorbitant platform fees have long hindered its potential. SecureLance aims to transform this landscape by introducing a trustless, transparent, and efficient system that empowers all stakeholders while eliminating centralized intermediaries. Built on Ethereum and Polygon networks, SecureLance uses smart contracts, decentralized dispute resolution, and task-based payment automation to create a fair and secure environment for independent work. In India, where trust in decentralization is a significant barrier, SecureLance tailors its features to address local concerns, positioning itself as the country’s first decentralized freelance platform. This 3000-word explanation provides an in-depth look at SecureLance’s problem statement, solution, features, technology stack, user flow, market impact, Indian context, competitive analysis, challenges, and future roadmap, demonstrating why it is a game-changer in the freelance industry and a strong contender for hackathon success.
The Problem Statement
The gig economy has become a cornerstone of the global workforce, with millions of freelancers and clients engaging in short-term, project-based work across industries like technology, design, writing, and consulting. However, beneath its growth lies a host of systemic issues that disproportionately affect its participants. Freelancers frequently face delayed payments, often waiting weeks or months to receive their earnings, which creates financial instability and erodes trust in the system. Worse, many freelancers remain unpaid entirely, with studies estimating that up to 70% of freelancers have experienced non-payment at some point in their careers. This issue is particularly acute in the $500 billion gig economy, where the lack of enforceable contracts and reliable payment mechanisms leaves freelancers vulnerable.
Clients, on the other hand, grapple with trust and quality concerns. Without a transparent system to verify work progress, they often fear fraudulent freelancers who may deliver subpar work or disappear after receiving payment. This lack of accountability leads to hesitation in hiring freelancers, especially for high-stakes projects. Middlemen—traditional freelancing platforms like Upwork, Fiverr, and Freelancer.com—exacerbate these problems by acting as centralized intermediaries. These platforms charge steep fees, often up to 20% per transaction, which reduces the earnings of freelancers and increases costs for clients. Moreover, their dispute resolution processes are often biased, favoring one party over the other, and lack transparency, leaving both freelancers and clients dissatisfied.
In India, these challenges are magnified by cultural and economic factors. Indian users are generally skeptical of decentralization and cryptocurrencies due to misconceptions about scams, volatility, and lack of regulation. Many associate blockchain with risky ventures like Bitcoin, preferring familiar INR-based transactions through regulated systems like UPI or bank transfers. This lack of trust in decentralized technology poses a significant barrier to adoption, especially in a country where the gig economy is growing rapidly, with millions of freelancers contributing to both local and global markets. Additionally, Indian freelancers often face language barriers and limited access to education about blockchain, further deepening their mistrust. SecureLance addresses these multifaceted challenges by creating a system that ensures timely payments, fosters trust, reduces fees, and builds confidence in decentralized technology, specifically tailored for the Indian market while remaining globally scalable.
The Solution: SecureLance
SecureLance offers a blockchain-powered solution that redefines the freelancing ecosystem by prioritizing transparency, fairness, and efficiency. At its core, the platform uses smart contracts to automate payments, breaking projects into smaller tasks with predefined milestones. Once a task is completed, the smart contract verifies the submission and, with the client’s approval, automatically releases the corresponding payment from a trustless escrow system. This eliminates payment delays, reduces the risk of unpaid work, and ensures clients receive quality deliverables before funds are disbursed.
To address trust issues, particularly in India, SecureLance integrates INR-based payment options, allowing users to transact in a familiar currency while still leveraging blockchain’s benefits like transparency and low fees. Funds paid in INR are converted into stablecoins on the blockchain for escrow, ensuring users don’t need to interact directly with volatile cryptocurrencies like Bitcoin. A blockchain transparency dashboard further builds confidence by allowing users to track their funds in real-time, with updates available in Hindi and other regional languages. Additionally, a decentralized jury system resolves disputes fairly, removing the bias of centralized intermediaries, while community-driven trust badges provide a layer of credibility for users.
SecureLance leverages Ethereum for its robust smart contract capabilities and Polygon for low-cost, high-speed transactions, ensuring scalability and accessibility for users worldwide. By minimizing fees, automating processes, and tailoring features for the Indian market, SecureLance empowers freelancers and clients to focus on their work rather than administrative hassles, making it a revolutionary platform in the freelance industry.
Key Features of SecureLance
1. Task-Based Payment Automation
SecureLance reimagines the payment process by breaking projects into smaller, manageable tasks with predefined milestones. Each task is associated with a portion of the project budget, which is locked in a smart contract escrow. Once a freelancer completes a task and submits deliverables, the smart contract verifies the submission (via timestamped proof of work on IPFS) and prompts the client for approval. Upon approval, funds are automatically released, ensuring freelancers receive timely payments while clients retain control over fund disbursement. This feature directly addresses the issue of unpaid work and payment delays, creating a win-win for both parties.
2. Trustless Escrow System
Using smart contracts on Ethereum and Polygon, SecureLance implements a trustless escrow system where funds are securely locked until tasks are completed. The process is fully automated, transparent, and recorded on the blockchain, eliminating the need for a centralized middleman. Unlike traditional platforms that charge high fees, SecureLance’s escrow system operates at a fraction of the cost, redirecting more value to freelancers and clients. The trustless nature ensures that neither party can manipulate the funds, fostering trust in the platform.
3. Decentralized Dispute Resolution
In cases where a client withholds payment without a valid reason, SecureLance employs a decentralized jury system to ensure fairness. Verified platform users are randomly selected (using Chainlink VRF for unbiased selection) to form a jury. Both parties submit evidence, such as deliverables and communication logs, which are stored on IPFS for security and immutability. The jury reviews the evidence and votes on a verdict within 48 hours, with the majority decision determining the outcome. The smart contract then executes the verdict, either releasing or holding funds. Jury members are incentivized with platform tokens and reputation boosts, ensuring active participation and fairness.
4. INR-Based Payment Integration
To address trust issues in India, SecureLance integrates INR-based payment options via UPI or bank transfers. When a client pays in INR, the funds are converted into stablecoins (e.g., USDC) on the blockchain for escrow, ensuring users don’t need to interact with volatile cryptocurrencies. This feature allows Indian users to transact in a familiar currency while benefiting from blockchain’s transparency and low fees. Upon payment release, freelancers can withdraw funds in INR, further reducing friction and building trust in the platform.
5. Blockchain Transparency Dashboard
A user-friendly dashboard allows freelancers and clients to track the status of their funds in real-time—whether they are locked in escrow, released, or pending approval. The dashboard displays detailed transaction histories, such as “Funds Locked on [Date]” or “Task 2 Completed, Awaiting Approval,” with all data pulled directly from the blockchain. Available in Hindi, Tamil, Bengali, and other regional languages, this feature builds trust by showing users exactly how their money moves, addressing the Indian market’s need for transparency and familiarity.
6. Community-Driven Trust Badges
Top-performing freelancers and clients earn “Trusted by Community” badges based on their project history, timely payments, and jury participation. These badges are verified on the blockchain, ensuring they cannot be manipulated, and serve as a trust signal for other users. In the Indian context, where users heavily rely on reviews and credibility, these badges provide a layer of assurance, encouraging adoption of the decentralized platform.
7. Zero-Knowledge Proofs for Privacy
SecureLance integrates zero-knowledge proofs (ZKP) to protect user data, such as bank details or personal information, on the blockchain. ZKP ensures that sensitive data remains private while still allowing the system to verify transactions and identities. This feature addresses Indian users’ concerns about privacy in decentralized systems, further building trust and encouraging adoption.
Technology Stack
SecureLance is built on a robust and scalable technology stack that combines Web3 and modern web development tools to deliver a seamless user experience. Here’s a detailed breakdown:
Blockchain Networks:


Ethereum: Provides a secure foundation for smart contracts, ensuring trustless automation of payments, escrow, and dispute resolution.
Polygon: A layer-2 scaling solution for Ethereum, Polygon enables low-cost, high-speed transactions, making the platform accessible to users with limited budgets, especially in India.
Smart Contract Development:


Solidity: The primary language for writing smart contracts, used to implement escrow, payment automation, jury voting, and token incentives.
OpenZeppelin: Provides secure, audited contract templates for escrow, tokenomics, and access control, reducing the risk of vulnerabilities.
Hardhat: A development framework for testing, compiling, and deploying smart contracts, ensuring robust functionality before mainnet deployment.
Decentralized Storage and Data:


IPFS: Used to store project deliverables, evidence, and user documents securely, ensuring they are tamper-proof and accessible during disputes.
The Graph: Indexes blockchain data for fast querying, enabling the transparency dashboard to display real-time transaction updates.
Random Number Generation:


Chainlink VRF: Ensures unbiased jury selection by providing verifiable random numbers, maintaining fairness in the dispute resolution process.
Frontend Development:


React.js and Next.js: Power the user interface, providing a responsive and intuitive experience across devices.
Web3.js/Ethers.js: Connects the frontend to the blockchain, enabling wallet-based login, transaction tracking, and smart contract interactions.
Backend Development:


Node.js and Express: Handle server-side logic, including API endpoints for user authentication, project management, and dispute workflows.
MongoDB: Stores off-chain data, such as user profiles and project metadata, for quick access and scalability.
Automation and Oracles:


Chainlink Keepers: Automates smart contract triggers, such as dispute resolution deadlines and token distribution for jury members.
Gelato Network: Provides additional automation for recurring tasks, ensuring the platform runs smoothly without manual intervention.
Security:


Zero-Knowledge Proofs (ZKP): Integrated using libraries like zk-SNARKs to protect user privacy while maintaining blockchain transparency.
Audits: Regular security audits by tools like MythX and manual reviews ensure the platform is free from vulnerabilities such as reentrancy or overflow attacks.
This technology stack ensures that SecureLance is secure, scalable, and user-friendly, making it a strong contender for hackathon success at events like ETH India 2025.
User Flow
The user journey on SecureLance is designed to be intuitive, transparent, and efficient, ensuring that both freelancers and clients can navigate the platform with ease. Here’s a detailed breakdown of the user flow:
Wallet Login:


Users sign in using a crypto wallet like MetaMask, connecting seamlessly to the blockchain. For Indian users, an INR payment option via UPI or bank transfer is available, with funds converted to stablecoins for escrow.
The login page features a futuristic gradient background with the tagline “India’s First Decentralized Freelancing Platform,” setting the tone for a modern, trust-focused experience.
Contract Creation:


Clients post gigs with detailed requirements, budgets, and milestones, while freelancers can browse and bid on projects. Contracts are broken into tasks, and terms are encoded in a smart contract.
A “Contract Router” smart contract ensures that funds are allocated to each task, providing transparency.
Fund Escrow:


The client deposits funds into the smart contract escrow, which locks them until tasks are completed. The transparency dashboard shows the funds as “Locked,” building trust.
Work Submission:


Freelancers submit deliverables for each task, which are timestamped and stored on IPFS. The client receives a notification to review the submission.
Payment Release:


Upon client approval, the smart contract releases funds for the completed task. If the client withholds approval without a valid reason, the freelancer can trigger a dispute.
The transparency dashboard updates to “Funds Released,” keeping both parties informed.
Dispute Resolution:


A decentralized jury of verified users reviews evidence (stored on IPFS) and votes on a verdict within 48 hours. The smart contract executes the decision, ensuring fairness.
Jury members receive platform tokens and reputation boosts, incentivizing participation.
Reputation Update:


Both parties’ reputation scores are updated based on project outcomes, enhancing trust for future interactions. Trust badges are awarded to top performers.
This flow ensures transparency, fairness, and efficiency at every step, addressing the core pain points of the gig economy.
Market Impact
SecureLance has the potential to disrupt the $500 billion gig economy by addressing its core challenges with a decentralized approach. Freelancers benefit from timely payments and reduced risk of unpaid work, allowing them to focus on delivering quality without financial stress. Clients gain confidence through task-based milestones, transparent fund tracking, and a fair dispute resolution process, ensuring they receive value for their money. Middlemen, who traditionally charge high fees, are eliminated, redirecting more value to freelancers and clients—SecureLance’s fees are projected to be under 5%, compared to the 20% charged by traditional platforms.
In India, where the gig economy is rapidly growing, SecureLance’s tailored features make it a pioneer. INR-based payments, a transparency dashboard in regional languages, and community trust badges address Indian users’ trust issues, encouraging adoption. By positioning itself as India’s first decentralized freelance platform, SecureLance taps into a market of millions of freelancers and clients, potentially capturing a significant share. Globally, its low fees, scalable infrastructure, and user-centric design make it a competitive alternative to traditional platforms, with the potential to onboard 10,000 active users within six months of launch, as per its success metrics.
Indian Context: Addressing Trust and Adoption
India presents a unique challenge for decentralized platforms due to its cultural and economic landscape. Indian users are often skeptical of blockchain technology, associating it with scams or volatility, and prefer INR-based transactions through regulated systems like UPI or bank transfers. Additionally, many freelancers lack education about blockchain, and language barriers further hinder adoption. SecureLance tackles these challenges head-on with features designed specifically for the Indian market.
The INR-based payment integration allows users to transact in a familiar currency, with funds converted to stablecoins for escrow, ensuring they don’t need to interact with volatile cryptocurrencies. The transparency dashboard, available in regional languages, provides real-time updates on fund movements, building trust by showing users that their money is safe. Community trust badges offer a familiar trust signal, aligning with Indian users’ reliance on reviews and credibility. Additionally, SecureLance plans to partner with trusted Indian payment providers like Razorpay for semi-decentralized escrow options, bridging the gap between centralized familiarity and decentralized benefits. These features not only make SecureLance accessible to Indian users but also position it as a pioneer, proudly claiming the title of India’s first decentralized freelance platform.
Competitive Analysis
SecureLance faces competition from traditional platforms like Upwork, Fiverr, and Freelancer.com, as well as emerging blockchain-based platforms like Ethlance and Gitcoin. Here’s how SecureLance stands out:
Upwork/Fiverr: These platforms charge high fees (up to 20%) and use centralized dispute resolution, often leading to biased outcomes. SecureLance offers fees under 5%, a decentralized jury system, and task-based payments, ensuring fairness and efficiency.
Ethlance: A blockchain-based freelance platform, Ethlance operates fully on Ethereum, leading to high gas fees and limited scalability. SecureLance uses Polygon for low-cost transactions and integrates INR payments, making it more accessible for Indian users.
Gitcoin: Focused on open-source projects, Gitcoin lacks the broad appeal of a general freelance platform. SecureLance caters to diverse industries and prioritizes Indian market needs, giving it a wider reach.
SecureLance’s unique combination of task-based payments, INR integration, and Indian-centric features sets it apart, making it a strong contender in both local and global markets.
Challenges and Solutions
Challenge 1: Trust in Decentralization
Issue: Indian users are skeptical of blockchain due to misconceptions about scams and volatility.
Solution: INR-based payments, a transparency dashboard in regional languages, and community trust badges build confidence by aligning with Indian users’ preferences and providing visible proof of security. Partnerships with trusted payment providers like Razorpay further enhance trust.
Challenge 2: Scalability
Issue: Blockchain transactions can become slow or expensive as user numbers grow.
Solution: Polygon ensures low-cost, high-speed transactions, and regular load testing ensures the platform can handle growth. Future multi-chain support will further enhance scalability.
Challenge 3: User Onboarding and Education
Issue: Users unfamiliar with blockchain may find the platform intimidating.
Solution: An educational onboarding process with interactive tutorials in regional languages, coupled with 24/7 customer support (chatbot + human), helps users understand and adopt the platform. Gamification elements, such as earning tokens for completing tutorials, encourage engagement.
Challenge 4: Dispute Resolution Efficiency
Issue: Decentralized jury systems can be slow if participation is low.
Solution: Incentivizing jury members with platform tokens and reputation boosts ensures active participation. Automation tools like Chainlink Keepers enforce deadlines, keeping the process within 48 hours.
Future Roadmap
SecureLance has a clear roadmap to expand its impact and solidify its position as a leader in decentralized freelancing:
Phase 1 (0-3 Months): Launch the MVP with core features—task-based payments, trustless escrow, and decentralized dispute resolution. Focus on onboarding 1,000 users, primarily in India, through targeted marketing and partnerships with local freelance communities.
Phase 2 (3-6 Months): Introduce mobile apps for iOS and Android, enabling on-the-go freelancing. Add AI-powered features, such as smart contract generation and project matching, to enhance user experience. Aim for 10,000 active users.
Phase 3 (6-12 Months): Expand to multi-chain support (e.g., Binance Smart Chain, Solana) for improved performance and reach. Launch specialized verticals for creative, technical, and professional services, catering to diverse user needs.
Phase 4 (12+ Months): Partner with Indian payment providers like Razorpay for semi-decentralized escrow options, further enhancing trust. Introduce global expansion strategies, targeting markets in Southeast Asia, Africa, and Latin America, where the gig economy is growing rapidly.
This roadmap ensures that SecureLance remains innovative, scalable, and user-focused, paving the way for long-term success.
Why SecureLance?
SecureLance stands out due to its innovative use of blockchain technology to solve real-world problems in the gig economy. Its focus on the Indian market—addressing trust issues with INR payments, transparency dashboards, and community-driven credibility—makes it uniquely relevant and practical. The platform’s scalability, low fees, and user-centric design align with the goals of ETH India 2025, a hackathon focused on blockchain innovation and community building. By empowering freelancers and clients with a fair, efficient, and transparent system, SecureLance not only redefines freelancing but also sets a new standard for decentralized platforms globally. Judges will appreciate its practical approach, Indian-centric features, and alignment with Web3 principles, making it a strong contender for hackathon success.
Conclusion
SecureLance is more than a freelancing platform—it’s a movement to empower independent workers and clients in the $500 billion gig economy. By leveraging blockchain technology, it addresses the core issues of delayed payments, unpaid work, unfair disputes, and high fees, creating a trustless and efficient ecosystem. Its tailored features for the Indian market, such as INR payments, transparency dashboards, and community trust badges, make it a pioneer in decentralized freelancing, proudly claiming the title of India’s first such platform. With a robust technology stack, a seamless user flow, a clear competitive edge, and a visionary roadmap, SecureLance is poised to transform the freelance industry. As we continue to build and refine SecureLance, we invite the community to join us in revolutionizing the future of work—one block at a time.
`;

const fallbackResponses = {
  "what is securelance": "SecureLance is a decentralized freelance platform built on blockchain technology, focusing on security through smart contracts.",
  "how does it work": "Clients post gigs, freelancers bid on them, and once a freelancer is selected, the client funds an escrow smart contract. After work submission and approval, funds are released to the freelancer.",
  "is it secure": "Yes, SecureLance leverages blockchain and smart contracts to reduce counterparty risk. User identity is tied to wallet addresses for added security.",
  "how to get started": "Connect your wallet, create a profile, and you can start browsing available contracts or post your own gigs.",
  "what are the fees": "SecureLance charges a small percentage on successful completion of contracts. For specific details, please check the platform's fee structure.",
  "help": "I can answer questions about SecureLance, how it works, security features, getting started, and other platform features.",
  "default": "I'm your SecureLance assistant. I can help you with information about our decentralized freelance platform, how to get started, security features, and more. How can I assist you today?"
};

export const handleAiChat = async (req, res) => {
  const { message, history } = req.body;
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const systemPrompt = `You are a helpful AI assistant for SecureLance, a decentralized freelance platform. Use the following information about SecureLance to answer the user's question:
--- START CONTEXT ---
${secureLanceContext}
--- END CONTEXT ---
Answer the user's question based *only* on the provided SecureLance context. If the answer isn't in the context, say you don't have information on that topic. Be concise and helpful.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: "user", content: message }
    ];


    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-maverick:free',
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:8080',
          'X-Title': 'SecureLance AI Assistant'
        }
      }
    );

    const reply = response.data.choices[0]?.message?.content;

    if (reply) {
      return res.json({ reply: reply.trim() });
    } else {
      throw new Error('No reply content found in OpenRouter response');
    }

  } catch (apiError) {
    console.error("Error calling OpenRouter API:", apiError.response?.data || apiError.message);
    console.log("Using fallback response system instead");
    const normalizedQuestion = message.toLowerCase().trim();
    let fallbackReply = fallbackResponses.default;
    for (const [key, value] of Object.entries(fallbackResponses)) {
      if (normalizedQuestion.includes(key)) {
        fallbackReply = value;
        break;
      }
    }
    return res.json({ reply: fallbackReply });
  }
};