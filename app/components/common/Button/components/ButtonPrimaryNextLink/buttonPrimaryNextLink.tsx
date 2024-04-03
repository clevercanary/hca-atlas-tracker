import { ReactNode } from "react";
import { Button } from "./buttonPrimaryNextLink.styles";

export interface ButtonPrimaryNextLinkProps {
  children: ReactNode;
  className?: string;
  href: string;
}

export const ButtonPrimaryNextLink = ({
  children,
  className,
  href,
}: ButtonPrimaryNextLinkProps): JSX.Element => {
  return (
    <Button className={className} href={href}>
      {children}
    </Button>
  );
};
