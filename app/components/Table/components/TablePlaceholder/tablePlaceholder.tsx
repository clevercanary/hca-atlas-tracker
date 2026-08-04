import { TypographyTextBody400 } from "@/app/components/common/Typography/components/TypographyTextBody400/typographyTextBody400";
import { type JSX, type ReactNode } from "react";
import { GridPaperSection } from "./tablePlaceholder.styles";

interface TablePlaceholderProps {
  canEdit?: boolean;
  message: ReactNode | ReactNode[];
  rowCount?: number;
}

export const TablePlaceholder = ({
  canEdit,
  message,
  rowCount = 0,
}: TablePlaceholderProps): JSX.Element | null => {
  if (canEdit || rowCount > 0) return null;
  return (
    <GridPaperSection>
      <TypographyTextBody400>{message}</TypographyTextBody400>
    </GridPaperSection>
  );
};
