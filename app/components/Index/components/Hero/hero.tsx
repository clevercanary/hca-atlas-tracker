import { Title } from "@clevercanary/data-explorer-ui/lib/components/common/Title/title";
import { Fragment } from "react";
import { HeroActions } from "./components/HeroActions/heroActions";

export const Hero = (): JSX.Element => {
  return (
    <Fragment>
      <Title title="Manage Atlases" />
      <HeroActions />
    </Fragment>
  );
};
