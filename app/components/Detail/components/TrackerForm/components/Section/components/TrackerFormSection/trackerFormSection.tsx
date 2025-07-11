import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";
import { FormMethod } from "../../../../../../../../hooks/useForm/common/entities";
import { FormManager } from "../../../../../../../../hooks/useFormManager/common/entities";
import { ControllerConfig } from "../../../../../../../common/Form/components/Controllers/common/entities";
import { Controllers } from "../../../../../../../common/Form/components/Controllers/controllers";
import { SectionContent } from "../../../../../../../Forms/common/entities";
import {
  SectionCard as DefaultSectionCard,
  Section,
  SectionHero,
  SectionText,
  SectionTitle,
} from "../../section.styles";
import { SlotProps } from "./common/utils";

export interface TrackerFormSectionProps<T extends FieldValues, R = undefined> {
  controllerConfigs?: ControllerConfig<T, R>[];
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  SectionCard?: SectionContent<T, R>;
  sectionText?: ReactNode;
  sectionTitle: ReactNode;
  slotProps?: SlotProps;
}

export const TrackerFormSection = <T extends FieldValues, R = undefined>({
  controllerConfigs = [],
  formManager,
  formMethod,
  SectionCard = DefaultSectionCard,
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
      <SectionCard
        elevation={0}
        formManager={formManager}
        formMethod={formMethod}
        fullWidth={fullWidth}
      >
        <Controllers
          controllerConfigs={controllerConfigs}
          formManager={formManager}
          formMethod={formMethod}
        />
      </SectionCard>
    </Section>
  );
};
