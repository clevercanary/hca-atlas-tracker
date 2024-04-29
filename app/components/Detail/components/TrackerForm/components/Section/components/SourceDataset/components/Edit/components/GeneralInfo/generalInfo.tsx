import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import {
  DOI_STATUS,
  HCAAtlasTrackerSourceDataset,
} from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { getSourceDatasetCitation } from "../../../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { PUBLICATION_STATUS } from "../../../../../../../../../../../../views/AddNewSourceDatasetView/common/entities";
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
import { getSectionTabs } from "./common/utils";
import { SectionCard, SectionContent } from "./generalInfo.styles";

export interface GeneralInfoProps {
  formMethod: FormMethod<SourceDatasetEditData, HCAAtlasTrackerSourceDataset>;
  sdPublicationStatus: PUBLICATION_STATUS;
}

export const GeneralInfo = ({
  formMethod,
  sdPublicationStatus,
}: GeneralInfoProps): JSX.Element => {
  const [publicationStatus, setPublicationStatus] =
    useState<PUBLICATION_STATUS>(PUBLICATION_STATUS.PUBLISHED);
  const {
    clearErrors,
    control,
    data: sourceDataset,
    formState,
    setValue,
    watch,
  } = formMethod;
  const { errors } = formState;
  const hasDoi = Boolean(watch(FIELD_NAME.DOI));
  const isPublished = sdPublicationStatus === PUBLICATION_STATUS.PUBLISHED;

  // Callback to handle tab change; clears errors, sets publication status, and updates form value.
  const onTabChange = useCallback(
    (value: PUBLICATION_STATUS): void => {
      clearErrors();
      setPublicationStatus(value);
      setValue(FIELD_NAME.PUBLICATION_STATUS, value);
    },
    [clearErrors, setValue]
  );

  useEffect(() => {
    setPublicationStatus(sdPublicationStatus);
  }, [sdPublicationStatus]);

  return (
    <Section>
      <SectionHero>
        <SectionTitle>General info</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Tabs
          onTabChange={onTabChange}
          tabs={getSectionTabs(isPublished, hasDoi)}
          value={publicationStatus}
        />
        <SectionContent>
          {publicationStatus ? (
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
                    readOnly={isPublished}
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
): JSX.Element | undefined {
  switch (sourceDataset?.doiStatus) {
    case DOI_STATUS.DOI_NOT_ON_CROSSREF:
      return <ErrorIcon color="error" fontSize="small" />;
    case DOI_STATUS.NA:
      return;
    case DOI_STATUS.OK:
      return <SuccessIcon color="success" fontSize="small" />;
    default:
      return;
  }
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
