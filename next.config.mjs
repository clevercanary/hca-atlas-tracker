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
    unoptimized: true,
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
});
