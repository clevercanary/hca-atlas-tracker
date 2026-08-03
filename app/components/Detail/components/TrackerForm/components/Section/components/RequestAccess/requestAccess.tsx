import {
  Section,
  SectionHero,
  SectionText,
} from "@/app/components/Detail/components/TrackerForm/components/Section/section.styles";
import { type JSX, type ReactNode } from "react";

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
