import "@testing-library/jest-dom";
import { type ReactNode } from "react";

jest.mock("@/app/common/utils", () => ({
  ...jest.requireActual("@/app/common/utils"),
  // `RefreshForm` loads its status on mount; leave that request pending.
  fetchResource: jest.fn(() => new Promise(() => undefined)),
}));
jest.mock("@/app/hooks/useAdminAction", () => ({
  useAdminAction: jest.fn(() => ({
    data: null,
    errors: null,
    isRequesting: false,
    onAction: jest.fn(),
    requestCompleted: false,
  })),
}));
jest.mock("@/app/hooks/UseEditFileArchived/hook", () => ({
  useEditFileArchived: jest.fn(() => ({
    isRequesting: false,
    onSubmit: jest.fn(),
  })),
}));
jest.mock("@/app/providers/entity/hook", () => ({
  useEntity: jest.fn(),
}));
jest.mock("@databiosphere/findable-ui/lib/hooks/useConfig", () => ({
  ...jest.requireActual("@databiosphere/findable-ui/lib/hooks/useConfig"),
  useConfig: jest.fn(() => ({ config: { portalURL: "https://portal.test" } })),
}));
jest.mock("@/app/views/SourceStudiesView/components/Table/table", () => ({
  Table: (): null => null,
}));
jest.mock(
  "@/app/components/Layout/components/Detail/sticky/detailView",
  () => ({
    // Render only the view's actions, where its button is.
    StickyDetailView: ({ actions }: { actions: ReactNode }): ReactNode =>
      actions,
  }),
);
jest.mock("@/app/hooks/UseFetchAtlas/hook", () => ({
  useFetchAtlas: jest.fn(() => ({ data: {} })),
}));
jest.mock(
  "@/app/views/AtlasMetadataEntrySheetsView/hooks/UseFetchEntrySheetsValidations/hook",
  () => ({ useFetchEntrySheetsValidations: jest.fn(() => ({ data: [] })) }),
);
jest.mock(
  "@/app/views/AtlasMetadataEntrySheetsView/hooks/UseEntrySheetSync/hook",
  () => ({
    useAtlasEntrySheetsSync: jest.fn(() => ({
      entrySheetSyncState: { started: false },
      onSyncEntrySheets: jest.fn(),
    })),
  }),
);
jest.mock("@/app/hooks/useAtlasTabBackPath", () => ({
  useAtlasTabBackPath: jest.fn(() => "/atlases"),
}));
jest.mock("@/app/hooks/useFormManager/useFormManager", () => ({
  useFormManager: jest.fn(() =>
    jest.requireActual("@/testing/buttons").makeFormManager(),
  ),
}));

