import { Controller } from "react-hook-form";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../../../hooks/useForm/common/entities";
import { FIELD_NAME } from "../../../../../../../../../../../../views/SourceDatasetView/common/constants";
import { SourceDatasetEditData } from "../../../../../../../../../../../../views/SourceDatasetView/common/entities";
import { Input } from "../../../../../../../../../../../common/Form/components/Input/input";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../../../section.styles";
import { DEFAULT_INPUT_PROPS } from "../../../../common/constants";

export interface IdentifiersProps {
  formMethod: FormMethod<SourceDatasetEditData, HCAAtlasTrackerSourceDataset>;
}

export const Identifiers = ({ formMethod }: IdentifiersProps): JSX.Element => {
  const { control } = formMethod;
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
              readOnly={true}
            />
          )}
        />
        <Controller
          control={control}
          name={FIELD_NAME.CELLXGENE_COLLECTION_ID}
          render={({ field }): JSX.Element => {
            return (
              <Input
                {...field}
                {...DEFAULT_INPUT_PROPS.CELLXGENE_COLLECTION_ID}
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
