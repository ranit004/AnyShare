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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-black text-center">
        Your file is ready to share!
      </h2>

      <div className="flex gap-2 justify-center">
        <Button
          className="glow-button bg-black hover:bg-gray-800 text-white font-bold px-6 py-2"
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
          className="glow-button bg-black hover:bg-gray-800 text-white font-bold px-6 py-2"
          onClick={onNewUpload}
        >
          <Upload className="mr-2 h-4 w-4" />
          New Upload
        </Button>
      </div>

      {showLink && (
        <div className="mt-4 text-center">
          <p className="text-sm text-black mb-2">Share Link:</p>
          <code className="bg-gray-100 p-2 rounded block truncate text-black">
            {shareUrl}
          </code>
        </div>
      )}
    </div>
  );
}