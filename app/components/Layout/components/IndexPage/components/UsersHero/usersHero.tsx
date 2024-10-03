import { Title } from "@databiosphere/findable-ui/lib/components/common/Title/title";
import { Fragment } from "react";
import { UsersHeroActions } from "./components/UsersHeroActions/usersHeroActions";

export const UsersHero = (): JSX.Element => {
  return (
    <Fragment>
      <Title title="Team" />
      <UsersHeroActions />
    </Fragment>
  );
};
