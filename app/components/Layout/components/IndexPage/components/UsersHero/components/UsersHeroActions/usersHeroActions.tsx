import { useFormManager } from "../../../../../../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../../../../../../routes/constants";
import { HeroButton } from "../../../HeroButton/heroButton";

export const UsersHeroActions = (): JSX.Element | null => {
  const {
    access: { canEdit },
  } = useFormManager();
  return canEdit ? (
    <HeroButton href={ROUTE.CREATE_USER}>Add User</HeroButton>
  ) : null;
};
