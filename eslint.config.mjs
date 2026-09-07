import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import next from "eslint-config-next";
import sonarjs from "eslint-plugin-sonarjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const config = [
  {
    ignores: [
      "**/node_modules/**",
      "**/out/**",
      "**/.next/**",
      "**/build/**",
      "**/venv/**",
      "next-env.d.ts",
      "next.config.mjs",
    ],
  },
  ...next,
  sonarjs.configs.recommended,
  ...compat.config({
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier",
      "plugin:prettier/recommended",
      "plugin:@eslint-community/eslint-comments/recommended",
    ],
    parser: "@typescript-eslint/parser",
    plugins: [
      "@typescript-eslint",
      "jsdoc",
      "sort-destructure-keys",
      "perfectionist",
      "react-hooks",
    ],
    rules: {
      "@eslint-community/eslint-comments/require-description": "error",
      // Any import used only in type positions must be written `import type` /
      // inline `type` (fixStyle: inline). `disallowTypeAnnotations: false` keeps
      // existing `typeof import("…")` annotations (jest generics, ambient .d.ts)
      // as-is instead of forcing them to top-of-file imports.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { disallowTypeAnnotations: false, fixStyle: "inline-type-imports" },
      ],
      // Intra-repo import convention: relative imports only for same-directory
      // and descendants (`./`); reach anything else through the `@/` alias.
      // Keeps a module's internal and external references to the same string
      // (one grep finds every consumer) and stops the rule from depending on
      // how deep a file happens to sit. Uses the typescript-eslint variant so
      // it also catches `import type` specifiers. `@/` is a tsconfig path, so
      // non-Next runtime entrypoints (scripts run outside `next`) must load it
      // via `tsx` or `ts-node -r tsconfig-paths/register` for it to resolve.
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // `".."` alone matches every parent-relative specifier (ESLint
              // uses gitignore semantics, where a slash-free pattern matches at
              // any depth); `"../**"` is kept only to make the intent explicit.
              group: ["..", "../**"],
              message:
                "Reach outside this directory via the '@/' alias; relative imports are for ./ same-dir and descendants only.",
            },
            {
              // #1543: our `LayoutDimensionsProvider` and findable-ui's share a
              // name, and either satisfies the compiler at the call site. An
              // editor auto-import, a merge resolution or an upgrade sweep can
              // therefore swap ours for upstream's silently — upstream seeds the
              // header at `0`, so the offset leaves the server-rendered HTML and
              // the ~57px first-paint jump returns with every test still green
              // (they build the provider tree themselves). Fence the upstream
              // path; `app/providers/layoutDimensions/provider.tsx` overrides
              // this below, since composing upstream is exactly its job.
              //
              // Trailing-wildcarded rather than exact: a `.js`-suffixed
              // specifier resolves to the same module and would slip an exact
              // match. Anchored on the package name so it cannot over-match the
              // local copy this rule points people at.
              group: [
                "@databiosphere/findable-ui/**/layoutDimensions/provider*",
              ],
              message:
                "Import LayoutDimensionsProvider from '@/app/providers/layoutDimensions/provider' — findable-ui's seeds the header offset as 0, reintroducing the first-paint jump (#1543).",
            },
            // Bare repo-root imports (e.g. `app/foo`) need no lint rule: with no
            // `baseUrl` in tsconfig they fail typecheck (TS2307), which CI and
            // the pre-commit hook enforce. (jest's SWC transform still resolves a
            // static bare import via Next's implicit baseUrl, so jest is not a
            // backstop; the trimmed `moduleDirectories` only closes runtime
            // `require`/`jest.mock` paths.) Only the `@/` alias reaches repo-root
            // modules.
          ],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "jsdoc/check-alignment": "error",
      "jsdoc/check-param-names": "error",
      "jsdoc/require-description": "error",
      "jsdoc/require-hyphen-before-param-description": "error",
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-param-name": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-description": "error",
      "perfectionist/sort-enums": "error",
      "perfectionist/sort-interfaces": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/immutability": "error",
      // react-hooks/incompatible-library targets React Compiler users; we
      // don't run the Compiler, so the rule isn't earning its keep yet.
      "react-hooks/incompatible-library": "off",
      "react-hooks/refs": "error",
      "react-hooks/set-state-in-effect": "error",
      "react-hooks/static-components": "error",
      // sonarjs v1 dropped `cognitive-complexity` from the recommended
      // preset; restore at the default threshold of 15.
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/todo-tag": "warn",
      "sort-destructure-keys/sort-destructure-keys": [
        "error",
        { caseSensitive: false },
      ],
      "sort-keys": [
        "error",
        "asc",
        { caseSensitive: true, minKeys: 2, natural: false },
      ],
    },
  }),
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    ignores: ["**/*.styles.ts", "**/*.styles.tsx"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
  {
    files: ["**/__tests__/**", "**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "sonarjs/no-duplicate-string": "off",
    },
  },
  {
    // The one module that must import findable-ui's provider: it composes it
    // with the seed. Everywhere else the fence above applies. Turning the rule
    // off wholesale here would also drop the `../` ban, so it is restated.
    files: ["app/providers/layoutDimensions/provider.tsx"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["..", "../**"],
              message:
                "Reach outside this directory via the '@/' alias; relative imports are for ./ same-dir and descendants only.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
