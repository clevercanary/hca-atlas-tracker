import { SectionCard } from "@/app/components/Detail/components/TrackerForm/components/Section/section.styles";
import { type JSX, type ReactNode } from "react";

interface ListSectionProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export const ListSection = ({
  children,
  fullWidth,
}: ListSectionProps): JSX.Element => {
  return (
    <SectionCard elevation={0} fullWidth={fullWidth} gridAutoFlow="dense">
      {children}
    </SectionCard>
  );
};
