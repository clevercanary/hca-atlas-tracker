import { Controller } from "react-hook-form";
import { HCAAtlasTrackerAtlas } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../../../../../hooks/useFormManager/common/entities";
import { FIELD_NAME } from "../../../../../../../../../../../../views/AtlasView/common/constants";
import { AtlasEditData } from "../../../../../../../../../../../../views/AtlasView/common/entities";
import { Input } from "../../../../../../../../../../../common/Form/components/Input/input";
import { BioNetwork } from "../../../../../../../../../../../Form/components/Select/components/BioNetwork/bioNetwork";
import { TargetCompletion } from "../../../../../../../../../../../Form/components/Select/components/TargetCompletion/targetCompletion";
import { Wave } from "../../../../../../../../../../../Form/components/Select/components/Wave/wave";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../../../section.styles";
import { DEFAULT_INPUT_PROPS } from "../../../../common/constants";

export interface GeneralInfoProps {
  formManager: FormManager;
  formMethod: FormMethod<AtlasEditData, HCAAtlasTrackerAtlas>;
}

export const GeneralInfo = ({
  formManager,
  formMethod,
}: GeneralInfoProps): JSX.Element => {
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
        <SectionTitle>General info</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Controller
          control={control}
          name={FIELD_NAME.SHORT_NAME}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.SHORT_NAME}
              error={Boolean(errors[FIELD_NAME.SHORT_NAME])}
              helperText={errors[FIELD_NAME.SHORT_NAME]?.message as string}
              isFilled={Boolean(field.value)}
              readOnly={isReadOnly}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.VERSION}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.VERSION}
              error={Boolean(errors[FIELD_NAME.VERSION])}
              helperText={errors[FIELD_NAME.VERSION]?.message as string}
              isFilled={Boolean(field.value)}
              readOnly={isReadOnly}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.BIO_NETWORK}
          render={({ field }): JSX.Element => (
            <BioNetwork
              {...field}
              {...DEFAULT_INPUT_PROPS.BIO_NETWORK}
              error={Boolean(errors[FIELD_NAME.BIO_NETWORK])}
              helperText={errors[FIELD_NAME.BIO_NETWORK]?.message as string}
              isFilled={Boolean(field.value)}
              readOnly={isReadOnly}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.WAVE}
          render={({ field }): JSX.Element => (
            <Wave
              {...field}
              {...DEFAULT_INPUT_PROPS.WAVE}
              error={Boolean(errors[FIELD_NAME.WAVE])}
              helperText={errors[FIELD_NAME.WAVE]?.message as string}
              isFilled={Boolean(field.value)}
              readOnly={isReadOnly}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.TARGET_COMPLETION}
          render={({ field }): JSX.Element => (
            <TargetCompletion
              {...field}
              {...DEFAULT_INPUT_PROPS.TARGET_COMPLETION}
              error={Boolean(errors[FIELD_NAME.TARGET_COMPLETION])}
              helperText={
                errors[FIELD_NAME.TARGET_COMPLETION]?.message as string
              }
              isFilled={Boolean(field.value)}
              readOnly={isReadOnly}
            />
          )}
        />
      </SectionCard>
    </Section>
  );
};
