import { Title } from "@clevercanary/data-explorer-ui/lib/components/common/Title/title";
import { Fragment } from "react";
import { ROUTE_CREATE } from "../../../../constants/routes";
import { Button } from "./hero.styles";

export const Hero = (): JSX.Element => {
  return (
    <Fragment>
      <Title title="Manage Atlases" />
      <Button href={ROUTE_CREATE}>Add Atlas</Button>
    </Fragment>
  );
};
