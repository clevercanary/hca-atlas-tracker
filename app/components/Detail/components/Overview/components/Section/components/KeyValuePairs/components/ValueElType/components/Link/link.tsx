import { LinkProps } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { Link as ValueElType } from "./link.styles";

export const Link = ({ ...linkProps }: LinkProps): JSX.Element => {
  return <ValueElType {...linkProps} />;
};
