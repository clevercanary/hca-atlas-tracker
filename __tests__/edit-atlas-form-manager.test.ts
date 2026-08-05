import { type HCAAtlasTrackerAtlas } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import {
  createElement,
  type FunctionComponent,
  type PropsWithChildren,
} from "react";

jest.mock("@databiosphere/findable-ui/lib/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("@/app/hooks/useAuthorization", () => ({
  useAuthorization: jest.fn(),
}));
jest.mock(
  "@/app/hooks/useUserHasEditAuthorization/useUserHasEditAuthorization",
  () => ({ useUserHasEditAuthorization: jest.fn() }),
);
jest.mock("next/router", () => ({
  __esModule: true,
  default: { push: jest.fn() },
}));

import { useAuthorization } from "@/app/hooks/useAuthorization";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { useUserHasEditAuthorization } from "@/app/hooks/useUserHasEditAuthorization/useUserHasEditAuthorization";
import { type AtlasEditData } from "@/app/views/AtlasView/common/entities";
import { useEditAtlasFormManager } from "@/app/views/AtlasView/hooks/useEditAtlasFormManager";
import { useAuth } from "@databiosphere/findable-ui/lib/auth/hooks/useAuth";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseAuthorization = useAuthorization as jest.MockedFunction<
  typeof useAuthorization
>;
const mockUseUserHasEditAuthorization =
  useUserHasEditAuthorization as jest.MockedFunction<
    typeof useUserHasEditAuthorization
  >;

const ATLAS_ID = "atlas-1";
const PATH_PARAMETER = { atlasId: ATLAS_ID };
const PAYLOAD = { cellxgeneAtlasCollection: null } as unknown as AtlasEditData;
const SAVED_ATLAS = {
  id: ATLAS_ID,
  shortName: "Gut v2",
} as unknown as HCAAtlasTrackerAtlas;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    authState: { isAuthenticated: true },
  } as ReturnType<typeof useAuth>);
  mockUseAuthorization.mockReturnValue({ user: {} } as ReturnType<
    typeof useAuthorization
  >);
  mockUseUserHasEditAuthorization.mockReturnValue({
    canEdit: true,
  } as ReturnType<typeof useUserHasEditAuthorization>);
});

describe("useEditAtlasFormManager", () => {
  it("writes the save response into the atlas cache via setQueryData (no invalidate) so the view reflects the save", () => {
    const queryClient = new QueryClient();
    const onSubmit = jest.fn();
    // handleSubmit passes straight through to the manager's onSave with a valid
    // payload (bypassing react-hook-form validation for the unit test).
    const formMethod = {
      formState: { isDirty: true },
      handleSubmit: (onValid: (payload: AtlasEditData) => void) => (): void =>
        onValid(PAYLOAD),
      onSubmit,
      reset: jest.fn(),
    } as unknown as FormMethod<AtlasEditData, HCAAtlasTrackerAtlas>;

    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    const cancelSpy = jest.spyOn(queryClient, "cancelQueries");

    const { result } = renderHook(
      () => useEditAtlasFormManager(PATH_PARAMETER, formMethod),
      { wrapper: wrapperFor(queryClient) },
    );

    // Trigger save.
    result.current.formAction?.onSave?.();

    // The atlas PUT is submitted with an onSuccess callback.
    expect(onSubmit).toHaveBeenCalledWith(
      expect.stringContaining(ATLAS_ID),
      METHOD.PUT,
      expect.anything(),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    // Its onSuccess writes the response into the atlas cache — which is what the
    // detail view reads (via useFetchAtlas → useForm apiData), so the save is
    // reflected without a refetch.
    const { onSuccess } = onSubmit.mock.calls[0][3];
    onSuccess(SAVED_ATLAS);

    expect(queryClient.getQueryData([ATLAS, ATLAS_ID])).toBe(SAVED_ATLAS);
    // setQueryData, not invalidateQueries — no refetch round-trip / stale flash.
    expect(invalidateSpy).not.toHaveBeenCalled();
    // An in-flight GET is cancelled first so it can't resolve after the save and
    // clobber the cache with pre-save data (setQueryData doesn't cancel it).
    expect(cancelSpy).toHaveBeenCalledWith({ queryKey: [ATLAS, ATLAS_ID] });
  });
});

/**
 * Build a QueryClientProvider wrapper around the given client.
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
