import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, Share2 } from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { useLocation } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length !== 1) {
      toast({
        title: "Error",
        description: "Please upload one file at a time",
        variant: "destructive",
      });
      return;
    }

    const file = acceptedFiles[0];
    setUploading(true);
    setProgress(0);

    try {
      const shareId = await uploadFile(file, (progress) => {
        setProgress(progress);
      });

      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });

      setLocation(`/download/${shareId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [toast, setLocation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
    maxFiles: 1,
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"}
              ${uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Upload Files</h2>
            <p className="text-muted-foreground mb-4">
              Drag & drop files here, or click to select
            </p>
            <Button disabled={uploading}>
              Select File
            </Button>
          </div>

          {uploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
