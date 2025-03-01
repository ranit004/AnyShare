import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MAX_FILE_SIZE } from "@shared/schema";
import ShareLink from "@/components/share-link";
import { CHUNK_SIZE } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import React from 'react';

// Use React.memo for motion components to prevent unnecessary re-renders
const MotionButton = React.memo(motion(Button));

export default function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareId, setShareId] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [fileName, setFileName] = useState();
  const [isDragReady, setIsDragReady] = useState(false);
  const abortControllerRef = useRef();
  const { toast } = useToast();

  const resetUpload = useCallback(() => {
    setShareId(undefined);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
    setFileName(undefined);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }
  }, []);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }
    resetUpload();
    toast({
      title: "Upload Cancelled",
      description: "File upload was cancelled",
    });
  }, [resetUpload, toast]);

  const onDrop = useCallback(
    async (acceptedFiles) => {
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

        const fileData = {
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          chunks: Math.ceil(file.size / CHUNK_SIZE),
        };

        const res = await fetch("/api/files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fileData),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) throw new Error("Failed to create file");
        const createdFile = await res.json();
        setShareId(createdFile.shareId);

        const chunks = Math.ceil(file.size / CHUNK_SIZE);
        const uploadedChunks = new Set();

        for (let i = 0; i < chunks; i++) {
          if (!abortControllerRef.current) break;

          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          let retries = 3;
          while (retries > 0) {
            try {
              const chunkRes = await fetch(
                `/api/files/${createdFile.shareId}/chunks/${i}`,
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
              if (err.name === "AbortError") {
                throw err;
              }
              retries--;
              if (retries === 0) {
                throw new Error(
                  `Failed to upload chunk ${i} after multiple attempts`
                );
              }
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        setUploadComplete(true);
        toast({
          title: "Success",
          description: "File uploaded successfully!",
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Upload error:", err);
          toast({
            title: "Error",
            description:
              err instanceof Error ? err.message : "Failed to upload file",
            variant: "destructive",
          });
        }
        resetUpload();
      } finally {
        setIsUploading(false);
        abortControllerRef.current = undefined;
      }
    },
    [toast, resetUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: isUploading,
    onDragEnter: () => setIsDragReady(true),
    onDragLeave: () => setIsDragReady(false),
  });

  if (shareId && uploadComplete) {
    return <ShareLink shareId={shareId} onNewUpload={resetUpload} />;
  }

  // Simplified animations with reduced complexity
  const dropzoneAnimation = isDragActive
    ? { scale: 1.03 }
    : { scale: 1 };

  // Simplified progress animations
  const progressVariants = {
    initial: { width: "0%" },
    animate: { width: `${uploadProgress}%` },
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-xl p-8 text-center
          transition-all duration-300
          ${isDragActive ? "border-primary shadow-md" : "border-muted-foreground"}
          ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-primary/5"}
          bg-gradient-to-br from-background to-primary/5
          border-2 border-dashed
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <Upload className="h-16 w-16 text-primary opacity-80" />
          <div className="space-y-2">
            <p className="text-xl font-semibold text-primary">
              {isUploading ? "Uploading..." : "Drop your file here"}
            </p>
            <p className="text-sm text-muted-foreground">
              {fileName || "Or click to select a file"}
            </p>
          </div>
        </div>

        {/* Simplified decorative elements */}
        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-br-3xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-3xl" />
      </div>

      {isUploading && (
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex-1 relative mr-24">
              {/* Simplified progress bar */}
              <div className="relative h-3 w-full rounded-full overflow-hidden bg-gray-100/10">
                <div
                  className="h-full rounded-full bg-primary relative"
                  style={{ width: `${uploadProgress}%` }}
                >
                  {/* Single shine effect instead of multiple */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                </div>
              </div>

              <div className="absolute -right-16 top-1/2 -translate-y-1/2">
                <div className="bg-primary/10 px-2 py-1 rounded-full">
                  <span className="text-xs font-medium text-primary">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={cancelUpload}
              className="shrink-0 rounded-full min-w-20"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>

          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span>Uploading</span>
            <span className="mx-1 animate-pulse">...</span>
          </div>
        </div>
      )}
    </div>
  );
}