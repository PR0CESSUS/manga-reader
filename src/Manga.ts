import { ScraperManager } from "./ScraperManager";
import { MangaManager } from "./MangaManager";
import { MangaType } from "./types/manga";

export class Manga implements MangaType {
  title: string = "";
  chapters: number = 0;
  url: string = "";
  lastRead: number = 0;
  lastUpdated: number = 0;
  description: string = "";
  image: string = "";
  status: "update" | "ready" | "error" = "update";
  id: number;
  next: string = "";
  current: string;

  constructor(url: string) {
    this.url = url;
  }

  get scraper() {
    return ScraperManager.get(this.url);
  }

  save() {
    this.status = "ready";
    this.lastUpdated = Date.now();
    const transaction = MangaManager.database.transaction(MangaManager.databaseName, "readwrite");
    transaction.onerror = (_e) => app.toast.add("Error adding to store. Duplicate URL");
    if (this.id) {
      transaction.objectStore("manga").put(JSON.parse(JSON.stringify(this)), this.id);
    } else {
      const id = transaction.objectStore("manga").put(JSON.parse(JSON.stringify(this)));
      id.onsuccess = (e) => (this.id = parseInt((e.target as IDBRequest).result));
    }
  }

  load(data: MangaType, id: number) {
    this.chapters = data.chapters || 0;
    this.description = data.description || "";
    this.title = data.title || "";
    this.image = data.image || "";
    this.lastRead = data.lastRead || 0;
    this.lastUpdated = data.lastUpdated || 0;
    this.status = data.status || "ready";
    this.id = id;
    this.next = data.next || "";
    this.current = data.current || "";

    if (!this.current && !this.next) this.status = "error";
  }

  async update() {
    await this.scraper.update(this);
  }

  delete() {
    const transaction = MangaManager.database.transaction("manga", "readwrite");
    transaction.objectStore("manga").delete(this.id);
    app.toast.add(`${this.title} deleted`);
  }

  setNext() {
    this.scraper.next(this);
  }

  parse() {
    this.scraper.parse(this.current || this.url, true);
  }
}
