import nextMDX from "@next/mdx";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Detect whether @observablehq/plot is installed. It is an optional peer of
// findable-ui that the tracker never renders (no ChartView/Plot usage in app/
// or site-config/); it was dropped as a direct dependency. findable-ui still
// statically references it from its lazy ChartView chunk, so the bundler must
// resolve the specifier at build time even though that chunk is never
// downloaded. When plot is absent we alias it to an empty module (below) so the
// build succeeds. The alias is applied ONLY when plot is not installed: a future
// consumer who runs `npm install @observablehq/plot` to actually render charts
// would otherwise hit an unconditional stub silently shadowing the real package
// (`Plot.plot` resolves to undefined and throws a TypeError at render, dropping
// the view to the error boundary with no build-time signal). Probing collapses
// that future fix to the single obvious step of installing the package.
let plotInstalled;
try {
  require.resolve("@observablehq/plot");
  plotInstalled = true;
} catch {
  plotInstalled = false;
}

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
  webpack: (config) => {
    // Stub the absent @observablehq/plot so webpack can compile findable-ui's
    // lazy ChartView chunk (see the plotInstalled probe above for the full
    // rationale). Only applied when plot is not installed, so installing it
    // later restores the real module without further config changes.
    //
    // This lives in the webpack config, which Next 16 runs only under
    // `--webpack`. The scripts that compile — `dev` and `build:*` — all force
    // `--webpack`, so it always applies where bundling happens (`start` just
    // serves prebuilt output, no bundling). A bare `next dev` uses Turbopack
    // (the Next 16 default), which ignores this function and would fail to
    // resolve the ChartView chunk. Turbopack's resolveAlias has no `false`
    // equivalent, so mirroring it would require a maintained empty-stub file —
    // deliberately avoided here.
    if (!plotInstalled) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@observablehq/plot": false,
      };
    }
    return config;
  },
});
