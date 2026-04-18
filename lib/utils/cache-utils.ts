import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "lib", "cache");

/**
 * Simple file-based cache for storing API data or translations.
 */
export class FileCache {
  private static ensureDir() {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  }

  static get(key: string): any | null {
    try {
      this.ensureDir();
      const filePath = path.join(CACHE_DIR, `${key}.json`);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        // Expire cache after 30 days
        const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
        if (ageInDays > 30) {
          fs.unlinkSync(filePath);
          return null;
        }
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch (error) {
      console.error("Cache read error:", error);
    }
    return null;
  }

  static set(key: string, data: any) {
    try {
      this.ensureDir();
      const filePath = path.join(CACHE_DIR, `${key}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
    } catch (error) {
      console.error("Cache write error:", error);
    }
  }
}
