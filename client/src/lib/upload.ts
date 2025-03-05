import { apiRequest } from "./queryClient";
import { CHUNK_SIZE, type InsertFile } from "@shared/schema";

export async function uploadFile(
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  // Create file entry with only required fields
  const fileData = {
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    chunks: Math.ceil(file.size / CHUNK_SIZE)
  };

  // First, create the file entry in our database
  const res = await apiRequest("POST", "/api/files", fileData);
  const createdFile = await res.json();

  // Upload chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedChunks = 0;

  // Get presigned URLs for each chunk
  const presignedUrlsRes = await apiRequest(
    "GET", 
    `/api/files/${createdFile.shareId}/presigned-urls`
  );
  const presignedUrls = await presignedUrlsRes.json();

  // Upload each chunk directly to S3 using presigned URLs
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    // Use the presigned URL to upload the chunk directly to S3
    const s3UploadRes = await fetch(presignedUrls[i], {
      method: 'PUT',
      body: chunk,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': chunk.size.toString()
      }
    });

    if (!s3UploadRes.ok) {
      throw new Error(`Failed to upload chunk ${i}`);
    }

    // Optionally, notify backend about successful chunk upload
    await apiRequest(
      "POST",
      `/api/files/${createdFile.shareId}/chunks/${i}/confirm`
    );

    uploadedChunks++;
    onProgress((uploadedChunks / totalChunks) * 100);
  }

  return createdFile.shareId;
}