import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { JSX, ReactNode } from "react";
import { ROUTE } from "../../../../../../../routes/constants";
import {
  Section,
  SectionHero,
  SectionText,
} from "../../../../../../Detail/components/TrackerForm/components/Section/section.styles";

interface AccessPromptProps {
  divider?: ReactNode;
  text: ReactNode;
}

export const AccessPrompt = ({
  divider = null,
  text,
}: AccessPromptProps): JSX.Element => {
  return (
    <Section>
      {divider}
      <SectionHero fullWidth>
        <SectionText>
          <Link label="Sign in" url={ROUTE.LOGIN} /> {text}.
        </SectionText>
      </SectionHero>
    </Section>
  );
};
