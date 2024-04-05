import { ReactNode } from "react";
import { Button } from "./buttonLink.styles";

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
  href: string;
}

export const ButtonLink = ({
  children,
  className,
  color = BUTTON_COLOR.PRIMARY,
  href,
}: ButtonLinkProps): JSX.Element => {
  return (
    <Button className={className} color={color} href={href}>
      {children}
    </Button>
  );
};
