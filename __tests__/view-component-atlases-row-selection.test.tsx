import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { createElement, useState, type JSX, type ReactNode } from "react";

// Mock dependencies before imports
jest.mock(
  "@/app/components/Detail/components/ViewComponentAtlases/hooks/UseIntegratedObjectsTable/hook",
);
jest.mock(
  "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/rowSelection",
);
jest.mock(
  "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/editFileArchivedStatus",
);
jest.mock(
  "@/app/components/Entity/components/common/Table/components/TableToolbar/components/ArchivedStatusToggle/archiveStatusToggle",
  () => ({ ArchivedStatusToggle: (): null => null }),
);
jest.mock("@/app/components/Entity/components/common/Table/table", () => ({
  Table: (): null => null,
}));
jest.mock(
  "@/app/components/Table/components/TablePlaceholder/tablePlaceholder",
  () => ({ TablePlaceholder: (): null => null }),
);
jest.mock("@/app/providers/entity/hook");

import { useIntegratedObjectsTable } from "@/app/components/Detail/components/ViewComponentAtlases/hooks/UseIntegratedObjectsTable/hook";
import { ViewComponentAtlases } from "@/app/components/Detail/components/ViewComponentAtlases/viewComponentAtlases";
import { EditFileArchivedStatus } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/editFileArchivedStatus";
import { RowSelection } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/rowSelection";
import { useEntity } from "@/app/providers/entity/hook";
import { TEST_THEME } from "@/testing/theme";

// Type mocks
const mockEditFileArchivedStatus =
  EditFileArchivedStatus as jest.MockedFunction<typeof EditFileArchivedStatus>;
const mockRowSelection = RowSelection as jest.MockedFunction<
  typeof RowSelection
>;
const mockUseEntity = useEntity as jest.MockedFunction<typeof useEntity>;
const mockUseIntegratedObjectsTable =
  useIntegratedObjectsTable as jest.MockedFunction<
    typeof useIntegratedObjectsTable
  >;

const TEST_ATLAS_ID = "test-atlas-id-123";

/**
 * Supplies the MUI theme the view's styled paper reads breakpoints from.
 * @param props - Wrapper props.
 * @param props.children - React children.
 * @returns themed wrapper.
 */
function Wrapper({ children }: { children: ReactNode }): JSX.Element {
  return <ThemeProvider theme={TEST_THEME}>{children}</ThemeProvider>;
}

/**
 * Stands in for `FileArchivedStatus`'s in-flight `isRequesting` guard: a
 * remount is what resets it, so surviving state proves the subtree wasn't
 * remounted.
 * @returns clickable probe rendering its own click count.
 */
function StatefulProbe(): JSX.Element {
  const [clicks, setClicks] = useState(0);
  return (
    <button
      data-testid="probe"
      onClick={(): void => setClicks((c) => c + 1)}
      type="button"
    >
      {clicks}
    </button>
  );
}

beforeEach(() => {
  jest.clearAllMocks();

  mockUseEntity.mockReturnValue({
    pathParameter: { atlasId: TEST_ATLAS_ID },
  } as unknown as ReturnType<typeof useEntity>);

  mockUseIntegratedObjectsTable.mockReturnValue({
    access: { canDelete: false, canEdit: true, canView: true },
    table: { getRowCount: (): number => 1 },
  } as unknown as ReturnType<typeof useIntegratedObjectsTable>);

  mockEditFileArchivedStatus.mockImplementation(StatefulProbe);

  // Mirrors findable-ui's ComponentCreator, which renders the row selection
  // view with `createElement(component, ...)` — so a `component` prop whose
  // identity changes between renders changes the element *type*, and React
  // unmounts and remounts the subtree.
  mockRowSelection.mockImplementation(({ component }) =>
    createElement(component, {}),
  );
});

describe("ViewComponentAtlases row selection", (): void => {
  it("passes a referentially stable component to RowSelection", (): void => {
    const { rerender } = render(<ViewComponentAtlases />, {
      wrapper: Wrapper,
    });
    rerender(<ViewComponentAtlases />);

    expect(mockRowSelection).toHaveBeenCalledTimes(2);
    expect(mockRowSelection.mock.calls[1][0].component).toBe(
      mockRowSelection.mock.calls[0][0].component,
    );
  });

  it("keeps the row selection subtree mounted across a re-render, so an in-flight request guard isn't reset", (): void => {
    const { rerender } = render(<ViewComponentAtlases />, {
      wrapper: Wrapper,
    });

    fireEvent.click(screen.getByTestId("probe"));
    expect(screen.getByTestId("probe")).toHaveTextContent("1");

    rerender(<ViewComponentAtlases />);

    expect(screen.getByTestId("probe")).toHaveTextContent("1");
  });
});
