import { ACCESSOR_KEYS } from "@databiosphere/findable-ui/lib/components/TableCreator/common/constants";
import { VisibilityState } from "@tanstack/react-table";

export const COLUMN_VISIBILITY: Record<string, VisibilityState> = {
  ROW_POSITION: { [ACCESSOR_KEYS.ROW_POSITION]: true },
};
