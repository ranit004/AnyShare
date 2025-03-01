import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import FeatureCard from "@/components/feature-card";
import { Github, Twitter } from "lucide-react";

// Fixed dark blue theme (no theme changing)
// Fixed dark blue theme (no theme changing)
const THEME = {
  darkBlue: "#0a192f",
  deeperBlue: "#061429",
  accentBlue: "#1e90ff",
};

const features = [
  {
    title: "Secure Sharing",
    description: "Advanced encryption ensures your files remain private and secure.",
    icon: "shield",
    iconColor: "#ffffff"
  },
  {
    title: "Lightning Fast",
    description: "Upload and share files instantly with optimized chunk transfer.",
    icon: "zap",
    iconColor: "#ffffff"
  },
  {
    title: "Reliable Storage",
    description: "Your files are safely stored with redundant backups.",
    icon: "lock",
    iconColor: "#ffffff"
  },
];

const steps = [
  {
    title: "Upload File",
    description: "Drag & drop or select your file to begin.",
  },
  {
    title: "Get Share Link",
    description: "Receive an instant secure sharing link.",
  },
  {
    title: "Share Securely",
    description: "Share the link with anyone you choose.",
  },
];

// Optimized Topographic SVG background - cached and used sparingly
const TopographicBackground = React.memo(({ opacity = 0.15 }) => (
  <div 
    className="absolute inset-0 z-0 overflow-hidden pointer-events-none" 
    style={{ opacity }}
  >
    <svg
      viewBox="0 0 1000 1000"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="topo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={THEME.accentBlue} stopOpacity="0.4" />
          <stop offset="50%" stopColor={THEME.deeperBlue} stopOpacity="0.2" />
          <stop offset="100%" stopColor={THEME.accentBlue} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g stroke="url(#topo-gradient)" fill="none" strokeWidth="0.5">
        {/* Reduced number of paths */}
        {[100, 200, 300, 400, 500].map((y, i) => (
          <path 
            key={`topo-${i}`} 
            d={`M0,${y} Q250,${y+100} 500,${y} Q750,${y-50} 1000,${y}`}
          />
        ))}
        {/* Reduced number of circles */}
        <circle cx="250" cy="250" r="75" />
        <circle cx="750" cy="550" r="75" />
      </g>
    </svg>
  </div>
));

// Simple Logo component without excessive animations
const Logo = React.memo(({ className = "", onClick = () => {} }) => (
  <div 
    className={`cursor-pointer text-white text-lg font-bold ${className}`}
    onClick={onClick}
  >
    <span style={{ color: THEME.accentBlue }}>Any</span>Share
  </div>
));

export default function Home() {
  const ref = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Reduce scroll measurement frequency
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Simplified transforms with fewer interpolation points
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.7]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a192f]">
      {/* Navigation Bar - simplified */}
      <nav className="flex items-center justify-between p-4 z-20 sticky top-0 backdrop-blur-md bg-[#0a192f]/80">
        <div className="flex items-center space-x-6">
          <a 
            href="https://github.com/ranit004" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors"
          >
            <Github size={24} />
          </a>
          <a 
            href="https://x.com/Ranit_bro" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors"
          >
            <Twitter size={24} />
          </a>
        </div>
        
        <Logo onClick={handleLogoClick} />
        
        <div className="w-10"></div>
      </nav>

      <div ref={ref} className="flex-1 relative">
        {/* Only render background once page is loaded */}
        {isLoaded && (
          <TopographicBackground opacity={0.1} />
        )}
        
        {/* Hero Section - simplified animations */}
        <div className="relative z-10 flex items-center justify-center min-h-[85vh] p-4">
          {isLoaded && (
            <motion.div 
              className="absolute inset-0 -z-10"
              style={{ 
                y: backgroundY,
                opacity: backgroundOpacity,
              }}
              initial={false}
            >
              {/* Simplified gradient backgrounds */}
              <div className="absolute inset-0 bg-[#0a192f] opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f]/80 to-[#061429]/60" />
            </motion.div>
          )}

          <div className="w-full max-w-2xl">
            {/* Card with white plain border */}
            <Card className="backdrop-blur-md bg-white/10 border-white border-2 shadow-lg">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-5xl font-bold text-white">
                    <span style={{ color: THEME.accentBlue }}>Any</span>Share
                  </h1>
                  <p className="text-blue-100/80">
                    Share files up to 10GB Securely
                  </p>
                </div>
                
                {/* File upload component */}
                <FileUpload />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section - simplified animations */}
        <div className="py-12 px-4 bg-[#0a192f]/70 bg-gradient-to-b from-[#0a192f]/90 to-[#0f2d5a]/80 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">
              Why Choose <span style={{ color: THEME.accentBlue }}>AnyShare</span>?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div key={feature.title}>
                  <FeatureCard {...feature} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section - simplified animations */}
        <div className="py-12 px-4 bg-gradient-to-b from-[#0f2d5a]/80 to-[#0a192f]/95 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">
              How It <span style={{ color: THEME.accentBlue }}>Works</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="flex items-start space-x-4 hover:translate-x-1 transition-transform">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-xl font-bold text-[#1e90ff]">{index + 1}</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-blue-100">{step.title}</h3>
                      <p className="text-sm text-blue-100/70">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - simplified */}
        <footer className="py-6 px-4 bg-[#061429]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <Logo onClick={handleLogoClick} className="mb-4 md:mb-0" />
            <div className="text-blue-100/60 text-sm">
              © {new Date().getFullYear()} AnyShare. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}