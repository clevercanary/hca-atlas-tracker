import {
  getArchiveOptions,
  mapPayload,
} from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/utils";
import { RowSelection } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/rowSelection";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/UseFetchAtlasSourceDatasets/query/constants";
import { type QueryKey } from "@tanstack/react-query";
import { type Row, type RowData, type Table } from "@tanstack/react-table";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { type JSX } from "react";

const TEST_ATLAS_ID = "test-atlas-id";

const QUERY_KEYS: QueryKey[] = [
  [ATLAS, TEST_ATLAS_ID],
  [SOURCE_DATASETS, TEST_ATLAS_ID],
];

/**
 * A selected row carrying the `fileId` the bulk payload is built from.
 * @param fileId - File id the row reports.
 * @returns the row.
 */
function row<T extends RowData>(fileId: string): Row<T> {
  return { getValue: (): string => fileId } as unknown as Row<T>;
}

/**
 * A table stub exposing only what the components under test read: the selected
 * row model and the selection reset.
 * @param rows - Selected rows.
 * @param resetRowSelection - Reset spy.
 * @returns the table.
 */
function table<T extends RowData>(
  rows: Row<T>[],
  resetRowSelection: () => void = jest.fn(),
): Table<T> {
  return {
    getSelectedRowModel: (): { rows: Row<T>[] } => ({ rows }),
    resetRowSelection,
  } as unknown as Table<T>;
}

describe("bulk archive selection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getArchiveOptions", () => {
    it("dispatches every supplied key and awaits none", () => {
      // The bulk surface awaits nothing, so the action's pending window covers
      // the request alone. Narrowing what is *awaited* must not narrow what is
      // invalidated: dropping these keys would shorten the window just as well
      // and silently leave the caches stale. The two detail helpers are pinned
      // the same way in `archive-options`; this is the third call site.
      const { invalidateQueryKeys } = getArchiveOptions(table([]), QUERY_KEYS);

      expect(invalidateQueryKeys?.dispatched).toEqual(QUERY_KEYS);
      // Awaiting here would hold a toolbar that is already unmounting (see the
      // RowSelection test below).
      expect(invalidateQueryKeys?.awaited).toBeUndefined();
    });

    it("clears the selection on success", () => {
      const resetRowSelection = jest.fn();

      getArchiveOptions(table([], resetRowSelection), QUERY_KEYS).onSuccess?.();

      expect(resetRowSelection).toHaveBeenCalledTimes(1);
    });

    it("declares no keys when none are supplied", () => {
      // `queryKeys` is optional; an omitted prop has to reach the request layer
      // as an absent list rather than as anything it would iterate.
      const { invalidateQueryKeys } = getArchiveOptions(table([]));

      expect(invalidateQueryKeys?.dispatched).toBeUndefined();
    });
  });

  describe("mapPayload", () => {
    it("collects the selected rows' file ids", () => {
      expect(mapPayload([row("file-1"), row("file-2")])).toEqual({
        fileIds: ["file-1", "file-2"],
      });
    });
  });

  describe("RowSelection", () => {
    it("renders nothing once the selection is empty", () => {
      // The premise the bulk surface's shortened guard rests on. `onSuccess`
      // returns nothing, so `isRequesting` clears as soon as the PATCH
      // responds — safe only because resetting the selection unmounts the
      // button entirely, leaving no control to click against a list that
      // hasn't refetched yet. If this ever renders a disabled toolbar instead
      // of null, that guard has to come back: the endpoint rejects a repeated
      // archive/unarchive, so the second click surfaces an error for an action
      // that succeeded.
      const { container } = render(
        <RowSelection
          component={(): JSX.Element => <div />}
          table={table([])}
        />,
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("renders the selection view while rows are selected", () => {
      // The other side of the same contract: without this, a RowSelection that
      // rendered null unconditionally would pass the test above and prove
      // nothing.
      const { container } = render(
        <RowSelection
          component={(): JSX.Element => <div data-testid="bulk-action" />}
          table={table([row("file-1")])}
        />,
      );

      expect(container).not.toBeEmptyDOMElement();
    });
  });
});
