import { Error } from "@databiosphere/findable-ui/lib/components/Error/error";
import { config } from "app/config/config";
import { JSX } from "react";

const ServerErrorPage = (): JSX.Element => {
  const { redirectRootToPath } = config();
  return <Error rootPath={redirectRootToPath} />;
};

export default ServerErrorPage;
