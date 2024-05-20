import { RefreshDataNotReadyError } from "../app/services/common/refresh-service";
import { CellxGeneCollection } from "../app/utils/cellxgene-api";
import {
  CELLXGENE_ID_NORMAL,
  CELLXGENE_ID_NORMAL2,
  DOI_NORMAL,
  DOI_NORMAL2,
  TEST_CELLXGENE_COLLECTIONS_A,
  TEST_CELLXGENE_COLLECTIONS_B,
} from "../testing/constants";
import { delay, promiseWithResolvers } from "../testing/utils";

jest.mock("../app/services/hca-projects");
jest.mock("../app/services/validations", () => ({
  revalidateAllSourceDatasets: jest.fn(),
}));

jest.useFakeTimers({
  doNotFake: ["setTimeout"],
});

let [getCollectionsBlock, resolveGetCollections] = promiseWithResolvers<void>();
let cellxgeneCollections = TEST_CELLXGENE_COLLECTIONS_A;

const getCellxGeneCollections = jest
  .fn()
  .mockImplementation(async (): Promise<CellxGeneCollection[]> => {
    await getCollectionsBlock;
    return cellxgeneCollections;
  });

jest.mock("../app/utils/cellxgene-api", () => ({
  getCellxGeneCollections,
}));

let getCellxGeneIdByDoi: typeof import("../app/services/cellxgene").getCellxGeneIdByDoi;

beforeAll(async () => {
  getCellxGeneIdByDoi = (await import("../app/services/cellxgene"))
    .getCellxGeneIdByDoi;
});

afterAll(() => {
  globalThis.hcaAtlasTrackerCellxGeneInfoCache = undefined;
});

describe("getCellxGeneIdByDoi", () => {
  it("Throws RefreshDataNotReadyError when called before CELLxGENE collections are initially fetched", () => {
    expect(() => getCellxGeneIdByDoi([DOI_NORMAL])).toThrow(
      RefreshDataNotReadyError
    );
  });

  it("Returns ID for project in initial catalog", async () => {
    resolveGetCollections();
    await delay();
    expect(getCellxGeneIdByDoi([DOI_NORMAL])).toEqual(CELLXGENE_ID_NORMAL);
  });

  it("Returns null for project not in initial catalog and does not refresh when 2 hours have passed", async () => {
    cellxgeneCollections = TEST_CELLXGENE_COLLECTIONS_B;
    jest.setSystemTime(jest.now() + 7200000);
    [getCollectionsBlock, resolveGetCollections] = promiseWithResolvers<void>();
    expect(getCellxGeneIdByDoi([DOI_NORMAL2])).toEqual(null);
    await delay();
    expect(getCellxGeneCollections).toHaveBeenCalledTimes(1);
  });

  it("Returns null for project not in initial catalog and starts refresh when catalog is more than 4 hours out of date", async () => {
    jest.setSystemTime(jest.now() + 7200001);
    expect(getCellxGeneIdByDoi([DOI_NORMAL2])).toEqual(null);
    await delay();
    expect(getCellxGeneCollections).toHaveBeenCalledTimes(2);
  });

  it("Returns null for project not in initial catalog and does not start new refresh while catalog is refreshing", async () => {
    expect(getCellxGeneIdByDoi([DOI_NORMAL2])).toEqual(null);
    await delay();
    expect(getCellxGeneCollections).toHaveBeenCalledTimes(2);
  });

  it("Returns ID for project not in initial catalog when refresh finishes", async () => {
    resolveGetCollections();
    await delay();
    expect(getCellxGeneIdByDoi([DOI_NORMAL2])).toEqual(CELLXGENE_ID_NORMAL2);
  });
});
