import { InvalidOperationError } from "../app/utils/api-handler";
import { parseS3AtlasVersion } from "../app/utils/atlases";

/**
 * Parameterized tests for atlas version parsing.
 * Rules:
 * - "1" -> "1.0"
 * - "2" -> "2.0"
 * - "1.0" -> "1.0"
 * - "1.2" -> "1.2"
 * - Reject malformed: "1.99", "1.0.0", "2..00", ".1", "1.", "01", "x", ""
 */

describe("parseS3AtlasVersion", () => {
  it.each<readonly [raw: string, expectedGen: number, expectedRev: number]>([
    ["1", 1, 0],
    ["2", 2, 0],
    ["1.0", 1, 0],
    ["1.2", 1, 2],
    ["2.0", 2, 0],
    ["2.3", 2, 3],
    ["1.99", 1, 99],
    ["1.90", 1, 90],
    ["1-0", 1, 0],
    ["12-34", 12, 34],
  ])(
    "parses %s -> generation %i, revision %i",
    (raw, expectedGen, expectedRev) => {
      expect(parseS3AtlasVersion(raw)).toEqual({
        generation: expectedGen,
        revision: expectedRev,
      });
    },
  );

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
    expect(() => parseS3AtlasVersion(raw)).toThrow(InvalidOperationError);
  });

  describe("SNS key examples", () => {
    it.each<readonly [key: string, expectedGen: number, expectedRev: number]>([
      ["/gut/gut-v1/", 1, 0],
      ["/gut/gut-v2", 2, 0],
      ["/gut/gut-v1.0", 1, 0],
      ["/gut/gut-v1.2", 1, 2],
      ["/gut/gut-v2-1", 2, 1],
    ])(
      "parses version from %s -> generation %i, revision %i",
      (key, expectedGen, expectedRev) => {
        const match = key.match(/-v([0-9.-]+)\/?$/);
        expect(match).not.toBeNull();
        const raw = match ? match[1] : "";
        expect(parseS3AtlasVersion(raw)).toEqual({
          generation: expectedGen,
          revision: expectedRev,
        });
      },
    );
  });
});
