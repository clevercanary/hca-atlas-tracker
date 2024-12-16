import { HCAAtlasTrackerAtlas } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { controllerConfigWithProps } from "app/components/common/Form/components/Controllers/common/utils";
import { NewAtlasData } from "../../../../../views/AddNewAtlasView/common/entities";
import { FIELD_NAME } from "../../../../../views/AtlasView/common/constants";
import { AtlasEditData } from "../../../../../views/AtlasView/common/entities";
import {
  ControllerConfig,
  StaticControllerConfig,
} from "../../../../common/Form/components/Controllers/common/entities";
import { BioNetwork } from "../../../../Form/components/Select/components/BioNetwork/bioNetwork";
import { TargetCompletion } from "../../../../Form/components/Select/components/TargetCompletion/targetCompletion";
import { Wave } from "../../../../Form/components/Select/components/Wave/wave";
import { InputControllerWithLink } from "../components/InputControllerWithLink/inputControllerWithLink";
import { CellxgeneAtlasCollectionControllerProps } from "./entities";

type CommonControllerConfig = StaticControllerConfig<
  NewAtlasData | AtlasEditData
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

const TARGET_COMPLETION: StaticControllerConfig<AtlasEditData> = {
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

const GENERAL_INFO_COMMON_CONTROLLERS: CommonControllerConfig[] = [
  SHORT_NAME,
  VERSION,
  BIO_NETWORK,
  WAVE,
];

export const GENERAL_INFO_NEW_ATLAS_CONTROLLERS: ControllerConfig<
  NewAtlasData,
  HCAAtlasTrackerAtlas
>[] = GENERAL_INFO_COMMON_CONTROLLERS;

export const GENERAL_INFO_VIEW_ATLAS_CONTROLLERS: ControllerConfig<
  AtlasEditData,
  HCAAtlasTrackerAtlas
>[] = [...GENERAL_INFO_COMMON_CONTROLLERS, TARGET_COMPLETION];

const CELLXGENE_ATLAS_COLLECTION_PROPS = {
  inputProps: {
    isFullWidth: true,
  },
  label: "CELLxGENE collection ID",
  name: FIELD_NAME.CELLXGENE_ATLAS_COLLECTION,
};

const NEW_ATLAS_CELLXGENE_ATLAS_COLLECTION = controllerConfigWithProps<
  NewAtlasData,
  HCAAtlasTrackerAtlas,
  CellxgeneAtlasCollectionControllerProps
>(InputControllerWithLink, CELLXGENE_ATLAS_COLLECTION_PROPS);

const VIEW_ATLAS_CELLXGENE_ATLAS_COLLECTION = controllerConfigWithProps<
  AtlasEditData,
  HCAAtlasTrackerAtlas,
  CellxgeneAtlasCollectionControllerProps
>(InputControllerWithLink, CELLXGENE_ATLAS_COLLECTION_PROPS);

export const IDENTIFIERS_NEW_ATLAS_CONTROLLERS: ControllerConfig<
  NewAtlasData,
  HCAAtlasTrackerAtlas
>[] = [NEW_ATLAS_CELLXGENE_ATLAS_COLLECTION];

export const IDENTIFIERS_VIEW_ATLAS_CONTROLLERS: ControllerConfig<
  AtlasEditData,
  HCAAtlasTrackerAtlas
>[] = [VIEW_ATLAS_CELLXGENE_ATLAS_COLLECTION];
