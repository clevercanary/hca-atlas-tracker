import { delay, promiseWithResolvers } from "testing/utils";
import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import { CellxGeneCollection } from "../app/utils/cellxgene-api";
import {
  HCA_CATALOG_TEST1,
  HCA_CATALOG_TEST2,
  TEST_CELLXGENE_COLLECTIONS_A,
  TEST_HCA_CATALOGS,
} from "../testing/constants";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/source-studies");
jest.mock("../app/services/source-datasets");
jest.mock("../app/services/component-atlases");
jest.mock("../app/utils/pg-app-connect-config");

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
  getCellxGeneDatasets: jest.fn().mockResolvedValue([]),
}));

let cellxgeneService: typeof import("../app/services/cellxgene");

let consoleLogSpy: jest.SpyInstance;

beforeAll(async () => {
  consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

  const [projectsPromise, resolveProjects] = promiseWithResolvers<void>();
  getAllProjectsBlock = projectsPromise;
  const [cellxgenePromise, resolveCellxGene] = promiseWithResolvers<void>();
  getCollectionsBlock = cellxgenePromise;

  hcaService = await import("../app/services/hca-projects");
  cellxgeneService = await import("../app/services/cellxgene");

  resolveProjects();
  resolveCellxGene();
});

afterAll(() => {
  consoleLogSpy.mockRestore();
  globalThis.hcaAtlasTrackerProjectsInfoCache = undefined;
  globalThis.hcaAtlasTrackerCellxGeneInfoCache = undefined;
});

test("source studies are not revalidated when no refresh happens", async () => {
  await delay();
  // With auto-start disabled in tests, no refresh should have occurred yet.
  expect(refreshValidations).toHaveBeenCalledTimes(0);
  // Do not call data getters here, as cache is intentionally uninitialized.
  await delay();
  expect(hcaService.areProjectsRefreshing()).toBe(false);
  expect(cellxgeneService.isCellxGeneRefreshing()).toBe(false);
  expect(refreshValidations).toHaveBeenCalledTimes(0);
});

test("source studies are revalidated when last refresh completes", async () => {
  const [projectsPromise, resolveProjects] = promiseWithResolvers<void>();
  getAllProjectsBlock = projectsPromise;
  const [cellxgenePromise, resolveCellxGene] = promiseWithResolvers<void>();
  getCollectionsBlock = cellxgenePromise;

  getLatestCatalog.mockResolvedValue(HCA_CATALOG_TEST2);
  jest.setSystemTime(jest.now() + 14400001);

  // Explicitly trigger refreshes instead of relying on getters to auto-start
  hcaService.forceProjectsRefresh();
  cellxgeneService.forceCellxGeneRefresh();

  await delay();
  expect(refreshValidations).toHaveBeenCalledTimes(0);
  resolveProjects();
  await delay();
  expect(refreshValidations).toHaveBeenCalledTimes(0);
  resolveCellxGene();
  await delay();
  expect(refreshValidations).toHaveBeenCalledTimes(1);
});
