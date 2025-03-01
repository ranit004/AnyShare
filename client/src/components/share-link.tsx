import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy, Share2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareLinkProps {
  shareId: string;
  onNewUpload: () => void;
}

export default function ShareLink({ shareId, onNewUpload }: ShareLinkProps) {
  const [showLink, setShowLink] = useState(false);
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/d/${shareId}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Success",
      description: "Link copied to clipboard!",
    });
  };

  return (
    <div className="space-y-4 p-6 backdrop-blur-lg bg-black/80 rounded-2xl border border-gray-700 shadow-xl">
      <h2 className="text-2xl font-semibold text-blue-400 text-center">
        Your file is ready to share!
      </h2>

      <div className="flex gap-4 justify-center">
        <Button
          className="rounded-full backdrop-blur-md bg-gray-800/80 hover:bg-gray-700/80 text-white border border-gray-600 shadow-lg transition-all duration-300 px-6 py-2"
          onClick={() => {
            setShowLink(true);
            copyLink();
          }}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Now
        </Button>

        <Button
          variant="outline"
          className="rounded-full backdrop-blur-md bg-gray-800/50 hover:bg-gray-700/70 text-white border border-gray-600 shadow-lg transition-all duration-300 px-6 py-2"
          onClick={onNewUpload}
        >
          <Upload className="mr-2 h-4 w-4" />
          New Upload
        </Button>
      </div>

      {showLink && (
        <div className="mt-6 animate-fadeIn">
          <p className="text-sm text-gray-400 mb-2 text-center">Share Link:</p>
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-700 shadow-lg">
            <div className="bg-black/70 p-3 flex-grow text-gray-200 font-mono text-sm overflow-hidden text-ellipsis">
              {shareUrl}
            </div>
            <Button 
              className="bg-blue-600/60 hover:bg-blue-700/70 rounded-r-lg rounded-l-none h-12 min-w-12 transition-all duration-300"
              onClick={copyLink}
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}