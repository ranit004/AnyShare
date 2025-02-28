import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  shareId: text("share_id").notNull().unique(),
  chunks: integer("chunks").notNull(),
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  size: true,
  mimeType: true,
  shareId: true,
  chunks: true,
});

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
