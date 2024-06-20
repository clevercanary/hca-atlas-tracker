import { NewSourceStudyData } from "../../../../../views/AddNewSourceStudyView/common/entities";
import { FIELD_NAME } from "../../../../../views/SourceStudyView/common/constants";
import { SourceStudyEditData } from "../../../../../views/SourceStudyView/common/entities";
import { ControllerConfig } from "../../../../common/Form/components/Controllers/common/entities";
import { makeInputControllerConfigReadOnly } from "../../../common/utils";

type CommonControllerConfig = ControllerConfig<
  NewSourceStudyData | SourceStudyEditData
>;

const CAP_ID: CommonControllerConfig = {
  inputProps: { isFullWidth: true, label: "CAP ID" },
  name: FIELD_NAME.CAP_ID,
};

const CELLXGENE_COLLECTION_ID: ControllerConfig<SourceStudyEditData> = {
  inputProps: {
    isFullWidth: true,
    label: "CELLxGENE collection ID",
    readOnly: true,
  },
  name: FIELD_NAME.CELLXGENE_COLLECTION_ID,
};

const CONTACT_EMAIL: ControllerConfig<NewSourceStudyData> = {
  inputProps: {
    label: "Email",
  },
  name: FIELD_NAME.CONTACT_EMAIL,
};

const DOI: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "Publication DOI no.",
    placeholder: "e.g. 10.1038/s41591-023-02327-2",
  },
  name: FIELD_NAME.DOI,
};

const HCA_PROJECT_ID: ControllerConfig<SourceStudyEditData> = {
  inputProps: {
    isFullWidth: true,
    label: "HCA repository project ID",
    readOnly: true,
  },
  name: FIELD_NAME.HCA_PROJECT_ID,
};

const REFERENCE_AUTHOR: ControllerConfig<NewSourceStudyData> = {
  inputProps: {
    label: "First author",
  },
  name: FIELD_NAME.REFERENCE_AUTHOR,
};

const TITLE: ControllerConfig<SourceStudyEditData> = {
  inputProps: {
    isFullWidth: true,
    label: "Title",
    readOnly: true,
  },
  name: FIELD_NAME.TITLE,
};

const WORKING_TITLE: ControllerConfig<NewSourceStudyData> = {
  inputProps: {
    isFullWidth: true,
    label: "Working title",
  },
  name: FIELD_NAME.WORKING_TITLE,
};

/* New Source Study - Unpublished */
export const GENERAL_INFO_NEW_UNPUBLISHED_SOURCE_STUDY_CONTROLLERS: ControllerConfig<NewSourceStudyData>[] =
  [REFERENCE_AUTHOR, CONTACT_EMAIL, WORKING_TITLE];

/* New Source Study - Published */
export const GENERAL_INFO_NEW_PUBLISHED_SOURCE_STUDY_CONTROLLERS: ControllerConfig<NewSourceStudyData>[] =
  [DOI];

/* View Source Study - Unpublished */
export const GENERAL_INFO_VIEW_UNPUBLISHED_SOURCE_STUDY_CONTROLLERS: ControllerConfig<SourceStudyEditData>[] =
  GENERAL_INFO_NEW_UNPUBLISHED_SOURCE_STUDY_CONTROLLERS;

export const INTEGRATION_LEAD_VIEW_UNPUBLISHED_SOURCE_STUDY_CONTROLLERS: ControllerConfig<SourceStudyEditData>[] =
  [HCA_PROJECT_ID, CELLXGENE_COLLECTION_ID, CAP_ID];

/* View Source Study - Published */
export const GENERAL_INFO_VIEW_PUBLISHED_SOURCE_STUDY_CONTROLLERS: ControllerConfig<SourceStudyEditData>[] =
  [makeInputControllerConfigReadOnly(DOI), TITLE]; // TODO - configure controller to be read-only for published source study.

export const INTEGRATION_LEAD_VIEW_PUBLISHED_SOURCE_STUDY_CONTROLLERS: ControllerConfig<SourceStudyEditData>[] =
  [HCA_PROJECT_ID, CELLXGENE_COLLECTION_ID, CAP_ID];
