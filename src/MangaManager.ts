import { reactive } from "vue";
import { Manga } from "./Manga";

export class MangaManager {
  static list: Manga[] = reactive([]);
  static version: 1;
  static database: IDBDatabase;
  static databaseName = "manga";

  static add(url: string) {
    const manga = reactive(new Manga(url));
    MangaManager.list.push(manga);
    return manga;
  }

  static test(url: string) {
    for (let index = 0; index < MangaManager.list.length; index++) {
      if (MangaManager.list[index].url == url) return MangaManager.list[index];
    }
    return false;
  }

  static async testOrCreate(url: string) {
    const manga = MangaManager.test(url);
    if (manga) {
      manga.status = "update";
      return manga;
    } else {
      return MangaManager.add(url);
    }
  }

  static init() {
    if (MangaManager.list.length) return;
    const db = indexedDB.open("database", MangaManager.version);
    db.onerror = (_event) => app.toast.add("db.onerror");

    db.onsuccess = (_event) => {
      MangaManager.database = db.result;
      const transaction = MangaManager.database.transaction(MangaManager.databaseName, "readonly");
      const store = transaction.objectStore(MangaManager.databaseName);

      store.openCursor().onsuccess = (e) => {
        //@ts-ignore
        const cursor = e.target.result as IDBCursorWithValue;
        if (cursor) {
          this.add(cursor.value.url).load(cursor.value, parseInt(cursor.key as string));
          cursor.continue();
        }
      };
    };
    db.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      if (!event.target) return;
      //@ts-ignore
      const db = event.target.result as IDBDatabase;
      switch (db.version) {
        case 1:
          const store = db.createObjectStore(MangaManager.databaseName, { autoIncrement: true });
          store.createIndex("title", "title", { unique: false });
          store.createIndex("chapters", "chapters", { unique: false });
          store.createIndex("url", "url", { unique: true });
          store.createIndex("lastRead", "lastRead", { unique: false });
          store.createIndex("lastUpdated", "lastUpdated", { unique: false });
          store.createIndex("description", "description", { unique: false });
          store.createIndex("image", "image", { unique: false });
          break;
        default:
          break;
      }
    };
  }

  static async update() {
    // update all
    for (let index = 0; index < MangaManager.list.length; index++) {
      const manga = MangaManager.list[index];
      const now = Date.now();

      console.log("Last update time: ", manga.lastUpdated);
      console.log("Last update time: ", manga.lastUpdated);
      console.log("diff: ", now - manga.lastUpdated);

      if (now - manga.lastUpdated > 100000) {
        await manga.update();
      }
    }
  }
  static load() {}
  static save() {
    MangaManager.list.forEach((manga) => manga.save());
  }

  static delete(manga: Manga) {
    const index = MangaManager.list.findIndex((item) => item.id === manga.id);

    if (index !== -1) {
      manga.delete();
      MangaManager.list.splice(index, 1);
    }
  }
}
