import { JSX } from "react";
import {
  Link,
  LinkProps,
} from "@databiosphere/findable-ui/lib/components/Links/components/Link/link";
import { LinksList } from "./linksCell.styles";

export interface LinksProps {
  links: LinkProps[];
}

export const LinksCell = ({ links }: LinksProps): JSX.Element => {
  return (
    <LinksList>
      {links.map(({ copyable, label, noWrap, target, url }, i) => {
        return (
          <Link
            key={`${i}_${url}`}
            copyable={copyable}
            label={label}
            noWrap={noWrap}
            target={target}
            url={url}
          />
        );
      })}
    </LinksList>
  );
};
