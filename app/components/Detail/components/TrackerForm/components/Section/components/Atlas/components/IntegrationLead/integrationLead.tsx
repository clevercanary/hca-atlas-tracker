import { Controller } from "react-hook-form";
import {
  AtlasEditData,
  NewAtlasData,
} from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FormMethod } from "../../../../../../../../../../hooks/useForm/common/entities";
import { Input } from "../../../../../../../../../common/Form/components/Input/input";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../section.styles";

export const FIELD_NAME_INTEGRATION_LEAD = "integrationLead";
export const FIELD_NAME_INTEGRATION_LEAD_EMAIL = "integrationLead.email";
export const FIELD_NAME_INTEGRATION_LEAD_NAME = "integrationLead.name";

export interface IntegrationLeadProps {
  control: FormMethod<AtlasEditData | NewAtlasData>["control"];
  formState: FormMethod<AtlasEditData | NewAtlasData>["formState"];
}

export const IntegrationLead = ({
  control,
  formState,
}: IntegrationLeadProps): JSX.Element => {
  const { errors } = formState;
  return (
    <Section>
      <SectionHero>
        <SectionTitle>Integration lead</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Controller
          control={control}
          name={FIELD_NAME_INTEGRATION_LEAD_NAME}
          render={({ field }): JSX.Element => {
            return (
              <Input
                {...field}
                error={Boolean(errors.integrationLead?.name)}
                helperText={errors.integrationLead?.name?.message as string}
                isFilled={Boolean(field.value)}
                label="Full name"
                readOnly={false}
              />
            );
          }}
        />
        <Controller
          control={control}
          name={FIELD_NAME_INTEGRATION_LEAD_EMAIL}
          render={({ field }): JSX.Element => {
            return (
              <Input
                {...field}
                error={Boolean(errors.integrationLead?.email)}
                helperText={errors.integrationLead?.email?.message as string}
                isFilled={Boolean(field.value)}
                label="Email"
                readOnly={false}
              />
            );
          }}
        />
      </SectionCard>
    </Section>
  );
};
