import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Upload, X, FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MAX_FILE_SIZE } from "@shared/schema";
import ShareLink from "@/components/share-link";
import {CHUNK_SIZE} from "@shared/schema";

export default function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareId, setShareId] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [fileName, setFileName] = useState<string>();
  const abortControllerRef = useRef<AbortController>();
  const { toast } = useToast();

  const resetUpload = () => {
    setShareId(undefined);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
    setFileName(undefined);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }
    resetUpload();
    toast({
      title: "Upload Cancelled",
      description: "File upload was cancelled",
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "File too large. Maximum size is 10GB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setFileName(file.name);
      abortControllerRef.current = new AbortController();

      // Create file entry
      const res = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          chunks: Math.ceil(file.size / CHUNK_SIZE),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Failed to create file");
      const fileData = await res.json();
      setShareId(fileData.shareId);

      // Upload chunks with cancellation support
      const chunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadedChunks = new Set<number>();

      for (let i = 0; i < chunks; i++) {
        if (!abortControllerRef.current) break; // Check if cancelled

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        let retries = 3;
        while (retries > 0) {
          try {
            const chunkRes = await fetch(
              `/api/files/${fileData.shareId}/chunks/${i}`,
              {
                method: "POST",
                body: chunk,
                signal: abortControllerRef.current.signal,
              }
            );

            if (!chunkRes.ok) throw new Error(`Failed to upload chunk ${i}`);

            uploadedChunks.add(i);
            setUploadProgress((uploadedChunks.size / chunks) * 100);
            break;
          } catch (err) {
            if (err.name === 'AbortError') {
              throw err; // Propagate abort
            }
            retries--;
            if (retries === 0) {
              throw new Error(`Failed to upload chunk ${i} after multiple attempts`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      setUploadComplete(true);
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Upload error:", err);
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to upload file. Please try again.",
          variant: "destructive",
        });
      }
      resetUpload();
    } finally {
      setIsUploading(false);
      abortControllerRef.current = undefined;
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: isUploading,
  });

  if (shareId && uploadComplete) {
    return <ShareLink shareId={shareId} onNewUpload={resetUpload} />;
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-lg p-8 text-center
          transition-all duration-300 transform
          ${isDragActive ? 'scale-105 border-primary' : 'border-muted-foreground'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
          bg-gradient-to-br from-background to-muted
          border-2 border-dashed shadow-xl
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Upload className={`
              h-16 w-16 text-primary
              ${isDragActive ? 'animate-bounce' : 'animate-pulse'}
            `} />
            {fileName && (
              <FileIcon className="h-6 w-6 text-primary absolute -right-2 -bottom-2" />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">
              {isUploading ? "Uploading..." : "Drop your file here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {fileName || "Or click to select a file"}
            </p>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <Progress value={uploadProgress} className="h-2" />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={cancelUpload}
              className="shrink-0"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
    </div>
  );
}