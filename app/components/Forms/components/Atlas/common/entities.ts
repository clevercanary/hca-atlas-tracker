import { NewAtlasData } from "app/views/AddNewAtlasView/common/entities";
import { HCAAtlasTrackerAtlas } from "../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FIELD_NAME } from "../../../../../views/AtlasView/common/constants";
import { InputControllerWithLinkProps } from "../components/InputControllerWithLink/inputControllerWithLink";

export type CellxgeneAtlasCollectionControllerProps =
  InputControllerWithLinkProps<
    NewAtlasData,
    HCAAtlasTrackerAtlas,
    typeof FIELD_NAME.CELLXGENE_ATLAS_COLLECTION
  >;
