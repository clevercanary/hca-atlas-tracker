import { type HCAAtlasTrackerListValidationRecord } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { FormActions } from "@/app/components/common/Form/components/FormActions/formActions";
import { Banner } from "@/app/components/common/Form/components/FormManager/components/Banner/banner";
import { Popup } from "@/app/components/common/Form/components/FormManager/components/Popup/popup";
import { ViewSourceStudies } from "@/app/components/Detail/components/ViewSourceStudies/viewSourceStudies";
import { CellxGeneInProgressForm } from "@/app/components/Forms/components/CellxGeneInProgress/cellxgeneInProgress";
import { FileArchivedStatus } from "@/app/components/Forms/components/FileArchivedStatus/fileArchivedStatus";
import { FilesAdminForm } from "@/app/components/Forms/components/FilesAdmin/filesAdmin";
import { IntegrationLeadsFromAtlasesForm } from "@/app/components/Forms/components/IntegrationLeadsFromAtlases/integrationLeadsFromAtlases";
import { RefreshForm } from "@/app/components/Forms/components/Refresh/refresh";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { buildTaskDescription } from "@/app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { AtlasMetadataEntrySheetsView } from "@/app/views/AtlasMetadataEntrySheetsView/atlasMetadataEntrySheetsView";
import { Actions as EntrySheetValidationActions } from "@/app/views/AtlasMetadataEntrySheetValidationView/components/Actions/actions";
import { EntityValidationReport } from "@/app/views/AtlasMetadataEntrySheetValidationView/components/ValidationReport/components/EntityValidationReport/entityValidationReport";
import { AtlasActionButton } from "@/app/views/AtlasView/components/AtlasActionButton/atlasActionButton";
import { CreateRevisionDialogUnsavedChanges } from "@/app/views/AtlasView/components/CreateRevisionDialogUnsavedChanges/createRevisionDialogUnsavedChanges";
import { PublishDialogUnsavedChanges } from "@/app/views/AtlasView/components/PublishDialogUnsavedChanges/publishDialogUnsavedChanges";
import { FormActions as SourceDatasetsSelectionFormActions } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/components/ComponentAtlasSourceDatasetsSelection/components/FormActions/formActions";
import { ViewComponentAtlasSourceDatasetsSelection } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/viewComponentAtlasSourceDatasetsSelection";
import { NotFoundView } from "@/app/views/NotFoundView/notFoundView";
import { TEST_THEME } from "@/testing/theme";
import { type ViewContext } from "@databiosphere/findable-ui/lib/config/entities";
import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

const FORM_STATUS: FormManager["formStatus"] = {
  isDirty: false,
  isDisabled: false,
  isLeaving: false,
  isReadOnly: false,
  isSubmitSuccessful: false,
  isSubmitted: false,
  isSubmitting: false,
};

/**
 * Returns a form manager that can edit, with the given status overrides.
 * @param formStatus - Form status overrides.
 * @returns form manager.
 */
function makeFormManager(
  formStatus: Partial<FormManager["formStatus"]> = {},
): FormManager {
  return {
    access: { canEdit: true },
    formAction: {
      onCancel: jest.fn(),
      onDelete: jest.fn(),
      onDiscard: jest.fn(),
      onSave: jest.fn(),
    },
    formStatus: { ...FORM_STATUS, ...formStatus },
    isLoading: false,
  };
}

/**
 * Returns the button with the given accessible name.
 * @param name - Button name.
 * @returns button element.
 */
function getButton(name: string): HTMLElement {
  // Match by text, so icon buttons labelled the same (a dialog's "Close" icon) are not matched.
  const button = screen.getByText(name).closest("button");
  if (!button) throw new Error(`No button with text "${name}".`);
  return button;
}

/**
 * Asserts that a button renders as findable-ui's white bordered button: `outlined` `secondary`.
 * @param name - Button name.
 */
function expectSecondaryOutlined(name: string): void {
  expect(getButton(name)).toHaveClass(
    "MuiButton-outlined",
    "MuiButton-colorSecondary",
  );
}

/**
 * Asserts that a button renders as `contained` `primary`.
 * @param name - Button name.
 */
