import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { File } from "@shared/schema";

export default function DownloadPage() {
  const { shareId } = useParams();
  const { toast } = useToast();

  const { data: file, isLoading } = useQuery<File>({
    queryKey: [`/api/files/${shareId}`],
    enabled: !!shareId,
  });

  const downloadFile = async () => {
    if (!file) return;

    const chunks: Blob[] = [];
    for (let i = 0; i < file.chunks; i++) {
      const res = await fetch(`/api/files/${file.shareId}/chunks/${i}`);
      const blob = await res.blob();
      chunks.push(blob);
    }

    const finalBlob = new Blob(chunks, { type: file.mimeType });
    const url = URL.createObjectURL(finalBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/download/${shareId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <div className="text-center">File not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{file.filename}</h2>
            <p className="text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button onClick={downloadFile} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>

            <Button onClick={copyShareLink} variant="outline" className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Copy Share Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
