// shared/schema.ts
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  shareId: text("share_id").notNull().unique(),
  chunks: integer("chunks").notNull(),
  multipartUploadId: text("multipart_upload_id"),
  storagePath: text("storage_path"),
  status: text("status", { 
    enum: ['uploading', 'completed', 'failed', 'pending'] 
  }).default('pending'),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  size: true,
  mimeType: true,
  shareId: true,
  chunks: true,
  multipartUploadId: true,
  storagePath: true,
  status: true,
  uploadedAt: true,
  completedAt: true,
});

export type InsertFile = z.infer<typeof insertFileSchema>
export type File = typeof files.$inferSelect;

export const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

// Validation schema for file upload
export const fileUploadSchema = z.object({
  name: z.string().min(1, "File name is required"),
  size: z.number().min(1, "File size must be greater than 0").max(MAX_FILE_SIZE, "File size exceeds maximum limit"),
  mimeType: z.string().optional().default("application/octet-stream"),
  chunks: z.number().min(1, "At least one chunk is required")
});