function expectPrimaryContained(name: string): void {
  expect(getButton(name)).toHaveClass(
    "MuiButton-contained",
    "MuiButton-colorPrimary",
  );
}

describe("FormActions", () => {
  it("renders Discard as outlined secondary and tags each button with its grid role", () => {
    render(<FormActions formManager={makeFormManager()} />);
    expectSecondaryOutlined("Discard");
    expectPrimaryContained("Save");
    expect(getButton("Delete")).toHaveClass("form-action-delete");
    expect(getButton("Discard")).toHaveClass("form-action-discard");
    expect(getButton("Save")).toHaveClass("form-action-save");
  });
});

describe("source datasets selection FormActions", () => {
  it("renders Discard as outlined secondary and tags each button with its grid role", () => {
    render(
      <SourceDatasetsSelectionFormActions
        count={2}
        formManager={makeFormManager()}
      />,
    );
    expectSecondaryOutlined("Discard");
    expectPrimaryContained("Link (2)");
    expect(getButton("Discard")).toHaveClass("form-action-discard");
    expect(getButton("Link (2)")).toHaveClass("form-action-save");
  });
});

describe("Banner", () => {
  it("renders Discard as outlined secondary and Save as contained primary", () => {
    render(<Banner {...makeFormManager({ isDirty: true })} />);
    expectSecondaryOutlined("Discard");
    expectPrimaryContained("Save");
  });
});

describe("Popup", () => {
  it("renders Discard as outlined secondary and Save as contained primary", () => {
    render(
      <Popup {...makeFormManager({ isLeaving: true })} content="Unsaved" />,
    );
    expectSecondaryOutlined("Discard changes");
    expectPrimaryContained("Save changes");
  });
});

describe("AtlasActionButton", () => {
  it("renders as outlined secondary", () => {
    render(<AtlasActionButton>Publish</AtlasActionButton>);
    expectSecondaryOutlined("Publish");
  });
});

describe("unsaved-changes dialogs", () => {
  it.each([
    ["CreateRevisionDialogUnsavedChanges", CreateRevisionDialogUnsavedChanges],
    ["PublishDialogUnsavedChanges", PublishDialogUnsavedChanges],
  ])("%s renders Close as contained primary", (_name, Dialog) => {
    render(<Dialog onClose={jest.fn()} open />);
    expectPrimaryContained("Close");
  });
});

describe("NotFoundView", () => {
  it("renders its home link as contained primary", () => {
    render(
      <ThemeProvider theme={TEST_THEME}>
        <NotFoundView />
      </ThemeProvider>,
    );
    expect(screen.getByRole("link")).toHaveClass(
      "MuiButton-contained",
      "MuiButton-colorPrimary",
    );
  });
});

describe("buildTaskDescription", () => {
  it("returns primary text button props", () => {
    const props = buildTaskDescription(
      { description: "Task" } as HCAAtlasTrackerListValidationRecord,
      {} as ViewContext<HCAAtlasTrackerListValidationRecord>,
    );
    expect(props).toMatchObject({
      children: "Task",
      color: "primary",
      variant: "text",
    });
  });
});

describe("components that need app providers to render", () => {
  it.each([
    ["AtlasMetadataEntrySheetsView", AtlasMetadataEntrySheetsView],
    ["CellxGeneInProgressForm", CellxGeneInProgressForm],
    ["EntityValidationReport", EntityValidationReport],
    ["EntrySheetValidationActions", EntrySheetValidationActions],
    ["FileArchivedStatus", FileArchivedStatus],
    ["FilesAdminForm", FilesAdminForm],
    ["IntegrationLeadsFromAtlasesForm", IntegrationLeadsFromAtlasesForm],
    ["RefreshForm", RefreshForm],
    [
      "ViewComponentAtlasSourceDatasetsSelection",
      ViewComponentAtlasSourceDatasetsSelection,
    ],
    ["ViewSourceStudies", ViewSourceStudies],
  ])("%s loads against findable-ui 63's button modules", (_name, Component) => {
    expect(Component).toEqual(expect.any(Function));
  });
});
