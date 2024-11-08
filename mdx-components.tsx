import { MDXComponents } from "mdx/types";
import { Link } from "./app/components/Layout/components/Content/components/Link/link";
import * as C from "./app/components/index";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Alert: C.Alert,
    AlertText: C.AlertText,
    AlertTitle: C.AlertTitle,
    a: Link,
  };
}
