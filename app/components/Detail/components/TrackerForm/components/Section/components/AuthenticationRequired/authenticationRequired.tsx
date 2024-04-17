import { ReactNode } from "react";
import { Section, SectionHero, SectionText } from "../../section.styles";

interface AuthenticationRequiredProps {
  children: ReactNode | ReactNode[];
  divider?: ReactNode;
}

export const AuthenticationRequired = ({
  children,
  divider,
}: AuthenticationRequiredProps): JSX.Element => {
  return (
    <Section>
      {divider}
      <SectionHero>
        <SectionText>{children}</SectionText>
      </SectionHero>
    </Section>
  );
};
