import { Controller } from "react-hook-form";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { NewSourceDatasetData } from "../../../../../../../../../../../../views/AddNewSourceDatasetView/common/entities";
import { Input } from "../../../../../../../../../../../common/Form/components/Input/input";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../../../section.styles";
import { DEFAULT_INPUT_PROPS, FIELD_NAME } from "../../../../common/constants";

export interface GeneralInfoProps {
  formMethod: FormMethod<NewSourceDatasetData>;
}

export const GeneralInfo = ({ formMethod }: GeneralInfoProps): JSX.Element => {
  const { control, formState } = formMethod;
  const { errors } = formState;
  return (
    <Section>
      <SectionHero>
        <SectionTitle>General info</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Controller
          control={control}
          name={FIELD_NAME.DOI}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.DOI}
              error={Boolean(errors[FIELD_NAME.DOI])}
              helperText={errors[FIELD_NAME.DOI]?.message}
              isFilled={Boolean(field.value)}
            />
          )}
        />
      </SectionCard>
    </Section>
  );
};
