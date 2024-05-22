import { delay, promiseWithResolvers } from "testing/utils";
import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import { CellxGeneCollection } from "../app/utils/cellxgene-api";
import {
  HCA_CATALOG_TEST1,
  HCA_CATALOG_TEST2,
  TEST_CELLXGENE_COLLECTIONS_A,
  TEST_HCA_CATALOGS,
} from "../testing/constants";

const refreshValidations = jest.fn();
jest.mock("../app/services/validations", () => ({
  refreshValidations,
}));

let getAllProjectsBlock: Promise<void>;

const getAllProjects = jest
  .fn()
  .mockImplementation(async (catalog: string): Promise<ProjectsResponse[]> => {
    await getAllProjectsBlock;
    return TEST_HCA_CATALOGS[catalog];
  });

const getLatestCatalog = jest.fn().mockResolvedValue(HCA_CATALOG_TEST1);

jest.mock("../app/utils/hca-api", () => ({
  getAllProjects,
  getLatestCatalog,
}));

let hcaService: typeof import("../app/services/hca-projects");

jest.useFakeTimers({
  doNotFake: ["setTimeout"],
});

let getCollectionsBlock: Promise<void>;

const getCellxGeneCollections = jest
  .fn()
  .mockImplementation(async (): Promise<CellxGeneCollection[]> => {
    await getCollectionsBlock;
    return TEST_CELLXGENE_COLLECTIONS_A;
  });

jest.mock("../app/utils/cellxgene-api", () => ({
  getCellxGeneCollections,
}));

let cellxgeneService: typeof import("../app/services/cellxgene");

let consoleLogSpy: jest.SpyInstance;

beforeAll(async () => {
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  hcaService = await import("../app/services/hca-projects");
  cellxgeneService = await import("../app/services/cellxgene");
});

afterAll(() => {
  consoleLogSpy.mockRestore();
  globalThis.hcaAtlasTrackerProjectsInfoCache = undefined;
  globalThis.hcaAtlasTrackerCellxGeneInfoCache = undefined;
});

test("source datasets are not revalidated when no refresh happens", async () => {
  await delay();
  expect(refreshValidations).toHaveBeenCalledTimes(1);
  hcaService.getProjectIdByDoi([""]);
  cellxgeneService.getCellxGeneIdByDoi([""]);
  await delay();
  expect(hcaService.areProjectsRefreshing()).toBe(false);
  expect(cellxgeneService.isCellxGeneRefreshing()).toBe(false);
  expect(refreshValidations).toHaveBeenCalledTimes(1);
});

test("source datasets are revalidated when last refresh completes", async () => {
  const [projectsPromise, resolveProjects] = promiseWithResolvers<void>();
  getAllProjectsBlock = projectsPromise;
  const [cellxgenePromise, resolveCellxGene] = promiseWithResolvers<void>();
  getCollectionsBlock = cellxgenePromise;

  getLatestCatalog.mockResolvedValue(HCA_CATALOG_TEST2);
  jest.setSystemTime(jest.now() + 14400001);

  hcaService.getProjectIdByDoi([""]);
  cellxgeneService.getCellxGeneIdByDoi([""]);

  await delay();
  expect(refreshValidations).toHaveBeenCalledTimes(1);
  resolveProjects();
  await delay();
  expect(refreshValidations).toHaveBeenCalledTimes(1);
  resolveCellxGene();
  await delay();
  expect(refreshValidations).toHaveBeenCalledTimes(2);
});
