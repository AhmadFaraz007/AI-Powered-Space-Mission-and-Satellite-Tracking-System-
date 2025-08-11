import React, { useState, useEffect, useRef } from 'react';

const VideoBackground = () => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Force video to play when component mounts
    const video = videoRef.current;
    if (video) {
      video.play().catch(error => {
        console.error('Video playback failed:', error);
        setVideoError(true);
        console.log('Video error state set to true.');
      });
    }
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      {/* Static Image Fallback */}
      {(!videoLoaded || videoError) && (
        <img
          src="/videos/nasa-background.jpg"
          alt="NASA background fallback"
          className="absolute top-0 left-0 w-full h-full object-cover"
          draggable="false"
        />
      )}
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        onError={() => {setVideoError(true); console.log('Video onError triggered.');}}
        onCanPlayThrough={() => {setVideoLoaded(true); console.log('Video onCanPlayThrough triggered.');}}
      >
        <source src="/videos/nasa-background.mp4" type="video/mp4" />
      </video>

      {/* Fallback Background if video fails */}
      {videoError && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-nasa-blue via-black to-nasa-blue" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
    </div>
  );
};

export default VideoBackground; 