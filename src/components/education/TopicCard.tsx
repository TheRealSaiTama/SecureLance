import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react'; // Or any other suitable icon

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  // icon?: React.ElementType; // Optional: if you want to add icons to cards
}

const TopicCard: React.FC<TopicCardProps> = ({ id, title, description }) => {
  return (
    <Link 
      to={`/education/${id}`}
      className="block p-6 bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out group"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h2>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <p className="text-muted-foreground text-sm mb-4 h-16 overflow-hidden">
        {description}
      </p>
      <span className="text-sm font-medium text-primary group-hover:underline">
        Explore Topic
      </span>
    </Link>
  );
};

export default TopicCard; 