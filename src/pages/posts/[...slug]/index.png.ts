import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { fontData, experimental_getFontFileURL } from "astro:assets";
import satori from "satori";
import sharp from "sharp";
import { getFontPathByWeight } from "@/utils/getFontPathByWeight";
import { getPostSlug } from "@/utils/getPostPaths";
import config from "@/config";

export async function getStaticPaths() {
  if (!config.features.dynamicOgImage) {
    return [];
  }

  const posts = await getCollection("posts").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return posts.map(post => ({
    params: { slug: getPostSlug(post.id, post.filePath) },
    props: post,
  }));
}

/**
 * Per-post Open Graph image (1200x630).
 *
 * Mirrors the site OG (navy gradient + brand mark) but swaps the title
 * block for the post title and the mono footer for a "DATE · CATEGORY"
 * meta strip.
 */
export const GET: APIRoute = async ({ props, url }) => {
  if (!config.features.dynamicOgImage) {
    return new Response(null, { status: 404, statusText: "Not found" });
  }

  const manropeFonts = fontData["--font-manrope"];
  const poppinsFonts = fontData["--font-poppins"];

  const manropeRegPath = getFontPathByWeight(manropeFonts, 400);
  const manropeBoldPath = getFontPathByWeight(manropeFonts, 700);
  const poppinsPath = getFontPathByWeight(poppinsFonts, 600);

  if (
    manropeRegPath === undefined ||
    manropeBoldPath === undefined ||
    poppinsPath === undefined
  ) {
    throw new Error("Cannot find a required font path for OG image.");
  }

  const [manropeReg, manropeBold, poppinsData] = await Promise.all([
    fetch(experimental_getFontFileURL(manropeRegPath, url)).then(res =>
      res.arrayBuffer()
    ),
    fetch(experimental_getFontFileURL(manropeBoldPath, url)).then(res =>
      res.arrayBuffer()
    ),
    fetch(experimental_getFontFileURL(poppinsPath, url)).then(res =>
      res.arrayBuffer()
    ),
  ]);

  const BG_DEEP = "#1e2a52";
  const BG_MID = "#3a4d8a";
  const FG = "#f2f5fb";
  const MUTED = "#a8b3d1";

  const pubDate = props.data.pubDatetime;
  const monthYear = pubDate
    ? new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "long" }).format(
        pubDate
      )
    : undefined;
  const metaParts = [monthYear, props.data.category].filter(
    (part): part is string => Boolean(part)
  );

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG_DEEP,
          color: FG,
          fontFamily: "Manrope",
          padding: "72px 80px",
          position: "relative",
        },
        children: [
          // Soft accent glow.
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: BG_MID,
                opacity: 0.35,
                transform: "translate(40%, 60%) rotate(20deg)",
                borderRadius: "50%",
                filter: "blur(120px)",
              },
            },
          },
          // Brand row.
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 16,
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: BG_MID,
                      display: "flex",
                    },
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "Poppins",
                      fontSize: 28,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    },
                    children: config.site.title,
                  },
                },
              ],
            },
          },
          // Post title.
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                marginTop: 60,
                maxWidth: "92%",
                maxHeight: 320,
                overflow: "hidden",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "Poppins",
                      fontSize: 72,
                      fontWeight: 600,
                      lineHeight: 1.05,
                      letterSpacing: "-0.02em",
                      color: FG,
                    },
                    children: props.data.title,
                  },
                },
              ],
            },
          },
          // Footer row: mono meta strip on the left, site host on the right.
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "auto",
                fontSize: 22,
                color: MUTED,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: { display: "flex" },
                    children: metaParts.length > 0 ? metaParts.join("  ·  ") : "",
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { display: "flex" },
                    children: new URL(config.site.url).hostname,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: [
        { name: "Manrope", data: manropeReg, weight: 400, style: "normal" },
        { name: "Manrope", data: manropeBold, weight: 700, style: "normal" },
        { name: "Poppins", data: poppinsData, weight: 600, style: "normal" },
      ],
    }
  );

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(pngBuffer), {
    headers: { "Content-Type": "image/png" },
  });
};
