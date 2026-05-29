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
      // Display sans. 700 is the header wordmark; 400/500/600 cover
      // h1–h4 / display text. `ttf` is included so satori (which needs
      // raw font tables) can load Poppins for OG-image titles.
      name: "Poppins",
      cssVariable: "--font-poppins",
      provider: fontProviders.google(),
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      formats: ["woff2", "woff", "ttf"],
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
