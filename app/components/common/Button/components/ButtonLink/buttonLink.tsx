import { ReactNode } from "react";
import { Button, StartIcon } from "./buttonLink.styles";

/**
 * Basic button component for handling client-side navigation between routes.
 */

export enum BUTTON_COLOR {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

export interface ButtonLinkProps {
  children: ReactNode;
  className?: string;
  color?: BUTTON_COLOR;
  disabled?: boolean;
  href: string;
  startIcon?: ReactNode;
}

export const ButtonLink = ({
  children,
  className,
  color = BUTTON_COLOR.PRIMARY,
  disabled = false,
  href,
  startIcon,
}: ButtonLinkProps): JSX.Element => {
  return (
    <Button className={className} color={color} disabled={disabled} href={href}>
      {startIcon && <StartIcon>{startIcon}</StartIcon>}
      {children}
    </Button>
  );
};
