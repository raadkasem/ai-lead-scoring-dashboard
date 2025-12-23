import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed');
const CURRENT_FILE = path.join(DATA_DIR, 'current.json');

// Ensure directories exist
export function ensureDirectories(): void {
  [DATA_DIR, UPLOADS_DIR, PROCESSED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Generate timestamp-based filename
export function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString()
    .replace(/[-:]/g, '')
    .replace(/T/, '_')
    .replace(/\..+/, '');
}

// Save uploaded Excel file
export function saveUploadedFile(buffer: Buffer, originalName: string): string {
  ensureDirectories();
  const timestamp = generateTimestamp();
  const ext = path.extname(originalName);
  const filename = `upload_${timestamp}${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return filename;
}

// Save processed JSON
export function saveProcessedJson(data: unknown, timestamp: string): string {
  ensureDirectories();
  const filename = `leads_${timestamp}.json`;
  const filepath = path.join(PROCESSED_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  return filename;
}

// Set as current active dataset
export function setCurrentData(data: unknown): void {
  ensureDirectories();
  fs.writeFileSync(CURRENT_FILE, JSON.stringify(data, null, 2));
}

// Get current active dataset
export function getCurrentData<T>(): T | null {
  try {
    if (fs.existsSync(CURRENT_FILE)) {
      const content = fs.readFileSync(CURRENT_FILE, 'utf-8');
      return JSON.parse(content) as T;
    }
    // Fallback to legacy leads.json
    const legacyFile = path.join(DATA_DIR, 'leads.json');
    if (fs.existsSync(legacyFile)) {
      const content = fs.readFileSync(legacyFile, 'utf-8');
      return JSON.parse(content) as T;
    }
    return null;
  } catch {
    return null;
  }
}

// List all uploaded files
export function listUploadedFiles(): string[] {
  ensureDirectories();
  return fs.readdirSync(UPLOADS_DIR)
    .filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'))
    .sort()
    .reverse();
}

// List all processed files
export function listProcessedFiles(): string[] {
  ensureDirectories();
  return fs.readdirSync(PROCESSED_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();
}

// Get file info
export interface FileInfo {
  name: string;
  size: number;
  created: Date;
}

export function getFileInfo(dir: 'uploads' | 'processed', filename: string): FileInfo | null {
  const dirPath = dir === 'uploads' ? UPLOADS_DIR : PROCESSED_DIR;
  const filepath = path.join(dirPath, filename);

  try {
    const stats = fs.statSync(filepath);
    return {
      name: filename,
      size: stats.size,
      created: stats.birthtime,
    };
  } catch {
    return null;
  }
}
