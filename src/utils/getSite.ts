import { getEntry } from "astro:content";

/**
 * Loads the site-chrome editorial copy from src/content/site/main.md.
 * Throws if the file is missing.
 */
export async function getSite() {
  const entry = await getEntry("site", "main");
  if (!entry) {
    throw new Error("Missing src/content/site/main.md");
  }
  return entry.data;
}
