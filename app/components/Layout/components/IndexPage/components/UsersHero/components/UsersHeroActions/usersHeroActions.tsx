import { useFormManager } from "../../../../../../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../../../../../../routes/constants";
import { BUTTON_COLOR } from "../../../../../../../common/Button/components/ButtonLink/buttonLink";
import { Button } from "../../../Hero/components/HeroActions/heroActions.styles";

export const UsersHeroActions = (): JSX.Element | null => {
  const {
    access: { canEdit },
  } = useFormManager();
  return canEdit ? (
    <Button color={BUTTON_COLOR.PRIMARY} href={ROUTE.CREATE_USER}>
      Add User
    </Button>
  ) : null;
};
