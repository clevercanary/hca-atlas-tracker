import { useAuthentication } from "@clevercanary/data-explorer-ui/lib/hooks/useAuthentication/useAuthentication";
import { ROUTE } from "../../../../../../constants/routes";
import { BUTTON_COLOR } from "../../../../../common/Button/components/ButtonLink/buttonLink";
import { Button } from "./heroActions.styles";

export const HeroActions = (): JSX.Element | null => {
  const { isAuthenticated } = useAuthentication();
  return isAuthenticated ? (
    <Button color={BUTTON_COLOR.PRIMARY} href={ROUTE.CREATE}>
      Add Atlas
    </Button>
  ) : null;
};
