// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
var EnhancedS3Storage = class {
  files;
  s3Client;
  bucketName;
  tempUploadDir;
  isS3Configured;
  constructor(bucketName, uploadDir = "./uploads") {
    this.files = /* @__PURE__ */ new Map();
    this.tempUploadDir = uploadDir;
    this.isS3Configured = false;
    this.s3Client = null;
    this.logEnvironmentConfiguration();
    this.bucketName = this.validateAndGetBucketName(bucketName);
    this.configureS3Client();
    this.ensureUploadDirectoryExists();
  }
  logEnvironmentConfiguration() {
    console.log("S3 Storage Configuration:");
    console.log("----------------------------");
    console.log("AWS_S3_BUCKET_NAME:", process.env.AWS_S3_BUCKET_NAME || "Not set");
    console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "[REDACTED]" : "Not set");
    console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "[REDACTED]" : "Not set");
    console.log("AWS_REGION:", process.env.AWS_REGION || "Default (us-east-1)");
    console.log("----------------------------");
  }
  validateAndGetBucketName(bucketName) {
    if (!process.env.AWS_S3_BUCKET_NAME && !bucketName) {
      console.warn("No S3 bucket name provided. Falling back to local storage.");
      return "local-storage";
    }
    return bucketName || process.env.AWS_S3_BUCKET_NAME;
  }
  configureS3Client() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || "us-east-1";
    if (!accessKeyId || !secretAccessKey) {
      console.warn("AWS credentials incomplete. Falling back to local storage.");
      console.warn(
        "Missing:",
        !accessKeyId ? "Access Key ID" : "",
        !secretAccessKey ? "Secret Access Key" : ""
      );
      return;
    }
    try {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey
        }
      });
      this.isS3Configured = true;
      console.log("S3 Client successfully configured");
    } catch (error) {
      console.error("Failed to configure S3 Client:", error);
      this.isS3Configured = false;
    }
  }
  ensureUploadDirectoryExists() {
    if (!fs.existsSync(this.tempUploadDir)) {
      try {
        fs.mkdirSync(this.tempUploadDir, { recursive: true });
        console.log(`Created upload directory: ${this.tempUploadDir}`);
      } catch (error) {
        console.error("Failed to create upload directory:", error);
      }
    }
  }
  getChunkPath(shareId, chunkIndex) {
    return path.join(this.tempUploadDir, `${shareId}_chunk_${chunkIndex}`);
  }
  async createFile(insertFile) {
    const file = {
      ...insertFile,
      id: Date.now(),
      uploadedAt: /* @__PURE__ */ new Date(),
      status: "uploading",
      multipartUploadId: void 0
    };
    if (this.isS3Configured && this.s3Client) {
      try {
        const multipartUpload = await this.s3Client.send(
          new CreateMultipartUploadCommand({
            Bucket: this.bucketName,
            Key: `uploads/${file.shareId}/${file.name}`
          })
        );
        file.multipartUploadId = multipartUpload.UploadId;
        console.log(`Multipart upload initiated for file: ${file.name}`);
      } catch (error) {
        console.error("Failed to create multipart upload:", error);
        this.isS3Configured = false;
      }
    }
    this.files.set(file.shareId, file);
    return file;
  }
  async getFile(shareId) {
    return this.files.get(shareId);
  }
  async saveChunk(shareId, chunkIndex, data) {
    const file = this.files.get(shareId);
    if (!file) throw new Error("File not found");
    const chunkPath = this.getChunkPath(shareId, chunkIndex);
    try {
      await fs.promises.writeFile(chunkPath, data);
      console.log(`Saved local chunk ${chunkIndex} for file ${shareId}`);
    } catch (error) {
      console.error(`Failed to save local chunk ${chunkIndex}:`, error);
      throw error;
    }
    if (this.isS3Configured && this.s3Client && file.multipartUploadId) {
      try {
        await this.s3Client.send(
          new UploadPartCommand({
            Bucket: this.bucketName,
            Key: `uploads/${shareId}/${file.name}`,
            PartNumber: chunkIndex + 1,
            UploadId: file.multipartUploadId,
            Body: data
          })
        );
        console.log(`Uploaded chunk ${chunkIndex} to S3 for file ${shareId}`);
      } catch (error) {
        console.error(`Failed to upload chunk ${chunkIndex} to S3:`, error);
        this.isS3Configured = false;
      }
    }
  }
  async getChunk(shareId, chunkIndex) {
    const file = this.files.get(shareId);
    if (!file) return void 0;
    const chunkPath = this.getChunkPath(shareId, chunkIndex);
    try {
      return await fs.promises.readFile(chunkPath);
    } catch {
      return void 0;
    }
  }
  async assembleFile(shareId) {
    const file = this.files.get(shareId);
    if (!file) return void 0;
    if (this.isS3Configured && this.s3Client && file.multipartUploadId) {
      try {
        await this.s3Client.send(
          new CompleteMultipartUploadCommand({
            Bucket: this.bucketName,
            Key: `uploads/${shareId}/${file.name}`,
            UploadId: file.multipartUploadId,
            MultipartUpload: {
              Parts: Array.from({ length: file.chunks }, (_, i) => ({
                PartNumber: i + 1,
                ETag: ""
                // Placeholder - in real implementation, track ETags
              }))
            }
          })
        );
        file.status = "completed";
        file.storagePath = `s3://${this.bucketName}/uploads/${shareId}/${file.name}`;
        console.log(`Successfully assembled file in S3: ${file.name}`);
        return file.storagePath;
      } catch (error) {
        console.error("File assembly in S3 failed:", error);
        this.isS3Configured = false;
      }
    }
    const outputPath = path.join(this.tempUploadDir, `${shareId}_${file.name}`);
    const writeStream = fs.createWriteStream(outputPath);
    try {
      for (let i = 0; i < file.chunks; i++) {
        const chunkPath = this.getChunkPath(shareId, i);
        const chunkData = await fs.promises.readFile(chunkPath);
        writeStream.write(chunkData);
      }
      writeStream.end();
      file.status = "completed";
      file.storagePath = outputPath;
      console.log(`Successfully assembled file locally: ${file.name}`);
      return outputPath;
    } catch (error) {
      console.error("Local file assembly failed:", error);
      file.status = "failed";
      return void 0;
    }
  }
  async cleanupFile(shareId) {
    const file = this.files.get(shareId);
    if (!file) return;
    for (let i = 0; i < file.chunks; i++) {
      const chunkPath = this.getChunkPath(shareId, i);
      try {
        await fs.promises.unlink(chunkPath);
        console.log(`Deleted local chunk file: ${chunkPath}`);
      } catch (error) {
        console.warn(`Failed to delete chunk file ${chunkPath}:`, error);
      }
    }
    this.files.delete(shareId);
    console.log(`Cleaned up file with shareId: ${shareId}`);
  }
};
var storage = new EnhancedS3Storage();

// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  shareId: text("share_id").notNull().unique(),
  chunks: integer("chunks").notNull(),
  multipartUploadId: text("multipart_upload_id"),
  storagePath: text("storage_path"),
  status: text("status", {
    enum: ["uploading", "completed", "failed", "pending"]
  }).default("pending"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  completedAt: timestamp("completed_at")
});
var insertFileSchema = createInsertSchema(files).pick({
  name: true,
  size: true,
  mimeType: true,
  shareId: true,
  chunks: true,
  multipartUploadId: true,
  storagePath: true,
  status: true,
  uploadedAt: true,
  completedAt: true
});
var MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024;
var CHUNK_SIZE = 5 * 1024 * 1024;
var fileUploadSchema = z.object({
  name: z.string().min(1, "File name is required"),
  size: z.number().min(1, "File size must be greater than 0").max(MAX_FILE_SIZE, "File size exceeds maximum limit"),
  mimeType: z.string().optional().default("application/octet-stream"),
  chunks: z.number().min(1, "At least one chunk is required")
});

// server/routes.ts
import { randomUUID } from "crypto";
async function registerRoutes(app2) {
  app2.post("/api/files", async (req, res) => {
    try {
      const { name, size, mimeType, chunks } = req.body;
      console.log("Received file data:", req.body);
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
  app2.post("/api/files/:shareId/chunks/:index", async (req, res) => {
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
      const chunks = [];
      req.on("data", (chunk) => {
        chunks.push(chunk);
      });
      req.on("end", async () => {
        const buffer = Buffer.concat(chunks);
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
  app2.post("/api/files/:shareId/complete", async (req, res) => {
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
  app2.get("/api/files/:shareId", async (req, res) => {
    const { shareId } = req.params;
    const file = await storage.getFile(shareId);
    if (!file) return res.status(404).json({ message: "File not found" });
    res.json(file);
  });
  app2.get("/api/files/:shareId/chunks/:index", async (req, res) => {
    const { shareId, index } = req.params;
    const chunkIndex = parseInt(index);
    const file = await storage.getFile(shareId);
    if (!file) return res.status(404).json({ message: "Chunk not found" });
    const chunk = await storage.getChunk(shareId, chunkIndex);
    if (!chunk) return res.status(404).json({ message: "Chunk not found" });
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(chunk);
  });
  app2.delete("/api/files/:shareId", async (req, res) => {
    const { shareId } = req.params;
    try {
      await storage.cleanupFile(shareId);
      res.json({ message: "File cleanup complete" });
    } catch (error) {
      console.error("File cleanup error:", error);
      res.status(500).json({ message: "Cleanup failed" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Remove themePlugin(), 
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "client", "src"),
      "@shared": path2.resolve(__dirname, "shared")
    }
  },
  root: path2.resolve(__dirname, "client"),
  build: {
    outDir: path2.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname2, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import bodyParser from "body-parser";
var app = express2();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: true
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
  if ("OPTIONS" === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 3e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
