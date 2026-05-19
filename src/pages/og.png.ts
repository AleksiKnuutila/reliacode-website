import type { APIRoute } from "astro";
import satori from "satori";
import sharp from "sharp";
import { fontData, experimental_getFontFileURL } from "astro:assets";
import { getFontPathByWeight } from "@/utils/getFontPathByWeight";
import config from "@/config";

/**
 * Site-wide Open Graph image (1200x630).
 *
 * Layout mirrors the brand: navy gradient background, brand-mark +
 * site title in the top-left, large Fraunces title in the center-left,
 * mono hostname in the bottom-left.
 */
export const GET: APIRoute = async context => {
  const manropeFonts = fontData["--font-manrope"];
  const frauncesFonts = fontData["--font-fraunces"];

  const manropeRegPath = getFontPathByWeight(manropeFonts, 400);
  const manropeBoldPath = getFontPathByWeight(manropeFonts, 700);
  const frauncesPath = getFontPathByWeight(frauncesFonts, 600);

  if (
    manropeRegPath === undefined ||
    manropeBoldPath === undefined ||
    frauncesPath === undefined
  ) {
    throw new Error("Cannot find a required font path for OG image.");
  }

  const [manropeReg, manropeBold, frauncesData] = await Promise.all([
    fetch(experimental_getFontFileURL(manropeRegPath, context.url)).then(res =>
      res.arrayBuffer()
    ),
    fetch(experimental_getFontFileURL(manropeBoldPath, context.url)).then(res =>
      res.arrayBuffer()
    ),
    fetch(experimental_getFontFileURL(frauncesPath, context.url)).then(res =>
      res.arrayBuffer()
    ),
  ]);

  // Navy gradient palette — hex equivalents of the OKLCH brand colours.
  // Satori sometimes mis-renders linear-gradient, so we use a solid
  // base and an absolutely-positioned overlay for a soft gradient feel.
  const BG_DEEP = "#1e2a52";
  const BG_MID = "#3a4d8a";
  const FG = "#f2f5fb";
  const MUTED = "#a8b3d1";

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
          // Soft diagonal lighten in the bottom-right.
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
                // Diagonal fade via a clipped square — satori supports
                // basic transforms.
                transform: "translate(40%, 60%) rotate(20deg)",
                borderRadius: "50%",
                filter: "blur(120px)",
              },
            },
          },
          // Brand row: mark + name
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
                      fontFamily: "Fraunces",
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
          // Title block — pushed toward the centre-left.
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                marginTop: 80,
                maxWidth: "85%",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: "Fraunces",
                      fontSize: 84,
                      fontWeight: 600,
                      lineHeight: 1.05,
                      letterSpacing: "-0.02em",
                      color: FG,
                    },
                    children: config.site.description,
                  },
                },
              ],
            },
          },
          // Footer row pinned to bottom — mono hostname.
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                marginTop: "auto",
                fontSize: 22,
                color: MUTED,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              },
              children: new URL(config.site.url).hostname,
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
        { name: "Fraunces", data: frauncesData, weight: 600, style: "normal" },
      ],
    }
  );

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(pngBuffer), {
    headers: { "Content-Type": "image/png" },
  });
};
