import { API } from "@/app/apis/catalog/hca-atlas-tracker/common/api";
import { METHOD } from "@/app/common/entities";
import { getRequestURL } from "@/app/common/utils";
import { useFetchDataState } from "@/app/hooks/useFetchDataState";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { useEntity } from "@/app/providers/entity/hook";
import { fetchData } from "@/app/providers/fetchDataState/actions/fetchData/dispatch";
import {
  AtlasSourceDataset,
  Entity,
} from "@/app/views/AtlasSourceDatasetsView/entities";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/useFetchAtlasSourceDatasets";
import { Table } from "@tanstack/react-table";
import { useCallback } from "react";
import { PublicationStatusEditData } from "../common/entities";

export const useEditPublicationStatusFormManager = (
  formMethod: FormMethod<PublicationStatusEditData>,
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
    (payload: PublicationStatusEditData) => {
      onSubmit(
        getRequestURL(
          API.ATLAS_SOURCE_DATASETS_PUBLICATION_STATUS,
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
