const SEVERITY_PREFIX_PATTERN = /^(ERROR|WARNING):\s*/i;
// Single-quote alternative requires identifier-like content (letters, digits,
// underscore, dot, hyphen, comma) optionally joined by spaces — so multi-word
// quoted phrases ("gene annotation version") match, while contraction
// apostrophes (e.g. "isn't") can't pair with surrounding quotes because the
// content character class excludes apostrophes and disallows leading/trailing
// whitespace.
const QUOTED_CONTENT = "[A-Za-z0-9_.\\-,]+(?: [A-Za-z0-9_.\\-,]+)*";
const CODE_PATTERN = new RegExp(`(\`[^\`]+\`|'${QUOTED_CONTENT}')`, "g");

/**
 * Splits a validation message into alternating plain-text and code segments,
 * stripping any leading "ERROR: " / "WARNING: " prefix.
 *
 * A segment is treated as code when it is wrapped in backticks or in single
 * quotes around an identifier-like token or space-joined sequence of such
 * tokens (the convention used by the tracker validators for identifiers,
 * dataframe names, column names, feature IDs, multi-word phrases).
 * @param message - The raw validation message string.
 * @returns An array of segments, each tagged as "text" or "code".
 */
export function parseValidationMessage(
  message: string,
): { type: "code" | "text"; value: string }[] {
  const cleaned = message.replace(SEVERITY_PREFIX_PATTERN, "");
  const parts = cleaned.split(CODE_PATTERN);
  return parts
    .filter((part) => part.length > 0)
    .map((part) => {
      const isBacktick = part.startsWith("`") && part.endsWith("`");
      const isQuoted = part.startsWith("'") && part.endsWith("'");

      if (isBacktick || isQuoted) {
        return { type: "code", value: part.slice(1, -1) };
      }

      return { type: "text", value: part };
    });
}
