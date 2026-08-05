import { METHOD } from "@/app/common/entities";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import {
  createElement,
  type FunctionComponent,
  type PropsWithChildren,
} from "react";

jest.mock("@/app/hooks/useDeleteData");
jest.mock("next/router", () => ({
  __esModule: true,
  default: { push: jest.fn() },
}));

import { useDeleteData } from "@/app/hooks/useDeleteData";
import { SOURCE_STUDIES } from "@/app/views/SourceStudiesView/hooks/UseFetchSourceStudies/query/constants";
import { SOURCE_STUDY } from "@/app/views/SourceStudyView/hooks/UseFetchSourceStudy/query/constants";
import { useDeleteSourceStudy } from "@/app/views/SourceStudyView/hooks/useDeleteSourceStudy";
import Router from "next/router";

const mockUseDeleteData = useDeleteData as jest.MockedFunction<
  typeof useDeleteData
>;
const mockPush = Router.push as jest.MockedFunction<typeof Router.push>;

const ATLAS_ID = "atlas-1";
const SOURCE_STUDY_ID = "study-1";
const PATH_PARAMETER = { atlasId: ATLAS_ID, sourceStudyId: SOURCE_STUDY_ID };

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDeleteData.mockReturnValue({ onDelete: jest.fn() });
});

describe("useDeleteSourceStudy", () => {
  it("wires useDeleteData with the source-study DELETE endpoint and an onSuccess", () => {
    renderHook(() => useDeleteSourceStudy(PATH_PARAMETER), {
      wrapper: wrapperFor(new QueryClient()),
    });

    expect(mockUseDeleteData).toHaveBeenCalledWith(
      expect.stringContaining(SOURCE_STUDY_ID),
      METHOD.DELETE,
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    // The request URL is atlas-scoped.
    expect(mockUseDeleteData.mock.calls[0][0]).toContain(ATLAS_ID);
  });

  it("removes the deleted detail from cache and redirects on delete success", () => {
    const queryClient = new QueryClient();
    // Seed the destination list (still containing the study) and the study's
    // own detail query, as they would be while sitting on the detail page.
    queryClient.setQueryData(
      [SOURCE_STUDIES, ATLAS_ID],
      [{ id: SOURCE_STUDY_ID }, { id: "study-2" }],
    );
    queryClient.setQueryData([SOURCE_STUDY, ATLAS_ID, SOURCE_STUDY_ID], {
      id: SOURCE_STUDY_ID,
    });

    renderHook(() => useDeleteSourceStudy(PATH_PARAMETER), {
      wrapper: wrapperFor(queryClient),
    });

    const onSuccess = mockUseDeleteData.mock.calls[0][2]?.onSuccess;
    expect(onSuccess).toBeDefined();
    onSuccess?.();

    // Deleted detail is dropped from cache via removeQueries (not invalidated —
    // that would refetch a now-404 resource on the still-mounted detail page).
    expect(
      queryClient.getQueryData([SOURCE_STUDY, ATLAS_ID, SOURCE_STUDY_ID]),
    ).toBeUndefined();
    // The list is NOT invalidated: its staleTime: 0 mount refetch after the
    // redirect covers navigation staleness (per app/query/README).
    expect(
      queryClient.getQueryState([SOURCE_STUDIES, ATLAS_ID])?.isInvalidated,
    ).toBe(false);
    // Redirect to the atlas-scoped source studies list.
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining(ATLAS_ID));
    expect(mockPush.mock.calls[0][0]).not.toContain(SOURCE_STUDY_ID);
  });
});

/**
 * Build a QueryClientProvider wrapper around the given client so hooks that call
 * useQueryClient have one available.
 * @param queryClient - Query client to provide.
 * @returns Wrapper component.
 */
function wrapperFor(
  queryClient: QueryClient,
): FunctionComponent<PropsWithChildren> {
  return function QueryWrapper({ children }: PropsWithChildren) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}
