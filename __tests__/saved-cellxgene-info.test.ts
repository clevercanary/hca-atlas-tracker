import fsp from "fs/promises";

const JSON_PATH = "./catalog/output/cellxgene-info.json";

describe("saved-cellxgene-info", () => {
  it("Loads successfully with actual data", async () => {
    const { TIER_ONE_METADATA_STATUS_BY_CELLXGENE_COLLECTION_ID } =
      await import("@/app/services/saved-cellxgene-info");

    expect(TIER_ONE_METADATA_STATUS_BY_CELLXGENE_COLLECTION_ID).toBeInstanceOf(
      Map,
    );

    const jsonData = JSON.parse(await fsp.readFile(JSON_PATH, "utf8"));
    const actualCollectionIds = Object.keys(jsonData.collections);

    expect(
      Array.from(
        TIER_ONE_METADATA_STATUS_BY_CELLXGENE_COLLECTION_ID.keys(),
      ).toSorted(),
    ).toEqual(actualCollectionIds.toSorted());
  });
});
