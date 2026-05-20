import { Scraper } from "./Scraper";

export class ScraperManager {
  static parser: Record<string, Scraper> = {};

  static test(url: string, manual = false) {
    try {
      const domain = new URL(url);
      //console.log(ScraperManager.parser["test.pl"]);

      const result = domain.host.includes("www.") ? ScraperManager.parser[domain.host.slice(4)] : ScraperManager.parser[domain.host];
      //console.log(domain, result, ScraperManager.parser["toongod.org"], domain.host.slice(4));
      if (result) {
        return result;
      } else {
        if (manual) app.toast.add("No parser for this domain");

        return false;
      }
    } catch (_) {
      app.toast.add("Bad URL");
      return false;
    }
  }

  static async parse(url: string, manual = false) {
    const scraper = ScraperManager.test(url, manual);
    if (scraper) await scraper.parse(url);
  }

  static get(url: string) {
    const scraper = ScraperManager.test(url);
    if (scraper) return scraper;
  }

  static async init() {
    const data = await electron.loadScrapers();

    for (const key in data) ScraperManager.parser[key] = new Scraper(data[key]);

    //ScraperManager.list.push(new WebtoonsScraper());
    //ScraperManager.list.push(new ManhuausScraper());
    //ScraperManager.list.push(new ManhwaclanScraper());
    //ScraperManager.list.push(new MgekoScraper());
    //ScraperManager.list.push(new ToongodScraper());
  }
}
