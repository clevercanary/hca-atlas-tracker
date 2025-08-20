import { ReactNode } from "react";
import { TypographyTextBody400 } from "../../../common/Typography/components/TypographyTextBody400/typographyTextBody400";
import { GridPaperSection } from "./tablePlaceholder.styles";

interface TablePlaceholderProps {
  canEdit: boolean;
  message: ReactNode | ReactNode[];
  rowCount: number;
}

export const TablePlaceholder = ({
  canEdit,
  message,
  rowCount,
}: TablePlaceholderProps): JSX.Element | null => {
  if (canEdit && rowCount > 0) return null;
  return (
    <GridPaperSection>
      <TypographyTextBody400>{message}</TypographyTextBody400>
    </GridPaperSection>
  );
};
