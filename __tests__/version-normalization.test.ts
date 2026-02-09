import { InvalidOperationError } from "../app/utils/api-handler";
import { normalizeAtlasVersion } from "../app/utils/atlases";

/**
 * Parameterized tests for version normalization and validation.
 * Rules:
 * - "1" -> "1.0"
 * - "2" -> "2.0"
 * - "1.0" -> "1.0"
 * - "1.2" -> "1.2"
 * - Reject malformed: "1.99", "1.0.0", "2..00", ".1", "1.", "01", "x", ""
 */

describe("normalizeAtlasVersion", () => {
  it.each<readonly [raw: string, expected: string]>([
    ["1", "1.0"],
    ["2", "2.0"],
    ["1.0", "1.0"],
    ["1.2", "1.2"],
    ["2.0", "2.0"],
    ["2.3", "2.3"],
    ["1.99", "1.99"],
    ["1.90", "1.90"],
  ])("maps %s -> %s", (raw, expected) => {
    expect(normalizeAtlasVersion(raw)).toBe(expected);
  });

  it.each<readonly [raw: string]>([
    ["1.00"],
    ["1.01"],
    ["1.0.0"],
    ["2..00"],
    [".1"],
    ["1."],
    ["01"],
    ["x"],
    [""],
  ])("throws on invalid version '%s'", (raw) => {
    expect(() => normalizeAtlasVersion(raw)).toThrow(InvalidOperationError);
  });

  describe("SNS key examples", () => {
    it.each<readonly [key: string, expected: string]>([
      ["/gut/gut-v1/", "1.0"],
      ["/gut/gut-v2", "2.0"],
      ["/gut/gut-v1.0", "1.0"],
      ["/gut/gut-v1.2", "1.2"],
    ])("extracts and normalizes version from %s -> %s", (key, expected) => {
      const match = key.match(/-v([0-9.]+)\/?$/);
      expect(match).not.toBeNull();
      const raw = match ? match[1] : "";
      expect(normalizeAtlasVersion(raw)).toBe(expected);
    });
  });
});
