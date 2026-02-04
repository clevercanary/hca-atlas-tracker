import { JSX } from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ParsedUrlQuery } from "querystring";
import { PathParameter } from "../../../../app/common/entities";
import { AddNewSourceStudyView } from "../../../../app/views/AddNewSourceStudyView/addNewSourceStudyView";

interface CreateSourceStudyPageUrlParams extends ParsedUrlQuery {
  atlasId: string;
}

interface CreateSourceStudyPageProps {
  pathParameter: PathParameter;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { atlasId } = context.params as CreateSourceStudyPageUrlParams;
  return {
    props: {
      pageTitle: "Add New Source Study",
      pathParameter: { atlasId },
    },
  };
};

const CreateSourceStudyPage = ({
  pathParameter,
}: CreateSourceStudyPageProps): JSX.Element => {
  return <AddNewSourceStudyView pathParameter={pathParameter} />;
};

export default CreateSourceStudyPage;
