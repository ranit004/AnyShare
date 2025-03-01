import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, FileIcon, ShieldCheck, Play, X, Github, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// Performance optimizations:
// 1. Memoize expensive computations 
// 2. Reduce motion animations
// 3. Simplified rendering logic
// 4. Component extraction

// Fixed values outside component to prevent recreations
const blueThemeColor = "#1e90ff";
const iconColorMap = {
  pdf: "text-red-500",
  doc: "text-blue-500", docx: "text-blue-500",
  xls: "text-green-500", xlsx: "text-green-500",
  jpg: "text-yellow-500", jpeg: "text-yellow-500", png: "text-yellow-500",
  zip: "text-purple-500", rar: "text-purple-500",
  mp3: "text-pink-500", mp4: "text-pink-500", webm: "text-pink-500",
};

// Simple background without excessive blur effects
const Background = React.memo(() => (
  <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-blue-950 z-0" />
));

export default function DownloadPage() {
  const { shareId } = useParams();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
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

  // Handle media playback
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

  // Download file
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
    } catch (err) {
      toast({
        title: "Error",
        description: "Download failed. Please try again.",
      });
    } finally {
      setDownloadProgress(0);
    }
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (mediaRef.current?.src) {
        URL.revokeObjectURL(mediaRef.current.src);
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      {/* Simple background without intensive effects */}
      <Background />
      
      {/* Media player - simplified animations */}
      {playerOpen && isPlayable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-lg shadow-lg border border-white">
            <Button 
              size="sm" 
              className="absolute top-4 right-4 z-10 rounded-full h-8 w-8 p-0 bg-black/50 text-white"
              onClick={() => setPlayerOpen(false)}
            >
              <X size={16} />
            </Button>
            
            {loadingMedia && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
                <Progress value={playbackProgress} className="h-2 w-64 mb-3" />
                <p className="text-white text-sm">Loading ({Math.round(playbackProgress)}%)</p>
              </div>
            )}
            
            {['mp4', 'webm', 'mov'].includes(fileExt) ? (
              <video 
                ref={mediaRef} 
                className="w-full h-auto max-h-[70vh]" 
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="p-8 bg-gradient-to-br from-black to-gray-800 flex flex-col items-center justify-center min-h-[300px]">
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
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-grow flex items-center justify-center w-full relative z-10">
        {isLoading ? (
          <div className="text-center">
            <FileIcon className="h-16 w-16 mx-auto text-blue-400" />
            <p className="mt-4 text-blue-100">Loading file information...</p>
          </div>
        ) : !file ? (
          <div className="w-full max-w-md">
            <Card className="bg-slate-900/90 border border-white shadow-lg text-white">
              <CardContent className="pt-6 text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                  <FileIcon className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-red-400">File Not Found</h1>
                <p className="text-blue-200/80">This file may have expired or been removed</p>
                <Button 
                  variant="outline" 
                  className="bg-slate-800/50 border-red-500/30 text-red-400"
                  onClick={() => window.location.href = '/'}
                >
                  Return Home
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <Card className="bg-slate-900/90 border border-white shadow-lg text-white">
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center ${iconColor}`}>
                    <FileIcon className={`h-7 w-7 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-semibold text-blue-100 truncate">{file.name}</h1>
                    <div className="flex items-center">
                      <p className="text-sm text-blue-200/70">
                        {fileSizeInMB.toFixed(2)} MB
                      </p>
                      <span className="mx-2 text-blue-300/50 text-xs">•</span>
                      <p className="text-sm text-blue-200/70 uppercase">{fileExt}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-1 px-1">
                  <div className="h-px w-full bg-blue-400/30" />
                </div>

                {downloadProgress > 0 ? (
                  <div className="space-y-3">
                    <Progress 
                      value={downloadProgress} 
                      className="h-2 bg-blue-800/30" 
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-blue-200/70">Downloading...</p>
                      <p className="text-sm font-medium text-blue-300">{Math.round(downloadProgress)}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 justify-center p-2 rounded-lg bg-blue-900/30 border border-blue-500/20">
                      <ShieldCheck className="h-4 w-4 text-green-400" />
                      <p className="text-xs text-blue-200/80">
                        {isPlayable ? "File can be played online" : "Files up to 10GB supported"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {isPlayable && (
                        <Button 
                          variant="outline"
                          className="w-full border-blue-400/40 hover:bg-blue-800/40 text-blue-300"
                          onClick={() => {
                            setPlayerOpen(true);
                            if (!mediaRef.current?.src) {
                              streamMedia();
                            }
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Play Online
                        </Button>
                      )}
                      
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                        onClick={downloadFile}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <p className="text-center text-xs text-blue-200/60 mt-4">
              Your files are automatically deleted after download
            </p>
          </div>
        )}
      </div>

      {/* Updated Footer with Clickable Social Media Icons */}
      <footer className="w-full py-6 px-4 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-blue-300">AnyShare</h2>
            <p className="text-xs text-blue-200/60 mt-1">Secure file sharing made simple</p>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href={socialLinks.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-300 hover:text-blue-100 transition-colors"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <a 
              href={socialLinks.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-100 transition-colors" 
              aria-label="Twitter/X"
            >
              <Twitter size={18} />
            </a>
            <span className="text-xs text-blue-200/70 ml-2">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}