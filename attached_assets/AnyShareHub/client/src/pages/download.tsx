import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, FileIcon } from "lucide-react";
import { useState } from "react";
import { CHUNK_SIZE } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function DownloadPage() {
  const { shareId } = useParams();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { toast } = useToast();

  const { data: file, isLoading } = useQuery({
    queryKey: [`/api/files/${shareId}`],
    queryFn: async () => {
      const res = await fetch(`/api/files/${shareId}`);
      if (!res.ok) throw new Error("File not found");
      return res.json();
    },
  });

  const downloadChunk = async (chunkIndex: number): Promise<ArrayBuffer> => {
    const res = await fetch(`/api/files/${shareId}/chunks/${chunkIndex}`);
    if (!res.ok) {
      throw new Error(`Failed to download chunk ${chunkIndex}`);
    }
    return res.arrayBuffer();
  };

  const downloadFile = async () => {
    if (!file) return;

    try {
      const chunks: ArrayBuffer[] = [];
      let totalSize = 0;

      // Download each chunk with retries
      for (let i = 0; i < file.chunks; i++) {
        let retries = 3;
        let chunk: ArrayBuffer | null = null;

        while (retries > 0 && !chunk) {
          try {
            chunk = await downloadChunk(i);
            chunks[i] = chunk;
            totalSize += chunk.byteLength;
            setDownloadProgress(((i + 1) / file.chunks) * 100);
          } catch (err) {
            retries--;
            if (retries === 0) {
              throw new Error(`Failed to download chunk ${i} after multiple attempts`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          }
        }
      }

      // Verify all chunks were downloaded and total size matches
      if (chunks.some(chunk => !chunk)) {
        throw new Error("Some chunks failed to download");
      }

      if (totalSize !== file.size) {
        throw new Error("Downloaded file size doesn't match expected size");
      }

      // Combine chunks into a single blob
      const blob = new Blob(chunks, { type: file.mimeType });

      // Create temporary download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = file.name;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "File downloaded successfully!",
      });
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to download file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin">
          <FileIcon className="h-8 w-8 text-black" />
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-black mb-2">File Not Found</h1>
            <p className="text-black">
              This file may have expired or been removed
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileIcon className="h-8 w-8 text-black" />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-black truncate">
                {file.name}
              </h1>
              <p className="text-sm text-black">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>

          {downloadProgress > 0 ? (
            <div className="space-y-2">
              <Progress value={downloadProgress} className="animate-pulse" />
              <p className="text-sm text-black text-center">
                Downloading... {Math.round(downloadProgress)}%
              </p>
            </div>
          ) : (
            <Button
              className="w-full glow-button bg-black hover:bg-gray-800 text-white font-bold"
              onClick={downloadFile}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}