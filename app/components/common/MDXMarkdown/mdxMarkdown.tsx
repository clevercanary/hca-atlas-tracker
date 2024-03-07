import { SectionDetailsEmpty } from "@clevercanary/data-explorer-ui/lib/components/common/Section/components/SectionDetailsEmpty/sectionDetailsEmpty";
import { Link } from "@clevercanary/data-explorer-ui/lib/components/Links/components/Link/link";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";

interface Props {
  fallbackText?: string; // Text to display when source is absent of a serialized result.
  source: MDXRemoteSerializeResult | null;
}

const components = { Link };

export const MdxMarkdown = ({ fallbackText, source }: Props): JSX.Element => {
  return source ? (
    <MDXRemote {...source} components={components}></MDXRemote>
  ) : (
    <SectionDetailsEmpty displayText={fallbackText} />
  );
};
