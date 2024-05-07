import { useFormManager } from "../../../../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../../../../routes/constants";
import { BUTTON_COLOR } from "../../../../../common/Button/components/ButtonLink/buttonLink";
import { Button } from "./heroActions.styles";

export const HeroActions = (): JSX.Element | null => {
  const {
    access: { canEdit },
  } = useFormManager();
  return canEdit ? (
    <Button color={BUTTON_COLOR.PRIMARY} href={ROUTE.CREATE_ATLAS}>
      Add Atlas
    </Button>
  ) : null;
};
