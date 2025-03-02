import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import FeatureCard from "@/components/feature-card";
import { Github, Twitter, ArrowRight } from "lucide-react";

// Enhanced color theme
const THEME = {
  darkBlue: "#0a192f",
  deeperBlue: "#061429",
  accentBlue: "#3b82f6", // Brighter blue for better contrast
  neonPurple: "#8b5cf6",
  neonPink: "#ec4899",
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

// 3D Background using CSS and DOM elements (no Three.js dependency)
const EnhancedBackground = React.memo(() => {
  useEffect(() => {
    // Create 3D space effect
    const createSpace = () => {
      const spaceElement = document.querySelector('.space-background');
      if (!spaceElement) return;
      
      // Clear existing elements
      spaceElement.innerHTML = '';
      
      // Create stars (small dots)
      for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random size between 1px and 3px
        const size = Math.random() * 2 + 1;
        
        // Random position in 3D space
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const posZ = Math.random() * 500 - 250;
        
        // Random opacity between 0.3 and 0.8
        const opacity = Math.random() * 0.5 + 0.3;
        
        // Random color from theme
        const colors = [THEME.accentBlue, THEME.neonPurple, THEME.neonPink, '#ffffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Set styles
        Object.assign(star.style, {
          width: `${size}px`,
          height: `${size}px`,
          left: `${posX}%`,
          top: `${posY}%`,
          opacity: opacity,
          backgroundColor: color,
          transform: `translateZ(${posZ}px)`,
          boxShadow: `0 0 ${Math.random() * 5 + 5}px ${color}`,
          animationDuration: `${Math.random() * 20 + 10}s`,
          animationDelay: `${Math.random() * -10}s`
        });
        
        spaceElement.appendChild(star);
      }
      
      // Create floating orbs
      for (let i = 0; i < 12; i++) {
        const orb = document.createElement('div');
        orb.className = 'orb';
        
        // Random size between 50px and 150px
        const size = Math.random() * 100 + 50;
        
        // Random position in 3D space
        const posX = Math.random() * 120 - 10;
        const posY = Math.random() * 120 - 10;
        const posZ = Math.random() * 300 - 150;
        
        // Random opacity between 0.05 and 0.15
        const opacity = Math.random() * 0.1 + 0.05;
        
        // Random color from theme
        const colors = [THEME.accentBlue, THEME.neonPurple, THEME.neonPink];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Set styles
        Object.assign(orb.style, {
          width: `${size}px`,
          height: `${size}px`,
          left: `${posX}%`,
          top: `${posY}%`,
          opacity: opacity,
          backgroundColor: color,
          transform: `translateZ(${posZ}px)`,
          filter: `blur(${Math.random() * 30 + 20}px)`,
          animationDuration: `${Math.random() * 100 + 50}s`,
          animationDelay: `${Math.random() * -25}s`
        });
        
        spaceElement.appendChild(orb);
      }
      
      // Create grid lines
      const createGridLine = (isHorizontal) => {
        const count = isHorizontal ? 10 : 10;
        const spacing = 100 / (count - 1);
        
        for (let i = 0; i < count; i++) {
          const line = document.createElement('div');
          line.className = 'grid-line';
          
          Object.assign(line.style, {
            [isHorizontal ? 'width' : 'height']: '100%',
            [isHorizontal ? 'height' : 'width']: '1px',
            [isHorizontal ? 'top' : 'left']: `${i * spacing}%`,
            backgroundColor: `rgba(59, 130, 246, ${0.1 - Math.abs(i - count/2) * 0.01})`,
            transform: isHorizontal ? 
              `rotateX(90deg) translateZ(${-200 + i * 40}px)` : 
              `rotateY(90deg) translateZ(${-200 + i * 40}px)`,
            opacity: 0.2
          });
          
          spaceElement.appendChild(line);
        }
      };
      
      // Create grid
      createGridLine(true); // horizontal lines
      createGridLine(false); // vertical lines
    };
    
    createSpace();
    
    // Handle mouse movement
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      // Calculate mouse position relative to center
      mouseX = (e.clientX / window.innerWidth - 0.5) * 10;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 10;
      
      // Update perspective origin for parallax effect
      const spaceElement = document.querySelector('.space-background');
      if (spaceElement) {
        spaceElement.style.perspectiveOrigin = `calc(50% + ${mouseX}px) calc(50% + ${mouseY}px)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Handle window resize
    const handleResize = () => {
      createSpace();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="space-background absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 3D elements will be created here by JavaScript */}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#061429] opacity-70"></div>
    </div>
  );
});

// Animated Logo
const Logo = ({ className = "", onClick = () => {} }) => (
  <motion.div 
    className={`cursor-pointer text-white text-lg font-bold flex items-center ${className}`}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <motion.span 
      initial={{ color: THEME.accentBlue }}
      animate={{ 
        color: [THEME.accentBlue, THEME.neonPurple, THEME.neonPink, THEME.accentBlue],
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity,
        ease: "linear" 
      }}
      className="text-xl mr-1"
    >
      Any
    </motion.span>
    <span className="text-xl">Share</span>
  </motion.div>
);

export default function Home() {
  const ref = useRef(null);
  const cardRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.7]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Firecracker animation function
  const createFireworks = (e) => {
    const fireworkContainer = document.createElement('div');
    fireworkContainer.className = 'firework-container';
    fireworkContainer.style.position = 'absolute';
    fireworkContainer.style.left = `${e.clientX}px`;
    fireworkContainer.style.top = `${e.clientY}px`;
    fireworkContainer.style.zIndex = '30';
    document.body.appendChild(fireworkContainer);

    // Create multiple particles for the firework effect
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework-particle';
      
      // Random color for each particle
      const hue = Math.floor(Math.random() * 360);
      particle.style.backgroundColor = `hsl(${hue}, 100%, 60%)`;
      
      // Random size
      const size = 2 + Math.random() * 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Position and animation properties
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      // Set inline styles for the particle
      Object.assign(particle.style, {
        position: 'absolute',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      });
      
      fireworkContainer.appendChild(particle);
      
      // Animate the particle
      let x = 0;
      let y = 0;
      let opacity = 1;
      let frame = 0;
      
      const animate = () => {
        frame++;
        x += vx;
        y += vy;
        opacity -= 0.02;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = opacity;
        
        if (opacity > 0 && frame < 100) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
          if (fireworkContainer.childNodes.length === 0) {
            fireworkContainer.remove();
          }
        }
      };
      
      requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    
    // Add click event listener for firecracker effect
    document.addEventListener('click', createFireworks);
    
    // Cleanup function
    return () => {
      document.removeEventListener('click', createFireworks);
    };
  }, []);

  // Handle 3D animation effect based on mouse position
  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePosition({
        x: ((x / rect.width) - 0.5) * 20, // Transform to -10 to 10 range
        y: ((y / rect.height) - 0.5) * 20
      });
    }
  };

  const handleMouseLeave = () => {
    // Reset position when mouse leaves
    setMousePosition({ x: 0, y: 0 });
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a192f]">
      {/* Animated Navigation Bar */}
      <motion.nav 
        className="flex items-center justify-between p-4 z-20 sticky top-0 backdrop-blur-md bg-[#0a192f]/80 rounded-b-xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex items-center space-x-6">
          <motion.a 
            href="https://github.com/ranit004" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors rounded-full p-2 hover:bg-blue-800/30"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Github size={24} />
          </motion.a>
          <motion.a 
            href="https://x.com/Ranit_bro" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors rounded-full p-2 hover:bg-blue-800/30"
            whileHover={{ scale: 1.2, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Twitter size={24} />
          </motion.a>
        </div>
        
        <Logo onClick={handleLogoClick} />
        
        <div className="w-10"></div>
      </motion.nav>

      <div ref={ref} className="flex-1 relative">
        {/* Only render background once page is loaded */}
        {isLoaded && (
          <EnhancedBackground />
        )}
        
        {/* Hero Section with enhanced animations */}
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
              <div className="absolute inset-0 bg-[#0a192f] opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f]/80 to-[#061429]/60" />
            </motion.div>
          )}

          <motion.div 
            className="w-full max-w-2xl perspective-container"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            {/* Card with plain white border and 3D animation effect */}
            <motion.div
              ref={cardRef}
              className="card-3d-container"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
                transition: mousePosition.x === 0 && mousePosition.y === 0 ? 'transform 0.5s ease-out' : 'none'
              }}
            >
              <Card className="backdrop-blur-md bg-white/5 card-3d border-2 border-white/30 rounded-xl overflow-hidden shadow-xl">
                <CardContent className="pt-6 space-y-6">
                  <motion.div 
                    className="text-center space-y-2"
                    variants={fadeInUp}
                  >
                    <motion.h1 
                      className="text-5xl font-bold text-white flex justify-center items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <motion.span 
                        animate={{ 
                          color: [THEME.accentBlue, THEME.neonPurple, THEME.neonPink, THEME.accentBlue],
                        }}
                        transition={{ 
                          duration: 8, 
                          repeat: Infinity,
                          ease: "linear" 
                        }}
                        className="mr-2"
                      >
                        Any
                      </motion.span>
                      Share
                    </motion.h1>
                    <motion.p 
                      className="text-blue-100/80"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      Share files up to 10GB Securely
                    </motion.p>
                  </motion.div>
                  
                  {/* File upload component */}
                  <motion.div 
                    variants={fadeInUp}
                    transition={{ delay: 0.4 }}
                    className="card-content"
                  >
                    <FileUpload />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section with staggered animations */}
        <motion.div 
          className="py-12 px-4 bg-[#0a192f]/70 bg-gradient-to-b from-[#0a192f]/90 to-[#0f2d5a]/80 relative rounded-t-xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.h2 
              className="text-3xl font-bold text-center mb-8 text-white"
              variants={fadeInUp}
            >
              Why Choose <span style={{ color: THEME.accentBlue }}>AnyShare</span>?
            </motion.h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.title}
                  variants={fadeInUp}
                  custom={index}
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FeatureCard {...feature} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* How It Works Section with animated steps */}
        <motion.div 
          className="py-12 px-4 bg-gradient-to-b from-[#0f2d5a]/80 to-[#0a192f]/95 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.h2 
              className="text-3xl font-bold text-center mb-8 text-white"
              variants={fadeInUp}
            >
              How It <span style={{ color: THEME.accentBlue }}>Works</span>
            </motion.h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
              variants={staggerContainer}
            >
              {/* Removed the blue connector line */}
              
              {steps.map((step, index) => (
                <motion.div 
                  key={step.title} 
                  className="relative z-10"
                  variants={fadeInUp}
                  custom={index}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="flex items-start space-x-4 p-6 rounded-xl bg-blue-900/20 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 shadow-glow-sm"
                    whileHover={{ 
                      boxShadow: "0 0 15px 2px rgba(59, 130, 246, 0.3)",
                      backgroundColor: "rgba(30, 58, 138, 0.3)"
                    }}
                  >
                    <motion.div 
                      className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: 5 }}
                    >
                      <span className="text-xl font-bold text-white">{index + 1}</span>
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-blue-100">{step.title}</h3>
                      <p className="text-sm text-blue-100/70">{step.description}</p>
                      <motion.div
                        className="flex items-center text-blue-400 text-sm mt-2 group"
                        whileHover={{ x: 5 }}
                      >
                        <span className="mr-1">Learn more</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Animated Footer */}
        <motion.footer 
          className="py-6 px-4 bg-[#061429] rounded-t-xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <Logo onClick={handleLogoClick} className="mb-4 md:mb-0" />
            <motion.div 
              className="text-blue-100/60 text-sm"
              whileHover={{ color: "rgba(219, 234, 254, 0.8)" }}
            >
              © {new Date().getFullYear()} AnyShare. All rights reserved.
            </motion.div>
          </div>
        </motion.footer>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        /* 3D Perspective Effects */
        .perspective-container {
          perspective: 1000px;
        }
        
        .card-3d-container {
          transform-style: preserve-3d;
          transition: transform 0.1s ease-out;
        }
        
        .card-3d {
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transform-style: preserve-3d;
        }
        
        .card-content {
          transform: translateZ(20px);
          transform-style: preserve-3d;
        }
        
        .shadow-glow-sm {
          box-shadow: 0 0 10px 1px rgba(59, 130, 246, 0.15);
          transition: box-shadow 0.3s ease;
        }
        
        /* 3D Space background */
        .space-background {
          perspective: 1000px;
          perspective-origin: 50% 50%;
          transform-style: preserve-3d;
          overflow: hidden;
          background: linear-gradient(to bottom, ${THEME.deeperBlue} 0%, ${THEME.darkBlue} 100%);
        }
        
        /* Star elements */
        .star {
          position: absolute;
          border-radius: 50%;
          animation: twinkle 5s ease-in-out infinite;
          z-index: 1;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        /* Orb elements */
        .orb {
          position: absolute;
          border-radius: 50%;
          animation: floatOrb 50s ease-in-out infinite;
          z-index: 1;
        }
        
        @keyframes floatOrb {
          0% { transform: translateZ(var(--z, 0)) translateX(0) translateY(0); }
          25% { transform: translateZ(var(--z, 0)) translateX(20px) translateY(15px); }
          50% { transform: translateZ(var(--z, 0)) translateX(10px) translateY(-15px); }
          75% { transform: translateZ(var(--z, 0)) translateX(-20px) translateY(10px); }
          100% { transform: translateZ(var(--z, 0)) translateX(0) translateY(0); }
        }
        
        /* Grid lines */
        .grid-line {
          position: absolute;
          animation: pulseGrid 10s infinite alternate;
        }
        
        @keyframes pulseGrid {
          0% { opacity: 0.1; }
          100% { opacity: 0.3; }
        }
        
        /* Firework animation styles */
        .firework-particle {
          position: absolute;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 100;
        }
        
        @keyframes fadeAndMove {
          0% { opacity: 1; transform: translate(0, 0); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)); }
        }
        
        /* Radial gradient support */
        .bg-gradient-radial {
          background-image: radial-gradient(var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}