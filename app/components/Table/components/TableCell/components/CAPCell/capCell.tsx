import { Link } from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { type JSX } from "react";
import { type Props } from "./entities";
import { getLinkProps } from "./utils";

export const CAPCell = (props: Props): JSX.Element => {
  return <Link {...getLinkProps(props)} />;
};
