import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, Twitter, ArrowRight, Mail, Linkedin } from "lucide-react";
import FeatureCard from "@/components/feature-card";

const THEME = {
  darkBlue: "#0a192f",
  deeperBlue: "#061429",
  accentBlue: "#3b82f6",
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

const EnhancedBackground = React.memo(() => {
  useEffect(() => {
    const createStarField = () => {
      const spaceElement = document.querySelector('.space-background');
      if (!spaceElement) return;

      spaceElement.innerHTML = '';

      const starCount = 300;
      const starColors = [
        THEME.accentBlue,
        THEME.neonPurple,
        THEME.neonPink,
        '#ffffff',
        'rgba(59, 130, 246, 0.5)',
        'rgba(136, 92, 246, 0.5)'
      ];

      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const size = Math.random() * 2 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const opacity = Math.random() * 0.7 + 0.2;
        const color = starColors[Math.floor(Math.random() * starColors.length)];

        star.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${posX}%;
          top: ${posY}%;
          background-color: ${color};
          opacity: ${opacity};
          border-radius: ${Math.random() > 0.7 ? '50%' : '0'};
          box-shadow: 0 0 ${Math.random() * 8 + 4}px ${color};
          animation: twinkle ${Math.random() * 5 + 3}s ease-in-out infinite;
        `;

        spaceElement.appendChild(star);
      }
    };

    createStarField();

    const handleResize = () => {
      createStarField();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="space-background absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#061429] opacity-70"></div>
    </div>
  );
});

const Logo = ({ className = "", onClick = () => { } }) => (
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
  const footerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // New hook to detect when user reaches end of page
  const { scrollYProgress: footerScrollProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

  useEffect(() => {
    // Listen to footer scroll progress to determine visibility
    return footerScrollProgress.onChange((latest) => {
      // When scroll progress is close to 1, make footer fully visible
      setIsFooterVisible(latest > 0.9);
    });
  }, [footerScrollProgress]);

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.7]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const createFireworks = (e) => {
    const fireworkContainer = document.createElement('div');
    fireworkContainer.className = 'firework-container';
    fireworkContainer.style.position = 'absolute';
    fireworkContainer.style.left = `${e.clientX}px`;
    fireworkContainer.style.top = `${e.clientY}px`;
    fireworkContainer.style.zIndex = '30';
    document.body.appendChild(fireworkContainer);

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework-particle';

      const hue = Math.floor(Math.random() * 360);
      particle.style.backgroundColor = `hsl(${hue}, 100%, 60%)`;

      const size = 2 + Math.random() * 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      Object.assign(particle.style, {
        position: 'absolute',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      });

      fireworkContainer.appendChild(particle);

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

    document.addEventListener('click', createFireworks);

    return () => {
      document.removeEventListener('click', createFireworks);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({
        x: ((x / rect.width) - 0.5) * 20,
        y: ((y / rect.height) - 0.5) * 20
      });
    }
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetInTouch = () => {
    const subject = encodeURIComponent("Inquiry about AnyShare");
    const body = encodeURIComponent("Hello Ranit,\n\nI would like to get in touch regarding...");
    window.location.href = `mailto:ranit1697@gmail.com?subject=${subject}&body=${body}`;
  };

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
      {/* Navigation remains the same */}
      <motion.nav

        className="fixed top-0 left-0 right-0 z-50 py-4 flex justify-center items-center"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
      

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
  className="py-20 px-6 relative overflow-hidden"
  style={{
    backgroundColor: 'rgb(6, 6, 105)', 
    backgroundImage: 'linear-gradient(to bottom, rgba(13, 37, 91, 0.95), rgba(11, 33, 82, 0.97))'
  }}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
  variants={staggerContainer}
  ref={footerRef}
>
  <div className="max-w-7xl mx-auto relative z-10">
    <motion.h2
      className="text-4xl font-bold text-center mb-16 text-white"
      variants={fadeInUp}
    >
      How <span style={{ color: THEME?.accentBlue || '#3b82f6' }}>AnyShare</span> Works
    </motion.h2>
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-12"
      variants={staggerContainer}
    >
      {(steps || []).map((step, index) => (
        <motion.div
          key={step?.title || `step-${index}`}
          className="relative z-10 flex flex-col items-center"
          variants={fadeInUp}
          custom={index}
          whileHover={{
            scale: 1.05,
            y: -10,
            transition: {
              type: "spring",
              stiffness: 300
            }
          }}
        >
          <div
            className="w-16 h-16 mb-6 rounded-full flex items-center justify-center
              bg-gradient-to-br from-blue-500/20 to-purple-600/20
              border-2 border-white/30 shadow-lg relative
              transform transition-all duration-300"
          >
            <span
              className="text-xl font-bold text-white absolute"
              style={{
                color: THEME?.accentBlue || '#3b82f6',
                textShadow: `0 0 10px ${THEME?.accentBlue || '#3b82f6'}`
              }}
            >
              {index + 1}
            </span>
          </div>
          <Card
            className="w-full p-8 text-center
              bg-[#0a192f]/70
              backdrop-blur-md border border-white/20 rounded-xl
              shadow-xl transform transition-all duration-300
              hover:shadow-2xl hover:border-blue-500/50"
          >
            <h3
              className="text-2xl font-semibold mb-4 text-white"
              style={{ color: THEME?.accentBlue || '#3b82f6' }}
            >
              {step?.title || `Step ${index + 1}`}
            </h3>
            <p className="text-blue-100/80 text-base">
              {step?.description || 'Description not available'}
            </p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  </div>
</motion.div>

        {/* How It Works Section */}
        <motion.div
          className="py-12 px-4 bg-gradient-to-b from-[#0f2d5a]/80 to-[#0a192f]/95 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          ref={footerRef}  // Add ref to this section
        >
          <div className="max-w-7xl mx-auto relative z-10">
            {/* How It Works content remains the same */}
          </div>
        </motion.div>

        {/* Sticky Footer with improved visibility */}
        <motion.footer 
  className="fixed bottom-0 left-0 right-0 z-50 py-4 px-4 bg-[#061429]/90 backdrop-blur-md shadow-[0_-4px_15px_rgba(59,130,246,0.2)] w-full"
  initial={{ opacity: 0, y: '100%' }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    duration: 0.6, 
    type: "spring", 
    stiffness: 100 
  }}
  whileHover={{ 
    boxShadow: '0 -6px 20px rgba(59,130,246,0.3)',
    scale: 1.005
  }}
>
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    <motion.div 
      className="text-emerald-200/80 text-sm"
      whileHover={{ 
        scale: 1.05,
        color: "rgba(167, 243, 208, 0.9)"
      }}
    >
      Built by <a 
        href="https://x.com/Ranit_bro" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="hover:text-emerald-300 transition-colors font-medium text-emerald-300"
      >
        Ranit
      </a>
    </motion.div>
    <motion.div 
      className="flex items-center space-x-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col items-center mr-2">
        <motion.span 
          className="text-emerald-200/70 text-sm mb-2 tracking-wider font-medium"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Connect with me
        </motion.span>
        <div className="flex space-x-4">
          {[
            { 
              Icon: Github, 
              href: "https://github.com/ranit004",
              hoverColor: "text-emerald-200 hover:text-emerald-400"
            },
            { 
              Icon: Twitter, 
              href: "https://x.com/Ranit_bro",
              hoverColor: "text-emerald-200 hover:text-emerald-400"
            },
            { 
              Icon: Linkedin, 
              href: "https://www.linkedin.com/in/ranit-mondal-a084102b5/",
              hoverColor: "text-emerald-200 hover:text-emerald-400"
            }
          ].map(({ Icon, href, hoverColor }) => (
            <motion.a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${hoverColor} transition-colors`}
              whileHover={{ 
                scale: 1.2, 
                rotate: 5,
                color: "rgb(16, 185, 129)"
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Icon size={26} />
            </motion.a>
          ))}
        </div>
      </div>
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