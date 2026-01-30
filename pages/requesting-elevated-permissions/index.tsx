import { JSX } from "react";
import { Main } from "@databiosphere/findable-ui/lib/components/Layout/components/ContentLayout/components/Main/main";
import { ContentView } from "@databiosphere/findable-ui/lib/views/ContentView/contentView";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { MDXRemote } from "next-mdx-remote";
import { Content } from "../../app/components/Layout/components/Content/content";
import { MDX_COMPONENTS } from "../../app/content/common/constants";
import { getContentStaticProps } from "../../app/content/common/contentPages";

const slug = ["requesting-elevated-permissions"];

export const getStaticProps: GetStaticProps = async () => {
  return getContentStaticProps(
    { params: { slug } },
    "Requesting Elevated Permissions",
  );
};

const RequestingElevatedPermissionsPage = ({
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

RequestingElevatedPermissionsPage.Main = Main;

export default RequestingElevatedPermissionsPage;
