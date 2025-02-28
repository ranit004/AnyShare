import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CHUNK_SIZE, MAX_FILE_SIZE } from "@shared/schema";
import ShareLink from "@/components/share-link";

export default function FileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareId, setShareId] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();

  const resetUpload = () => {
    setShareId(undefined);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadComplete(false);
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
      // Create file entry
      const res = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          mimeType: file.type,
        }),
      });

      if (!res.ok) throw new Error("Failed to create file");
      const fileData = await res.json();
      setShareId(fileData.shareId);

      // Upload chunks
      const chunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadedChunks = new Set<number>();

      for (let i = 0; i < chunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        let retries = 3;
        while (retries > 0) {
          try {
            const chunkRes = await fetch(`/api/files/${fileData.shareId}/chunks/${i}`, {
              method: "POST",
              body: chunk,
            });

            if (!chunkRes.ok) throw new Error(`Failed to upload chunk ${i}`);

            uploadedChunks.add(i);
            setUploadProgress((uploadedChunks.size / chunks) * 100);
            break; // Success, exit retry loop
          } catch (err) {
            retries--;
            if (retries === 0) {
              throw new Error(`Failed to upload chunk ${i} after multiple attempts`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          }
        }
      }

      // Verify all chunks were uploaded
      const allChunksUploaded = uploadedChunks.size === chunks;
      if (!allChunksUploaded) {
        throw new Error("Some chunks failed to upload");
      }

      setUploadComplete(true);
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      resetUpload();
    } finally {
      setIsUploading(false);
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
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragActive ? "border-primary" : "border-muted-foreground"}
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-black animate-pulse" />
          <p className="text-black font-semibold">
            {isUploading ? "Uploading..." : "Drag & drop a file here, or click to select"}
          </p>
        </div>
      </div>

      {uploadProgress > 0 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="animate-pulse" />
          <p className="text-sm text-center font-semibold text-black">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}
    </div>
  );
}