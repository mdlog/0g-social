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

  // Downloads an object to the response.
  async downloadObject(file: any, res: Response, cacheTtlSec: number = 3600) {
    try {
      // Set appropriate headers for object storage
      res.set({
        "Content-Type": file.contentType || "application/octet-stream",
        "Content-Length": file.size || "",
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });

      // For now, return a redirect to the actual object storage URL
      // In a full implementation, this would stream the file content
      if (file.url) {
        res.redirect(file.url);
      } else {
        res.status(404).json({ error: "File not found" });
      }
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

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      return null;
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = this.parseObjectPath(objectEntityPath);

    // Return mock file object for now
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
          const entityId = objectName.replace("uploads/", "");
          return `/objects/${entityId}`;
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
    const SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
    
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