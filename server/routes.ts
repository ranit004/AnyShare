// server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { CHUNK_SIZE, MAX_FILE_SIZE } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from 'fs';

export async function registerRoutes(app: Express): Promise<Server> {
  // File creation endpoint
  app.post("/api/files", async (req, res) => {
    try {
      const { name, size, mimeType, chunks } = req.body;
      console.log("Received file data:", req.body);

      // Validate file size
      if (size > MAX_FILE_SIZE) {
        return res.status(400).json({ message: "File too large" });
      }

      const shareId = randomUUID();
      const file = await storage.createFile({
        name,
        size,
        mimeType,
        shareId,
        chunks
      });

      console.log("Created file:", file);
      res.json(file);
    } catch (error) {
      console.error("File creation error:", error);
      res.status(400).json({ message: "Invalid file data" });
    }
  });

  // Chunk upload endpoint with improved error handling
  app.post("/api/files/:shareId/chunks/:index", async (req, res) => {
    const { shareId, index } = req.params;
    const chunkIndex = parseInt(index);

    try {
      const file = await storage.getFile(shareId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (chunkIndex >= file.chunks) {
        return res.status(400).json({ message: "Invalid chunk index" });
      }

      // Stream chunk data to avoid memory issues
      const chunks: Buffer[] = [];
      req.on('data', chunk => {
        chunks.push(chunk);
      });

      req.on('end', async () => {
        const buffer = Buffer.concat(chunks);

        // Validate chunk size
        if (buffer.length > CHUNK_SIZE) {
          return res.status(400).json({ message: "Chunk too large" });
        }

        await storage.saveChunk(shareId, chunkIndex, buffer);
        res.json({ success: true });
      });

    } catch (error) {
      console.error("Chunk upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // File completion endpoint
  app.post("/api/files/:shareId/complete", async (req, res) => {
    const { shareId } = req.params;

    try {
      const file = await storage.getFile(shareId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      const assembledFilePath = await storage.assembleFile(shareId);
      
      if (!assembledFilePath) {
        return res.status(500).json({ message: "Failed to assemble file" });
      }

      res.json({ 
        message: "File upload complete", 
        filePath: assembledFilePath 
      });
    } catch (error) {
      console.error("File completion error:", error);
      res.status(500).json({ message: "File assembly failed" });
    }
  });

  // Retrieve file metadata
  app.get("/api/files/:shareId", async (req, res) => {
    const { shareId } = req.params;
    const file = await storage.getFile(shareId);
    if (!file) return res.status(404).json({ message: "File not found" });
    res.json(file);
  });

  // Retrieve specific chunk
  app.get("/api/files/:shareId/chunks/:index", async (req, res) => {
    const { shareId, index } = req.params;
    const chunkIndex = parseInt(index);

    const file = await storage.getFile(shareId);
    if (!file) return res.status(404).json({ message: "Chunk not found" });

    const chunk = await storage.getChunk(shareId, chunkIndex);
    if (!chunk) return res.status(404).json({ message: "Chunk not found" });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(chunk);
  });

  // File cleanup endpoint
  app.delete("/api/files/:shareId", async (req, res) => {
    const { shareId } = req.params;

    try {
      await storage.cleanupFile(shareId);
      res.json({ message: "File cleanup complete" });
    } catch (error) {
      console.error("File cleanup error:", error);
      res.status(500).json({ message: "Cleanup failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}