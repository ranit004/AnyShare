import axios from "axios";
import { insertFileSchema, type InsertFile } from "@shared/schema";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export async function uploadFile(
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  // Create file entry
  const fileData: InsertFile = {
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    chunks: Math.ceil(file.size / CHUNK_SIZE),
    shareId: "", // Will be set by server
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };

  const { data: createdFile } = await axios.post("/api/files", fileData);

  // Upload chunks
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedChunks = 0;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("chunk", chunk);

    await axios.post(
      `/api/files/${createdFile.shareId}/chunks/${i}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    uploadedChunks++;
    onProgress((uploadedChunks / totalChunks) * 100);
  }

  return createdFile.shareId;
}
