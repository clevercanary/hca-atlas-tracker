import { ReactNode } from "react";
import { SectionCard } from "../../section.styles";

interface ListSectionProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export const ListSection = ({
  children,
  fullWidth,
}: ListSectionProps): JSX.Element => {
  return (
    <SectionCard fullWidth={fullWidth} gridAutoFlow="dense">
      {children}
    </SectionCard>
  );
};
