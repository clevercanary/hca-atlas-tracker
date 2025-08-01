import { useLayoutDimensions } from "@databiosphere/findable-ui/lib/providers/layoutDimensions/hook";
import { ReactNode } from "react";
import { Content as MDXContent } from "./content.styles";

export interface ContentProps {
  children: ReactNode | ReactNode[];
}

export const Content = ({ children }: ContentProps): JSX.Element => {
  const { dimensions } = useLayoutDimensions();
  return (
    <MDXContent headerHeight={dimensions.header.height}>{children}</MDXContent>
  );
};
