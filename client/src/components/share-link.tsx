import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Copy, Share2, Upload, CheckCircle, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareLinkProps {
  shareId: string;
  onNewUpload: () => void;
}

export default function ShareLink({ shareId, onNewUpload }: ShareLinkProps) {
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/d/${shareId}`;

  useEffect(() => {
    // Show fireworks animation initially when component loads
    setShowFireworks(true);
    const fireworksTimer = setTimeout(() => setShowFireworks(false), 2000);

    // Handle copy state
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => {
        clearTimeout(timer);
        clearTimeout(fireworksTimer);
      };
    }
    
    return () => clearTimeout(fireworksTimer);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Link copied to clipboard",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden p-5 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl animate-fadeIn">
      {/* Glass highlights */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full"></div>
      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full"></div>
      
      {/* Fireworks animation */}
      {showFireworks && (
        <div className="fireworks-container">
          <div className="firework" style={{ left: '20%', animationDelay: '0s' }}></div>
          <div className="firework" style={{ left: '50%', animationDelay: '0.2s' }}></div>
          <div className="firework" style={{ left: '80%', animationDelay: '0.4s' }}></div>
        </div>
      )}
      
      {/* Content container */}
      <div className="relative z-10">
        {/* Success indicator with emoji */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl backdrop-blur-md border border-white/10 animate-float">
            <span className="text-2xl" role="img" aria-label="party">🎉</span>
          </div>
        </div>
        
        {/* Main text */}
        <h2 className="text-xl font-medium text-center text-white mb-4">
          Your file is ready to share!
        </h2>
        
        {/* Button group with modern styling and white borders */}
        <div className="flex gap-3 justify-center mb-4">
          <Button
            className="flex-1 py-2 px-3 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border-2 border-white/30 hover:border-white/50 shadow-lg shadow-blue-600/20 transition-all duration-200 group"
            onClick={() => {
              setShowLink(true);
              copyLink();
            }}
          >
            <Share2 className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            Share Now
          </Button>

          <Button
            variant="outline"
            className="flex-1 py-2 px-3 h-10 rounded-xl bg-black/50 backdrop-blur-md text-gray-300 border-2 border-white/30 hover:bg-black/70 hover:border-white/50 transition-all duration-200"
            onClick={onNewUpload}
          >
            <Upload className="mr-2 h-4 w-4" />
            New Upload
          </Button>
        </div>

        {/* Link display area with modern styling */}
        {showLink && (
          <div className="animate-slideUp">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center mb-2">
                <LinkIcon className="h-3 w-3 text-blue-400 mr-2" />
                <p className="text-xs text-gray-400">Share link</p>
              </div>
              <div className="flex items-center">
                <div className="flex-grow font-mono text-xs text-gray-300 truncate mr-2">
                  {shareUrl}
                </div>
                <Button
                  size="sm"
                  className={`h-8 w-8 p-0 rounded-lg transition-all duration-300 ${
                    copied
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30"
                  }`}
                  onClick={copyLink}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Security note with subtle styling */}
        <div className="mt-4 flex items-center justify-center gap-1 text-gray-500 text-xs">
          <div className="w-1 h-1 rounded-full bg-blue-400 opacity-70"></div>
          <span>End-to-end encrypted</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        /* Fireworks animation */
        .fireworks-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 20;
        }
        
        .firework {
          position: absolute;
          top: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          transform-origin: center;
          animation: explosion 1.5s ease-out forwards;
        }
        
        .firework::before, .firework::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-image: radial-gradient(
            circle,
            rgba(255, 216, 157, 0.8) 10%,
            rgba(255, 176, 58, 0.8) 40%,
            rgba(255, 69, 0, 0.5) 60%,
            rgba(255, 69, 0, 0) 100%
          );
          transform-origin: center;
          animation: sparkle 1.5s ease-out forwards;
        }
        
        .firework::after {
          animation-delay: 0.1s;
        }
        
        @keyframes explosion {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(0, -120px) scale(4);
            opacity: 0;
          }
        }
        
        @keyframes sparkle {
          0% {
            transform: rotate(0deg) scale(0);
            opacity: 1;
            background-position: center;
          }
          100% {
            transform: rotate(180deg) scale(3);
            opacity: 0;
            background-position: center;
          }
        }
      `}</style>
    </div>
  );
}