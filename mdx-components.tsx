import { MDXComponents } from "mdx/types";
import * as C from "./app/components";
import { getContentURL } from "./app/content/common/utils";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: ({ children, href }) =>
      C.Link({ label: children, url: getContentURL(href) }),
  };
}
