import { NewAtlasData } from "../../../../../views/AddNewAtlasView/common/entities";
import { FIELD_NAME } from "../../../../../views/AtlasView/common/constants";
import { AtlasEditData } from "../../../../../views/AtlasView/common/entities";
import { ControllerConfig } from "../../../../common/Form/components/Controllers/common/entities";
import { BioNetwork } from "../../../../Form/components/Select/components/BioNetwork/bioNetwork";
import { TargetCompletion } from "../../../../Form/components/Select/components/TargetCompletion/targetCompletion";
import { Wave } from "../../../../Form/components/Select/components/Wave/wave";

type CommonControllerConfig = ControllerConfig<NewAtlasData | AtlasEditData>;

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

const TARGET_COMPLETION: ControllerConfig<AtlasEditData> = {
  name: FIELD_NAME.TARGET_COMPLETION,
  selectProps: {
    SelectComponent: TargetCompletion,
    displayEmpty: true,
    label: "Target completion",
  },
};

const VERSION: CommonControllerConfig = {
  inputProps: {
    label: "Version",
    placeholder: "e.g. 1.0",
  },
  name: FIELD_NAME.VERSION,
};

const WAVE: CommonControllerConfig = {
  name: FIELD_NAME.WAVE,
  selectProps: {
    SelectComponent: Wave,
    displayEmpty: true,
    label: "Select wave",
  },
};

const CELLXGENE_COLLECTION_ID: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "CELLxGENE collection ID",
  },
  name: FIELD_NAME.CELLXGENE_ATLAS_COLLECTION,
};

export const GENERAL_INFO_NEW_ATLAS_CONTROLLERS: ControllerConfig<NewAtlasData>[] =
  [SHORT_NAME, VERSION, BIO_NETWORK, WAVE, CELLXGENE_COLLECTION_ID];

export const GENERAL_INFO_VIEW_ATLAS_CONTROLLERS: ControllerConfig<AtlasEditData>[] =
  [...GENERAL_INFO_NEW_ATLAS_CONTROLLERS, TARGET_COMPLETION];
