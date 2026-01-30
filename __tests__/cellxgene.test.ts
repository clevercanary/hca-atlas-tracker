import { CellxGeneCollection } from "../app/utils/cellxgene-api";
import {
  CELLXGENE_ID_NORMAL,
  CELLXGENE_ID_NORMAL2,
  DOI_NORMAL,
  DOI_NORMAL2,
  TEST_CELLXGENE_COLLECTIONS_A,
  TEST_CELLXGENE_COLLECTIONS_B,
} from "../testing/constants";
import {
  delay,
  promiseWithResolvers,
  withConsoleMessageHiding,
} from "../testing/utils";

jest.mock("../app/services/hca-projects");
jest.mock("../app/utils/pg-app-connect-config");
jest.mock("../app/services/refresh-services", () => ({
  doUpdatesIfRefreshesComplete: jest.fn(),
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

let consoleLogSpy: jest.SpyInstance;

beforeAll(async () => {
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  getCellxGeneIdByDoi = (await import("../app/services/cellxgene"))
    .getCellxGeneIdByDoi;
});

afterAll(() => {
  consoleLogSpy.mockRestore();
  globalThis.hcaAtlasTrackerCellxGeneInfoCache = undefined;
});

describe("getCellxGeneIdByDoi", () => {
  it("Returns error result when called before CELLxGENE data is initially fetched", async () => {
    const result = await withConsoleMessageHiding(
      async () => getCellxGeneIdByDoi([DOI_NORMAL]),
      true,
      undefined,
      ["warn"],
    );
    const isError = result.mapRefreshOrElse(
      () => false,
      () => true,
    );
    expect(isError).toBe(true);
  });

  it("Returns ID for project in initial catalog", async () => {
    resolveGetCollections();
    await delay();
    const value = getCellxGeneIdByDoi([DOI_NORMAL]).unwrapRefresh(undefined);
    expect(value).toEqual(CELLXGENE_ID_NORMAL);
  });

  it("Returns null for project not in initial catalog and does not refresh when 2 hours have passed", async () => {
    cellxgeneCollections = TEST_CELLXGENE_COLLECTIONS_B;
    jest.setSystemTime(jest.now() + 7200000);
    [getCollectionsBlock, resolveGetCollections] = promiseWithResolvers<void>();
    const value = getCellxGeneIdByDoi([DOI_NORMAL2]).unwrapRefresh(undefined);
    expect(value).toEqual(null);
    await delay();
    expect(getCellxGeneCollections).toHaveBeenCalledTimes(1);
  });

  it("Returns null for project not in initial catalog and starts refresh when catalog is more than 4 hours out of date", async () => {
    jest.setSystemTime(jest.now() + 7200001);
    const value = getCellxGeneIdByDoi([DOI_NORMAL2]).unwrapRefresh(undefined);
    expect(value).toEqual(null);
    await delay();
    expect(getCellxGeneCollections).toHaveBeenCalledTimes(2);
  });

  it("Returns null for project not in initial catalog and does not start new refresh while catalog is refreshing", async () => {
    const value = getCellxGeneIdByDoi([DOI_NORMAL2]).unwrapRefresh(undefined);
    expect(value).toEqual(null);
    await delay();
    expect(getCellxGeneCollections).toHaveBeenCalledTimes(2);
  });

  it("Returns ID for project not in initial catalog when refresh finishes", async () => {
    resolveGetCollections();
    await delay();
    const value = getCellxGeneIdByDoi([DOI_NORMAL2]).unwrapRefresh(undefined);
    expect(value).toEqual(CELLXGENE_ID_NORMAL2);
  });
});
