import {
  VIEW,
  type View,
} from "@/app/views/AtlasStatusView/components/CurationReport/components/ReportOverview/constants";
import {
  type ColumnFiltersState,
  functionalUpdate,
  type OnChangeFn,
} from "@tanstack/react-table";
import { useState } from "react";

const NO_FILTERS: Record<View, ColumnFiltersState> = {
  [VIEW.CHECKS]: [],
  [VIEW.FILES]: [],
  [VIEW.ISSUES]: [],
};

export interface ReportState {
  filters: Record<View, ColumnFiltersState>;
  onFiltersChange: (view: View) => OnChangeFn<ColumnFiltersState>;
  showView: (view: View, filters?: ColumnFiltersState) => void;
  view: View;
}

/**
 * The overview's selected view and each view's column filters. Held by the
 * report, which stays mounted while a file's page is open, so both survive a
 * visit to a file. Only the shown view keeps filters, so no tab hides some.
 * @returns Report state.
 */
export const useReportState = (): ReportState => {
  const [view, setView] = useState<View>(VIEW.ISSUES);
  const [filters, setFilters] =
    useState<Record<View, ColumnFiltersState>>(NO_FILTERS);

  const onFiltersChange =
    (target: View): OnChangeFn<ColumnFiltersState> =>
    (updater): void =>
      setFilters((current) => ({
        ...current,
        [target]: functionalUpdate(updater, current[target]),
      }));

  const showView = (next: View, nextFilters?: ColumnFiltersState): void => {
    setFilters((current) => ({
      ...NO_FILTERS,
      [next]: nextFilters ?? current[next],
    }));
    setView(next);
  };

  return { filters, onFiltersChange, showView, view };
};
