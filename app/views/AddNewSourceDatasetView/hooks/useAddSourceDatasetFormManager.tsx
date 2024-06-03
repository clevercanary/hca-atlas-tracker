import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  AtlasId,
  HCAAtlasTrackerSourceDataset,
} from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import {
  FIELD_NAME,
  PUBLISHED_FIELDS,
  UNPUBLISHED_FIELDS,
} from "../common/constants";
import {
  NewSourceDatasetData,
  NewSourceDatasetDataKeys,
  PUBLICATION_STATUS,
} from "../common/entities";

export const useAddSourceDatasetFormManager = (
  atlasId: AtlasId,
  formMethod: FormMethod<NewSourceDatasetData, HCAAtlasTrackerSourceDataset>
): FormManager => {
  const { onSubmit, unregister, watch } = formMethod;
  const publicationStatus = watch(FIELD_NAME.PUBLICATION_STATUS);
  const isDirty = isFormDirty(formMethod, publicationStatus);

  const onDiscard = useCallback(
    (url?: string) => {
      Router.push(url ?? getRouteURL(ROUTE.SOURCE_DATASETS, atlasId));
    },
    [atlasId]
  );

  const onSave = useCallback(
    (payload: NewSourceDatasetData, url?: string) => {
      unregister(unregisterSchemaFields(payload));
      onSubmit(
        getRequestURL(API.CREATE_ATLAS_SOURCE_DATASET, atlasId),
        METHOD.POST,
        filterPayload(payload),
        {
          onSuccess: (data) => onSuccess(atlasId, data.id, url),
        }
      );
    },
    [atlasId, onSubmit, unregister]
  );

  return useFormManager(formMethod, { onDiscard, onSave }, isDirty);
};

/**
 * Filters the payload to exclude the publication status.
 * @param payload - Payload.
 * @returns filtered payload (payload without the publication status).
 */
function filterPayload(payload: NewSourceDatasetData): NewSourceDatasetData {
  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (key !== FIELD_NAME.PUBLICATION_STATUS) {
      return { ...acc, [key]: value };
    }
    return acc;
  }, {} as NewSourceDatasetData);
}

/**
 * Returns schema fields relating to the publication status.
 * @param publicationStatus - Publication status.
 * @returns schema fields.
 */
function getSchemaFields(
  publicationStatus: PUBLICATION_STATUS
): NewSourceDatasetDataKeys[] {
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
  formMethod: FormMethod<NewSourceDatasetData, HCAAtlasTrackerSourceDataset>,
  publicationStatus: PUBLICATION_STATUS
): boolean {
  const {
    formState: { dirtyFields },
  } = formMethod;
  const schemaFields = getSchemaFields(publicationStatus);
  return schemaFields.some((key) => key in dirtyFields);
}

/**
 * Side effect "onSuccess"; redirects to the source dataset page, or to the specified URL.
 * @param atlasId - Atlas ID.
 * @param sdId - Source dataset ID.
 * @param url - URL to redirect to.
 */
function onSuccess(atlasId: string, sdId: string, url?: string): void {
  Router.push(url ?? getRouteURL(ROUTE.SOURCE_DATASET, atlasId, sdId));
}

/**
 * Returns a list of fields to be unregistered prior to submission.
 * @param payload - Payload.
 * @returns fields to be unregistered.
 */
function unregisterSchemaFields(
  payload: NewSourceDatasetData
): NewSourceDatasetDataKeys[] {
  const fieldKeys: NewSourceDatasetDataKeys[] = [];
  if (payload.publicationStatus === PUBLICATION_STATUS.PUBLISHED) {
    fieldKeys.push(...UNPUBLISHED_FIELDS);
  } else {
    fieldKeys.push(...PUBLISHED_FIELDS);
  }
  return fieldKeys;
}
