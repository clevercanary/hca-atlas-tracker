import { HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { InputController } from "@/app/components/common/Form/components/Controllers/components/InputController/inputController";
import { AddItemButton } from "@/app/components/Detail/components/TrackerForm/components/Section/components/ListSection/components/AddItemButton/addItemButton";
import { DeleteItemButton } from "@/app/components/Detail/components/TrackerForm/components/Section/components/ListSection/components/DeleteItemButton/deleteItemButton";
import { ListSection } from "@/app/components/Detail/components/TrackerForm/components/Section/components/ListSection/listSection";
import {
  Section,
  SectionHero,
  SectionTitle,
} from "@/app/components/Detail/components/TrackerForm/components/Section/section.styles";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { FormManager } from "@/app/hooks/useFormManager/common/entities";
import { getSpreadsheetIdFromUrl } from "@/app/utils/google-sheets";
import { SourceStudyEditData } from "@/app/views/SourceStudyView/common/entities";
import { Fragment, JSX } from "react";
import { useFieldArray } from "react-hook-form";

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
    } catch {
      return null;
    }
    for (const sheet of sourceStudy.metadataSpreadsheets) {
      if (sheet.id === sheetId) return sheet.title;
    }
  }
  return null;
}
