import { type PathParameter } from "@/app/common/entities";
import { getAdminPageRedirect } from "@/app/routes/adminPageGuard";
import { UserView } from "@/app/views/UserView/userView";
import { type GetServerSideProps, type GetServerSidePropsContext } from "next";
import { type ParsedUrlQuery } from "querystring";
import { type JSX } from "react";

interface UserPageProps {
  pathParameter: PathParameter;
}

interface UserPageUrlParams extends ParsedUrlQuery {
  userId: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const redirect = await getAdminPageRedirect(context);
  if (redirect) return redirect;
  const { userId } = context.params as UserPageUrlParams;
  return {
    props: {
      pageTitle: "User",
      pathParameter: { userId: Number(userId) },
    },
  };
};

const AtlasPage = ({ pathParameter }: UserPageProps): JSX.Element => {
  return <UserView pathParameter={pathParameter} />;
};

export default AtlasPage;
