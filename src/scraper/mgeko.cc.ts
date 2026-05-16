import { MangaManager } from "@/MangaManager";
import { Scraper } from "@/Scraper";
import { Manga } from "@/Manga";

export class MgekoScraper extends Scraper {
  domain: string = "www.mgeko.cc";

  async parse(urlOrginal: string) {
    const url = this.parseURL(urlOrginal);
    const manga = await MangaManager.testOrCreate(url.url);
    await window.webview.loadURL(manga.url);
    manga.lastRead = url.episode || manga.lastRead;
    manga.title = await window.webview.sendMessage("querySelector.innerText", "h1.novel-title");
    manga.chapters = parseInt((await window.webview.sendMessage("querySelector.innerText", "div.chapter-number")).match(/\d+/)[0]);
    manga.image = await window.webview.sendMessage("querySelector.toDataURL", `figure.cover img`);
    await manga.save();
  }
  async update(manga: Manga): Promise<void> {
    manga.status = "update";
    await window.webview.loadURL(manga.url);
    manga.chapters = parseInt((await window.webview.sendMessage("querySelector.innerText", "div.chapter-number")).match(/\d+/)[0]);
    await manga.save();
  }
  parseURL(url: string) {
    const match = url.match(/.*(?:manga|reader\/en)\/(?:(.*?)-chapter-(\d+).*\/|(.*?)\/)/);
    const slag = match[1] || match[3];
    const episode = parseInt(match[2]) || 0;
    return { url: `https://www.mgeko.cc/manga/${slag}/`, episode: episode, genre: "", slag: slag };
  }
  getNewEpisodeLink(manga: Manga): string {
    return `${manga.url}chapter-${manga.lastRead + 1}`;
  }
}
