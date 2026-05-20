export type MangaType = {
  title: string;
  chapters: number;
  url: string;
  lastRead: number;
  lastUpdated: number;
  description?: string;
  status: "update" | "ready" | "error";
  image: string;
  next: string;
  current: string;
};
