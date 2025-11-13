import { LABEL } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { Table } from "@tanstack/react-table";
import { useCallback } from "react";
import { API } from "../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/api";
import { METHOD } from "../../../../../../../../../../../common/entities";
import { getRequestURL } from "../../../../../../../../../../../common/utils";
import { useFetchDataState } from "../../../../../../../../../../../hooks/useFetchDataState";
import { FormMethod } from "../../../../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../../../../../../../../../hooks/useFormManager/useFormManager";
import { useEntity } from "../../../../../../../../../../../providers/entity/hook";
import { fetchData } from "../../../../../../../../../../../providers/fetchDataState/actions/fetchData/dispatch";
import {
  AtlasSourceDataset,
  Entity,
} from "../../../../../../../../../entities";
import { SOURCE_DATASETS } from "../../../../../../../../../hooks/useFetchAtlasSourceDatasets";
import { SourceStudyEditData } from "../common/entities";

export const useEditSourceStudyFormManager = (
  formMethod: FormMethod<SourceStudyEditData>,
  onClose: () => void,
  table: Table<AtlasSourceDataset>
): FormManager => {
  const { pathParameter } = useEntity() as Entity;
  const { fetchDataDispatch } = useFetchDataState();
  const { onSubmit, reset } = formMethod;

  const onDiscard = useCallback(() => {
    onClose();
  }, [onClose]);

  const onSuccess = useCallback(() => {
    fetchDataDispatch(fetchData([SOURCE_DATASETS]));
    table.resetRowSelection();
    onClose();
  }, [fetchDataDispatch, onClose, table]);

  const onSave = useCallback(
    (payload: SourceStudyEditData) => {
      onSubmit(
        getRequestURL(API.ATLAS_SOURCE_DATASETS_SOURCE_STUDY, pathParameter),
        METHOD.PATCH,
        sanitizePayload(payload),
        { onReset: reset, onSuccess }
      );
    },
    [onSuccess, onSubmit, pathParameter, reset]
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};

/**
 * Sanitizes the payload by converting the source study ID to null if it is the unspecified label.
 * @param payload - Payload.
 * @returns The sanitized payload.
 */
function sanitizePayload(payload: SourceStudyEditData): SourceStudyEditData {
  const { sourceStudyId } = payload;
  return {
    ...payload,
    sourceStudyId: sourceStudyId === LABEL.UNSPECIFIED ? null : sourceStudyId,
  };
}
