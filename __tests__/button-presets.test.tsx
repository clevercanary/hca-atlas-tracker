import { type HCAAtlasTrackerListValidationRecord } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { FormActions } from "@/app/components/common/Form/components/FormActions/formActions";
import { Banner } from "@/app/components/common/Form/components/FormManager/components/Banner/banner";
import { Popup } from "@/app/components/common/Form/components/FormManager/components/Popup/popup";
import { buildTaskDescription } from "@/app/viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { AtlasActionButton } from "@/app/views/AtlasView/components/AtlasActionButton/atlasActionButton";
import { CreateRevisionDialogUnsavedChanges } from "@/app/views/AtlasView/components/CreateRevisionDialogUnsavedChanges/createRevisionDialogUnsavedChanges";
import { PublishDialogUnsavedChanges } from "@/app/views/AtlasView/components/PublishDialogUnsavedChanges/publishDialogUnsavedChanges";
import { FormActions as SourceDatasetsSelectionFormActions } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/components/ComponentAtlasSourceDatasetsSelection/components/FormActions/formActions";
import { NotFoundView } from "@/app/views/NotFoundView/notFoundView";
import {
  expectPrimaryContained,
  expectSecondaryOutlined,
  getButton,
  makeFormManager,
} from "@/testing/buttons";
import { TEST_THEME } from "@/testing/theme";
import { type ViewContext } from "@databiosphere/findable-ui/lib/config/entities";
import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

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
