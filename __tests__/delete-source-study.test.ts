import { METHOD } from "@/app/common/entities";
import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";

jest.mock("@/app/hooks/UseDeleteData/hook");
jest.mock("next/router", () => ({
  __esModule: true,
  default: { push: jest.fn() },
}));

import { useDeleteData } from "@/app/hooks/UseDeleteData/hook";
import { SOURCE_STUDIES } from "@/app/views/SourceStudiesView/hooks/UseFetchSourceStudies/query/constants";
import { SOURCE_STUDY } from "@/app/views/SourceStudyView/hooks/UseFetchSourceStudy/query/constants";
import { useDeleteSourceStudy } from "@/app/views/SourceStudyView/hooks/useDeleteSourceStudy";
import { createQuerySnackbarWrapper } from "@/testing/snackbar";
import { createMockResponse, promiseWithResolvers } from "@/testing/utils";
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
  it("wires useDeleteData with the source-study DELETE endpoint, and an onSuccess", () => {
    renderHook(() => useDeleteSourceStudy(PATH_PARAMETER), {
      wrapper: createQuerySnackbarWrapper(new QueryClient()),
    });

    // No `onError`: the hook wires the snackbar itself.
    expect(mockUseDeleteData).toHaveBeenCalledWith(
      expect.stringContaining(SOURCE_STUDY_ID),
      METHOD.DELETE,
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    // The request URL is atlas-scoped.
    expect(mockUseDeleteData.mock.calls[0][0]).toContain(ATLAS_ID);
  });

  it("ignores a second delete while the first is still away", async () => {
    // The menu closes on click but can be reopened mid-request, so this was
    // reachable. Two in-flight copies of the same DELETE share a snackbar
    // entry — the key is method, URL and payload — and the second's success
    // dismisses that key, erasing the first's unread failure. Guarded with a
    // ref as well as state, because the state update doesn't land before a
    // second click in the same tick could read it.
    const [pending, respond] = promiseWithResolvers<boolean>();
    const onDelete = jest.fn().mockReturnValue(pending);
    mockUseDeleteData.mockReturnValue({ onDelete });

    const { result } = renderHook(() => useDeleteSourceStudy(PATH_PARAMETER), {
      wrapper: createQuerySnackbarWrapper(new QueryClient()),
    });

    let first: Promise<boolean> | undefined;
    let second: Promise<boolean> | undefined;
    await act(async () => {
      first = result.current.onDelete();
      second = result.current.onDelete();
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(await second).toBe(false);

    await act(async () => {
      respond(false);
      await first;
    });
  });

  it("reports the delete as in flight, and stops once it settles", async () => {
    // What disables the menu item. Reset on every outcome, so a failed delete
    // — where the study is still there to retry — doesn't leave the action
    // stuck.
    const [pending, respond] = promiseWithResolvers<boolean>();
    mockUseDeleteData.mockReturnValue({
      onDelete: jest.fn().mockReturnValue(pending),
    });

    const { result } = renderHook(() => useDeleteSourceStudy(PATH_PARAMETER), {
      wrapper: createQuerySnackbarWrapper(new QueryClient()),
    });

    expect(result.current.isDeleting).toBe(false);

    let deleting: Promise<boolean> | undefined;
    await act(async () => {
      deleting = result.current.onDelete();
    });

    expect(result.current.isDeleting).toBe(true);

    await act(async () => {
      respond(false);
      await deleting;
    });

    expect(result.current.isDeleting).toBe(false);
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
      wrapper: createQuerySnackbarWrapper(queryClient),
    });

    const onSuccess = mockUseDeleteData.mock.calls[0][2]?.onSuccess;
    expect(onSuccess).toBeDefined();
    onSuccess?.(createMockResponse(200, {}));

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
