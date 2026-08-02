import { getEntry, type CollectionEntry } from "astro:content";

type LandingData = CollectionEntry<"landing">["data"];

/**
 * Collections that share the `landing` schema. `landingReliacheck` backs
 * the ReliaCheck page (src/pages/reliacheck.astro) with its own vault
 * folder (src/content/landing-reliacheck/) so it can be edited
 * independently of ReliaParse's copy.
 */
export type LandingCollection = "landing" | "landingReliacheck";

/**
 * Loads a landing-page section by its `section` discriminator
 * (e.g. "hero", "problem", "approach"). Throws if the entry is missing
 * or if the file's `section` field doesn't match the requested slug.
 *
 * The return type is narrowed to the matching variant of the discriminated
 * union so callers get typed access to the section's specific fields.
 *
 * `collection` defaults to "landing" (ReliaParse); pass "landingReliacheck"
 * to read the ReliaCheck copy instead — both collections share this exact
 * schema.
 */
export async function getLandingSection<S extends LandingData["section"]>(
  section: S,
  collection: LandingCollection = "landing",
): Promise<Extract<LandingData, { section: S }>> {
  const entry = await getEntry(collection as "landing", section);
  if (!entry) {
    throw new Error(`Missing src/content/${collection}/${section}.md`);
  }
  if (entry.data.section !== section) {
    throw new Error(
      `Section mismatch in ${collection}/${section}.md: file declares "${entry.data.section}"`,
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
  collection: LandingCollection = "landing",
): Promise<{ data: Extract<LandingData, { section: S }>; body: string }> {
  const entry = await getEntry(collection as "landing", section);
  if (!entry) {
    throw new Error(`Missing src/content/${collection}/${section}.md`);
  }
  if (entry.data.section !== section) {
    throw new Error(
      `Section mismatch in ${collection}/${section}.md: file declares "${entry.data.section}"`,
    );
  }
  return {
    data: entry.data as Extract<LandingData, { section: S }>,
    body: entry.body ?? "",
  };
}
