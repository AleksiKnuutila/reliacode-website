import type { CollectionEntry } from "astro:content";
import { getSortedPosts } from "./getSortedPosts";

/**
 * Builds a stable "Note · NNN" stamp for every post in the collection.
 *
 * Numbering is assigned across the *full* sorted list (newest → oldest),
 * with the newest post getting N and the oldest getting 1. The map is
 * keyed by `post.id` so the same post always receives the same stamp
 * across the landing teaser, the /posts index, and (later) tag pages.
 *
 * Pad width matches the highest number so single-digit catalogues render
 * as "001", "002", … and three-digit catalogues stay legible too.
 */
export function buildPostStamps(
  posts: CollectionEntry<"posts">[]
): Map<string, string> {
  const sorted = getSortedPosts(posts);
  const total = sorted.length;
  const pad = Math.max(3, String(total).length);
  const stamps = new Map<string, string>();
  sorted.forEach((post, idx) => {
    const n = total - idx; // newest gets the largest number
    stamps.set(post.id, `Note · ${String(n).padStart(pad, "0")}`);
  });
  return stamps;
}
