import "@testing-library/jest-dom";

jest.mock("@/app/config/config", () => ({
  config: jest.fn(() => ({ entities: [] })),
}));
jest.mock("@databiosphere/findable-ui/lib/config/utils", () => ({
  ...jest.requireActual("@databiosphere/findable-ui/lib/config/utils"),
  getEntityConfig: jest.fn(),
}));
jest.mock("@databiosphere/findable-ui/lib/hooks/useEntityService", () => ({
  ...jest.requireActual(
    "@databiosphere/findable-ui/lib/hooks/useEntityService",
  ),
  getEntityService: jest.fn(),
}));
jest.mock("@databiosphere/findable-ui/lib/utils/seedDatabase", () => ({
  seedDatabase: jest.fn(),
}));

import IndexPage, { getStaticProps } from "@/pages/[entityListType]/index";
import { getEntityConfig } from "@databiosphere/findable-ui/lib/config/utils";
import { getEntityService } from "@databiosphere/findable-ui/lib/hooks/useEntityService";
import { EXPLORE_MODE } from "@databiosphere/findable-ui/lib/hooks/useExploreMode/types";
import { seedDatabase } from "@databiosphere/findable-ui/lib/utils/seedDatabase";
import { render } from "@testing-library/react";
import { type GetStaticPropsContext } from "next";

const mockGetEntityConfig = getEntityConfig as jest.MockedFunction<
  typeof getEntityConfig
>;
const mockGetEntityService = getEntityService as jest.MockedFunction<
  typeof getEntityService
>;

const CONTEXT = {
  params: { entityListType: "tasks" },
} as unknown as GetStaticPropsContext;
const HITS = [{ id: "task-id" }];

describe("entity list page getStaticProps", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEntityService.mockReturnValue({
      fetchAllEntities: jest.fn(async () => ({ hits: HITS })),
    } as unknown as ReturnType<typeof getEntityService>);
  });

  it("passes the seeded entities' hits as `data` for client-side fetching", async () => {
    mockGetEntityConfig.mockReturnValue({
      exploreMode: EXPLORE_MODE.CS_FETCH_CS_FILTERING,
    } as ReturnType<typeof getEntityConfig>);

    const result = await getStaticProps(CONTEXT);

    expect(seedDatabase).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      props: { data: HITS, entityListType: "tasks" },
    });
  });

  it("returns only the entity list type for server-side fetching", async () => {
    mockGetEntityConfig.mockReturnValue({
      exploreMode: EXPLORE_MODE.SS_FETCH_CS_FILTERING,
    } as ReturnType<typeof getEntityConfig>);

    const result = await getStaticProps(CONTEXT);

    expect(seedDatabase).not.toHaveBeenCalled();
    expect(result).toEqual({ props: { entityListType: "tasks" } });
  });
});

describe("entity list page", () => {
  it("renders nothing without an entity list type", () => {
    const { container } = render(<IndexPage entityListType="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
