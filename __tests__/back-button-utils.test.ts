import {
  parseBackOrigin,
  resolveBackPath,
} from "../app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/hooks/UseBackPath/utils";
import { withBackOrigin } from "../app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/utils";

describe("parseBackOrigin", () => {
  it("returns undefined for undefined", () => {
    expect(parseBackOrigin(undefined)).toBeUndefined();
  });

  it("returns undefined for null", () => {
    expect(parseBackOrigin(null)).toBeUndefined();
  });

  it("returns undefined for a non-string value", () => {
    expect(parseBackOrigin(123)).toBeUndefined();
  });

  it("returns undefined for a string[] (Next.js can yield string arrays in query)", () => {
    expect(parseBackOrigin(["SOURCE_DATASETS"])).toBeUndefined();
  });

  it("returns undefined for a string that is not a ROUTE key", () => {
    expect(parseBackOrigin("BOGUS_KEY")).toBeUndefined();
  });

  it("rejects inherited Object.prototype keys (e.g. toString, __proto__)", () => {
    expect(parseBackOrigin("toString")).toBeUndefined();
    expect(parseBackOrigin("__proto__")).toBeUndefined();
    expect(parseBackOrigin("hasOwnProperty")).toBeUndefined();
  });

  it("returns the value for a valid global ROUTE key", () => {
    expect(parseBackOrigin("SOURCE_DATASETS")).toBe("SOURCE_DATASETS");
  });

  it("returns the value for a valid atlas-scoped ROUTE key", () => {
    expect(parseBackOrigin("ATLAS_SOURCE_DATASETS")).toBe(
      "ATLAS_SOURCE_DATASETS",
    );
  });
});

describe("resolveBackPath", () => {
  it("returns undefined when origin is undefined", () => {
    expect(
      resolveBackPath({ origin: undefined, pathParameter: {} }),
    ).toBeUndefined();
  });

  it("resolves a global ROUTE key with no dynamic segments", () => {
    expect(
      resolveBackPath({ origin: "SOURCE_DATASETS", pathParameter: {} }),
    ).toBe("/source-datasets");
  });

  it("resolves an atlas-scoped ROUTE key against pathParameter.atlasId", () => {
    expect(
      resolveBackPath({
        origin: "ATLAS_SOURCE_DATASETS",
        pathParameter: { atlasId: "abc-123" },
      }),
    ).toBe("/atlases/abc-123/source-datasets");
  });

  it("ignores extra pathParameter keys not present in the route template", () => {
    expect(
      resolveBackPath({
        origin: "ATLAS_SOURCE_STUDIES",
        pathParameter: { atlasId: "abc", sourceDatasetId: "xyz" },
      }),
    ).toBe("/atlases/abc/source-studies");
  });

  it("returns undefined when the route template has dynamic segments not satisfied by pathParameter", () => {
    // INTEGRATED_OBJECT_SOURCE_DATASETS needs [atlasId] + [componentAtlasId];
    // a source-dataset-detail pathParameter only carries atlasId + sourceDatasetId.
    expect(
      resolveBackPath({
        origin: "INTEGRATED_OBJECT_SOURCE_DATASETS",
        pathParameter: { atlasId: "abc", sourceDatasetId: "xyz" },
      }),
    ).toBeUndefined();
  });
});

describe("withBackOrigin", () => {
  it("appends ?from=<origin> to a URL with no existing query string", () => {
    expect(
      withBackOrigin("/atlases/abc/source-datasets/xyz", "SOURCE_DATASETS"),
    ).toBe("/atlases/abc/source-datasets/xyz?from=SOURCE_DATASETS");
  });

  it("uses the literal ROUTE key as the from value", () => {
    expect(
      withBackOrigin(
        "/atlases/abc/integrated-objects/yyy",
        "COMPONENT_ATLASES",
      ),
    ).toBe("/atlases/abc/integrated-objects/yyy?from=COMPONENT_ATLASES");
  });

  it("preserves an existing query string and joins with '&'", () => {
    expect(withBackOrigin("/foo?bar=1", "SOURCE_DATASETS")).toBe(
      "/foo?bar=1&from=SOURCE_DATASETS",
    );
  });

  it("preserves a hash fragment", () => {
    expect(withBackOrigin("/foo#section", "SOURCE_DATASETS")).toBe(
      "/foo?from=SOURCE_DATASETS#section",
    );
  });

  it("preserves both an existing query string and a hash fragment", () => {
    expect(withBackOrigin("/foo?bar=1#section", "SOURCE_DATASETS")).toBe(
      "/foo?bar=1&from=SOURCE_DATASETS#section",
    );
  });
});
