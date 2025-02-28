import { type File, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createFile(file: InsertFile): Promise<File>;
  getFile(shareId: string): Promise<File | undefined>;
  saveChunk(shareId: string, chunkIndex: number, data: Buffer): Promise<void>;
  getChunk(shareId: string, chunkIndex: number): Promise<Buffer | undefined>;
}

export class MemStorage implements IStorage {
  private files: Map<number, File>;
  private chunks: Map<string, Buffer[]>;
  private currentId: number;

  constructor() {
    this.files = new Map();
    this.chunks = new Map();
    this.currentId = 1;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentId++;
    const file: File = { ...insertFile, id };
    this.files.set(id, file);
    this.chunks.set(file.shareId, new Array(file.chunks));
    return file;
  }

  async getFile(shareId: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.shareId === shareId
    );
  }

  async saveChunk(shareId: string, chunkIndex: number, data: Buffer): Promise<void> {
    const chunks = this.chunks.get(shareId);
    if (!chunks) throw new Error("File not found");
    chunks[chunkIndex] = data;
  }

  async getChunk(shareId: string, chunkIndex: number): Promise<Buffer | undefined> {
    const chunks = this.chunks.get(shareId);
    if (!chunks) return undefined;
    return chunks[chunkIndex];
  }
}

export const storage = new MemStorage();
