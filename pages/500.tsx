import { Error } from "@databiosphere/findable-ui/lib/components/Error/error";
import { ROUTE } from "app/routes/constants";
import { JSX } from "react";

const ServerErrorPage = (): JSX.Element => {
  return <Error rootPath={ROUTE.ATLASES} />;
};

export default ServerErrorPage;
