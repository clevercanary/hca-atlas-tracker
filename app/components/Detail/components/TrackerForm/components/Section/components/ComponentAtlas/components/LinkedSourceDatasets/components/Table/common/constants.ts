import { COLUMN_IDENTIFIER } from "@databiosphere/findable-ui/lib/components/Table/common/columnIdentifier";
import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import {
  getSortedRowModel,
  SortingState,
  TableOptions,
} from "@tanstack/react-table";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

const PUBLICATION_STRING = "publicationString";
const TITLE = "title";

const SORTING: SortingState = [
  { desc: SORT_DIRECTION.ASCENDING, id: PUBLICATION_STRING },
  { desc: SORT_DIRECTION.ASCENDING, id: TITLE },
];

export const TABLE_GRID_TEMPLATE_COLUMNS =
  "max-content minmax(180px, 1fr) minmax(220px, 2fr) minmax(220px, 2fr) minmax(168px, 1fr) repeat(4, minmax(150px, 1fr)) minmax(116px, 1fr) auto";

export const TABLE_OPTIONS: Partial<
  TableOptions<HCAAtlasTrackerSourceDataset>
> = {
  enableMultiSort: true,
  enableSorting: true,
  getSortedRowModel: getSortedRowModel(),
  initialState: {
    columnVisibility: { [COLUMN_IDENTIFIER.ROW_POSITION]: true },
    sorting: SORTING,
  },
};
