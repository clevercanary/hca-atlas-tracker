import { Fade, Toolbar } from "@mui/material";
import { ReactNode } from "react";
import { AppBar } from "./banner.styles";

interface BannerProps {
  children: ReactNode;
  className?: string;
  isIn: boolean;
}

export const Banner = ({
  children,
  className,
  isIn,
}: BannerProps): JSX.Element => {
  return (
    <Fade appear={false} in={isIn} unmountOnExit>
      <AppBar className={className} component="div" position="fixed">
        <Toolbar>{children}</Toolbar>
      </AppBar>
    </Fade>
  );
};
