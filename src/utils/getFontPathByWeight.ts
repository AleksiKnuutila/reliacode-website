import type { FontData } from "astro:assets";

export function getFontPathByWeight(
  fonts: FontData[],
  weight: number,
  options?: {
    style?: "normal" | "italic";
    format?: string;
  }
): string | undefined {
  const style = options?.style ?? "normal";
  const format = options?.format ?? "truetype";

  // Astro's font system can emit multiple FontData entries for the same
  // weight/style (one per format group), so we look across all matching
  // entries for a src with the requested format rather than only the
  // first one.
  for (const font of fonts) {
    if (font.weight !== String(weight) || font.style !== style) continue;
    const url = font.src.find(file => file.format === format)?.url;
    if (url) return url;
  }
  return undefined;
}
