import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, FileIcon, ShieldCheck, Play, X, Github, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// Performance optimizations remain
const blueThemeColor = "#1e90ff";
const iconColorMap = {
  pdf: "text-red-500",
  doc: "text-blue-500", docx: "text-blue-500",
  xls: "text-green-500", xlsx: "text-green-500",
  jpg: "text-yellow-500", jpeg: "text-yellow-500", png: "text-yellow-500",
  zip: "text-purple-500", rar: "text-purple-500",
  mp3: "text-pink-500", mp4: "text-pink-500", webm: "text-pink-500",
};

// Enhanced animated background with CSS only
const Background = React.memo(() => (
  <>
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-blue-950 z-0" />
    <div className="fixed inset-0 z-1 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-blue-500/20"
          style={{
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 10}s infinite linear`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random() * 0.2 + 0.1
          }}
        />
      ))}
    </div>
    <style jsx global>{`
      @keyframes float {
        0% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(50px, -50px) rotate(120deg); }
        66% { transform: translate(-20px, 20px) rotate(240deg); }
        100% { transform: translate(0, 0) rotate(360deg); }
      }
    `}</style>
  </>
));

// Fixed Firecracker effect component
const Firecracker = ({ x, y, onComplete }) => {
  const particleColors = ['#4FACFE', '#00F2FE', '#FFF94C', '#FFCB80', '#FF5E7D'];
  const particleCount = 30;
  
  return (
    <div className="absolute" style={{ left: 0, top: 0, pointerEvents: 'none' }}>
      <AnimatePresence>
        {Array.from({ length: particleCount }).map((_, i) => {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 100 + 50;
          const duration = Math.random() * 0.7 + 0.3;
          const delay = Math.random() * 0.2;
          const size = Math.random() * 4 + 2;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ 
                width: size,
                height: size,
                backgroundColor: particleColors[Math.floor(Math.random() * particleColors.length)],
                boxShadow: `0 0 ${size * 2}px ${size}px ${particleColors[Math.floor(Math.random() * particleColors.length)]}80`,
                left: x,
                top: y
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                x: Math.cos(angle) * distance, 
                y: Math.sin(angle) * distance,
                scale: Math.random() * 1 + 0.5,
                opacity: 1
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration, 
                delay,
                ease: ["circOut", "circIn"][Math.floor(Math.random() * 2)]
              }}
              onAnimationComplete={() => {
                if (i === particleCount - 1) onComplete();
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default function DownloadPage() {
  const { shareId } = useParams();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [firecrackers, setFirecrackers] = useState([]);
  const mediaRef = useRef(null);
  const { toast } = useToast();

  // Social media URLs
  const socialLinks = {
    github: "https://github.com/ranit004",
    twitter: "https://x.com/Ranit_bro"
  };

  // Fetch file data with react-query - caching enabled
  const { data: file, isLoading } = useQuery({
    queryKey: [`file-${shareId}`],
    queryFn: async () => {
      const res = await fetch(`/api/files/${shareId}`);
      if (!res.ok) throw new Error("File not found");
      return res.json();
    },
    staleTime: 60000, // Cache for 1 minute
  });

  // Compute file info only when file changes
  const { fileExt, isPlayable, fileSizeInMB, iconColor } = useMemo(() => {
    if (!file) return { fileExt: "", isPlayable: false, fileSizeInMB: 0, iconColor: "" };
    
    const fileExt = file.name.split('.').pop().toLowerCase();
    const isPlayableMedia = ['mp3', 'mp4', 'wav', 'ogg', 'webm', 'mov'].includes(fileExt);
    const sizeMB = file.size / (1024 * 1024);
    
    return { 
      fileExt, 
      isPlayable: isPlayableMedia && sizeMB < 5000,
      fileSizeInMB: sizeMB,
      iconColor: iconColorMap[fileExt] || `text-[${blueThemeColor}]`
    };
  }, [file]);

  // Fixed handle click/touch for firecracker effect
  const handleFirecracker = (e) => {
    // Prevent bubbling when clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('a') || playerOpen) {
      return;
    }
    
    const id = Date.now();
    setFirecrackers(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
  };

  const removeFirecracker = (id) => {
    setFirecrackers(prev => prev.filter(fc => fc.id !== id));
  };

  // Handle media playback (simplified)
  const streamMedia = async () => {
    if (!file || !isPlayable) return;
    
    setLoadingMedia(true);
    try {
      const chunks = [];
      
      for (let i = 0; i < file.chunks; i++) {
        const res = await fetch(`/api/files/${shareId}/chunks/${i}`);
        if (!res.ok) throw new Error(`Failed to load chunk ${i}`);
        chunks.push(await res.arrayBuffer());
        setPlaybackProgress(((i + 1) / file.chunks) * 100);
      }
      
      const blob = new Blob(chunks, { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      
      if (mediaRef.current) {
        mediaRef.current.src = url;
        mediaRef.current.onloadeddata = () => {
          setIsPlaying(true);
          mediaRef.current.play();
        };
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to stream file. Try downloading instead.",
      });
    } finally {
      setLoadingMedia(false);
    }
  };

  // Download file (simplified)
  const downloadFile = async () => {
    if (!file) return;

    try {
      const chunks = [];
      
      for (let i = 0; i < file.chunks; i++) {
        const chunk = await fetch(`/api/files/${shareId}/chunks/${i}`).then(res => res.arrayBuffer());
        chunks.push(chunk);
        setDownloadProgress(((i + 1) / file.chunks) * 100);
      }

      const blob = new Blob(chunks, { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Success", description: "Download completed" });
      
      // Create a celebratory firecracker in the center of the screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const id = Date.now();
      setFirecrackers(prev => [...prev, { id, x: centerX, y: centerY }]);
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Download failed. Please try again.",
      });
    } finally {
      setDownloadProgress(0);
    }
  };
  
  // Cleanup URLs
  useEffect(() => {
    return () => {
      if (mediaRef.current?.src) {
        URL.revokeObjectURL(mediaRef.current.src);
      }
    };
  }, []);

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      onClick={handleFirecracker}
      onTouchStart={(e) => {
        // Support for touch devices
        const touch = e.touches[0];
        handleFirecracker({ clientX: touch.clientX, clientY: touch.clientY });
      }}
    >
      {/* Background */}
      <Background />
      
      {/* Firecracker effects - fixed positioning */}
      {firecrackers.map(fc => (
        <Firecracker 
          key={fc.id}
          x={fc.x}
          y={fc.y}
          onComplete={() => removeFirecracker(fc.id)}
        />
      ))}
      
      {/* Media player */}
      <AnimatePresence>
        {playerOpen && isPlayable && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="relative w-full max-w-4xl bg-slate-900 rounded-xl shadow-2xl border border-blue-400/30"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <Button 
                size="sm" 
                className="absolute top-4 right-4 z-10 rounded-full h-10 w-10 p-0 bg-black/50 text-white hover:bg-blue-600 transition-colors"
                onClick={() => setPlayerOpen(false)}
              >
                <X size={18} />
              </Button>
              
              {loadingMedia && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20 rounded-xl">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <Progress value={playbackProgress} className="h-2 w-64 mb-3 rounded-full bg-blue-900/50" />
                    <p className="text-white text-sm">Loading ({Math.round(playbackProgress)}%)</p>
                  </motion.div>
                </div>
              )}
              
              {['mp4', 'webm', 'mov'].includes(fileExt) ? (
                <video 
                  ref={mediaRef} 
                  className="w-full h-auto max-h-[70vh] rounded-xl" 
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <div className="p-8 bg-gradient-to-br from-black to-blue-950 flex flex-col items-center justify-center min-h-[300px] rounded-xl">
                  <FileIcon className={`h-16 w-16 ${iconColor} mb-4`} />
                  <h3 className="text-white text-lg mb-4">{file?.name}</h3>
                  <audio 
                    ref={mediaRef} 
                    className="w-full" 
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <div className="flex-grow flex items-center justify-center w-full relative z-10">
        {isLoading ? (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{ 
                rotateZ: [0, 10, 0, -10, 0],
                y: [0, -5, 0, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <FileIcon className="h-16 w-16 mx-auto text-blue-400" />
            </motion.div>
            <p className="mt-4 text-blue-100">Loading file information...</p>
          </motion.div>
        ) : !file ? (
          <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-slate-900/90 border border-white shadow-lg text-white rounded-xl overflow-hidden backdrop-blur-sm">
              <CardContent className="pt-6 text-center space-y-6">
                <motion.div 
                  className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center"
                  animate={{ 
                    boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0)', '0 0 0 10px rgba(239, 68, 68, 0.2)', '0 0 0 0 rgba(239, 68, 68, 0)'],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <FileIcon className="h-8 w-8 text-red-500" />
                </motion.div>
                <h1 className="text-2xl font-bold text-red-400">File Not Found</h1>
                <p className="text-blue-200/80">This file may have expired or been removed</p>
                <Button 
                  variant="outline" 
                  className="bg-slate-800/50 border-red-500/30 text-red-400 rounded-xl hover:bg-red-900/20 transition-colors"
                  onClick={() => window.location.href = '/'}
                >
                  Return Home
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-900/90 border border-blue-400/30 shadow-2xl text-white rounded-xl overflow-hidden backdrop-blur-sm hover:border-blue-400/50 transition-colors">
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className={`flex-shrink-0 w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center ${iconColor}`}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <FileIcon className={`h-7 w-7 ${iconColor}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-semibold text-blue-100 truncate">{file.name}</h1>
                    <div className="flex items-center">
                      <p className="text-sm text-blue-200/70">{fileSizeInMB.toFixed(2)} MB</p>
                      <span className="mx-2 text-blue-300/50 text-xs">•</span>
                      <p className="text-sm text-blue-200/70 uppercase">{fileExt}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-blue-400/30" />

                {downloadProgress > 0 ? (
                  <div className="space-y-3">
                    <Progress value={downloadProgress} className="h-2 bg-blue-800/30 rounded-full" />
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-blue-200/70">Downloading...</p>
                      <p className="text-sm font-medium text-blue-300">{Math.round(downloadProgress)}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.div 
                      className="flex items-center gap-2 justify-center p-2 rounded-xl bg-blue-900/30 border border-blue-500/20"
                      whileHover={{ scale: 1.02, borderColor: "rgba(59, 130, 246, 0.4)" }}
                    >
                      <ShieldCheck className="h-4 w-4 text-green-400" />
                      <p className="text-xs text-blue-200/80">
                        {isPlayable ? "File can be played online" : "Files up to 10GB supported"}
                      </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {isPlayable && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            variant="outline"
                            className="w-full border-blue-400/40 hover:bg-blue-800/40 text-blue-300 rounded-xl shadow-lg"
                            onClick={() => {
                              setPlayerOpen(true);
                              if (!mediaRef.current?.src) {
                                streamMedia();
                              }
                            }}
                          >
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                              <Play className="mr-2 h-4 w-4" />
                            </motion.div>
                            Play Online
                          </Button>
                        </motion.div>
                      )}
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg"
                          onClick={downloadFile}
                        >
                          <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                            <Download className="mr-2 h-4 w-4" />
                          </motion.div>
                          Download Now
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <p className="text-center text-xs text-blue-200/60 mt-4">
              Your files are automatically deleted after download
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-4 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }}>
            <h2 className="text-xl font-bold text-blue-300">AnyShare</h2>
            <p className="text-xs text-blue-200/60 mt-1">Secure file sharing made simple</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <motion.a 
              href={socialLinks.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-300 hover:text-blue-100 transition-colors rounded-full p-2 hover:bg-blue-800/30"
              aria-label="GitHub"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github size={18} />
            </motion.a>
            <motion.a 
              href={socialLinks.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-100 transition-colors rounded-full p-2 hover:bg-blue-800/30" 
              aria-label="Twitter/X"
              whileHover={{ scale: 1.2, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Twitter size={18} />
            </motion.a>
            <span className="text-xs text-blue-200/70 ml-2">
              © {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}