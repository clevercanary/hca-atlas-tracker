import { JSX } from "react";
import { Main } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/components/Main/main";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { MDXRemote } from "next-mdx-remote";
import { Content } from "../../app/components/Layout/components/Content/content";
import { MDX_COMPONENTS } from "../../app/content/common/constants";
import { getContentStaticProps } from "../../app/content/common/contentPages";

const slug = ["validating-atlas-source-study-list"];

export const getStaticProps: GetStaticProps = async () => {
  return getContentStaticProps(
    { params: { slug } },
    "Validating an Atlas's Source Study List",
  );
};

const ValidatingAtlasSourceStudyListPage = ({
  layoutStyle,
  mdxSource,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element => {
  return (
    <ContentView
      content={
        <Content>
          <MDXRemote {...mdxSource} components={MDX_COMPONENTS} />
        </Content>
      }
      layoutStyle={layoutStyle ?? undefined}
    />
  );
};

ValidatingAtlasSourceStudyListPage.Main = Main;

export default ValidatingAtlasSourceStudyListPage;
