import fs from "fs";
import matter from "gray-matter";
import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { serialize } from "next-mdx-remote/serialize";
import {
  LAYOUT_STYLE_NO_CONTRAST_DEFAULT,
  SERIALIZE_OPTIONS,
} from "./constants";
import {
  getContentPathname,
  getMarkdownPathname,
  getSlug,
  isContentPathnameExists,
} from "./contentPagesUtils";
import { ContentProps } from "./entities";

export async function getContentStaticProps(
  context: GetStaticPropsContext,
  pageTitle: string,
): Promise<GetStaticPropsResult<ContentProps>> {
  const slug = getSlug(context);
  const contentPathname = getContentPathname();
  if (
    !slug ||
    !contentPathname ||
    !isContentPathnameExists(contentPathname, slug)
  ) {
    return {
      notFound: true,
    };
  }
  const markdownPathname = getMarkdownPathname(contentPathname, slug);
  const markdownWithMeta = fs.readFileSync(markdownPathname, "utf-8");
  const { content } = matter(markdownWithMeta);
  const mdxSource = await serialize(content, SERIALIZE_OPTIONS);
  return {
    props: {
      layoutStyle: LAYOUT_STYLE_NO_CONTRAST_DEFAULT,
      mdxSource,
      pageTitle,
      slug,
    },
  };
}
