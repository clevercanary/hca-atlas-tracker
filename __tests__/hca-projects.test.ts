import { ProjectsResponse } from "../app/apis/azul/hca-dcp/common/responses";
import { RefreshDataNotReadyError } from "../app/services/common/refresh-service";
import { DOI_NORMAL } from "../testing/constants";

const getAllProjects = jest.fn();
const getLatestCatalog = jest.fn();

jest.mock("../app/utils/hca-api", () => ({
  getAllProjects,
  getLatestCatalog,
}));

let getProjectIdByDoi: typeof import("../app/services/hca-projects").getProjectIdByDoi;

let resolveGetAllProjects: (id: ProjectsResponse[]) => void;

beforeAll(async () => {
  const [promise, resolve] = promiseWithResolvers<ProjectsResponse[]>();
  resolveGetAllProjects = resolve;
  getAllProjects.mockReturnValueOnce(promise);
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
});

// Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers#description
function promiseWithResolvers<T>(): [
  Promise<T>,
  (v: T) => void,
  (v: unknown) => void
] {
  let resolve: (v: T) => void;
  let reject: (v: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The function passed to the Promise constructor is called immediately, guaranteeing that these will be defined.
  return [promise, resolve!, reject!];
}
