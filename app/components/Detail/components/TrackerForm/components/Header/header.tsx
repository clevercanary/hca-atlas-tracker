import { Fade, Toolbar } from "@mui/material";
import { ReactNode } from "react";
import { AppBar } from "./header.styles";

interface HeaderProps {
  children: ReactNode;
  className?: string;
  isIn?: boolean;
}

export const Header = ({
  children,
  className,
  isIn = true,
}: HeaderProps): JSX.Element => {
  return (
    <Fade appear={false} in={isIn}>
      <AppBar className={className} component="div" position="fixed">
        <Toolbar>{children}</Toolbar>
      </AppBar>
    </Fade>
  );
};
