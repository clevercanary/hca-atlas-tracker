import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { ListConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { HCAAtlasTrackerComponentAtlas } from "../../../../apis/catalog/hca-atlas-tracker/common/entities";

export const TABLE_OPTIONS: ListConfig<HCAAtlasTrackerComponentAtlas>["tableOptions"] =
  {
    getRowId: (row) => row.id,
    initialState: {
      columnVisibility: { [COLUMN_IDENTIFIER.ROW_POSITION]: true },
    },
  };
