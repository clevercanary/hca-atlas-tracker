import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  HCAAtlasTrackerSourceStudy,
  SourceStudyId,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { PUBLICATION_STATUS } from "../../AddNewSourceDatasetView/common/entities";
import {
  FIELD_NAME,
  PUBLISHED_FIELDS,
  UNPUBLISHED_FIELDS,
} from "../common/constants";
import {
  SourceDatasetEditData,
  SourceDatasetEditDataKeys,
} from "../common/entities";

export const useEditSourceDatasetFormManager = (
  atlasId: AtlasId,
  sourceStudyId: SourceStudyId,
  formMethod: FormMethod<SourceDatasetEditData, HCAAtlasTrackerSourceStudy>
): FormManager => {
  const {
    onDelete: onDeleteSourceDataset,
    onSubmit,
    reset,
    unregister,
    watch,
  } = formMethod;
  const publicationStatus = watch(FIELD_NAME.PUBLICATION_STATUS);
  const isDirty = isFormDirty(formMethod, publicationStatus);

  const onDelete = useCallback(() => {
    onDeleteSourceDataset(
      getRequestURL(API.ATLAS_SOURCE_DATASET, atlasId, sourceStudyId),
      METHOD.DELETE,
      {
        onSuccess: () => onDeleteSuccess(atlasId),
      }
    );
  }, [atlasId, onDeleteSourceDataset, sourceStudyId]);

  const onDiscard = useCallback(
    (url?: string) => {
      Router.push(url ?? getRouteURL(ROUTE.SOURCE_DATASETS, atlasId));
    },
    [atlasId]
  );

  const onSave = useCallback(
    (payload: SourceDatasetEditData, url?: string) => {
      unregister(unregisterSchemaFields(payload));
      onSubmit(
        getRequestURL(API.ATLAS_SOURCE_DATASET, atlasId, sourceStudyId),
        METHOD.PUT,
        filterPayload(payload),
        {
          onReset: reset,
          onSuccess: (data) => onSuccess(atlasId, data.id, url),
        }
      );
    },
    [atlasId, onSubmit, reset, sourceStudyId, unregister]
  );

  return useFormManager(formMethod, { onDelete, onDiscard, onSave }, isDirty);
};

/**
 * Filters the payload to exclude the publication status.
 * @param payload - Payload.
 * @returns filtered payload (payload without the publication status).
 */
function filterPayload(payload: SourceDatasetEditData): SourceDatasetEditData {
  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (key !== FIELD_NAME.PUBLICATION_STATUS) {
      return { ...acc, [key]: value };
    }
    return acc;
  }, {} as SourceDatasetEditData);
}

/**
 * Returns schema fields relating to the publication status.
 * @param publicationStatus - Publication status.
 * @returns schema fields.
 */
function getSchemaFields(
  publicationStatus: PUBLICATION_STATUS
): SourceDatasetEditDataKeys[] {
  if (publicationStatus === PUBLICATION_STATUS.PUBLISHED) {
    return PUBLISHED_FIELDS;
  }
  return UNPUBLISHED_FIELDS;
}

/**
 * Returns true if the form is dirty.
 * @param formMethod - Form method.
 * @param publicationStatus - Publication status.
 * @returns true if the form is dirty.
 */
function isFormDirty(
  formMethod: FormMethod<SourceDatasetEditData, HCAAtlasTrackerSourceStudy>,
  publicationStatus: PUBLICATION_STATUS
): boolean {
  const {
    formState: { dirtyFields },
  } = formMethod;
  const schemaFields = getSchemaFields(publicationStatus);
  return schemaFields.some((key) => key in dirtyFields);
}

/**
 * Delete side effect "onSuccess"; redirects to the source datasets page.
 * @param {string} atlasId - Atlas ID.
 */
function onDeleteSuccess(atlasId: string): void {
  Router.push(getRouteURL(ROUTE.SOURCE_DATASETS, atlasId));
}

/**
 * Submit side effect "onSuccess"; redirects to the source dataset page, or to the specified URL.
 * @param atlasId - Atlas ID.
 * @param sourceStudyId - Source dataset ID.
 * @param url - URL to redirect to.
 */
function onSuccess(atlasId: string, sourceStudyId: string, url?: string): void {
  Router.push(url ?? getRouteURL(ROUTE.SOURCE_DATASET, atlasId, sourceStudyId));
}

/**
 * Returns a list of fields to be unregistered prior to submission.
 * @param payload - Payload.
 * @returns fields to be unregistered.
 */
function unregisterSchemaFields(
  payload: SourceDatasetEditData
): SourceDatasetEditDataKeys[] {
  const fieldKeys: SourceDatasetEditDataKeys[] = [];
  if (payload.publicationStatus === PUBLICATION_STATUS.PUBLISHED) {
    fieldKeys.push(...UNPUBLISHED_FIELDS);
  } else {
    fieldKeys.push(...PUBLISHED_FIELDS);
  }
  return fieldKeys;
}
