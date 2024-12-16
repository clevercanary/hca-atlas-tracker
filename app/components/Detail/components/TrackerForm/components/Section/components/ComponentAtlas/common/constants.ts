import { NewComponentAtlasData } from "../../../../../../../../../views/AddNewComponentAtlasView/common/entities";
import { FIELD_NAME } from "../../../../../../../../../views/ComponentAtlasView/common/constants";
import { ComponentAtlasEditData } from "../../../../../../../../../views/ComponentAtlasView/common/entities";
import { ControllerConfig } from "../../../../../../../../common/Form/components/Controllers/common/entities";

type CommonControllerConfig = ControllerConfig<
  ComponentAtlasEditData | NewComponentAtlasData
>;

const TITLE: CommonControllerConfig = {
  inputProps: {
    isFullWidth: true,
    label: "Title",
  },
  name: FIELD_NAME.TITLE,
};

export const GENERAL_INFO_NEW_COMPONENT_ATLAS_CONTROLLERS: ControllerConfig<NewComponentAtlasData>[] =
  [TITLE];

export const GENERAL_INFO_VIEW_COMPONENT_ATLAS_CONTROLLERS: ControllerConfig<ComponentAtlasEditData>[] =
  GENERAL_INFO_NEW_COMPONENT_ATLAS_CONTROLLERS;
