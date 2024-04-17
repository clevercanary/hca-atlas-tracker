import { Controller } from "react-hook-form";
import { HCAAtlasTrackerAtlas } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
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
import { DEFAULT_INPUT_PROPS, FIELD_NAME } from "../../common/constants";

export interface IntegrationLeadProps {
  formMethod:
    | FormMethod<AtlasEditData, HCAAtlasTrackerAtlas>
    | FormMethod<NewAtlasData>;
}

export const IntegrationLead = ({
  formMethod,
}: IntegrationLeadProps): JSX.Element => {
  const { control, formState } = formMethod;
  const { errors } = formState;
  return (
    <Section>
      <SectionHero>
        <SectionTitle>Integration lead</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Controller
          control={control}
          name={FIELD_NAME.INTEGRATION_LEAD_NAME}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.INTEGRATION_LEAD_NAME}
              error={Boolean(errors.integrationLead?.name)}
              helperText={errors.integrationLead?.name?.message as string}
              isFilled={Boolean(field.value)}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.INTEGRATION_LEAD_EMAIL}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.INTEGRATION_LEAD_EMAIL}
              error={Boolean(errors.integrationLead?.email)}
              helperText={errors.integrationLead?.email?.message as string}
              isFilled={Boolean(field.value)}
            />
          )}
        />
      </SectionCard>
    </Section>
  );
};
