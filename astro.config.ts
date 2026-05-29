import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

const tunnel = process.env.TUNNEL === "1";

export default defineConfig({
  site: config.site.url,
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: tunnel
      ? {
          allowedHosts: ["website.taival.dev"],
          hmr: { host: "website.taival.dev", protocol: "wss", clientPort: 443 },
        }
      : undefined,
  },
  fonts: [
    {
      // Display serif. Variable across opsz/wght with optional SOFT and
      // WONK axes (low-contrast Fraunces look used on h1-h4). Italic 400
      // only — we never italicize a weight other than the body weight.
      name: "Fraunces",
      cssVariable: "--font-fraunces",
      provider: fontProviders.google(),
      fallbacks: ["Source Serif 4", "Georgia", "serif"],
      weights: ["400 600"],
      styles: ["normal", "italic"],
      // `ttf` is included so satori (which needs raw font tables) can
      // load Fraunces for OG-image titles.
      formats: ["woff2", "woff", "ttf"],
      // Unifont experimental option, forwarded by Astro to the google
      // provider. Tuples become range axes (`9..144`); strings are
      // passed through. SOFT 0..100, WONK 0..1 are Fraunces-specific
      // axes; opsz 9..144 is the standard optical-sizing range.
      options: {
        experimental: {
          variableAxis: {
            opsz: [["9", "144"]],
            SOFT: [["0", "100"]],
            WONK: [["0", "1"]],
          },
        },
      },
    },
    {
      // Body sans. Discrete weights are sufficient — the body never
      // animates wght, and static faces keep OG image rendering
      // (satori) straightforward. `ttf` is included so satori (which
      // needs raw font tables) can load the bold weight for OG images.
      name: "Manrope",
      cssVariable: "--font-manrope",
      provider: fontProviders.google(),
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      formats: ["woff2", "woff", "ttf"],
    },
    {
      // Monospace. Geist Mono ships as a wght-variable font.
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      provider: fontProviders.google(),
      fallbacks: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
      weights: ["400 500"],
      styles: ["normal"],
      formats: ["woff2", "woff"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
