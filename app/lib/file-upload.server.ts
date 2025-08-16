import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = join(process.cwd(), "public", "users", "uploads", "avatars");

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists, ignore error
  }
}

// Validate file type
function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

// Get file extension from MIME type
function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };
  return extensions[mimeType] || 'jpg';
}

export async function uploadAvatar(file: File): Promise<string> {
  // Validate file type
  if (!isValidImageType(file)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('File too large. Please upload an image smaller than 5MB.');
  }

  // Ensure upload directory exists
  await ensureUploadDir();

  // Generate unique filename
  const fileExtension = getFileExtension(file.type);
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = join(UPLOAD_DIR, fileName);

  // Convert file to buffer and save
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  await writeFile(filePath, buffer);

  // Return public URL path
  return `/users/uploads/avatars/${fileName}`;
}