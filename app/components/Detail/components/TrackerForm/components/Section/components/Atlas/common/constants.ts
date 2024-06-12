import { NewAtlasData } from "../../../../../../../../../views/AddNewAtlasView/common/entities";
import { FIELD_NAME } from "../../../../../../../../../views/AtlasView/common/constants";
import { AtlasEditData } from "../../../../../../../../../views/AtlasView/common/entities";
import { ControllerProps } from "../../../../../../../../common/Form/components/Controller/common/entities";
import { BioNetwork } from "../../../../../../../../Form/components/Select/components/BioNetwork/bioNetwork";
import { TargetCompletion } from "../../../../../../../../Form/components/Select/components/TargetCompletion/targetCompletion";
import { Wave } from "../../../../../../../../Form/components/Select/components/Wave/wave";

type CommonControllerProps = ControllerProps<NewAtlasData | AtlasEditData>;

const BIO_NETWORK: CommonControllerProps = {
  name: FIELD_NAME.BIO_NETWORK,
  selectProps: {
    SelectComponent: BioNetwork,
    displayEmpty: true,
    label: "Select network",
  },
};

const INTEGRATION_LEAD_A_EMAIL: CommonControllerProps = {
  inputProps: { label: "Email" },
  name: FIELD_NAME.INTEGRATION_LEAD_A_EMAIL,
};

const INTEGRATION_LEAD_B_EMAIL: CommonControllerProps = {
  inputProps: {
    label: "Email",
  },
  name: FIELD_NAME.INTEGRATION_LEAD_B_EMAIL,
};

const INTEGRATION_LEAD_A_NAME: CommonControllerProps = {
  inputProps: { label: "Full name" },
  name: FIELD_NAME.INTEGRATION_LEAD_A_NAME,
};

const INTEGRATION_LEAD_B_NAME: CommonControllerProps = {
  inputProps: { label: "Full name" },
  name: FIELD_NAME.INTEGRATION_LEAD_B_NAME,
};

const SHORT_NAME: CommonControllerProps = {
  inputProps: {
    label: "Short name",
    placeholder: "e.g. Cortex",
  },
  name: FIELD_NAME.SHORT_NAME,
};

const TARGET_COMPLETION: ControllerProps<AtlasEditData> = {
  name: FIELD_NAME.TARGET_COMPLETION,
  selectProps: {
    SelectComponent: TargetCompletion,
    displayEmpty: true,
    label: "Target completion",
  },
};

const VERSION: CommonControllerProps = {
  inputProps: {
    label: "Version",
    placeholder: "e.g. 1.0",
  },
  name: FIELD_NAME.VERSION,
};

const WAVE: CommonControllerProps = {
  name: FIELD_NAME.WAVE,
  selectProps: {
    SelectComponent: Wave,
    displayEmpty: true,
    label: "Select wave",
  },
};

export const GENERAL_INFO_NEW_ATLAS_CONTROLLERS: ControllerProps<NewAtlasData>[] =
  [SHORT_NAME, VERSION, BIO_NETWORK, WAVE];

export const INTEGRATION_LEAD_NEW_ATLAS_CONTROLLERS: ControllerProps<NewAtlasData>[] =
  [
    INTEGRATION_LEAD_A_NAME,
    INTEGRATION_LEAD_A_EMAIL,
    INTEGRATION_LEAD_B_NAME,
    INTEGRATION_LEAD_B_EMAIL,
  ];

export const GENERAL_INFO_VIEW_ATLAS_CONTROLLERS: ControllerProps<AtlasEditData>[] =
  [...GENERAL_INFO_NEW_ATLAS_CONTROLLERS, TARGET_COMPLETION];

export const INTEGRATION_LEAD_VIEW_ATLAS_CONTROLLERS: ControllerProps<AtlasEditData>[] =
  INTEGRATION_LEAD_NEW_ATLAS_CONTROLLERS;
