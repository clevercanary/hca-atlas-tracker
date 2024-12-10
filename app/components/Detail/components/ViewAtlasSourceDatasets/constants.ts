import { ListConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerSourceDataset } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { COLUMN_VISIBILITY } from "../../../Table/features/constants";

export const TABLE_OPTIONS: ListConfig<HCAAtlasTrackerSourceDataset>["tableOptions"] =
  {
    initialState: {
      columnVisibility: COLUMN_VISIBILITY.ROW_POSITION,
    },
  };
