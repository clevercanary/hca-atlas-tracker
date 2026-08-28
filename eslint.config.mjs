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
              // #1543: the header offset must be in the server-rendered CSS,
              // which findable-ui's provider cannot do — it falls back to `0`
              // until its ResizeObserver reports, and the observer cannot run
              // before the SSR paint. `app/providers/layoutDimensions` is a
              // copy that seeds the fallback instead. The two are
              // interchangeable to the compiler and to every test (the provider
              // tests import the local copy directly, and upstream's context
              // default is zeros so nothing throws), so an auto-import, a merge
              // resolution, or an upgrade sweep could restore the upstream path
              // and silently reintroduce the ~57px jump. Fence it instead.
              // Remove this when the seed lands upstream as a prop, or when
              // DataBiosphere/findable-ui#998 removes the offset entirely.
              group: [
                "@databiosphere/findable-ui/lib/providers/layoutDimensions/provider",
              ],
              message:
                "Import LayoutDimensionsProvider from '@/app/providers/layoutDimensions/provider' — upstream's seeds the header offset as 0 and reintroduces the first-paint jump (#1543).",
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
];

export default config;
