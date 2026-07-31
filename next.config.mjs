import nextMDX from "@next/mdx";

const ESM_PACKAGES = [
  "codsen-utils",
  "lodash-es",
  "ranges-apply",
  "ranges-merge",
  "ranges-push",
  "ranges-sort",
  "string-collapse-leading-whitespace",
  "string-left-right",
  "string-strip-html",
  "@databiosphere/findable-ui",
];

const withMDX = nextMDX({
  extension: /\.mdx?$/,
});

export default withMDX({
  basePath: "",
  images: {
    // Serve WebP from the built-in optimizer. The tracker runs as a Node server
    // (App Runner), so on-demand optimization is available — this is not a
    // static export, which is the usual reason to disable it. WebP only (the
    // Next.js default): AVIF encoding is CPU-heavy on the small container and
    // would slow the first (uncached) request for little extra saving.
    formats: ["image/webp"],
  },
  pageExtensions: ["md", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  async redirects() {
    return [
      {
        destination: "/reports",
        permanent: true,
        source: "/tasks",
      },
    ];
  },
  transpilePackages: [...ESM_PACKAGES],
  /**
   * Extend the webpack configuration.
   * @param config - Webpack configuration.
   * @returns The modified webpack configuration.
   */
  webpack: (config) => {
    // @observablehq/plot is only reached through findable-ui's lazy ChartView
    // chunk, which the tracker never renders (no ChartView/Plot usage in app/ or
    // site-config/). The package is not installed; alias it to an empty module
    // so webpack can still compile the lazy chunk at build time instead of
    // failing to resolve it. See clevercanary/hca-atlas-tracker#1470.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@observablehq/plot": false,
    };
    return config;
  },
});
