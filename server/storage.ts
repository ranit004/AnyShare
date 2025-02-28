import { files, type File, type InsertFile } from "@shared/schema";
import crypto from "crypto";

export interface IStorage {
  createFile(file: InsertFile): Promise<File>;
  getFileByShareId(shareId: string): Promise<File | undefined>;
  saveChunk(shareId: string, chunkIndex: number, data: Buffer): Promise<void>;
  getChunk(shareId: string, chunkIndex: number): Promise<Buffer | undefined>;
  deleteExpiredFiles(): Promise<void>;
}

export class MemStorage implements IStorage {
  private files: Map<number, File>;
  private chunks: Map<string, Map<number, Buffer>>;
  currentId: number;

  constructor() {
    this.files = new Map();
    this.chunks = new Map();
    this.currentId = 1;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentId++;
    const file: File = { ...insertFile, id, uploadDate: new Date() };
    this.files.set(id, file);
    this.chunks.set(file.shareId, new Map());
    return file;
  }

  async getFileByShareId(shareId: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.shareId === shareId,
    );
  }

  async saveChunk(shareId: string, chunkIndex: number, data: Buffer): Promise<void> {
    const fileChunks = this.chunks.get(shareId);
    if (!fileChunks) {
      throw new Error("File not found");
    }
    fileChunks.set(chunkIndex, data);
  }

  async getChunk(shareId: string, chunkIndex: number): Promise<Buffer | undefined> {
    const fileChunks = this.chunks.get(shareId);
    if (!fileChunks) {
      return undefined;
    }
    return fileChunks.get(chunkIndex);
  }

  async deleteExpiredFiles(): Promise<void> {
    const now = new Date();
    const expiredFiles = Array.from(this.files.values()).filter(
      (file) => file.expiryDate < now
    );
    
    for (const file of expiredFiles) {
      this.files.delete(file.id);
      this.chunks.delete(file.shareId);
    }
  }
}

export const storage = new MemStorage();

// Run cleanup every hour
setInterval(() => {
  storage.deleteExpiredFiles().catch(console.error);
}, 60 * 60 * 1000);
