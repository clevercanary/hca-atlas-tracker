import { Controller } from "react-hook-form";
import { HCAAtlasTrackerComponentAtlas } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../../../../../hooks/useFormManager/common/entities";
import { FIELD_NAME } from "../../../../../../../../../../../../views/AddNewComponentAtlasView/common/constants";
import { ComponentAtlasEditData } from "../../../../../../../../../../../../views/ComponentAtlasView/common/entities";
import { Input } from "../../../../../../../../../../../common/Form/components/Input/input";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../../../section.styles";
import { DEFAULT_INPUT_PROPS } from "../../../../common/constants";

export interface GeneralInfoProps {
  formManager: FormManager;
  formMethod: FormMethod<ComponentAtlasEditData, HCAAtlasTrackerComponentAtlas>;
}

export const GeneralInfo = ({
  formManager,
  formMethod,
}: GeneralInfoProps): JSX.Element => {
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const { control } = formMethod;
  return (
    <Section>
      <SectionHero>
        <SectionTitle>General info</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Controller
          control={control}
          name={FIELD_NAME.TITLE}
          render={({ field, fieldState: { error, invalid } }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.TITLE}
              error={invalid}
              helperText={error?.message as string}
              isFilled={Boolean(field.value)}
              readOnly={isReadOnly}
            />
          )}
        />
      </SectionCard>
    </Section>
  );
};
