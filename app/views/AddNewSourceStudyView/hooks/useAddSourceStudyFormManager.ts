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
import {
  FIELD_NAME,
  NO_DOI_FIELDS,
  PUBLISHED_PREPRINT_FIELDS,
} from "../common/constants";
import {
  NewSourceStudyData,
  NewSourceStudyDataKeys,
  PUBLICATION_STATUS,
} from "../common/entities";

export const useAddSourceStudyFormManager = (
  pathParameter: PathParameter,
  formMethod: FormMethod<NewSourceStudyData, HCAAtlasTrackerSourceStudy>,
): FormManager => {
  const { onSubmit, unregister, watch } = formMethod;
  const publicationStatus = watch(FIELD_NAME.PUBLICATION_STATUS);
  const isDirty = isFormDirty(formMethod, publicationStatus);

  const onDiscard = useCallback(
    (url?: string) => {
      Router.push(url ?? getRouteURL(ROUTE.SOURCE_STUDIES, pathParameter));
    },
    [pathParameter],
  );

  const onSave = useCallback(
    (payload: NewSourceStudyData, url?: string) => {
      unregister(unregisterSchemaFields(payload));
      onSubmit(
        getRequestURL(API.CREATE_ATLAS_SOURCE_STUDY, pathParameter),
        METHOD.POST,
        filterPayload(payload),
        {
          onSuccess: (data) => onSuccess(pathParameter, data.id, url),
        },
      );
    },
    [onSubmit, pathParameter, unregister],
  );

  return useFormManager(formMethod, { onDiscard, onSave }, isDirty);
};

/**
 * Filters the payload to exclude the publication status.
 * @param payload - Payload.
 * @returns filtered payload (payload without the publication status).
 */
function filterPayload(payload: NewSourceStudyData): NewSourceStudyData {
  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (key !== FIELD_NAME.PUBLICATION_STATUS) {
      return { ...acc, [key]: value };
    }
    return acc;
  }, {} as NewSourceStudyData);
}

/**
 * Returns schema fields relating to the publication status.
 * @param publicationStatus - Publication status.
 * @returns schema fields.
 */
function getSchemaFields(
  publicationStatus: PUBLICATION_STATUS,
): NewSourceStudyDataKeys[] {
  if (publicationStatus === PUBLICATION_STATUS.PUBLISHED_PREPRINT) {
    return PUBLISHED_PREPRINT_FIELDS;
  }
  return NO_DOI_FIELDS;
}

/**
 * Returns true if the form is dirty.
 * @param formMethod - Form method.
 * @param publicationStatus - Publication status.
 * @returns true if the form is dirty.
 */
function isFormDirty(
  formMethod: FormMethod<NewSourceStudyData, HCAAtlasTrackerSourceStudy>,
  publicationStatus: PUBLICATION_STATUS,
): boolean {
  const {
    formState: { dirtyFields },
  } = formMethod;
  const schemaFields = getSchemaFields(publicationStatus);
  return schemaFields.some((key) => key in dirtyFields);
}

/**
 * Side effect "onSuccess"; redirects to the source study page, or to the specified URL.
 * @param pathParameter - Path parameter.
 * @param sourceStudyId - Source study ID.
 * @param url - URL to redirect to.
 */
function onSuccess(
  pathParameter: PathParameter,
  sourceStudyId: string,
  url?: string,
): void {
  Router.push(
    url ?? getRouteURL(ROUTE.SOURCE_STUDY, { ...pathParameter, sourceStudyId }),
  );
}

/**
 * Returns a list of fields to be unregistered prior to submission.
 * @param payload - Payload.
 * @returns fields to be unregistered.
 */
function unregisterSchemaFields(
  payload: NewSourceStudyData,
): NewSourceStudyDataKeys[] {
  const fieldKeys: NewSourceStudyDataKeys[] = [];
  if (payload.publicationStatus === PUBLICATION_STATUS.PUBLISHED_PREPRINT) {
    fieldKeys.push(...NO_DOI_FIELDS);
  } else {
    fieldKeys.push(...PUBLISHED_PREPRINT_FIELDS);
  }
  return fieldKeys;
}
