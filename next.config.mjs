import nextMDX from "@next/mdx";
import withPlugins from "next-compose-plugins";

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

export default withPlugins(
  [[withMDX, { pageExtensions: ["md", "mdx", "ts", "tsx"] }]],
  {
    basePath: "",
    experimental: {
      instrumentationHook: true,
    },
    images: {
      unoptimized: true,
    },
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
  },
);
