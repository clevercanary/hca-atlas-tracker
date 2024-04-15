import { Controller } from "react-hook-form";
import { NewSourceDatasetData } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FormMethod } from "../../../../../../../../../../hooks/useForm/common/entities";
import { Input } from "../../../../../../../../../common/Form/components/Input/input";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../section.styles";

export const FIELD_NAME_DOI = "doi";

export interface GeneralInfoProps {
  control: FormMethod<NewSourceDatasetData>["control"];
  formState: FormMethod<NewSourceDatasetData>["formState"];
}

export const GeneralInfo = ({
  control,
  formState,
}: GeneralInfoProps): JSX.Element => {
  const { errors } = formState;
  return (
    <Section>
      <SectionHero>
        <SectionTitle>General info</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Controller
          control={control}
          name={FIELD_NAME_DOI}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              error={Boolean(errors[FIELD_NAME_DOI])}
              helperText={errors[FIELD_NAME_DOI]?.message as string}
              isFilled={Boolean(field.value)}
              label="DOI"
              placeholder="e.g. 10.1038/s41591-023-02327-2"
              readOnly={false}
            />
          )}
        />
      </SectionCard>
    </Section>
  );
};
