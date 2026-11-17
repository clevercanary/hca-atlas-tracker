import { DropDownIcon } from "@databiosphere/findable-ui/lib/components/common/Form/components/Select/components/DropDownIcon/dropDownIcon";
import { PopperProvider } from "@databiosphere/findable-ui/lib/components/common/Popper/provider/provider";
import { MAX_DISPLAYABLE_LIST_ITEMS } from "@databiosphere/findable-ui/lib/components/Filter/common/constants";
import { withHeaderPadding } from "@databiosphere/findable-ui/lib/components/Filter/common/popper";
import { ClickAway } from "@databiosphere/findable-ui/lib/components/Filter/components/Filter/components/ClickAway/clickAway";
import { MenuTransition } from "@databiosphere/findable-ui/lib/components/Filter/components/Filter/components/MenuTransition/menuTransition";
import { FilterCountChip } from "@databiosphere/findable-ui/lib/components/Filter/components/FilterCountChip/filterCountChip";
import { StyledList } from "@databiosphere/findable-ui/lib/components/Filter/components/FilterList/filterList.styles";
import { applyMenuFilter } from "@databiosphere/findable-ui/lib/components/Filter/components/FilterMenu/filterMenu";
import { FilterMenuSearch } from "@databiosphere/findable-ui/lib/components/Filter/components/FilterMenuSearch/filterMenuSearch";
import { FilterNoResultsFound } from "@databiosphere/findable-ui/lib/components/Filter/components/FilterNoResultsFound/filterNoResultsFound";
import { SURFACE_TYPE } from "@databiosphere/findable-ui/lib/components/Filter/components/surfaces/types";
import { getColumnHeader } from "@databiosphere/findable-ui/lib/components/Table/common/utils";
import {
  StyledButton,
  StyledPopper,
} from "@databiosphere/findable-ui/lib/components/Table/components/TableFeatures/ColumnFilter/columnFilter.styles";
import { ColumnFilterList } from "@databiosphere/findable-ui/lib/components/Table/components/TableFeatures/ColumnFilter/components/ColumnFilterList/columnFilterList";
import {
  COLUMN_FILTER_PLACEMENT,
  GRID_PROPS,
  POPPER_OPTIONS,
  POPPER_PROPS,
} from "@databiosphere/findable-ui/lib/components/Table/components/TableFeatures/ColumnFilter/constants";
import { closeAndRestoreFocus } from "@databiosphere/findable-ui/lib/components/Table/components/TableFeatures/ColumnFilter/utils";
import { getSortedFacetedValues } from "@databiosphere/findable-ui/lib/components/Table/featureOptions/facetedColumn/utils";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { PAPER_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/paper";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import {
  getPopupAriaProps,
  HAS_POPUP,
} from "@databiosphere/findable-ui/lib/utils/ariaPopup";
import { Grid, Paper } from "@mui/material";
import { type RowData } from "@tanstack/react-table";
import { Fragment, type JSX, useId, useState } from "react";
import { StyledSearch } from "./searchableColumnFilter.styles";
import { type Props, type SearchListProps } from "./types";

// Prototype: findable-ui's ColumnFilter at medium size, with a search field
// above its list when the column has more values than the list shows at once
// (findable-ui FilterMenu's rule). Candidate for a findable-ui option.
export const SearchableColumnFilter = <T extends RowData>({
  column,
}: Props<T>): JSX.Element => {
  const sortedValues = getSortedFacetedValues(column.getFacetedUniqueValues());
  const filterValue = (column.getFilterValue() || []) as unknown[];
  const disabled = sortedValues.length === 0;
  const isSearchable = sortedValues.length > MAX_DISPLAYABLE_LIST_ITEMS;
  const header = getColumnHeader(column);
  const panelId = useId();
  const placement = COLUMN_FILTER_PLACEMENT.BOTTOM_END;
  return (
    <PopperProvider>
      {({ anchorEl, onClose, onOpen, open }): JSX.Element => (
        <Fragment>
          <StyledButton
            {...getPopupAriaProps({
              disabled,
              hasPopup: HAS_POPUP.DIALOG,
              id: panelId,
              open,
            })}
            disabled={disabled}
            endIcon={<DropDownIcon color={SVG_ICON_PROPS.COLOR.INK_LIGHT} />}
            onClick={(e): void => (open ? onClose() : onOpen(e))}
            open={open}
            size={BUTTON_PROPS.SIZE.MEDIUM}
          >
            <Grid {...GRID_PROPS}>
              {header}
              <FilterCountChip count={filterValue.length} />
            </Grid>
          </StyledButton>
          <StyledPopper
            {...POPPER_PROPS}
            anchorEl={anchorEl}
            aria-label={header}
            id={panelId}
            open={open}
            placement={placement}
            popperOptions={
              open ? withHeaderPadding(POPPER_OPTIONS[placement]) : undefined
            }
            role="dialog"
          >
            {({ placement, TransitionProps }): JSX.Element => (
              <ClickAway
                anchorEl={anchorEl}
                onClose={onClose}
                onEscape={(): void => closeAndRestoreFocus(onClose, anchorEl)}
                open={open}
              >
                <MenuTransition {...TransitionProps} placement={placement}>
                  <Paper variant={PAPER_PROPS.VARIANT.MENU}>
                    {isSearchable ? (
                      <SearchList
                        column={column}
                        filterValue={filterValue}
                        sortedValues={sortedValues}
                      />
                    ) : (
                      <ColumnFilterList
                        column={column}
                        filterValue={filterValue}
                        sortedValues={sortedValues}
                      />
                    )}
                  </Paper>
                </MenuTransition>
              </ClickAway>
            )}
          </StyledPopper>
        </Fragment>
      )}
    </PopperProvider>
  );
};

/**
 * Search field and the column's values that match every word of it, best matches first, as findable-ui's FilterMenu matches them. With no match, findable-ui's no results message, whose button clears the search. Mounted while the panel is open, so the search clears on close.
 * @param props - Component props.
 * @param props.column - TanStack column.
 * @param props.filterValue - Selected filter values.
 * @param props.sortedValues - Faceted values with their counts, sorted.
 * @returns Search field and matching values.
 */
function SearchList<T extends RowData>({
  column,
  filterValue,
  sortedValues,
}: SearchListProps<T>): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const matchedValues = applyMenuFilter(
    sortedValues.map(([value, count]) => ({
      count,
      key: value,
      label: String(value),
      selected: filterValue.includes(value),
    })),
    searchTerm,
  ).map(({ value: { count, key } }): [unknown, number] => [key, count]);
  return (
    <>
      <StyledSearch>
        <FilterMenuSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          surfaceType={SURFACE_TYPE.POPPER_MENU}
        />
      </StyledSearch>
      {matchedValues.length > 0 ? (
        <ColumnFilterList
          column={column}
          filterValue={filterValue}
          sortedValues={matchedValues}
        />
      ) : (
        <StyledList>
          <FilterNoResultsFound
            onClearSearchTerm={(): void => setSearchTerm("")}
          />
        </StyledList>
      )}
    </>
  );
}
