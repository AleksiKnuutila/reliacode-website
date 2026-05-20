import { marked } from "marked";

/**
 * One item extracted from an H2 heading and the prose that follows it.
 *
 * Heading convention: `## {label} — {title}` (em-dash separator).
 * `label` is the bit before the em-dash, `title` is everything after.
 * Either can be empty if the convention isn't followed.
 *
 * If the heading has no em-dash, the whole heading text becomes `label`
 * and `title` is empty.
 */
export type ParsedSectionItem = {
  label: string;
  title: string;
  /** Rendered HTML of the prose between this H2 and the next H2 or end-of-body.
   *  Empty string if there's no prose under the heading. */
  bodyHtml: string;
};

/** An H1-delimited group of items within a body, used when a single
 *  markdown file holds more than one list (e.g. approach.md has both
 *  pillars and workflow steps). */
export type ParsedSectionGroup = {
  /** Plain text of the H1. */
  heading: string;
  items: ParsedSectionItem[];
};

const EM_DASH = " — ";

function parseItem(chunk: string): ParsedSectionItem {
  const newlineIdx = chunk.indexOf("\n");
  const headingLine = newlineIdx === -1 ? chunk : chunk.slice(0, newlineIdx);
  const bodyMd = newlineIdx === -1 ? "" : chunk.slice(newlineIdx + 1).trim();

  const sepIdx = headingLine.indexOf(EM_DASH);
  const label = (sepIdx === -1 ? headingLine : headingLine.slice(0, sepIdx)).trim();
  const title = (sepIdx === -1 ? "" : headingLine.slice(sepIdx + EM_DASH.length)).trim();

  const bodyHtml = bodyMd ? (marked.parse(bodyMd, { async: false }) as string) : "";
  return { label, title, bodyHtml };
}

/**
 * Splits a markdown body into items by `## ` H2 headings.
 *
 * Body before the first H2 is discarded (intentional — that space is for
 * editor notes/comments that don't belong on the rendered page).
 */
export function parseSectionItems(rawBody: string): ParsedSectionItem[] {
  const chunks = rawBody.split(/^## /m).slice(1);
  return chunks.map(parseItem);
}

/**
 * Splits a markdown body into H1-delimited groups, each containing its
 * own list of H2 items. Use for files that carry more than one list.
 */
export function parseSectionGroups(rawBody: string): ParsedSectionGroup[] {
  // Split on H1 lines (^# followed by space, NOT ##/###). The negative
  // lookahead distinguishes H1 from H2/H3/etc.
  const groups = rawBody.split(/^# (?!#)/m).slice(1);
  return groups.map(group => {
    const newlineIdx = group.indexOf("\n");
    const headingLine = newlineIdx === -1 ? group : group.slice(0, newlineIdx);
    const remaining = newlineIdx === -1 ? "" : group.slice(newlineIdx + 1);
    return {
      heading: headingLine.trim(),
      items: parseSectionItems(remaining),
    };
  });
}
