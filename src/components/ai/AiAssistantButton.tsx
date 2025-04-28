import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import AiChatInterface from "./AiChatInterface"; // We'll create this next

const AiAssistantButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: window.innerHeight - 96 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load saved position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('aiButtonPosition');
    if (savedPosition) {
      try {
        const parsedPosition = JSON.parse(savedPosition);
        setPosition(parsedPosition);
      } catch (e) {
        // Fallback to default if parsing fails
        console.error('Failed to parse saved AI button position', e);
      }
    }
  }, []);

  // Save position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('aiButtonPosition', JSON.stringify(position));
  }, [position]);

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  // Handle mouse move while dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const maxX = window.innerWidth - 64;
    const maxY = window.innerHeight - 64;
    
    // Calculate new position
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
    
    // Keep button within window bounds
    newX = Math.max(0, Math.min(maxX, newX));
    newY = Math.max(0, Math.min(maxY, newY));
    
    setPosition({ x: newX, y: newY });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove global event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Handle window resize to keep button in bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 64),
        y: Math.min(prev.y, window.innerHeight - 64)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outline"
        size="icon"
        className="fixed rounded-full w-16 h-16 shadow-lg z-[9999] bg-gradient-to-br from-web3-primary to-web3-secondary text-white hover:scale-110 transition-transform duration-200 ease-in-out glow-btn-ai cursor-move"
        onClick={() => !isDragging && setIsChatOpen(true)}
        onMouseDown={handleMouseDown}
        aria-label="Open AI Assistant"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        <MessageSquarePlus className="h-8 w-8" />
      </Button>
      <AiChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
      <style>
        {`
          .glow-btn-ai {
            box-shadow: 0 0 15px 3px rgba(155, 135, 245, 0.6), 0 0 5px 1px rgba(155, 135, 245, 0.4);
          }
          .glow-btn-ai:hover {
            box-shadow: 0 0 25px 5px rgba(155, 135, 245, 0.8), 0 0 10px 2px rgba(155, 135, 245, 0.6);
          }
        `}
      </style>
    </>
  );
};

export default AiAssistantButton;
