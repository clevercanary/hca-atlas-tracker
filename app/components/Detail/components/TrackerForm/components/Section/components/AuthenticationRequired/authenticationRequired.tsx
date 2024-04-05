import { ReactNode } from "react";
import { Divider } from "../../../Divider/divider.styles";
import { Section, SectionHero, SectionText } from "../../section.styles";

interface AuthenticationRequiredProps {
  children: ReactNode | ReactNode[];
}

export const AuthenticationRequired = ({
  children,
}: AuthenticationRequiredProps): JSX.Element => {
  return (
    <Section>
      <Divider />
      <SectionHero>
        <SectionText>{children}</SectionText>
      </SectionHero>
    </Section>
  );
};
