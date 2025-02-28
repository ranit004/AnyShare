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

  const res = await apiRequest("POST", "/api/files", fileData);
  const createdFile = await res.json();

  // Upload chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedChunks = 0;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    await apiRequest(
      "POST",
      `/api/files/${createdFile.shareId}/chunks/${i}`,
      chunk,
    );

    uploadedChunks++;
    onProgress((uploadedChunks / totalChunks) * 100);
  }

  return createdFile.shareId;
}