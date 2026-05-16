import { MangaManager } from "@/MangaManager";
import { Scraper } from "@/Scraper";
import { Manga } from "@/Manga";

export class ManhwaclanScraper extends Scraper {
  domain: string = "manhwaclan.com";

  async parse(urlOrginal: string) {
    const url = this.parseURL(urlOrginal);
    const manga = await MangaManager.testOrCreate(url.url);
    await window.webview.loadURL(manga.url);
    manga.lastRead = url.episode || manga.lastRead;
    manga.title = await window.webview.sendMessage("querySelector.innerText", ".post-title h1");
    manga.chapters = parseInt((await window.webview.sendMessage("querySelector.innerText", ".wp-manga-chapter a")).match(/\d+/)[0]);
    manga.image = await window.webview.sendMessage("querySelector.toDataURL", `a[href="${url.url}"] img`);
    await manga.save();
  }
  async update(manga: Manga): Promise<void> {
    manga.status = "update";
    await window.webview.loadURL(manga.url);
    manga.chapters = parseInt((await window.webview.sendMessage("querySelector.innerText", ".wp-manga-chapter a")).match(/\d+/)[0]);
    await manga.save();
  }
  parseURL(url: string) {
    const match = url.match(/.*?\/manga\/(.*?)\/(?:chapter-(\d+)\/)?/);
    const slag = match[1];
    const episode = parseInt(match[2]) || 0;
    return { url: `https://manhwaclan.com/manga/${slag}/`, episode: episode, genre: "", slag: slag };
  }
  getNewEpisodeLink(manga: Manga): string {
    return `${manga.url}chapter-${manga.lastRead + 1}`;
  }
}
