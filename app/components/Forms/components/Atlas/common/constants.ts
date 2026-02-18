import { HCAAtlasTrackerAtlas } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { getPublicationCitation } from "../../../../../apis/catalog/hca-atlas-tracker/common/utils";
import { getDOILink } from "../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { NewAtlasData } from "../../../../../views/AddNewAtlasView/common/entities";
import { FIELD_NAME } from "../../../../../views/AtlasView/common/constants";
import { AtlasEditData } from "../../../../../views/AtlasView/common/entities";
import { ControllerConfig } from "../../../../common/Form/components/Controllers/common/entities";
import { BioNetwork } from "../../../../Form/components/Select/components/BioNetwork/bioNetwork";
import { Status } from "../../../../Form/components/Select/components/Status/status";
import { TargetCompletion } from "../../../../Form/components/Select/components/TargetCompletion/targetCompletion";
import { Wave } from "../../../../Form/components/Select/components/Wave/wave";

type CommonControllerConfig = ControllerConfig<
  NewAtlasData | AtlasEditData,
  HCAAtlasTrackerAtlas
>;

const BIO_NETWORK: CommonControllerConfig = {
  name: FIELD_NAME.BIO_NETWORK,
  selectProps: {
    SelectComponent: BioNetwork,
    displayEmpty: true,
    label: "Select network",
  },
};

const SHORT_NAME: CommonControllerConfig = {
  inputProps: {
    label: "Short name",
    placeholder: "e.g. Cortex",
  },
  name: FIELD_NAME.SHORT_NAME,
};

const TARGET_COMPLETION: ControllerConfig<AtlasEditData, HCAAtlasTrackerAtlas> =
  {
    name: FIELD_NAME.TARGET_COMPLETION,
    selectProps: {
      SelectComponent: TargetCompletion,
      displayEmpty: true,
      label: "Target completion",
    },
  };

const WAVE: CommonControllerConfig = {
  name: FIELD_NAME.WAVE,
  selectProps: {
    SelectComponent: Wave,
    displayEmpty: true,
    label: "Select wave",
  },
};

const DOI: CommonControllerConfig = {
  inputProps: {
    label: "Publication DOI",
  },
  labelLink: {
    getUrl: (v) => getDOILink(v) || null,
  },
  name: FIELD_NAME.DOI,
  renderHelperText(atlas) {
    const publication = atlas?.publications[0];
    return publication ? getPublicationCitation(publication) : "";
  },
};

const STATUS: ControllerConfig<AtlasEditData, HCAAtlasTrackerAtlas> = {
  name: FIELD_NAME.STATUS,
  selectProps: {
    SelectComponent: Status,
    displayEmpty: true,
    label: "Status",
  },
};

const CELLXGENE_COLLECTION_ID: CommonControllerConfig = {
  inputProps: {
    helperTextProps: {
      noWrap: false,
    },
    isFullWidth: true,
    label: "CELLxGENE collection ID",
  },
  labelLink: true,
  name: FIELD_NAME.CELLXGENE_ATLAS_COLLECTION,
  renderHelperText(atlas) {
    return atlas?.cellxgeneAtlasCollectionTitle;
  },
};

const CAP_ID: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "CAP ID",
  },
  labelLink: true,
  name: FIELD_NAME.CAP_ID,
};

const METADATA_SPECIFICATION_URL: ControllerConfig<
  AtlasEditData,
  HCAAtlasTrackerAtlas
> = {
  inputProps: {
    isFullWidth: true,
    label: "Metadata Specification (Golden Spreadsheet)",
  },
  labelLink: true,
  name: FIELD_NAME.METADATA_SPECIFICATION_URL,
  renderHelperText(atlas) {
    return atlas?.metadataSpecificationTitle;
  },
};

const METADATA_CORRECTNESS_URL: ControllerConfig<
  AtlasEditData,
  HCAAtlasTrackerAtlas
> = {
  inputProps: {
    isFullWidth: true,
    label: "Metadata Correctness Report",
  },
  labelLink: true,
  name: FIELD_NAME.METADATA_CORRECTNESS_URL,
};

export const GENERAL_INFO_NEW_ATLAS_CONTROLLERS: ControllerConfig<
  NewAtlasData,
  HCAAtlasTrackerAtlas
>[] = [SHORT_NAME, BIO_NETWORK, WAVE, DOI];

export const IDENTIFIERS_NEW_ATLAS_CONTROLLERS: ControllerConfig<
  NewAtlasData,
  HCAAtlasTrackerAtlas
>[] = [CELLXGENE_COLLECTION_ID, CAP_ID];

export const GENERAL_INFO_VIEW_ATLAS_CONTROLLERS: ControllerConfig<
  AtlasEditData,
  HCAAtlasTrackerAtlas
>[] = [...GENERAL_INFO_NEW_ATLAS_CONTROLLERS, STATUS, TARGET_COMPLETION];

export const IDENTIFIERS_VIEW_ATLAS_CONTROLLERS: ControllerConfig<
  AtlasEditData,
  HCAAtlasTrackerAtlas
>[] = [...IDENTIFIERS_NEW_ATLAS_CONTROLLERS];

export const METADATA_VIEW_ATLAS_CONTROLLERS: ControllerConfig<
  AtlasEditData,
  HCAAtlasTrackerAtlas
>[] = [METADATA_SPECIFICATION_URL, METADATA_CORRECTNESS_URL];
