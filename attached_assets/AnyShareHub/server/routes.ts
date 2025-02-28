import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { CHUNK_SIZE, MAX_FILE_SIZE, insertFileSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/files", async (req, res) => {
    const { name, size, mimeType } = req.body;

    if (size > MAX_FILE_SIZE) {
      return res.status(400).json({ message: "File too large" });
    }

    const chunks = Math.ceil(size / CHUNK_SIZE);
    const shareId = randomUUID();

    const file = await storage.createFile({
      name,
      size,
      mimeType,
      shareId,
      chunks
    });

    res.json(file);
  });

  app.post("/api/files/:shareId/chunks/:index", async (req, res) => {
    const { shareId, index } = req.params;
    const chunkIndex = parseInt(index);

    const file = await storage.getFile(shareId);
    if (!file) return res.status(404).json({ message: "File not found" });

    if (chunkIndex >= file.chunks) {
      return res.status(400).json({ message: "Invalid chunk index" });
    }

    // Handle raw binary data
    const chunks: Buffer[] = [];
    req.on('data', chunk => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      await storage.saveChunk(shareId, chunkIndex, buffer);
      res.json({ success: true });
    });
  });

  app.get("/api/files/:shareId", async (req, res) => {
    const { shareId } = req.params;
    const file = await storage.getFile(shareId);
    if (!file) return res.status(404).json({ message: "File not found" });
    res.json(file);
  });

  app.get("/api/files/:shareId/chunks/:index", async (req, res) => {
    const { shareId, index } = req.params;
    const chunkIndex = parseInt(index);

    const file = await storage.getFile(shareId);
    if (!file) return res.status(404).json({ message: "Chunk not found" });

    const chunk = await storage.getChunk(shareId, chunkIndex);
    if (!chunk) return res.status(404).json({ message: "Chunk not found" });

    // Set proper content type for binary data
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(chunk);
  });

  const httpServer = createServer(app);
  return httpServer;
}