import { randomUUID } from "crypto";
import type { Response } from "express";

// Object storage service for 0G Social platform
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
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Object storage bucket not configured properly."
      );
    }
    return paths;
  }

  // Gets the private object directory.
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Object storage bucket not configured properly."
      );
    }
    return dir;
  }

  // Gets the upload URL for an object entity.
  async getObjectEntityUploadURL(): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;

    // Parse the bucket and object path
    const { bucketName, objectName } = this.parseObjectPath(fullPath);

    // Generate signed URL for uploading
    return await this.signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900, // 15 minutes
    });
  }

  // Downloads an object to the response with enhanced CORS and direct serving
  async downloadObject(file: any, res: Response, cacheTtlSec: number = 3600) {
    try {
      if (!file || !file.url) {
        console.error("[OBJECT STORAGE] File not found - no URL provided");
        return res.status(404).json({ error: "File not found" });
      }

      console.log(`[OBJECT STORAGE] Fetching file from: ${file.url}`);

      // Always use direct serving with proper CORS headers
      const response = await fetch(file.url);
      
      if (!response.ok) {
        console.error(`[OBJECT STORAGE] Failed to fetch: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ error: "Failed to fetch file from storage" });
      }

      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      console.log(`[OBJECT STORAGE] ✅ Successfully fetched ${buffer.byteLength} bytes, type: ${contentType}`);

      // Set comprehensive headers for proper serving and aggressive caching
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', buffer.byteLength.toString());
      res.setHeader('Cache-Control', `public, max-age=${cacheTtlSec}, immutable`);
      res.setHeader('ETag', `"${Date.now()}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      
      res.send(Buffer.from(buffer));
      
    } catch (error) {
      console.error(`[OBJECT STORAGE] ❌ Error downloading file:`, error);
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

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      return null;
    }

    const entityId = parts.slice(1).join("/");
    
    // Extract bucket name from PRIVATE_OBJECT_DIR
    // Format: /replit-objstore-{id}/.private
    const privateDir = this.getPrivateObjectDir();
    const bucketName = privateDir.split('/')[1]; // Extract bucket from path
    const objectName = entityId; // entityId is already ".private/filename"

    // Return file object
    return {
      name: objectName,
      bucketName,
      exists: true,
      url: await this.signObjectURL({
        bucketName,
        objectName,
        method: "GET",
        ttlSec: 3600,
      }),
    };
  }

  // Normalize object entity path from upload URL
  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("https://")) {
      return rawPath;
    }

    // Extract object path from signed URL
    try {
      const url = new URL(rawPath);
      const pathParts = url.pathname.split("/");
      
      // For signed URLs, extract the object path
      if (pathParts.length >= 3) {
        const bucketName = pathParts[1];
        const objectName = pathParts.slice(2).join("/");
        
        // Check if this is in our private directory
        const privateDir = this.getPrivateObjectDir();
        const expectedPath = `/${bucketName}/${objectName}`;
        
        if (expectedPath.startsWith(privateDir)) {
          // Keep the full object name without removing uploads/ prefix
          return `/objects/${objectName}`;
        }
      }
      
      return rawPath;
    } catch (error) {
      console.error("Error normalizing object path:", error);
      return rawPath;
    }
  }

  // Parse object path into bucket and object name
  private parseObjectPath(path: string): { bucketName: string; objectName: string } {
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    
    const pathParts = path.split("/");
    if (pathParts.length < 3) {
      throw new Error("Invalid path: must contain at least a bucket name");
    }

    const bucketName = pathParts[1];
    const objectName = pathParts.slice(2).join("/");

    return { bucketName, objectName };
  }

  // Sign object URL for upload/download
  private async signObjectURL({
    bucketName,
    objectName,
    method,
    ttlSec,
  }: {
    bucketName: string;
    objectName: string;
    method: "GET" | "PUT" | "DELETE" | "HEAD";
    ttlSec: number;
  }): Promise<string> {
    // Use environment-aware sidecar endpoint
    const SIDECAR_ENDPOINT = process.env.SIDECAR_ENDPOINT || 
      (process.env.NODE_ENV === 'production' ? 'http://38.96.255.34:1106' : 'http://127.0.0.1:1106');
    
    const request = {
      bucket_name: bucketName,
      object_name: objectName,
      method,
      expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    };

    try {
      const response = await fetch(
        `${SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to sign object URL: ${response.status}`);
      }

      const { signed_url: signedURL } = await response.json();
      return signedURL;
    } catch (error) {
      console.error("Error signing object URL:", error);
      throw new Error("Failed to generate signed URL for object storage");
    }
  }
}

// Custom error class for object storage errors
export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}