import { ViewSourceStudies } from "@/app/components/Detail/components/ViewSourceStudies/viewSourceStudies";
import { CellxGeneInProgressForm } from "@/app/components/Forms/components/CellxGeneInProgress/cellxgeneInProgress";
import { FileArchivedStatus } from "@/app/components/Forms/components/FileArchivedStatus/fileArchivedStatus";
import { FilesAdminForm } from "@/app/components/Forms/components/FilesAdmin/filesAdmin";
import { IntegrationLeadsFromAtlasesForm } from "@/app/components/Forms/components/IntegrationLeadsFromAtlases/integrationLeadsFromAtlases";
import { RefreshForm } from "@/app/components/Forms/components/Refresh/refresh";
import { useEntity } from "@/app/providers/entity/hook";
import { AtlasMetadataEntrySheetsView } from "@/app/views/AtlasMetadataEntrySheetsView/atlasMetadataEntrySheetsView";
import { Actions as EntrySheetValidationActions } from "@/app/views/AtlasMetadataEntrySheetValidationView/components/Actions/actions";
import { EntityValidationReport } from "@/app/views/AtlasMetadataEntrySheetValidationView/components/ValidationReport/components/EntityValidationReport/entityValidationReport";
import { MAX_REPORTS_TO_DISPLAY } from "@/app/views/AtlasMetadataEntrySheetValidationView/components/ValidationReport/constants";
import { type ValidationErrorInfo } from "@/app/views/AtlasMetadataEntrySheetValidationView/components/ValidationReport/entities";
import { ViewComponentAtlasSourceDatasetsSelection } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/viewComponentAtlasSourceDatasetsSelection";
import {
  expectPrimaryContained,
  expectSecondaryOutlined,
  getButton,
  makeFormManager,
} from "@/testing/buttons";
import { TEST_THEME } from "@/testing/theme";
import { ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";

const mockUseEntity = useEntity as jest.MockedFunction<typeof useEntity>;

const PATH_PARAMETER = { atlasId: "atlas-id" };

/**
 * Renders the element inside the test theme, which styled components read breakpoints from.
 * @param element - Element to render.
 */
function renderWithTheme(element: ReactNode): void {
  render(<ThemeProvider theme={TEST_THEME}>{element}</ThemeProvider>);
}

/**
 * Returns a validation report for the given column.
 * @param column - Column name.
 * @returns validation report.
 */
function makeReport(column: string): ValidationErrorInfo {
  return {
    cell: "A1",
    column,
    entity_type: "donor",
    input: null,
    message: "Invalid value",
    primary_key: null,
    row: 1,
    worksheet_id: 1,
  };
}

describe("admin forms", () => {
  it.each([
    ["CellxGeneInProgressForm", CellxGeneInProgressForm, "Update"],
    ["FilesAdminForm", FilesAdminForm, "Validate"],
    [
      "IntegrationLeadsFromAtlasesForm",
      IntegrationLeadsFromAtlasesForm,
      "Update",
    ],
  ])("%s renders %s as contained primary", (_name, Form, label) => {
    renderWithTheme(<Form />);
    expectPrimaryContained(label);
  });

  it("RefreshForm renders both of its buttons as contained primary", () => {
    renderWithTheme(<RefreshForm />);
    expectPrimaryContained("Reload Status");
    expectPrimaryContained("Start Refresh");
  });
});

describe("FileArchivedStatus", () => {
  it("renders as outlined secondary", () => {
    mockUseEntity.mockReturnValue({
      pathParameter: PATH_PARAMETER,
    } as ReturnType<typeof useEntity>);
    renderWithTheme(
      <FileArchivedStatus isArchived={false} payload={{ fileIds: [] }} />,
    );
    expectSecondaryOutlined("Archive");
  });
});

describe("entry sheet validation Actions", () => {
  it("renders Sync as medium outlined secondary and Open Sheet as medium contained primary", () => {
    mockUseEntity.mockReturnValue({
      data: { entrySheetValidation: { entrySheetId: "sheet-id" } },
    } as ReturnType<typeof useEntity>);
    renderWithTheme(
      <EntrySheetValidationActions
        entrySheetSyncState={{ started: false }}
        onSyncEntrySheets={jest.fn()}
      />,
    );
    expectSecondaryOutlined("Sync entry sheet");
    expect(getButton("Sync entry sheet")).toHaveClass("MuiButton-sizeMedium");
    expectPrimaryContained("Open Sheet");
    expect(getButton("Open Sheet")).toHaveClass("MuiButton-sizeMedium");
  });
});

describe("EntityValidationReport", () => {
  it("renders Open as inherit text and Show more as primary text", () => {
    const reports = Array.from({ length: MAX_REPORTS_TO_DISPLAY + 1 }, () =>
      makeReport("donor_id"),
    );
    renderWithTheme(
      <EntityValidationReport
        columnValidationReports={new Map([["donor_id", reports]])}
        entityType="donor"
        entrySheetId="sheet-id"
      />,
    );
    const openButtons = screen.getAllByText("Open");
    expect(openButtons).toHaveLength(MAX_REPORTS_TO_DISPLAY);
    for (const open of openButtons) {
      expect(open.closest("button")).toHaveClass(
        "MuiButton-text",
        "MuiButton-colorInherit",
      );
    }
    expect(getButton("Show more")).toHaveClass(
      "MuiButton-text",
      "MuiButton-colorPrimary",
    );
  });
});

describe("ViewComponentAtlasSourceDatasetsSelection", () => {
  it("renders Link source dataset as outlined secondary", () => {
    renderWithTheme(
      <ViewComponentAtlasSourceDatasetsSelection
        atlasSourceDatasets={[]}
        componentAtlasIsArchived={false}
        componentAtlasSourceDatasets={[]}
        pathParameter={PATH_PARAMETER}
      />,
    );
    expectSecondaryOutlined("Link source dataset");
  });
});

describe("ViewSourceStudies", () => {
  it("renders Add Source Study as outlined secondary", () => {
    renderWithTheme(
      <ViewSourceStudies
        formManager={makeFormManager()}
        pathParameter={PATH_PARAMETER}
      />,
    );
    expectSecondaryOutlined("Add Source Study");
  });
});

describe("AtlasMetadataEntrySheetsView", () => {
  it("renders Sync Entry Sheets as outlined secondary", () => {
    renderWithTheme(
      <AtlasMetadataEntrySheetsView pathParameter={PATH_PARAMETER} />,
    );
    expectSecondaryOutlined("Sync entry sheets");
  });
});
