import { useCallback } from "react";
import { FieldValues } from "react-hook-form";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../../../../../../common/entities";
import { useFetchDataState } from "../../../../../../../../../hooks/useFetchDataState";
import {
  FormMethod,
  YupValidatedFormValues,
} from "../../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../../../../../../../hooks/useFormManager/useFormManager";
import { FetchDataActionKind } from "../../../../../../../../../providers/fetchDataState/fetchDataState";

export const useSourceDatasetFormManager = <T extends FieldValues>(
  onClose: () => void,
  formMethod: FormMethod<T, HCAAtlasTrackerSourceDataset>,
  requestUrl: string,
  method: METHOD,
  canDelete: boolean
): FormManager => {
  const { fetchDataDispatch } = useFetchDataState();
  const { onDelete: onDeleteSourceDataset, onSubmit } = formMethod;

  const onDelete = useCallback(() => {
    onDeleteSourceDataset(requestUrl, METHOD.DELETE, {
      onSuccess: () => {
        fetchDataDispatch({
          payload: undefined,
          type: FetchDataActionKind.FetchData,
        });
        onClose();
      },
    });
  }, [fetchDataDispatch, onClose, onDeleteSourceDataset, requestUrl]);

  const onDiscard = useCallback(() => {
    onClose();
  }, [onClose]);

  const onSave = useCallback(
    (payload: YupValidatedFormValues<T>) => {
      onSubmit(requestUrl, method, payload, {
        onSuccess: () => {
          fetchDataDispatch({
            payload: undefined,
            type: FetchDataActionKind.FetchData,
          });
          onClose();
        },
      });
    },
    [fetchDataDispatch, method, onClose, onSubmit, requestUrl]
  );

  return useFormManager(formMethod, {
    onDelete: canDelete ? onDelete : undefined,
    onDiscard,
    onSave,
  });
};
