import { AddIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/AddIcon/addIcon";
import { IconButton } from "@mui/material";
import { Fragment } from "react";
import { useFieldArray } from "react-hook-form";
import { HCAAtlasTrackerSourceStudy } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../../../../../hooks/useFormManager/common/entities";
import { SourceStudyEditData } from "../../../../../../../../../../../../views/SourceStudyView/common/entities";
import { DeleteIcon } from "../../../../../../../../../../../common/CustomIcon/components/DeleteIcon/deleteIcon";
import { InputController } from "../../../../../../../../../../../common/Form/components/Controllers/components/InputController/inputController";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../../../section.styles";
import { BUTTON_PROPS, ICON_BUTTON_PROPS, SVG_ICON_PROPS } from "./constants";
import { ControllerAction, StyledButton } from "./metadata.styles";

export interface MetadataProps {
  formManager: FormManager;
  formMethod: FormMethod<SourceStudyEditData, HCAAtlasTrackerSourceStudy>;
}

export const Metadata = ({
  formManager,
  formMethod,
}: MetadataProps): JSX.Element => {
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const { append, fields, remove } = useFieldArray({
    control: formMethod.control,
    name: "metadataSpreadsheets",
  });
  return (
    <Section>
      <SectionHero>
        <SectionTitle>Metadata</SectionTitle>
      </SectionHero>
      <SectionCard gridAutoFlow="dense">
        {fields.map((item, index) => {
          return (
            <Fragment key={item.id}>
              <InputController
                formManager={formManager}
                formMethod={formMethod}
                inputProps={{
                  isFullWidth: true,
                  label: "Metadata entry sheet",
                }}
                labelLink={{
                  getUrl: (url) => url || null,
                }}
                name={`metadataSpreadsheets.${index}.url`}
                renderHelperText={(sourceStudy) =>
                  getMetadataSpreadsheetHelperText(sourceStudy, item.url)
                }
              />
              <ControllerAction>
                <IconButton
                  {...ICON_BUTTON_PROPS}
                  onClick={() => remove(index)}
                  disabled={isReadOnly}
                >
                  <DeleteIcon {...SVG_ICON_PROPS} />
                </IconButton>
              </ControllerAction>
            </Fragment>
          );
        })}
        <StyledButton
          {...BUTTON_PROPS}
          startIcon={<AddIcon />}
          onClick={() => append({ title: null, url: "" })}
          disabled={isReadOnly}
        >
          Add sheet
        </StyledButton>
      </SectionCard>
    </Section>
  );
};

function getMetadataSpreadsheetHelperText(
  sourceStudy: HCAAtlasTrackerSourceStudy | undefined,
  sheetUrl: string
): string | null {
  if (sourceStudy) {
    for (const sheet of sourceStudy.metadataSpreadsheets) {
      if (sheet.url === sheetUrl) return sheet.title;
    }
  }
  return null;
}
