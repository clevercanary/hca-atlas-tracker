import { JSX, Fragment } from "react";
import { useFieldArray } from "react-hook-form";
import { HCAAtlasTrackerSourceStudy } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../../../../../hooks/useFormManager/common/entities";
import { getSpreadsheetIdFromUrl } from "../../../../../../../../../../../../utils/google-sheets";
import { SourceStudyEditData } from "../../../../../../../../../../../../views/SourceStudyView/common/entities";
import { InputController } from "../../../../../../../../../../../common/Form/components/Controllers/components/InputController/inputController";
import {
  Section,
  SectionHero,
  SectionTitle,
} from "../../../../../../section.styles";
import { AddItemButton } from "../../../../../ListSection/components/AddItemButton/addItemButton";
import { DeleteItemButton } from "../../../../../ListSection/components/DeleteItemButton/deleteItemButton";
import { ListSection } from "../../../../../ListSection/listSection";

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
      <ListSection>
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
              <DeleteItemButton
                inputRowsPerItem={1}
                onClick={() => remove(index)}
                disabled={isReadOnly}
              />
            </Fragment>
          );
        })}
        <AddItemButton
          disabled={isReadOnly}
          onClick={() => append({ url: "" })}
        >
          Add entry sheet
        </AddItemButton>
      </ListSection>
    </Section>
  );
};

function getMetadataSpreadsheetHelperText(
  sourceStudy: HCAAtlasTrackerSourceStudy | undefined,
  sheetUrl: string,
): string | null {
  if (sourceStudy) {
    let sheetId: string;
    try {
      sheetId = getSpreadsheetIdFromUrl(sheetUrl);
    } catch (_) {
      return null;
    }
    for (const sheet of sourceStudy.metadataSpreadsheets) {
      if (sheet.id === sheetId) return sheet.title;
    }
  }
  return null;
}
