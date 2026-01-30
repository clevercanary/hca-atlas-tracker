import { JSX, ReactNode } from "react";
import { Section, SectionHero, SectionText } from "../../section.styles";

interface RequestAccessProps {
  children: ReactNode | ReactNode[];
  divider?: ReactNode;
}

export const RequestAccess = ({
  children,
  divider,
}: RequestAccessProps): JSX.Element => {
  return (
    <Section>
      {divider}
      <SectionHero fullWidth>
        <SectionText>{children}</SectionText>
      </SectionHero>
    </Section>
  );
};
