jest.mock(
  "@/app/components/Forms/components/FileArchivedStatus/fileArchivedStatus",
);

import { EditFileArchivedStatus } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/editFileArchivedStatus";
import { RowSelection } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/rowSelection";
import { FileArchivedStatus } from "@/app/components/Forms/components/FileArchivedStatus/fileArchivedStatus";
import { type OnSubmitOptions } from "@/app/hooks/UseEditFileArchived/entities";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/UseFetchAtlasSourceDatasets/query/constants";
import {
  QueryClient,
  QueryClientProvider,
  type QueryKey,
} from "@tanstack/react-query";
import { type Row, type RowData, type Table } from "@tanstack/react-table";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { type JSX } from "react";

const mockFileArchivedStatus = FileArchivedStatus as jest.MockedFunction<
  typeof FileArchivedStatus
>;

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

  describe("EditFileArchivedStatus onSuccess", () => {
    /**
     * Renders the bulk control and returns the options it handed down, so the
     * success handler can be invoked directly rather than through a request.
     * @param resetRowSelection - Reset spy.
     * @param queryClient - Query client.
     * @returns the captured options.
     */
    function renderAndCaptureOptions(
      resetRowSelection: () => void,
      queryClient: QueryClient,
    ): OnSubmitOptions | undefined {
      mockFileArchivedStatus.mockImplementation((): JSX.Element => <div />);
      render(
        <QueryClientProvider client={queryClient}>
          <EditFileArchivedStatus
            queryKeys={QUERY_KEYS}
            rows={[row("file-1")]}
            table={table([row("file-1")], resetRowSelection)}
          />
        </QueryClientProvider>,
      );
      return mockFileArchivedStatus.mock.calls[0][0].options;
    }

    it("clears the selection and invalidates every supplied key", () => {
      // The bulk surface returns nothing, so the action's pending window covers
      // the request alone. Narrowing what is *awaited* must not narrow what is
      // invalidated: dropping these calls would shorten the window just as well
      // and silently leave the caches stale. The two detail helpers are pinned
      // the same way in `archive-options`; this is the third call site.
      const resetRowSelection = jest.fn();
      const queryClient = new QueryClient();
      const invalidateQueries = jest
        .spyOn(queryClient, "invalidateQueries")
        .mockResolvedValue(undefined);

      const options = renderAndCaptureOptions(resetRowSelection, queryClient);
      const returned = options?.onSuccess?.();

      expect(resetRowSelection).toHaveBeenCalledTimes(1);
      expect(invalidateQueries).toHaveBeenCalledTimes(QUERY_KEYS.length);
      for (const queryKey of QUERY_KEYS) {
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey });
      }
      // Nothing awaited: returning a promise here would hold a toolbar that is
      // already unmounting (see the RowSelection test below).
      expect(returned).toBeUndefined();
    });

    it("invalidates nothing when no keys are supplied", () => {
      // `queryKeys` is optional, and the `?? []` fallback is the only thing
      // between an omitted prop and a throw on iteration.
      const queryClient = new QueryClient();
      const invalidateQueries = jest
        .spyOn(queryClient, "invalidateQueries")
        .mockResolvedValue(undefined);
      mockFileArchivedStatus.mockImplementation((): JSX.Element => <div />);
      render(
        <QueryClientProvider client={queryClient}>
          <EditFileArchivedStatus
            rows={[row("file-1")]}
            table={table([row("file-1")])}
          />
        </QueryClientProvider>,
      );

      expect(() =>
        mockFileArchivedStatus.mock.calls[0][0].options?.onSuccess?.(),
      ).not.toThrow();
      expect(invalidateQueries).not.toHaveBeenCalled();
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
