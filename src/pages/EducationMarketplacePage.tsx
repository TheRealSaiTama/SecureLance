import React from 'react';
import TopicCard from '@/components/education/TopicCard';
import { educationTopics } from '@/data/educationDemoData';

const EducationMarketplacePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Level Up Your Skills
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Explore courses and resources to enhance your expertise and stay ahead.
        </p>
      </header>

      {/* Render Topic Cards from demo data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {educationTopics.map((topic) => (
          <TopicCard 
            key={topic.id} 
            id={topic.id} 
            title={topic.title} 
            description={topic.description} 
          />
        ))}
      </div>
    </div>
  );
};

export default EducationMarketplacePage; 