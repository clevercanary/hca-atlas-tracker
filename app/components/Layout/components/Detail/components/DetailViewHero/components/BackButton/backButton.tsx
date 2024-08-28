import { SouthIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SouthIcon/southIcon";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { IconButton } from "../../../../../../../common/IconButton/iconButton";
import { HeroActions } from "./backButton.styles";

export const BackButton = (): JSX.Element => {
  const { asPath, push } = useRouter();
  const onNavigate = useCallback(
    () => push(getNextPath(asPath)),
    [asPath, push]
  );
  return (
    <HeroActions>
      <IconButton
        color="secondary"
        Icon={SouthIcon}
        size="medium"
        onClick={onNavigate}
      />
    </HeroActions>
  );
};

/**
 * Returns the next path to navigate to when the back button is clicked.
 * The back button will navigate to the parent path of the current path.
 * @param asPath - Current path.
 * @returns next path.
 */
function getNextPath(asPath: string): string {
  const path = asPath.split("/");
  path.pop();
  return path.join("/");
}
