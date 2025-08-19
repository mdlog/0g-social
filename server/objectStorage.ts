import { randomUUID } from "crypto";
import type { Response } from "express";

// Mock object storage service for development
export class ObjectStorageService {
  constructor() {}

  // Gets the public object search paths.
  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      // Return mock path for development
      return ["/mock-bucket/public"];
    }
    return paths;
  }

  // Gets the private object directory.
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      // Return mock path for development
      return "/mock-bucket/.private";
    }
    return dir;
  }

  // Gets the upload URL for an object entity.
  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    
    // For development, return a mock upload URL
    // In production, this would return a signed URL to cloud storage
    return `https://mock-storage.example.com/upload/${objectId}`;
  }

  // Downloads an object to the response.
  async downloadObject(file: any, res: Response, cacheTtlSec: number = 3600) {
    try {
      // For development, return a placeholder image or handle mock file
      res.set({
        "Content-Type": "image/png",
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });

      // Return a simple response for development
      res.status(200).json({ message: "Mock file download" });
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  // Gets the object entity file from the object path.
  async getObjectEntityFile(objectPath: string): Promise<any | null> {
    if (!objectPath.startsWith("/objects/")) {
      return null;
    }

    // For development, return a mock file object
    return {
      name: objectPath,
      exists: true,
    };
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith("https://mock-storage.example.com/upload/")) {
      // Extract the object ID from the mock URL
      const objectId = rawPath.split("/").pop();
      return `/objects/uploads/${objectId}`;
    }
    
    return rawPath;
  }
}