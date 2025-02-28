import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFileSchema, chunkSchema } from "@shared/schema";
import multer from "multer";
import crypto from "crypto";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize file upload
  app.post("/api/files", async (req, res) => {
    try {
      const fileData = insertFileSchema.parse({
        ...req.body,
        shareId: crypto.randomBytes(16).toString("hex"),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      const file = await storage.createFile(fileData);
      res.json(file);
    } catch (error) {
      res.status(400).json({ error: "Invalid file data" });
    }
  });

  // Upload chunk
  app.post("/api/files/:shareId/chunks/:index", upload.single("chunk"), async (req, res) => {
    try {
      const { shareId, index } = req.params;
      const chunkIndex = parseInt(index, 10);
      
      if (!req.file?.buffer) {
        throw new Error("No chunk data provided");
      }

      const file = await storage.getFileByShareId(shareId);
      if (!file) {
        throw new Error("File not found");
      }

      await storage.saveChunk(shareId, chunkIndex, req.file.buffer);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to save chunk" });
    }
  });

  // Download chunk
  app.get("/api/files/:shareId/chunks/:index", async (req, res) => {
    try {
      const { shareId, index } = req.params;
      const chunkIndex = parseInt(index, 10);

      const file = await storage.getFileByShareId(shareId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      const chunk = await storage.getChunk(shareId, chunkIndex);
      if (!chunk) {
        return res.status(404).json({ error: "Chunk not found" });
      }

      res.set("Content-Type", file.mimeType);
      res.send(chunk);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve chunk" });
    }
  });

  // Get file metadata
  app.get("/api/files/:shareId", async (req, res) => {
    try {
      const { shareId } = req.params;
      const file = await storage.getFileByShareId(shareId);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to get file info" });
    }
  });

  return httpServer;
}
