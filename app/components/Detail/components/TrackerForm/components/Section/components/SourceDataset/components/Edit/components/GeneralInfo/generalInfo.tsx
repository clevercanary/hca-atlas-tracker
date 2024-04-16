import { ErrorIcon } from "@clevercanary/data-explorer-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@clevercanary/data-explorer-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { Controller } from "react-hook-form";
import { PUBLICATION_STATUS } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { SourceDatasetEditData } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/schema";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { Input } from "../../../../../../../../../../../common/Form/components/Input/input";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../../../section.styles";
import { DEFAULT_INPUT_PROPS, FIELD_NAME } from "../../../../common/constants";

export interface GeneralInfoProps {
  control: FormMethod<SourceDatasetEditData>["control"];
  formState: FormMethod<SourceDatasetEditData>["formState"];
  getValues: FormMethod<SourceDatasetEditData>["getValues"];
}

export const GeneralInfo = ({
  control,
  formState,
  getValues,
}: GeneralInfoProps): JSX.Element => {
  const { errors } = formState;
  const formValue = getValues();
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
              endAdornment={renderDoiEndAdornment(formValue)}
              error={Boolean(errors[FIELD_NAME.DOI])}
              helperText={renderDoiHelperText(
                formValue,
                errors[FIELD_NAME.DOI]?.message
              )}
              isFilled={Boolean(field.value)}
              readOnly={true}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.TITLE}
          render={({ field }): JSX.Element => {
            return (
              <Input
                {...field}
                {...DEFAULT_INPUT_PROPS.TITLE}
                error={Boolean(errors[FIELD_NAME.TITLE])}
                helperText={errors[FIELD_NAME.TITLE]?.message}
                isFilled={Boolean(field.value)}
                readOnly={true}
              />
            );
          }}
        />
      </SectionCard>
    </Section>
  );
};

/**
 * Renders the end adornment for the Publication DOI input.
 * @param value - Form value.
 * @returns end adornment.
 */
function renderDoiEndAdornment(value: SourceDatasetEditData): JSX.Element {
  if (value[FIELD_NAME.PUBLICATION_STATUS] === PUBLICATION_STATUS.OK) {
    return <SuccessIcon color="success" fontSize="small" />;
  }
  return <ErrorIcon color="error" fontSize="small" />;
}

/**
 * Renders the helper text for the publication DOI input.
 * @param value - Form value.
 * @param errorMessage - Error message.
 * @returns helper text.
 */
function renderDoiHelperText(
  value: SourceDatasetEditData,
  errorMessage: string | undefined
): string | undefined {
  if (errorMessage) return errorMessage;
  const citation = value[FIELD_NAME.CITATION];
  if (citation) {
    return citation;
  }
}
