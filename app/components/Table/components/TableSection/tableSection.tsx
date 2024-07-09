import { ReactNode } from "react";
import { TypographyTextBody400 } from "../../../common/Typography/components/TypographyTextBody400/typographyTextBody400";
import { GridPaperSection } from "./tableSection.styles";

interface TableSectionProps {
  children: ReactNode | ReactNode[];
}

export const TableSection = ({ children }: TableSectionProps): JSX.Element => {
  return (
    <GridPaperSection>
      <TypographyTextBody400>{children}</TypographyTextBody400>
    </GridPaperSection>
  );
};
