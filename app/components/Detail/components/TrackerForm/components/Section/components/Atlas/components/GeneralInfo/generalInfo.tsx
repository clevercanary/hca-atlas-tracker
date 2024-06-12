import { FieldValues } from "react-hook-form";
import { HCAAtlasTrackerAtlas } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FormMethod } from "../../../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../../../hooks/useFormManager/common/entities";
import { ControllerProps } from "../../../../../../../../../common/Form/components/Controller/common/entities";
import { Controller } from "../../../../../../../../../common/Form/components/Controller/controller";
import {
  Section,
  SectionCard,
  SectionHero,
  SectionTitle,
} from "../../../../section.styles";

export interface GeneralInfoProps<T extends FieldValues> {
  controllerConfigs: ControllerProps<T>[];
  formManager: FormManager;
  formMethod: FormMethod<T, HCAAtlasTrackerAtlas>;
}

export const GeneralInfo = <T extends FieldValues>({
  controllerConfigs,
  formManager,
  formMethod,
}: GeneralInfoProps<T>): JSX.Element => {
  return (
    <Section>
      <SectionHero>
        <SectionTitle>General info</SectionTitle>
      </SectionHero>
      <SectionCard>
        <Controller
          controllerConfigs={controllerConfigs}
          formManager={formManager}
          formMethod={formMethod}
        />
      </SectionCard>
    </Section>
  );
};
