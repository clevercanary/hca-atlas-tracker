import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import { RefreshDataNotReadyError } from "../app/services/common/refresh-service";
import {
  DOI_NORMAL,
  DOI_NORMAL2,
  HCA_CATALOG_TEST1,
  HCA_CATALOG_TEST2,
  HCA_ID_NORMAL,
  HCA_ID_NORMAL2,
  TEST_HCA_CATALOGS,
} from "../testing/constants";
import { delay, promiseWithResolvers } from "../testing/utils";

let [getAllProjectsBlock, resolveGetAllProjectsBlock] =
  promiseWithResolvers<void>();

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

let getProjectIdByDoi: typeof import("../app/services/hca-projects").getProjectIdByDoi;

beforeAll(async () => {
  getProjectIdByDoi = (await import("../app/services/hca-projects"))
    .getProjectIdByDoi;
});

afterAll(() => {
  globalThis.hcaAtlasTrackerProjectsInfoCache = undefined;
});

describe("getProjectIdByDoi", () => {
  it("Throws RefreshDataNotReadyError when called before HCA projects are initially fetched", () => {
    expect(() => getProjectIdByDoi(DOI_NORMAL)).toThrow(
      RefreshDataNotReadyError
    );
  });

  it("Returns ID for project in initial catalog", async () => {
    resolveGetAllProjectsBlock();
    await delay();
    expect(getProjectIdByDoi(DOI_NORMAL)).toEqual(HCA_ID_NORMAL);
  });

  it("Returns null for project not in initial catalog and does not refresh", async () => {
    [getAllProjectsBlock, resolveGetAllProjectsBlock] =
      promiseWithResolvers<void>();
    expect(getProjectIdByDoi(DOI_NORMAL2)).toEqual(null);
    await delay();
    expect(getAllProjects).toHaveBeenCalledTimes(1);
  });

  it("Returns null for project not in initial catalog and starts refresh when catalog has updated", async () => {
    getLatestCatalog.mockResolvedValue(HCA_CATALOG_TEST2);
    expect(getProjectIdByDoi(DOI_NORMAL2)).toEqual(null);
    await delay();
    expect(getAllProjects).toHaveBeenCalledTimes(2);
  });

  it("Returns null for project not in initial catalog and does not start new refresh while catalog is refreshing", async () => {
    expect(getProjectIdByDoi(DOI_NORMAL2)).toEqual(null);
    await delay();
    expect(getAllProjects).toHaveBeenCalledTimes(2);
  });

  it("Returns ID for project not in initial catalog when refresh finishes", async () => {
    resolveGetAllProjectsBlock();
    await delay();
    expect(getProjectIdByDoi(DOI_NORMAL2)).toEqual(HCA_ID_NORMAL2);
  });
});
