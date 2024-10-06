import { useRouter } from "next/router";
import { useFormManager } from "../../../../../../../../hooks/useFormManager/useFormManager";
import { ROUTE } from "../../../../../../../../routes/constants";
import { HeroButton } from "../../../HeroButton/heroButton";

export const HeroActions = (): JSX.Element | null => {
  const { asPath } = useRouter();
  const {
    access: { canEdit },
  } = useFormManager();
  return canEdit && asPath.startsWith(ROUTE.ATLASES) ? (
    <HeroButton href={ROUTE.CREATE_ATLAS}>Add Atlas</HeroButton>
  ) : null;
};
