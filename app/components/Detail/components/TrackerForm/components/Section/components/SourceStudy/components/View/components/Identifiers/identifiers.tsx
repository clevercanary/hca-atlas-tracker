import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { Fragment } from "react";
import { Controller } from "react-hook-form";
import { HCAAtlasTrackerSourceStudy } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { PUBLICATION_STATUS } from "../../../../../../../../../../../../views/AddNewSourceStudyView/common/entities";
import { FIELD_NAME } from "../../../../../../../../../../../../views/SourceStudyView/common/constants";
import { SourceStudyEditData } from "../../../../../../../../../../../../views/SourceStudyView/common/entities";
import { Input } from "../../../../../../../../../../../common/Form/components/Input/input";
import { TypographyNoWrap } from "../../../../../../../../../../../common/Typography/components/TypographyNoWrap/typographyNoWrap";
import { CapId } from "../../../../../../../../../../../Form/components/Input/components/CapId/capId";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../../../section.styles";
import { DEFAULT_INPUT_PROPS } from "../../../../common/constants";

export interface IdentifiersProps {
  formMethod: FormMethod<SourceStudyEditData, HCAAtlasTrackerSourceStudy>;
}

export const Identifiers = ({ formMethod }: IdentifiersProps): JSX.Element => {
  const { control, watch } = formMethod;
  const watchedFields = watch([FIELD_NAME.PUBLICATION_STATUS]);
  const [publicationStatus] = watchedFields;
  const isPublishedPreprint =
    publicationStatus === PUBLICATION_STATUS.PUBLISHED_PREPRINT;
  return (
    <Section>
      <SectionHero>
        <SectionTitle>Identifiers</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Controller
          control={control}
          name={FIELD_NAME.HCA_PROJECT_ID}
          render={({ field }): JSX.Element => (
            <Input
              {...field}
              {...DEFAULT_INPUT_PROPS.HCA_PROJECT_ID}
              isFilled={Boolean(field.value)}
              label={
                <Fragment>
                  <TypographyNoWrap>
                    {DEFAULT_INPUT_PROPS.HCA_PROJECT_ID.label}
                  </TypographyNoWrap>
                  {field.value && <Link label="Visit link" url={field.value} />}
                </Fragment>
              }
              readOnly={isPublishedPreprint}
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
              isFilled={Boolean(field.value)}
              label={
                <Fragment>
                  <TypographyNoWrap>
                    {DEFAULT_INPUT_PROPS.CELLXGENE_COLLECTION_ID.label}
                  </TypographyNoWrap>
                  {field.value && <Link label="Visit link" url={field.value} />}
                </Fragment>
              }
              readOnly={isPublishedPreprint}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.CAP_ID}
          render={({ field, fieldState: { error, invalid } }): JSX.Element => (
            <CapId
              {...field}
              {...DEFAULT_INPUT_PROPS.CAP_ID}
              error={invalid}
              helperText={error?.message}
              isFilled={Boolean(field.value)}
            />
          )}
        />
      </SectionCard>
    </Section>
  );
};
