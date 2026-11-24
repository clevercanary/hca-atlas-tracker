import { type API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { type HCAAtlasTrackerValidationRecord } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { taskInputMapper } from "@/app/apis/catalog/hca-atlas-tracker/common/utils";
import { type METHOD } from "@/app/common/entities";
import {
  type FormMethod,
  type YupValidatedFormValues,
} from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { useExploreState } from "@databiosphere/findable-ui/lib/hooks/useExploreState";
import { ExploreActionKind } from "@databiosphere/findable-ui/lib/providers/exploreState";
import { useCallback } from "react";
import { type FieldValues } from "react-hook-form";

export const useEditTasksFormManager = <
  T extends FieldValues,
  R extends HCAAtlasTrackerValidationRecord[] =
    HCAAtlasTrackerValidationRecord[],
>(
  formMethod: FormMethod<T, R>,
  closeDialog: () => void,
  requestURL?: API,
  requestMethod?: METHOD,
): FormManager => {
  const { exploreDispatch } = useExploreState();
  const { onSubmit } = formMethod;

  const onDiscard = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  const onSave = useCallback(
    (payload: YupValidatedFormValues<T>) => {
      if (!requestURL || !requestMethod) return;
      onSubmit(requestURL, requestMethod, payload, {
        onSuccess: (data) => {
          exploreDispatch({
            payload: {
              listItemKey: "id",
              updatedListItems: data.map((task) => taskInputMapper(task)),
            },
            type: ExploreActionKind.PatchExploreResponse,
          });
          closeDialog();
        },
      });
    },
    [closeDialog, exploreDispatch, onSubmit, requestMethod, requestURL],
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};
