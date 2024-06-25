import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import {
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  SortingState,
  TableOptions,
} from "@tanstack/react-table";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

const PUBLICATION_STRING = "publicationString";
const TITLE = "title";

const GROUPING = [PUBLICATION_STRING];
const SORTING: SortingState = [
  { desc: SORT_DIRECTION.ASCENDING, id: PUBLICATION_STRING },
  { desc: SORT_DIRECTION.ASCENDING, id: TITLE },
];

export const TABLE_OPTIONS: Partial<
  TableOptions<HCAAtlasTrackerSourceDataset>
> = {
  enableGrouping: true,
  enableMultiSort: true,
  enableSorting: true,
  getExpandedRowModel: getExpandedRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  getSortedRowModel: getSortedRowModel(),
  initialState: {
    expanded: true,
    grouping: GROUPING,
    sorting: SORTING,
  },
};
