import { Controller } from "react-hook-form";
import { HCAAtlasTrackerAtlas } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../../../hooks/useFormManager/common/entities";
import { NewAtlasData } from "../../../../../../../../../../views/AddNewAtlasView/common/entities";
import { FIELD_NAME } from "../../../../../../../../../../views/AtlasView/common/constants";
import { AtlasEditData } from "../../../../../../../../../../views/AtlasView/common/entities";
import { Input } from "../../../../../../../../../common/Form/components/Input/input";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../section.styles";
import { DEFAULT_INPUT_PROPS } from "../../common/constants";

export interface IntegrationLeadProps {
  formManager: FormManager;
  formMethod:
    | FormMethod<AtlasEditData, HCAAtlasTrackerAtlas>
    | FormMethod<NewAtlasData>;
}

export const IntegrationLead = ({
  formManager,
  formMethod,
}: IntegrationLeadProps): JSX.Element => {
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const {
    control,
    formState: { errors },
  } = formMethod;
  return (
    <Section>
      <SectionHero>
        <SectionTitle>Integration lead</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Controller
          control={control}
          name={FIELD_NAME.INTEGRATION_LEAD_A_NAME}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.INTEGRATION_LEAD_A_NAME}
              error={Boolean(errors.integrationLeadA?.name)}
              helperText={errors.integrationLeadA?.name?.message as string}
              isFilled={Boolean(field.value)}
              readOnly={isReadOnly}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.INTEGRATION_LEAD_A_EMAIL}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.INTEGRATION_LEAD_A_EMAIL}
              error={Boolean(errors.integrationLeadA?.email)}
              helperText={errors.integrationLeadA?.email?.message as string}
              isFilled={Boolean(field.value)}
              readOnly={isReadOnly}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.INTEGRATION_LEAD_B_NAME}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.INTEGRATION_LEAD_B_NAME}
              error={Boolean(errors.integrationLeadB?.name)}
              helperText={errors.integrationLeadB?.name?.message as string}
              isFilled={Boolean(field.value)}
              readOnly={isReadOnly}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.INTEGRATION_LEAD_B_EMAIL}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.INTEGRATION_LEAD_B_EMAIL}
              error={Boolean(errors.integrationLeadB?.email)}
              helperText={errors.integrationLeadB?.email?.message as string}
              isFilled={Boolean(field.value)}
              readOnly={isReadOnly}
            />
          )}
        />
      </SectionCard>
    </Section>
  );
};
