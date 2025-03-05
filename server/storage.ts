// server/storage.ts
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { type File, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface IStorage {
  createFile(file: InsertFile): Promise<File>;
  getFile(shareId: string): Promise<File | undefined>;
  saveChunk(shareId: string, chunkIndex: number, data: Buffer): Promise<void>;
  getChunk(shareId: string, chunkIndex: number): Promise<Buffer | undefined>;
  assembleFile(shareId: string): Promise<string | undefined>;
  cleanupFile(shareId: string): Promise<void>;
}

export class EnhancedS3Storage implements IStorage {
  private files: Map<string, File>;
  private s3Client: S3Client | null;
  private bucketName: string;
  private tempUploadDir: string;
  private isS3Configured: boolean;

  constructor(
    bucketName?: string, 
    uploadDir = './uploads'
  ) {
    this.files = new Map();
    this.tempUploadDir = uploadDir;
    this.isS3Configured = false;
    this.s3Client = null;

    // Comprehensive logging for debugging
    this.logEnvironmentConfiguration();

    // Validate and set bucket name
    this.bucketName = this.validateAndGetBucketName(bucketName);

    // Configure S3 Client
    this.configureS3Client();

    // Ensure upload directory exists
    this.ensureUploadDirectoryExists();
  }

  private logEnvironmentConfiguration() {
    console.log('S3 Storage Configuration:');
    console.log('----------------------------');
    console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME || 'Not set');
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '[REDACTED]' : 'Not set');
    console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '[REDACTED]' : 'Not set');
    console.log('AWS_REGION:', process.env.AWS_REGION || 'Default (us-east-1)');
    console.log('----------------------------');
  }

  private validateAndGetBucketName(bucketName?: string): string {
    if (!process.env.AWS_S3_BUCKET_NAME && !bucketName) {
      console.warn('No S3 bucket name provided. Falling back to local storage.');
      return 'local-storage';
    }
    return bucketName || process.env.AWS_S3_BUCKET_NAME!;
  }

  private configureS3Client() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKeyId || !secretAccessKey) {
      console.warn('AWS credentials incomplete. Falling back to local storage.');
      console.warn('Missing:', 
        !accessKeyId ? 'Access Key ID' : '', 
        !secretAccessKey ? 'Secret Access Key' : ''
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
      console.log('S3 Client successfully configured');
    } catch (error) {
      console.error('Failed to configure S3 Client:', error);
      this.isS3Configured = false;
    }
  }

  private ensureUploadDirectoryExists() {
    if (!fs.existsSync(this.tempUploadDir)) {
      try {
        fs.mkdirSync(this.tempUploadDir, { recursive: true });
        console.log(`Created upload directory: ${this.tempUploadDir}`);
      } catch (error) {
        console.error('Failed to create upload directory:', error);
      }
    }
  }

  private getChunkPath(shareId: string, chunkIndex: number): string {
    return path.join(this.tempUploadDir, `${shareId}_chunk_${chunkIndex}`);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const file: File = {
      ...insertFile,
      id: Date.now(),
      uploadedAt: new Date(),
      status: 'uploading',
      multipartUploadId: undefined
    };

    // Only attempt S3 upload if fully configured
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
        console.error('Failed to create multipart upload:', error);
        // Fall back to local storage behavior
        this.isS3Configured = false;
      }
    }

    this.files.set(file.shareId, file);
    return file;
  }

  async getFile(shareId: string): Promise<File | undefined> {
    return this.files.get(shareId);
  }

  async saveChunk(shareId: string, chunkIndex: number, data: Buffer): Promise<void> {
    const file = this.files.get(shareId);
    if (!file) throw new Error("File not found");

    const chunkPath = this.getChunkPath(shareId, chunkIndex);

    // Always save chunk locally
    try {
      await fs.promises.writeFile(chunkPath, data);
      console.log(`Saved local chunk ${chunkIndex} for file ${shareId}`);
    } catch (error) {
      console.error(`Failed to save local chunk ${chunkIndex}:`, error);
      throw error;
    }

    // Only attempt S3 upload if fully configured
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
        // Fallback to local storage
        this.isS3Configured = false;
      }
    }
  }

  async getChunk(shareId: string, chunkIndex: number): Promise<Buffer | undefined> {
    const file = this.files.get(shareId);
    if (!file) return undefined;

    const chunkPath = this.getChunkPath(shareId, chunkIndex);

    try {
      return await fs.promises.readFile(chunkPath);
    } catch {
      return undefined;
    }
  }

  async assembleFile(shareId: string): Promise<string | undefined> {
    const file = this.files.get(shareId);
    if (!file) return undefined;

    // If S3 is configured and multipart upload was initiated
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
                ETag: '' // Placeholder - in real implementation, track ETags
              }))
            }
          })
        );

        // Update file status
        file.status = 'completed';
        file.storagePath = `s3://${this.bucketName}/uploads/${shareId}/${file.name}`;

        console.log(`Successfully assembled file in S3: ${file.name}`);
        return file.storagePath;
      } catch (error) {
        console.error('File assembly in S3 failed:', error);
        // Fallback to local storage behavior
        this.isS3Configured = false;
      }
    }

    // Local storage fallback
    const outputPath = path.join(this.tempUploadDir, `${shareId}_${file.name}`);
    const writeStream = fs.createWriteStream(outputPath);

    try {
      for (let i = 0; i < file.chunks; i++) {
        const chunkPath = this.getChunkPath(shareId, i);
        const chunkData = await fs.promises.readFile(chunkPath);
        writeStream.write(chunkData);
      }

      writeStream.end();

      // Update file status
      file.status = 'completed';
      file.storagePath = outputPath;

      console.log(`Successfully assembled file locally: ${file.name}`);
      return outputPath;
    } catch (error) {
      console.error('Local file assembly failed:', error);
      file.status = 'failed';
      return undefined;
    }
  }

  async cleanupFile(shareId: string): Promise<void> {
    const file = this.files.get(shareId);
    if (!file) return;

    // Remove local chunk files
    for (let i = 0; i < file.chunks; i++) {
      const chunkPath = this.getChunkPath(shareId, i);
      try {
        await fs.promises.unlink(chunkPath);
        console.log(`Deleted local chunk file: ${chunkPath}`);
      } catch (error) {
        console.warn(`Failed to delete chunk file ${chunkPath}:`, error);
      }
    }

    // Remove from in-memory storage
    this.files.delete(shareId);
    console.log(`Cleaned up file with shareId: ${shareId}`);
  }
}

// Create storage instance with fallback mechanism
export const storage = new EnhancedS3Storage();