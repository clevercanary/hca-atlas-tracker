import { type ControllerConfig } from "@/app/components/common/Form/components/Controllers/common/entities";
import { Controllers } from "@/app/components/common/Form/components/Controllers/controllers";
import {
  SectionCard as DefaultSectionCard,
  Section,
  SectionHero,
  SectionText,
  SectionTitle,
} from "@/app/components/Detail/components/TrackerForm/components/Section/section.styles";
import { type SectionContent } from "@/app/components/Forms/common/entities";
import { type FormMethod } from "@/app/hooks/useForm/common/entities";
import { type FormManager } from "@/app/hooks/useFormManager/common/entities";
import { type ElementType, type JSX, type ReactNode } from "react";
import { type FieldValues } from "react-hook-form";
import { type SlotProps } from "./common/utils";

export interface TrackerFormSectionProps<
  T extends FieldValues,
  R = undefined,
  C extends ElementType = "input",
> {
  controllerConfigs?: ControllerConfig<T, R, C>[];
  formManager: FormManager;
  formMethod: FormMethod<T, R>;
  SectionCard?: SectionContent<T, R>;
  sectionText?: ReactNode;
  sectionTitle: ReactNode;
  slotProps?: SlotProps;
}

export const TrackerFormSection = <
  T extends FieldValues,
  R = undefined,
  C extends ElementType = "input",
>({
  controllerConfigs = [],
  formManager,
  formMethod,
  SectionCard = DefaultSectionCard,
  sectionText,
  sectionTitle,
  slotProps,
}: TrackerFormSectionProps<T, R, C>): JSX.Element => {
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
