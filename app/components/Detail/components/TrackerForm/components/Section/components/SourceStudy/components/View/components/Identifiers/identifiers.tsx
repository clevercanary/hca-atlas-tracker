import { type HCAAtlasTrackerSourceStudy } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { Input } from "@/app/components/common/Form/components/Input/input";
import { TypographyNoWrap } from "@/app/components/common/Typography/components/TypographyNoWrap/typographyNoWrap";
import { DEFAULT_INPUT_PROPS } from "@/app/components/Detail/components/TrackerForm/components/Section/components/SourceStudy/common/constants";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "@/app/components/Detail/components/TrackerForm/components/Section/section.styles";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { PUBLICATION_STATUS } from "@/app/views/AddNewSourceStudyView/common/entities";
import { FIELD_NAME } from "@/app/views/SourceStudyView/common/constants";
import { type SourceStudyEditData } from "@/app/views/SourceStudyView/common/entities";
import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { Fragment, type JSX } from "react";
import { Controller } from "react-hook-form";

export interface IdentifiersProps {
  formManager: FormManager;
  formMethod: FormMethod<SourceStudyEditData, HCAAtlasTrackerSourceStudy>;
}

export const Identifiers = ({
  formManager,
  formMethod,
}: IdentifiersProps): JSX.Element => {
  const {
    formStatus: { isReadOnly },
  } = formManager;
  const {
    control,
    formState: { errors },
    watch,
  } = formMethod;
  const watchedFields = watch([FIELD_NAME.PUBLICATION_STATUS]);
  const [publicationStatus] = watchedFields;
  const isPublishedPreprint =
    publicationStatus === PUBLICATION_STATUS.PUBLISHED_PREPRINT;
  return (
    <Section>
      <SectionHero>
        <SectionTitle>Identifiers</SectionTitle>
      </SectionHero>
      <SectionCard elevation={0}>
        <Controller
          control={control}
          name={FIELD_NAME.HCA_PROJECT_ID}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.HCA_PROJECT_ID}
              error={Boolean(errors[FIELD_NAME.HCA_PROJECT_ID])}
              helperText={errors[FIELD_NAME.HCA_PROJECT_ID]?.message}
              isFilled={Boolean(field.value)}
              label={
                <Fragment>
                  <TypographyNoWrap>
                    {DEFAULT_INPUT_PROPS.HCA_PROJECT_ID.label}
                  </TypographyNoWrap>
                  {field.value && <Link label="Visit link" url={field.value} />}
                </Fragment>
              }
              readOnly={isReadOnly || isPublishedPreprint}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.CELLXGENE_COLLECTION_ID}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.CELLXGENE_COLLECTION_ID}
              error={Boolean(errors[FIELD_NAME.CELLXGENE_COLLECTION_ID])}
              helperText={errors[FIELD_NAME.CELLXGENE_COLLECTION_ID]?.message}
              isFilled={Boolean(field.value)}
              label={
                <Fragment>
                  <TypographyNoWrap>
                    {DEFAULT_INPUT_PROPS.CELLXGENE_COLLECTION_ID.label}
                  </TypographyNoWrap>
                  {field.value && <Link label="Visit link" url={field.value} />}
                </Fragment>
              }
              readOnly={isReadOnly || isPublishedPreprint}
            />
          )}
        />
      </SectionCard>
    </Section>
  );
};
