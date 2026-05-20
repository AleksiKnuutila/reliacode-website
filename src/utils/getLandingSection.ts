import { getEntry, type CollectionEntry } from "astro:content";

type LandingData = CollectionEntry<"landing">["data"];

/**
 * Loads a landing-page section by its `section` discriminator
 * (e.g. "hero", "problem", "approach"). Throws if the entry is missing
 * or if the file's `section` field doesn't match the requested slug.
 *
 * The return type is narrowed to the matching variant of the discriminated
 * union so callers get typed access to the section's specific fields.
 */
export async function getLandingSection<S extends LandingData["section"]>(
  section: S,
): Promise<Extract<LandingData, { section: S }>> {
  const entry = await getEntry("landing", section);
  if (!entry) {
    throw new Error(`Missing src/content/landing/${section}.md`);
  }
  if (entry.data.section !== section) {
    throw new Error(
      `Section mismatch in ${section}.md: file declares "${entry.data.section}"`,
    );
  }
  return entry.data as Extract<LandingData, { section: S }>;
}

/**
 * Same as {@link getLandingSection} but also returns the raw markdown
 * body. Use when a section stores its items as H2 sub-headings in the
 * body (parsed via {@link parseSectionGroups}/{@link parseSectionItems}).
 */
export async function getLandingSectionWithBody<
  S extends LandingData["section"],
>(
  section: S,
): Promise<{ data: Extract<LandingData, { section: S }>; body: string }> {
  const entry = await getEntry("landing", section);
  if (!entry) {
    throw new Error(`Missing src/content/landing/${section}.md`);
  }
  if (entry.data.section !== section) {
    throw new Error(
      `Section mismatch in ${section}.md: file declares "${entry.data.section}"`,
    );
  }
  return {
    data: entry.data as Extract<LandingData, { section: S }>,
    body: entry.body ?? "",
  };
}
