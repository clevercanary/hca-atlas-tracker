import { renderHook } from "@testing-library/react";

// Mock dependencies before imports
jest.mock("../app/hooks/useDeleteData");
jest.mock("../app/hooks/useFetchDataState");
jest.mock("../app/hooks/useFetchData");
jest.mock("../app/hooks/useResetFetchStatus");
jest.mock("../app/providers/entity/hook");

import { useDeleteData } from "../app/hooks/useDeleteData";
import { useFetchDataState } from "../app/hooks/useFetchDataState";
import { useFetchData, FETCH_PROGRESS } from "../app/hooks/useFetchData";
import { useEntity } from "../app/providers/entity/hook";
import { useEditIntegratedObjectSourceDatasets } from "../app/views/IntegratedObjectSourceDatasetsView/hooks/useEditIntegratedObjectSourceDatasets";
import { useFetchIntegratedObjectSourceDatasets } from "../app/views/IntegratedObjectSourceDatasetsView/hooks/useFetchIntegratedObjectSourceDatasets";
import {
  renderFileName,
  renderPublicationString,
} from "../app/views/IntegratedObjectSourceDatasetsView/components/Table/viewBuilders";
import { IntegratedObjectSourceDataset } from "../app/views/IntegratedObjectSourceDatasetsView/entities";
import { HCAAtlasTrackerSourceDataset } from "../app/apis/catalog/hca-atlas-tracker/common/entities";

// Type mocks
const mockUseDeleteData = useDeleteData as jest.MockedFunction<
  typeof useDeleteData
>;
const mockUseFetchDataState = useFetchDataState as jest.MockedFunction<
  typeof useFetchDataState
>;
const mockUseFetchData = useFetchData as jest.MockedFunction<
  typeof useFetchData
>;
const mockUseEntity = useEntity as jest.MockedFunction<typeof useEntity>;

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

describe("useEditIntegratedObjectSourceDatasets", () => {
  const mockOnDelete = jest.fn().mockResolvedValue(undefined);
  const mockFetchDataDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeleteData.mockReturnValue({ onDelete: mockOnDelete });
    mockUseFetchDataState.mockReturnValue({
      fetchDataDispatch: mockFetchDataDispatch,
      fetchDataState: {
        shouldFetch: true,
        shouldFetchByKey: {},
      },
    });
  });

  it("returns onDelete function", () => {
    const { result } = renderHook(() =>
      useEditIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
    );

    expect(result.current.onDelete).toBeDefined();
    expect(typeof result.current.onDelete).toBe("function");
  });

  it("calls useDeleteData with correct API URL", () => {
    renderHook(() =>
      useEditIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
    );

    expect(mockUseDeleteData).toHaveBeenCalledWith(
      expect.stringContaining(TEST_ATLAS_ID),
      undefined,
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("dispatches fetchData on successful delete", () => {
    renderHook(() =>
      useEditIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
    );

    // Get the onSuccess callback passed to useDeleteData
    const onSuccessCallback = mockUseDeleteData.mock.calls[0][2]?.onSuccess;
    expect(onSuccessCallback).toBeDefined();

    // Call the onSuccess callback
    onSuccessCallback?.();

    expect(mockFetchDataDispatch).toHaveBeenCalled();
  });
});

describe("useFetchIntegratedObjectSourceDatasets", () => {
  const mockFetchDataDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFetchDataState.mockReturnValue({
      fetchDataDispatch: mockFetchDataDispatch,
      fetchDataState: {
        shouldFetch: true,
        shouldFetchByKey: { integratedObjectSourceDatasets: true },
      },
    });
  });

  it("returns source datasets with atlasId mapped", () => {
    const testData = [TEST_SOURCE_DATASET] as HCAAtlasTrackerSourceDataset[];

    mockUseFetchData.mockReturnValue({
      data: testData,
      isSuccess: true,
      progress: FETCH_PROGRESS.COMPLETED,
    });

    const { result } = renderHook(() =>
      useFetchIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
    );

    expect(result.current.integratedObjectSourceDatasets).toHaveLength(1);
    expect(result.current.integratedObjectSourceDatasets?.[0].atlasId).toBe(
      TEST_ATLAS_ID,
    );
    expect(result.current.integratedObjectSourceDatasets?.[0].id).toBe(
      TEST_SOURCE_DATASET_ID,
    );
  });

  it("returns empty array when data is undefined", () => {
    mockUseFetchData.mockReturnValue({
      data: undefined,
      isSuccess: false,
      progress: FETCH_PROGRESS.INACTIVE,
    });

    const { result } = renderHook(() =>
      useFetchIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
    );

    expect(result.current.integratedObjectSourceDatasets).toEqual([]);
  });

  it("throws error when atlasId is missing", () => {
    mockUseFetchData.mockReturnValue({
      data: undefined,
      isSuccess: false,
      progress: FETCH_PROGRESS.INACTIVE,
    });

    expect(() => {
      renderHook(() =>
        useFetchIntegratedObjectSourceDatasets({ componentAtlasId: "test" }),
      );
    }).toThrow("Atlas ID is required");
  });

  it("maps atlasId to all source datasets", () => {
    const testData = [
      { ...TEST_SOURCE_DATASET, id: "dataset-1" },
      { ...TEST_SOURCE_DATASET, id: "dataset-2" },
      { ...TEST_SOURCE_DATASET, id: "dataset-3" },
    ] as HCAAtlasTrackerSourceDataset[];

    mockUseFetchData.mockReturnValue({
      data: testData,
      isSuccess: true,
      progress: FETCH_PROGRESS.COMPLETED,
    });

    const { result } = renderHook(() =>
      useFetchIntegratedObjectSourceDatasets(TEST_PATH_PARAMETER),
    );

    expect(result.current.integratedObjectSourceDatasets).toHaveLength(3);
    result.current.integratedObjectSourceDatasets?.forEach((dataset) => {
      expect(dataset.atlasId).toBe(TEST_ATLAS_ID);
    });
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
        canView: true,
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
      await import("../app/views/IntegratedObjectSourceDatasetsView/components/Table/hooks/UseIntegratedObjectSourceDatasetsTable/hook");

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
      await import("../app/views/IntegratedObjectSourceDatasetsView/components/Table/hooks/UseIntegratedObjectSourceDatasetsTable/hook");

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
      await import("../app/views/IntegratedObjectSourceDatasetsView/components/Table/hooks/UseIntegratedObjectSourceDatasetsTable/hook");

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
      await import("../app/views/IntegratedObjectSourceDatasetsView/components/Table/hooks/UseIntegratedObjectSourceDatasetsTable/hook");

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
      await import("../app/views/IntegratedObjectSourceDatasetsView/components/Table/hooks/UseIntegratedObjectSourceDatasetsTable/hook");

    const { result } = renderHook(() =>
      useIntegratedObjectSourceDatasetsTable(),
    );

    const rows = result.current.table.getRowModel().rows;
    expect(rows[0]?.id).toBe(TEST_SOURCE_DATASET_ID);
  });
});
