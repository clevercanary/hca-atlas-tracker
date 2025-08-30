import { getAtlasByNetworkVersionAndShortName } from "../app/data/files";
import { ATLAS_DRAFT, ATLAS_WITH_IL } from "../testing/constants";
import { resetDatabase } from "../testing/db-utils";
// Mock refresh-dependent services to avoid RefreshDataNotReadyError
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");

describe("getAtlasByNetworkVersionAndShortName", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  const DRAFT_ATLAS_ID = ATLAS_DRAFT.id;
  const IL_ATLAS_ID = ATLAS_WITH_IL.id;
  const DRAFT_NETWORK = ATLAS_DRAFT.network;
  const DRAFT_VERSION = ATLAS_DRAFT.version;
  const DRAFT_SHORT_NAME = ATLAS_DRAFT.shortName;

  describe("successful lookups", () => {
    it("should find atlas by exact version match", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        DRAFT_NETWORK,
        DRAFT_VERSION,
        DRAFT_SHORT_NAME
      );

      expect(atlasId).toBe(DRAFT_ATLAS_ID);
    });

    it("should match 2.0 and 2 interchangeably", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        ATLAS_WITH_IL.network,
        "2.0",
        ATLAS_WITH_IL.shortName
      );

      expect(atlasId).toBe(IL_ATLAS_ID);
    });

    it("should find atlas with case-insensitive short name match", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        DRAFT_NETWORK,
        DRAFT_VERSION,
        "TEST-DRAFT"
      );

      expect(atlasId).toBe(DRAFT_ATLAS_ID);
    });

    it("should prioritize exact version match over decimal-stripped version", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        ATLAS_WITH_IL.network,
        ATLAS_WITH_IL.version,
        ATLAS_WITH_IL.shortName
      );

      expect(atlasId).toBe(IL_ATLAS_ID);
    });
  });

  describe("error cases", () => {
    it("should throw error when atlas not found by network", async () => {
      await expect(
        getAtlasByNetworkVersionAndShortName(
          "nonexistent-network",
          DRAFT_VERSION,
          DRAFT_SHORT_NAME
        )
      ).rejects.toThrow(
        `Atlas not found for network: nonexistent-network, shortName: ${DRAFT_SHORT_NAME}, version: ${DRAFT_VERSION}`
      );
    });

    it("should throw error when atlas not found by version", async () => {
      await expect(
        getAtlasByNetworkVersionAndShortName(
          DRAFT_NETWORK,
          "99.99",
          DRAFT_SHORT_NAME
        )
      ).rejects.toThrow(
        `Atlas not found for network: ${DRAFT_NETWORK}, shortName: ${DRAFT_SHORT_NAME}, version: 99.99`
      );
    });

    it("should throw error when atlas not found by short name", async () => {
      await expect(
        getAtlasByNetworkVersionAndShortName(
          DRAFT_NETWORK,
          DRAFT_VERSION,
          "nonexistent-atlas"
        )
      ).rejects.toThrow(
        `Atlas not found for network: ${DRAFT_NETWORK}, shortName: nonexistent-atlas, version: ${DRAFT_VERSION}`
      );
    });
  });

  describe("version matching edge cases", () => {
    it("should handle version with multiple decimals", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        ATLAS_WITH_IL.network,
        "2.0.0",
        ATLAS_WITH_IL.shortName
      );

      expect(atlasId).toBe(IL_ATLAS_ID);
    });

    it("should handle single digit version", async () => {
      const atlasId = await getAtlasByNetworkVersionAndShortName(
        ATLAS_WITH_IL.network,
        "2",
        ATLAS_WITH_IL.shortName
      );

      expect(atlasId).toBe(IL_ATLAS_ID);
    });
  });
});
