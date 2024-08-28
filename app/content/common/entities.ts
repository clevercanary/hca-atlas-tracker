import { LayoutStyle } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/common/entities";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

export interface ContentProps {
  layoutStyle?: LayoutStyle;
  mdxSource: MDXRemoteSerializeResult | null;
  pageTitle: string;
  slug: string[] | null;
}
