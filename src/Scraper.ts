import { Manga } from "./Manga";
import { MangaManager } from "./MangaManager";
import { ScraperPatternType } from "./types/scraper";

export class Scraper {
  pattern: ScraperPatternType;

  constructor(data: ScraperPatternType) {
    this.pattern = data;
  }

  url(url: string, pattern: string = this.pattern.url) {
    const match = url.match(new RegExp(this.pattern.match));
    for (const key in match?.groups) pattern = pattern.replace(`$\{${key}\}`, match.groups[key]);
    return pattern;
  }

  episode(url: string) {
    const match = url.match(new RegExp(this.pattern.match));
    return parseInt(match.groups.episode) || 0;
  }

  async next(manga: Manga) {
    manga.lastRead++;
    manga.current = manga.next;
    manga.next = await window.webview.sendMessage("querySelector.href", this.pattern.next);
    manga.save();
  }

  //initial parse
  async parse(url: string, overwrite = false) {
    console.log("parse", !url.match(new RegExp(this.pattern.match)), url);
    // if correct domain but malformed url
    if (!url.match(new RegExp(this.pattern.match))) return;
    // if manga exist but not overwrite
    if (MangaManager.test(this.url(url)) && !overwrite) return;

    const manga = MangaManager.getOrCreate(this.url(url));

    //const manga = MangaManager.getOrCreate(this.url(url));
    await window.webview.loadURL(manga.url);
    manga.title = await window.webview.sendMessage("querySelector.innerText", this.pattern.title);
    manga.chapters = await window.webview.sendMessage("querySelector.innerText.number", this.pattern.chapters);
    if (this.pattern.description) manga.description = await window.webview.sendMessage("querySelector.innerText", this.pattern.description);
    if (!this.pattern.imageUrl) manga.image = await window.webview.sendMessage("querySelector.toDataURL", this.parsePattern(manga, this.pattern.image));
    manga.lastRead = this.episode(url) || manga.lastRead;
    if (this.episode(url)) {
      manga.current = url;
      await window.webview.loadURL(manga.current);
      manga.next = await window.webview.sendMessage("querySelector.href", this.pattern.next);
    } else {
      manga.next = await window.webview.sendMessage("querySelector.href", this.pattern.first);
    }

    if (this.pattern.imageUrl) {
      await window.webview.loadURL(this.url(url, this.pattern.imageUrl));
      manga.image = await window.webview.sendMessage("querySelector.toDataURL", this.parsePattern(manga, this.pattern.image));
    }

    manga.save();
  }

  parsePattern(manga: Manga, pattern: string) {
    return pattern.replaceAll("${url}", manga.url);
  }

  async update(manga: Manga): Promise<void> {
    manga.status = "update";
    await window.webview.loadURL(manga.url);
    manga.chapters = await window.webview.sendMessage("querySelector.innerText.number", this.pattern.chapters);

    if (!manga.next && manga.chapters > manga.lastRead) {
      if (!manga.current) {
        app.toast.add("Missing link to current episode!");
        return;
      } else {
        await window.webview.loadURL(manga.current);
        manga.next = await window.webview.sendMessage("querySelector.href", this.pattern.next);
      }
    }
    manga.save();
  }
}
