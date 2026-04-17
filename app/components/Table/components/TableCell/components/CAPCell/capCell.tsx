import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { JSX } from "react";
import { Props } from "./entities";
import { getLinkProps } from "./utils";

export const CAPCell = (props: Props): JSX.Element => {
  return <Link {...getLinkProps(props)} />;
};
