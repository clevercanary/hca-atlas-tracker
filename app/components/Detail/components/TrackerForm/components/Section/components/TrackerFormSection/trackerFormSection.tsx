import { ElementType, ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../hooks/useFormManager/common/entities";
import { ControllerConfig } from "../../../../../../../common/Form/components/Controllers/common/entities";
import { Controllers } from "../../../../../../../common/Form/components/Controllers/controllers";
import {
  Section,
  SectionCard as SectionContent,
  SectionHero,
  SectionText,
  SectionTitle,
} from "../../section.styles";
import { SlotProps } from "./common/utils";

export interface TrackerFormSectionProps<T extends FieldValues, R = undefined> {
  controllerConfigs: ControllerConfig<T>[];
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  SectionCard?: ElementType;
  sectionText?: ReactNode;
  sectionTitle: ReactNode;
  slotProps?: SlotProps;
}

export const TrackerFormSection = <T extends FieldValues, R = undefined>({
  controllerConfigs,
  formManager,
  formMethod,
  SectionCard = SectionContent,
  sectionText,
  sectionTitle,
  slotProps,
}: TrackerFormSectionProps<T, R>): JSX.Element => {
  const { section: { fullWidth = false } = {} } = slotProps || {};
  return (
    <Section fullWidth={fullWidth}>
      <SectionHero fullWidth={fullWidth}>
        <SectionTitle>{sectionTitle}</SectionTitle>
        {sectionText && <SectionText>{sectionText}</SectionText>}
      </SectionHero>
      <SectionCard fullWidth={fullWidth}>
        <Controllers
          controllerConfigs={controllerConfigs}
          formManager={formManager}
          formMethod={formMethod}
        />
      </SectionCard>
    </Section>
  );
};
