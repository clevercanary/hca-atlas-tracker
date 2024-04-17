import { ReactNode } from "react";
import { Button, StartIcon } from "./buttonLink.styles";

/**
 * Basic button component for handling client-side navigation between routes.
 */

export enum BUTTON_COLOR {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

export enum BUTTON_VARIANT {
  OUTLINED = "outlined",
}

export interface ButtonLinkProps {
  children: ReactNode;
  className?: string;
  color?: BUTTON_COLOR;
  href: string;
  startIcon?: ReactNode;
  variant?: BUTTON_VARIANT;
}

export const ButtonLink = ({
  children,
  className,
  color = BUTTON_COLOR.PRIMARY,
  href,
  startIcon,
  variant,
}: ButtonLinkProps): JSX.Element => {
  return (
    <Button className={className} color={color} href={href} variant={variant}>
      {startIcon && <StartIcon>{startIcon}</StartIcon>}
      {children}
    </Button>
  );
};
