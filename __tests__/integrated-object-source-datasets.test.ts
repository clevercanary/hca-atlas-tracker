import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, FunctionComponent, PropsWithChildren } from "react";

// Mock dependencies before imports
jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/app/hooks/useDeleteData");
jest.mock("@/app/providers/entity/hook");
jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  fetchResource: jest.fn(),
}));

import { HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { fetchResource } from "@/app/common/utils";
import { useDeleteData } from "@/app/hooks/useDeleteData";
import { useEntity } from "@/app/providers/entity/hook";
import { INTEGRATED_OBJECT } from "@/app/views/ComponentAtlasView/hooks/UseFetchComponentAtlas/query/constants";
import {
  renderFileName,
  renderPublicationString,
} from "@/app/views/IntegratedObjectSourceDatasetsView/components/Table/viewBuilders";
import { IntegratedObjectSourceDataset } from "@/app/views/IntegratedObjectSourceDatasetsView/entities";
import { useEditIntegratedObjectSourceDatasets } from "@/app/views/IntegratedObjectSourceDatasetsView/hooks/useEditIntegratedObjectSourceDatasets";
import { useFetchIntegratedObjectSourceDatasets } from "@/app/views/IntegratedObjectSourceDatasetsView/hooks/UseFetchIntegratedObjectSourceDatasets/hook";
import { INTEGRATED_OBJECT_SOURCE_DATASETS } from "@/app/views/IntegratedObjectSourceDatasetsView/hooks/UseFetchIntegratedObjectSourceDatasets/query/constants";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";

// Type mocks
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseDeleteData = useDeleteData as jest.MockedFunction<
  typeof useDeleteData
>;
const mockUseEntity = useEntity as jest.MockedFunction<typeof useEntity>;
const mockFetchResource = fetchResource as jest.MockedFunction<
  typeof fetchResource
>;

// Test data
const TEST_ATLAS_ID = "test-atlas-id-123";
const TEST_COMPONENT_ATLAS_ID = "test-component-atlas-id-456";
const TEST_SOURCE_DATASET_ID = "test-source-dataset-id-789";

const TEST_PATH_PARAMETER = {
  atlasId: TEST_ATLAS_ID,
  componentAtlasId: TEST_COMPONENT_ATLAS_ID,
};

const TEST_SOURCE_DATASET = {
  assay: ["10x 3' v3"],
  baseFileName: "test-file.h5ad",
  cellCount: 50000,
  disease: ["normal"],
  doi: "10.1234/test-doi",
  fileName: "test-file-r1-wip-1.h5ad",
  id: TEST_SOURCE_DATASET_ID,
  publicationString: "Test Author et al. (2024)",
  suspensionType: ["cell"],
  tissue: ["lung"],
  title: "Test Source Dataset",
} satisfies Partial<HCAAtlasTrackerSourceDataset>;

const TEST_INTEGRATED_OBJECT_SOURCE_DATASET = {
  ...TEST_SOURCE_DATASET,
  atlasId: TEST_ATLAS_ID,
} satisfies Partial<IntegratedObjectSourceDataset>;

/**
 * Wraps a rendered hook in a QueryClientProvider so hooks that call
 * useQueryClient (e.g. for invalidation) have a client available.
 * @returns Wrapper component providing a fresh QueryClient.
 */
function createQueryWrapper(): FunctionComponent<PropsWithChildren> {
  const queryClient = new QueryClient();
  return function QueryWrapper({ children }: PropsWithChildren) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useEditIntegratedObjectSourceDatasets", () => {
  const mockOnDelete = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeleteData.mockReturnValue({ onDelete: mockOnDelete });
  });

  it("returns onDelete function", () => {
    const { result } = renderHook(
      () => useEditIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
      { wrapper: createQueryWrapper() },
    );

    expect(result.current.onDelete).toBeDefined();
    expect(typeof result.current.onDelete).toBe("function");
  });

  it("calls useDeleteData with correct API URL", () => {
    renderHook(
      () => useEditIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
      { wrapper: createQueryWrapper() },
    );

    expect(mockUseDeleteData).toHaveBeenCalledWith(
      expect.stringContaining(TEST_ATLAS_ID),
      undefined,
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("invalidates the integrated object and its source datasets on successful delete", () => {
    const queryClient = new QueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper: FunctionComponent<PropsWithChildren> = ({ children }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    renderHook(
      () => useEditIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
      { wrapper },
    );

    // Get the onSuccess callback passed to useDeleteData
    const onSuccessCallback = mockUseDeleteData.mock.calls[0][2]?.onSuccess;
    expect(onSuccessCallback).toBeDefined();

    // Call the onSuccess callback: both the integrated object detail and its
    // source datasets list are invalidated.
    onSuccessCallback?.();

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [INTEGRATED_OBJECT, TEST_ATLAS_ID, TEST_COMPONENT_ATLAS_ID],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [
        INTEGRATED_OBJECT_SOURCE_DATASETS,
        TEST_ATLAS_ID,
        TEST_COMPONENT_ATLAS_ID,
      ],
    });
  });
});

