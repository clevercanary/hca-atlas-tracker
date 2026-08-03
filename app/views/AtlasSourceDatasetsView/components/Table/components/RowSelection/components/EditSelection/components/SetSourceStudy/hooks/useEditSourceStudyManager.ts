import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { METHOD } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { useEntity } from "@/app/providers/entity/hook";
import { type SourceStudyEditData } from "@/app/views/AtlasSourceDatasetsView/components/Table/components/RowSelection/components/EditSelection/components/SetSourceStudy/common/entities";
import {
  type AtlasSourceDataset,
  type Entity,
} from "@/app/views/AtlasSourceDatasetsView/entities";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/UseFetchAtlasSourceDatasets/query/constants";
import { LABEL } from "@databiosphere/findable-ui/lib/apis/azul/common/entities";
import { useQueryClient } from "@tanstack/react-query";
import { type Table } from "@tanstack/react-table";
import { useCallback } from "react";

export const useEditSourceStudyFormManager = (
  formMethod: FormMethod<SourceStudyEditData>,
  onClose: () => void,
  table: Table<AtlasSourceDataset>,
): FormManager => {
  const { pathParameter } = useEntity() as Entity;
  const queryClient = useQueryClient();
  const { onSubmit, reset } = formMethod;

  const onDiscard = useCallback(() => {
    onClose();
  }, [onClose]);

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [SOURCE_DATASETS, pathParameter.atlasId],
    });
    table.resetRowSelection();
    onClose();
  }, [onClose, pathParameter, queryClient, table]);

  const onSave = useCallback(
    (payload: SourceStudyEditData) => {
      onSubmit(
        getRequestURL(API.ATLAS_SOURCE_DATASETS_SOURCE_STUDY, pathParameter),
        METHOD.PATCH,
        sanitizePayload(payload),
        { onReset: reset, onSuccess },
      );
    },
    [onSuccess, onSubmit, pathParameter, reset],
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
