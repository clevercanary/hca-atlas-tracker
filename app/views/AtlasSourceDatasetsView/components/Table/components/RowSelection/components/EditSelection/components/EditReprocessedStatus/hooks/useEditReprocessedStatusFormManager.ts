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
import { SOURCE_DATASETS } from "../../../../../../../../../../../views/AtlasSourceDatasetsView/hooks/useFetchAtlasSourceDatasets";
import {
  AtlasSourceDataset,
  Entity,
} from "../../../../../../../../../entities";
import { ReprocessedStatusEditData } from "../common/entities";

export const useEditReprocessedStatusFormManager = (
  formMethod: FormMethod<ReprocessedStatusEditData>,
  onClose: () => void,
  table: Table<AtlasSourceDataset>,
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
    (payload: ReprocessedStatusEditData) => {
      onSubmit(
        getRequestURL(
          API.ATLAS_SOURCE_DATASETS_REPROCESSED_STATUS,
          pathParameter,
        ),
        METHOD.PATCH,
        payload,
        { onReset: reset, onSuccess },
      );
    },
    [onSuccess, onSubmit, pathParameter, reset],
  );

  return useFormManager(formMethod, { onDiscard, onSave });
};
