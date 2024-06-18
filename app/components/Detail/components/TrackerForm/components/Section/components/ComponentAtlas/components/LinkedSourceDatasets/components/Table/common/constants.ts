import { SORT_DIRECTION } from "@databiosphere/findable-ui/lib/config/entities";
import {
  getSortedRowModel,
  SortingState,
  TableOptions,
} from "@tanstack/table-core";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

const SOURCE_STUDY_TITLE = "sourceStudyTitle";
const TITLE = "title";

const SORTING: SortingState = [
  { desc: SORT_DIRECTION.ASCENDING, id: SOURCE_STUDY_TITLE },
  { desc: SORT_DIRECTION.ASCENDING, id: TITLE },
];

export const TABLE_OPTIONS: Partial<
  TableOptions<HCAAtlasTrackerSourceDataset>
> = {
  enableMultiSort: true,
  enableSorting: true,
  getSortedRowModel: getSortedRowModel(),
  initialState: {
    sorting: SORTING,
  },
};
