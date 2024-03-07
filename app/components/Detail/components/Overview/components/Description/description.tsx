import { SectionTitle } from "@clevercanary/data-explorer-ui/lib/components/common/Section/components/SectionTitle/sectionTitle";
import {
  Section,
  SectionContent,
} from "@clevercanary/data-explorer-ui/lib/components/common/Section/section.styles";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { MdxMarkdown } from "../../../../../common/MDXMarkdown/mdxMarkdown";
import { Description as FluidPaper, SectionText } from "./description.styles";

export interface OverviewDescriptionProps {
  description: MDXRemoteSerializeResult | null;
  title: string;
}

export const Description = ({
  description,
  title,
}: OverviewDescriptionProps): JSX.Element => {
  return (
    <FluidPaper>
      <Section>
        <SectionContent>
          <SectionTitle title={title} />
          <SectionText>
            <MdxMarkdown source={description} />
          </SectionText>
        </SectionContent>
      </Section>
    </FluidPaper>
  );
};
