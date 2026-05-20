import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export function loadScrapers(dir: string) {
  try {
    const files = readdirSync(dir).filter((file) => file.endsWith(".json"));
    const result: Record<string, any> = {};

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const content = JSON.parse(readFileSync(fullPath, "utf-8"));
      const key = file.replace(".json", "");
      result[key] = content;
    });

    return result;
  } catch (err) {
    console.error("Błąd wczytywania JSON-ów:", err);
    return {};
  }
}