describe("useFetchIntegratedObjectSourceDatasets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      authState: { isAuthenticated: true },
    } as ReturnType<typeof useAuth>);
  });

  it("maps atlasId onto each fetched source dataset", async () => {
    mockFetchResource.mockResolvedValue({
      json: async () => [
        { ...TEST_SOURCE_DATASET, id: "dataset-1" },
        { ...TEST_SOURCE_DATASET, id: "dataset-2" },
      ],
      status: 200,
    } as Response);

    const { result } = renderHook(
      () => useFetchIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toHaveLength(2);
    result.current.data?.forEach((dataset) => {
      expect(dataset.atlasId).toBe(TEST_ATLAS_ID);
    });
    expect(result.current.data?.map((dataset) => dataset.id)).toEqual([
      "dataset-1",
      "dataset-2",
    ]);
  });

  it("fetches from the integrated object's source datasets endpoint", async () => {
    mockFetchResource.mockResolvedValue({
      json: async () => [],
      status: 200,
    } as Response);

    renderHook(
      () => useFetchIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(mockFetchResource).toHaveBeenCalled());
    const [requestUrl] = mockFetchResource.mock.calls[0];
    expect(requestUrl).toContain(TEST_ATLAS_ID);
    expect(requestUrl).toContain(TEST_COMPONENT_ATLAS_ID);
  });
});

describe("renderFileName", () => {
  it("renders link with correct URL including atlasId and sourceDatasetId", () => {
    const mockRow = {
      original: TEST_INTEGRATED_OBJECT_SOURCE_DATASET,
    };

    const result = renderFileName({
      row: mockRow,
    } as Parameters<typeof renderFileName>[0]);

    // The result is a React element wrapping a Link component
    expect(result).toBeDefined();

    // Get the nested link element from the children
    const linkElement = result.props.children[0];
    expect(linkElement).toBeDefined();

    // Check that the label (children) matches the base filename
    expect(linkElement.props.children).toBe(TEST_SOURCE_DATASET.baseFileName);

    // URL should contain both atlasId and sourceDatasetId
    expect(linkElement.props.href).toContain(TEST_ATLAS_ID);
    expect(linkElement.props.href).toContain(TEST_SOURCE_DATASET_ID);
  });
});

describe("renderPublicationString", () => {
  it("renders link with DOI URL", () => {
    const mockRow = {
      original: TEST_INTEGRATED_OBJECT_SOURCE_DATASET,
    };

    const result = renderPublicationString({
      row: mockRow,
    } as Parameters<typeof renderPublicationString>[0]);

    expect(result).toBeDefined();

    // Get the nested link element from the children
    const linkElement = result.props.children[0];
    expect(linkElement).toBeDefined();

    // Check that the label (children) matches the publication string
    expect(linkElement.props.children).toBe(
      TEST_SOURCE_DATASET.publicationString,
    );

    // URL should be a DOI link
    expect(linkElement.props.href).toContain("doi.org");
  });

  it("handles null DOI gracefully", () => {
    const datasetWithNullDoi = {
      ...TEST_INTEGRATED_OBJECT_SOURCE_DATASET,
      doi: null as unknown as string,
    } as IntegratedObjectSourceDataset;

    const mockRow = {
      original: datasetWithNullDoi,
    };

    // Should not throw when DOI is null
    expect(() => {
      renderPublicationString({
        row: mockRow,
      } as Parameters<typeof renderPublicationString>[0]);
    }).not.toThrow();

    const result = renderPublicationString({
      row: mockRow,
    } as Parameters<typeof renderPublicationString>[0]);

    // Should still render something
    expect(result).toBeDefined();
  });
});

// Helper to create mock entity context with all required properties
const createMockEntityContext = (overrides: {
  canEdit?: boolean;
  integratedObjectSourceDatasets?: IntegratedObjectSourceDataset[];
}): ReturnType<typeof useEntity> =>
  ({
    data: {
      integratedObjectSourceDatasets:
        overrides.integratedObjectSourceDatasets ?? [],
    },
    formManager: {
      access: {
        canEdit: overrides.canEdit ?? false,
      },
      formStatus: {},
      isLoading: false,
    },
    pathParameter: TEST_PATH_PARAMETER,
  }) as unknown as ReturnType<typeof useEntity>;

describe("useIntegratedObjectSourceDatasetsTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns table with action column hidden when canEdit is false", async () => {
    mockUseEntity.mockReturnValue(
      createMockEntityContext({
        canEdit: false,
        integratedObjectSourceDatasets: [
          TEST_INTEGRATED_OBJECT_SOURCE_DATASET as IntegratedObjectSourceDataset,
        ],
      }),
    );

    const { useIntegratedObjectSourceDatasetsTable } =
      await import("@/app/views/IntegratedObjectSourceDatasetsView/components/Table/hooks/UseIntegratedObjectSourceDatasetsTable/hook");

    const { result } = renderHook(() =>
      useIntegratedObjectSourceDatasetsTable(),
    );

    expect(result.current.table).toBeDefined();
    expect(result.current.access?.canEdit).toBe(false);

    // Check that action column is not visible
    const actionColumn = result.current.table.getColumn("action");
    expect(actionColumn?.getIsVisible()).toBe(false);
  });

  it("returns table with action column visible when canEdit is true", async () => {
    mockUseEntity.mockReturnValue(
      createMockEntityContext({
        canEdit: true,
        integratedObjectSourceDatasets: [
          TEST_INTEGRATED_OBJECT_SOURCE_DATASET as IntegratedObjectSourceDataset,
        ],
      }),
    );

    const { useIntegratedObjectSourceDatasetsTable } =
      await import("@/app/views/IntegratedObjectSourceDatasetsView/components/Table/hooks/UseIntegratedObjectSourceDatasetsTable/hook");

    const { result } = renderHook(() =>
      useIntegratedObjectSourceDatasetsTable(),
    );

    expect(result.current.table).toBeDefined();
    expect(result.current.access?.canEdit).toBe(true);

    // Check that action column is visible
    const actionColumn = result.current.table.getColumn("action");
    expect(actionColumn?.getIsVisible()).toBe(true);
  });

  it("applies correct initial sorting", async () => {
    mockUseEntity.mockReturnValue(
      createMockEntityContext({
        canEdit: false,
        integratedObjectSourceDatasets: [],
      }),
    );

    const { useIntegratedObjectSourceDatasetsTable } =
      await import("@/app/views/IntegratedObjectSourceDatasetsView/components/Table/hooks/UseIntegratedObjectSourceDatasetsTable/hook");

    const { result } = renderHook(() =>
      useIntegratedObjectSourceDatasetsTable(),
    );

    const sorting = result.current.table.getState().sorting;
    expect(sorting).toEqual([
      { desc: false, id: "publicationString" },
      { desc: false, id: "title" },
    ]);
  });

  it("returns correct row count", async () => {
    const testDatasets = [
      { ...TEST_INTEGRATED_OBJECT_SOURCE_DATASET, id: "1" },
      { ...TEST_INTEGRATED_OBJECT_SOURCE_DATASET, id: "2" },
      { ...TEST_INTEGRATED_OBJECT_SOURCE_DATASET, id: "3" },
    ] as IntegratedObjectSourceDataset[];

    mockUseEntity.mockReturnValue(
      createMockEntityContext({
        canEdit: false,
        integratedObjectSourceDatasets: testDatasets,
      }),
    );

    const { useIntegratedObjectSourceDatasetsTable } =
      await import("@/app/views/IntegratedObjectSourceDatasetsView/components/Table/hooks/UseIntegratedObjectSourceDatasetsTable/hook");

    const { result } = renderHook(() =>
      useIntegratedObjectSourceDatasetsTable(),
    );

    expect(result.current.table.getRowCount()).toBe(3);
  });

  it("uses row id as getRowId", async () => {
    mockUseEntity.mockReturnValue(
      createMockEntityContext({
        canEdit: false,
        integratedObjectSourceDatasets: [
          TEST_INTEGRATED_OBJECT_SOURCE_DATASET as IntegratedObjectSourceDataset,
        ],
      }),
    );

    const { useIntegratedObjectSourceDatasetsTable } =
      await import("@/app/views/IntegratedObjectSourceDatasetsView/components/Table/hooks/UseIntegratedObjectSourceDatasetsTable/hook");

    const { result } = renderHook(() =>
      useIntegratedObjectSourceDatasetsTable(),
    );

    const rows = result.current.table.getRowModel().rows;
    expect(rows[0]?.id).toBe(TEST_SOURCE_DATASET_ID);
  });
});
