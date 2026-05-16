import { Manga } from "./Manga";

export class Scraper {
  domain: string;

  constructor() {}

  /**
   * @param {string} url - URL to parse
   */
  async parse(url: string) {
    console.log("default trying to parse", url);
  }

  test(url: string) {
    try {
      return new URL(url).host === this.domain ? this : false;
    } catch (_) {
      return false;
    }
  }
  async update(manga: Manga) {
    this.parse(manga.url);
  }

  getNewEpisodeLink(manga: Manga) {
    return "https://example.com";
  }

  parseURL(url: string) {
    return { url: url, episode: 0, genre: "", slag: "" };
  }
}
