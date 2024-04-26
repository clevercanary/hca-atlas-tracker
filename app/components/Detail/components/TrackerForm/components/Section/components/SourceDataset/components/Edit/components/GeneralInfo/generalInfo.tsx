import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { Fragment } from "react";
import { Controller } from "react-hook-form";
import {
  DOI_STATUS,
  HCAAtlasTrackerSourceDataset,
} from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { getSourceDatasetCitation } from "../../../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { FIELD_NAME } from "../../../../../../../../../../../../views/EditSourceDatasetView/common/constants";
import { SourceDatasetEditData } from "../../../../../../../../../../../../views/EditSourceDatasetView/common/entities";
import { Input } from "../../../../../../../../../../../common/Form/components/Input/input";
import { Tabs } from "../../../../../../../Tabs/tabs";
import {
  Section,
  SectionHero,
  SectionTitle,
} from "../../../../../../section.styles";
import { DEFAULT_INPUT_PROPS } from "../../../../common/constants";
import { SectionCard, SectionContent } from "./generalInfo.styles";

export interface GeneralInfoProps {
  formMethod: FormMethod<SourceDatasetEditData, HCAAtlasTrackerSourceDataset>;
}

export const GeneralInfo = ({ formMethod }: GeneralInfoProps): JSX.Element => {
  const { control, data: sourceDataset, formState, getValues } = formMethod;
  const { errors } = formState;
  const { isPublished } = getValues();
  return (
    <Section>
      <SectionHero>
        <SectionTitle>General info</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Tabs
          tabs={[
            { disabled: !isPublished, label: "Published", value: 1 },
            { disabled: Boolean(isPublished), label: "Unpublished", value: 0 },
          ]}
          value={isPublished}
        />
        <SectionContent>
          {isPublished ? (
            <Fragment>
              <Controller
                control={control}
                key={FIELD_NAME.DOI}
                name={FIELD_NAME.DOI}
                render={({ field }): JSX.Element => (
                  <Input
                    {...field}
                    {...DEFAULT_INPUT_PROPS.DOI}
                    endAdornment={renderDoiEndAdornment(sourceDataset)}
                    error={Boolean(errors[FIELD_NAME.DOI])}
                    helperText={renderDoiHelperText(
                      sourceDataset,
                      errors[FIELD_NAME.DOI]?.message
                    )}
                    isFilled={Boolean(field.value)}
                    readOnly={true}
                  />
                )}
              />
              <Controller
                control={control}
                key={FIELD_NAME.TITLE}
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
            </Fragment>
          ) : (
            <Fragment>
              <Controller
                control={control}
                key={FIELD_NAME.REFERENCE_AUTHOR}
                name={FIELD_NAME.REFERENCE_AUTHOR}
                render={({ field }): JSX.Element => (
                  <Input
                    {...field}
                    {...DEFAULT_INPUT_PROPS.REFERENCE_AUTHOR}
                    error={Boolean(errors[FIELD_NAME.REFERENCE_AUTHOR])}
                    helperText={errors[FIELD_NAME.REFERENCE_AUTHOR]?.message}
                    isFilled={Boolean(field.value)}
                    readOnly={true}
                  />
                )}
              />
              <Controller
                control={control}
                key={FIELD_NAME.CONTACT_EMAIL}
                name={FIELD_NAME.CONTACT_EMAIL}
                render={({ field }): JSX.Element => (
                  <Input
                    {...field}
                    {...DEFAULT_INPUT_PROPS.CONTACT_EMAIL}
                    error={Boolean(errors[FIELD_NAME.CONTACT_EMAIL])}
                    helperText={errors[FIELD_NAME.CONTACT_EMAIL]?.message}
                    isFilled={Boolean(field.value)}
                    readOnly={true}
                  />
                )}
              />
              <Controller
                control={control}
                key={FIELD_NAME.TITLE}
                name={FIELD_NAME.TITLE}
                render={({ field }): JSX.Element => (
                  <Input
                    {...field}
                    {...DEFAULT_INPUT_PROPS.TITLE}
                    error={Boolean(errors[FIELD_NAME.TITLE])}
                    helperText={errors[FIELD_NAME.TITLE]?.message}
                    isFilled={Boolean(field.value)}
                    label="Working title"
                    readOnly={true}
                  />
                )}
              />
            </Fragment>
          )}
        </SectionContent>
      </SectionCard>
    </Section>
  );
};

/**
 * Renders the end adornment for the Publication DOI input.
 * @param sourceDataset - Source dataset.
 * @returns end adornment.
 */
function renderDoiEndAdornment(
  sourceDataset: HCAAtlasTrackerSourceDataset | undefined
): JSX.Element {
  if (sourceDataset?.doiStatus === DOI_STATUS.OK) {
    return <SuccessIcon color="success" fontSize="small" />;
  }
  return <ErrorIcon color="error" fontSize="small" />;
}

/**
 * Renders the helper text for the publication DOI input.
 * @param sourceDataset - Source dataset.
 * @param errorMessage - Error message.
 * @returns helper text.
 */
function renderDoiHelperText(
  sourceDataset: HCAAtlasTrackerSourceDataset | undefined,
  errorMessage: string | undefined
): string | undefined {
  if (errorMessage) return errorMessage;
  return getSourceDatasetCitation(sourceDataset);
}
