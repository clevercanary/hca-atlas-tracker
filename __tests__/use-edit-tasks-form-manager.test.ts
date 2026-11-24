import { renderHook } from "@testing-library/react";

jest.mock("@databiosphere/findable-ui/lib/hooks/useExploreState", () => ({
  useExploreState: jest.fn(),
}));
jest.mock("@/app/hooks/useFormManager/useFormManager", () => ({
  useFormManager: jest.fn(),
}));

import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { UNPUBLISHED } from "@/app/apis/catalog/hca-atlas-tracker/common/constants";
import { type HCAAtlasTrackerValidationRecord } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { useEditTasksFormManager } from "@/app/components/Index/components/ViewTasks/components/EditTasks/hooks/useEditTasksFormManager";
import {
  type FormMethod,
  type YupValidatedFormValues,
} from "@/app/hooks/useForm/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { GREATEST_UNIX_TIME } from "@/app/utils/date-fns";
import { useExploreState } from "@databiosphere/findable-ui/lib/hooks/useExploreState";
import { ExploreActionKind } from "@databiosphere/findable-ui/lib/providers/exploreState";
import { type FieldValues } from "react-hook-form";

const mockUseFormManager = useFormManager as jest.MockedFunction<
  typeof useFormManager
>;
const mockUseExploreState = useExploreState as jest.MockedFunction<
  typeof useExploreState
>;

// Only the fields `taskInputMapper` reads or rewrites matter here.
const TASK = {
  doi: null,
  id: "task-id",
  targetCompletion: null,
} as unknown as HCAAtlasTrackerValidationRecord;

/**
 * Calls the `onSave` the hook last passed to `useFormManager`.
 */
function save(): void {
  const [, formAction] =
    mockUseFormManager.mock.calls[mockUseFormManager.mock.calls.length - 1];
  formAction?.onSave?.({} as YupValidatedFormValues<FieldValues>);
}

/**
 * Returns a form method whose `onSubmit` calls its `onSuccess` with the given tasks.
 * @param tasks - Tasks the save responds with.
 * @returns form method.
 */
function makeFormMethod(
  tasks: HCAAtlasTrackerValidationRecord[],
): FormMethod<FieldValues, HCAAtlasTrackerValidationRecord[]> {
  return {
    onSubmit: jest.fn((_url, _method, _payload, options) =>
      options?.onSuccess?.(tasks),
    ),
  } as unknown as FormMethod<FieldValues, HCAAtlasTrackerValidationRecord[]>;
}

describe("useEditTasksFormManager", () => {
  const closeDialog = jest.fn();
  const exploreDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExploreState.mockReturnValue({
      exploreDispatch,
    } as unknown as ReturnType<typeof useExploreState>);
  });

  it("patches the list rows with the saved tasks, mapped to list tasks, and closes the dialog", () => {
    renderHook(() =>
      useEditTasksFormManager(
        makeFormMethod([TASK]),
        closeDialog,
        API.TASKS_COMPLETION_DATES,
        METHOD.PATCH,
      ),
    );

    save();

    expect(exploreDispatch).toHaveBeenCalledWith({
      payload: {
        listItemKey: "id",
        updatedListItems: [
          {
            doi: UNPUBLISHED,
            id: "task-id",
            targetCompletion: GREATEST_UNIX_TIME,
          },
        ],
      },
      type: ExploreActionKind.PatchExploreResponse,
    });
    expect(closeDialog).toHaveBeenCalledTimes(1);
  });
});
