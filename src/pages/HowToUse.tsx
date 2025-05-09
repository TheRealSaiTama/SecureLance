import React from 'react';

const HowToUse = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">How to Use SecureLance</h1>
      <p className="mb-4">
        Welcome to SecureLance! This page will soon feature a helpful video guide to get you started.
      </p>
      {/* Placeholder for video player */}
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <iframe 
            className="w-full h-full rounded-lg"
            src="https://www.youtube.com/embed/DodILT2pDAY" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen>
        </iframe>
      </div>
    </div>
  );
};

export default HowToUse; 