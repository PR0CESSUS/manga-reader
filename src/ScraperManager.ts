import { ManhuausScraper } from "./scraper/manhuaus.com";
import { Scraper } from "./Scraper";
import { WebtoonsScraper } from "./scraper/webtoons.com";
import { ManhwaclanScraper } from "./scraper/manhwaclan.com";
import { MgekoScraper } from "./scraper/mgeko.cc";

export class ScraperManager {
  static list: Scraper[] = [];

  static test(url: string) {
    for (let index = 0; index < ScraperManager.list.length; index++) {
      const isValidScraper = ScraperManager.list[index].test(url);

      if (isValidScraper) return isValidScraper;
    }
    app.toast.add("No parser for this domain");
    return false;
  }

  static parse(url: string) {
    const scraper = ScraperManager.test(url);
    if (scraper) scraper.parseURL(url);
  }

  static get(url: string) {
    const scraper = ScraperManager.test(url);
    if (scraper) return scraper;
  }

  static init() {
    ScraperManager.list.push(new WebtoonsScraper());
    ScraperManager.list.push(new ManhuausScraper());
    ScraperManager.list.push(new ManhwaclanScraper());
    ScraperManager.list.push(new MgekoScraper());
  }
}
