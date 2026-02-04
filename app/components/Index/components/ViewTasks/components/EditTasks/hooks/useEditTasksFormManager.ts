import { EntityMapper } from "@databiosphere/findable-ui/lib/config/entities";
import { useEntityService } from "@databiosphere/findable-ui/lib/hooks/useEntityService";
import { useExploreState } from "@databiosphere/findable-ui/lib/hooks/useExploreState";
import { ExploreActionKind } from "@databiosphere/findable-ui/lib/providers/exploreState";
import { useCallback } from "react";
import { FieldValues } from "react-hook-form";
import { API } from "../../../../../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  HCAAtlasTrackerListValidationRecord,
  HCAAtlasTrackerValidationRecord,
} from "../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../../../../common/entities";
import {
  FormMethod,
  YupValidatedFormValues,
} from "../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../../../../../hooks/useFormManager/useFormManager";

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
  const { entityMapper } = useEntityService<
    HCAAtlasTrackerListValidationRecord,
    HCAAtlasTrackerValidationRecord
  >();
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
              updatedListItems: mapEntities(data, entityMapper),
            },
            type: ExploreActionKind.PatchExploreResponse,
          });
          closeDialog();
        },
      });
    },
    [
      closeDialog,
      entityMapper,
      exploreDispatch,
      onSubmit,
      requestMethod,
      requestURL,
    ],
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Returns tasks response mapped to the list task.
 * @param tasksResponse - Tasks response.
 * @param entityMapper - Entity mapper.
 * @returns tasks.
 */
function mapEntities(
  tasksResponse: HCAAtlasTrackerValidationRecord[],
  entityMapper?: EntityMapper<
    HCAAtlasTrackerListValidationRecord,
    HCAAtlasTrackerValidationRecord
  >,
): HCAAtlasTrackerListValidationRecord[] {
  if (!entityMapper) {
    throw new Error("Entity mapper is required.");
  }
  return tasksResponse.map(entityMapper);
}
