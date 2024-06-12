import Router from "next/router";
import { useCallback } from "react";
import { API } from "../../../apis/catalog/hca-atlas-tracker/common/api";
import { HCAAtlasTrackerSourceStudy } from "../../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD, PathParameter } from "../../../common/entities";
import { getRequestURL, getRouteURL } from "../../../common/utils";
import { FormMethod } from "../../../hooks/useForm/common/entities";
import { FormManager } from "../../../hooks/useFormManager/common/entities";
import { useFormManager } from "../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../routes/constants";
import { PUBLICATION_STATUS } from "../../AddNewSourceStudyView/common/entities";
import {
  FIELD_NAME,
  PUBLISHED_FIELDS,
  UNPUBLISHED_FIELDS,
} from "../common/constants";
import {
  SourceStudyEditData,
  SourceStudyEditDataKeys,
} from "../common/entities";

export const useEditSourceStudyFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<SourceStudyEditData, HCAAtlasTrackerSourceStudy>
): FormManager => {
  const { onSubmit, reset, unregister, watch } = formMethod;
  const publicationStatus = watch(FIELD_NAME.PUBLICATION_STATUS);
  const isDirty = isFormDirty(formMethod, publicationStatus);

  const onDiscard = useCallback(
    (url?: string) => {
      Router.push(url ?? getRouteURL(ROUTE.SOURCE_STUDIES, pathParameter));
    },
    [pathParameter]
  );

  const onSave = useCallback(
    (payload: SourceStudyEditData, url?: string) => {
      unregister(unregisterSchemaFields(payload));
      onSubmit(
        getRequestURL(API.ATLAS_SOURCE_STUDY, pathParameter),
        METHOD.PUT,
        filterPayload(payload),
        {
          onReset: reset,
          onSuccess: (data) => onSuccess(pathParameter, data.id, url),
        }
      );
    },
    [onSubmit, pathParameter, reset, unregister]
  );

  return useFormManager(formMethod, { onDiscard, onSave }, isDirty);
};

/**
 * Filters the payload to exclude the publication status.
 * @param payload - Payload.
 * @returns filtered payload (payload without the publication status).
 */
function filterPayload(payload: SourceStudyEditData): SourceStudyEditData {
  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (key !== FIELD_NAME.PUBLICATION_STATUS) {
      return { ...acc, [key]: value };
    }
    return acc;
  }, {} as SourceStudyEditData);
}

/**
 * Returns schema fields relating to the publication status.
 * @param publicationStatus - Publication status.
 * @returns schema fields.
 */
function getSchemaFields(
  publicationStatus: PUBLICATION_STATUS
): SourceStudyEditDataKeys[] {
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
  formMethod: FormMethod<SourceStudyEditData, HCAAtlasTrackerSourceStudy>,
  publicationStatus: PUBLICATION_STATUS
): boolean {
  const {
    formState: { dirtyFields },
  } = formMethod;
  const schemaFields = getSchemaFields(publicationStatus);
  return schemaFields.some((key) => key in dirtyFields);
}

/**
 * Submit side effect "onSuccess"; redirects to the source studies page, or to the specified URL.
 * @param pathParameter - Path parameter.
 * @param sourceStudyId - Source study ID.
 * @param url - URL to redirect to.
 */
function onSuccess(
  pathParameter: PathParameter,
  sourceStudyId: string,
  url?: string
): void {
  Router.push(
    url ?? getRouteURL(ROUTE.SOURCE_STUDY, { ...pathParameter, sourceStudyId })
  );
}

/**
 * Returns a list of fields to be unregistered prior to submission.
 * @param payload - Payload.
 * @returns fields to be unregistered.
 */
function unregisterSchemaFields(
  payload: SourceStudyEditData
): SourceStudyEditDataKeys[] {
  const fieldKeys: SourceStudyEditDataKeys[] = [];
  if (payload.publicationStatus === PUBLICATION_STATUS.PUBLISHED) {
    fieldKeys.push(...UNPUBLISHED_FIELDS);
  } else {
    fieldKeys.push(...PUBLISHED_FIELDS);
  }
  return fieldKeys;
}
