import { TEXT_BODY_400 } from "@clevercanary/data-explorer-ui/lib/theme/common/typography";
import { Typography } from "@mui/material";
import { ReactNode } from "react";

export interface TypographyTextBody400Props {
  children: ReactNode;
}

export const TypographyTextBody400 = ({
  children,
  ...props /* Spread props to allow for Mui TypographyProps specific prop overrides e.g. "variant". */
}: TypographyTextBody400Props): JSX.Element => {
  return (
    <Typography variant={TEXT_BODY_400} {...props}>
      {children}
    </Typography>
  );
};
