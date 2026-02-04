import { JSX, ReactNode } from "react";
import {
  Section,
  SectionHero,
  SectionText,
} from "../../../../../../Detail/components/TrackerForm/components/Section/section.styles";

interface AccessDeniedPromptProps {
  divider?: ReactNode;
  text?: ReactNode;
}

export const AccessDeniedPrompt = ({
  divider = null,
  text = "You do not have access to this feature.",
}: AccessDeniedPromptProps): JSX.Element => {
  return (
    <Section>
      {divider}
      <SectionHero fullWidth>
        <SectionText>{text}</SectionText>
      </SectionHero>
    </Section>
  );
};
