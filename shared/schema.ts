import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  shareId: text("share_id").notNull().unique(),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date").notNull(),
  chunks: integer("chunks").notNull(),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadDate: true,
});

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export const chunkSchema = z.object({
  chunk: z.instanceof(Blob),
  index: z.number().int().min(0),
  shareId: z.string(),
});
