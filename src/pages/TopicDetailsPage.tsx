import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { TopicData, VideoData, getTopicById } from '@/data/educationDemoData'; // Import from demo data

// Placeholder for fetching topic details and videos
// Remove the old fetchTopicDetails function

const TopicDetailsPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (topicId) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const foundTopic = getTopicById(topicId);
        setTopic(foundTopic || null); // Set to null if not found
        setLoading(false);
      }, 300); // Short delay to simulate loading
    }
  }, [topicId]);

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Loading topic details...</div>;
  }

  if (!topic) {
    return <div className="container mx-auto p-8 text-center text-destructive">Topic not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Link to="/education" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Education Marketplace
      </Link>
      <h1 className="text-3xl font-bold mb-2 text-foreground">{topic.title}</h1>
      <p className="text-muted-foreground mb-8">{topic.description}</p>

      {topic.videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* VideoCard components will be mapped here */}
          {topic.videos.map(video => (
            <div key={video.id} className="p-4 bg-card border rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
              <div className="aspect-video bg-muted rounded-md overflow-hidden mb-2">
                 <iframe 
                    width="100%" 
                    height="100%" 
                    src={video.embedUrl}
                    title={video.title}
                    frameBorder="0" // Added frameBorder for cleaner look
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" // Updated allow attribute
                    referrerPolicy="strict-origin-when-cross-origin" // Added referrerPolicy
                    allowFullScreen
                  ></iframe>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No videos available for this topic yet.</p>
      )}
    </div>
  );
};

export default TopicDetailsPage; 