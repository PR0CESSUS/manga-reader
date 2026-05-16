import { MangaManager } from "@/MangaManager";
import { Scraper } from "@/Scraper";
import { Manga } from "@/Manga";

export class WebtoonsScraper extends Scraper {
  domain: string = "www.webtoons.com";

  async parse(urlOrginal: string) {
    const url = this.parseURL(urlOrginal);
    const manga = await MangaManager.testOrCreate(url.url);
    await window.webview.loadURL(manga.url);
    manga.lastRead = url.episode || manga.lastRead;
    manga.title = await window.webview.sendMessage("querySelector.innerText", "h1.subj");
    manga.description = await window.webview.sendMessage("querySelector.innerText", ".summary");
    manga.chapters = parseInt(JSON.parse(await window.webview.sendMessage("querySelector.dataset", "#_listUl li"))?.episodeNo) || 0;
    await window.webview.loadURL(`https://www.webtoons.com/en/genres/${url.genre}?sortOrder=MANA`);
    manga.image = await window.webview.sendMessage("querySelector.toDataURL", `a[href="${url.url}"] img`);
    await manga.save();
  }

  parseURL(urlOrginal: string) {
    const url = new URL(urlOrginal);
    const match = url.href.match(/.*?\/en\/(.*?)\/(.*?)\/.*/);
    const genre = match[1];
    const slag = match[2];
    const title_no = parseInt(url.searchParams.get("title_no")) || 0;
    const episode = parseInt(url.searchParams.get("episode_no")) || 0;
    return { url: `https://www.webtoons.com/en/${genre}/${slag}/list?title_no=${title_no}`, episode: episode, genre: genre, slag: slag, title_no: title_no };
  }

  async update(manga: Manga) {
    manga.status = "update";
    await window.webview.loadURL(manga.url);
    manga.chapters = parseInt(JSON.parse(await window.webview.sendMessage("querySelector.dataset", "#_listUl li"))?.episodeNo) || 0;
    await manga.save();
  }

  getNewEpisodeLink(manga: Manga): string {
    const url = this.parseURL(manga.url);
    return `https://www.webtoons.com/en/${url.genre}/${url.slag}/episode-${manga.lastRead + 1}/viewer?title_no=${url.title_no}&episode_no=${manga.lastRead + 1}`;
  }
}
