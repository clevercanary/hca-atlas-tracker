import { Fragment, useCallback, useState } from "react";
import { Controller } from "react-hook-form";
import { HCAAtlasTrackerSourceStudy } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../../../../../hooks/useFormManager/common/entities";
import { FIELD_NAME } from "../../../../../../../../../../../../views/AddNewSourceDatasetView/common/constants";
import {
  NewSourceDatasetData,
  PUBLICATION_STATUS,
} from "../../../../../../../../../../../../views/AddNewSourceDatasetView/common/entities";
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
  formManager: FormManager;
  formMethod: FormMethod<NewSourceDatasetData, HCAAtlasTrackerSourceStudy>;
}

export const GeneralInfo = ({
  formManager,
  formMethod,
}: GeneralInfoProps): JSX.Element => {
  const [publicationStatus, setPublicationStatus] =
    useState<PUBLICATION_STATUS>(PUBLICATION_STATUS.PUBLISHED);
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const {
    clearErrors,
    control,
    formState: { errors },
    setValue,
    watch,
  } = formMethod;
  const hasDoi = Boolean(watch(FIELD_NAME.DOI));

  // Callback to handle tab change; clears errors, sets publication status, and updates form value.
  const onTabChange = useCallback(
    (value: PUBLICATION_STATUS): void => {
      clearErrors();
      setPublicationStatus(value);
      setValue(FIELD_NAME.PUBLICATION_STATUS, value, { shouldDirty: false });
    },
    [clearErrors, setValue]
  );

  return (
    <Section>
      <SectionHero>
        <SectionTitle>General info</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Tabs
          onTabChange={onTabChange}
          tabs={getSectionTabs(hasDoi)}
          value={publicationStatus}
        />
        <SectionContent>
          {publicationStatus === PUBLICATION_STATUS.PUBLISHED ? (
            <Controller
              control={control}
              key={FIELD_NAME.DOI}
              name={FIELD_NAME.DOI}
              render={({ field }): JSX.Element => (
                <Input
                  {...field}
                  {...DEFAULT_INPUT_PROPS.DOI}
                  error={Boolean(errors[FIELD_NAME.DOI])}
                  helperText={errors[FIELD_NAME.DOI]?.message}
                  isFilled={Boolean(field.value)}
                  readOnly={isReadOnly}
                />
              )}
            />
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
                    readOnly={isReadOnly}
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
                    readOnly={isReadOnly}
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
                    readOnly={isReadOnly}
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
