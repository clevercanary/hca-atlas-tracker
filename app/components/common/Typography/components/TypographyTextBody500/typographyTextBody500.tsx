import { TEXT_BODY_500 } from "@clevercanary/data-explorer-ui/lib/theme/common/typography";
import { Typography } from "@mui/material";
import { ReactNode } from "react";

export interface TypographyTextBody500Props {
  children: ReactNode;
}

export const TypographyTextBody500 = ({
  children,
  ...props /* Spread props to allow for Mui TypographyProps specific prop overrides e.g. "variant". */
}: TypographyTextBody500Props): JSX.Element => {
  return (
    <Typography variant={TEXT_BODY_500} {...props}>
      {children}
    </Typography>
  );
};
