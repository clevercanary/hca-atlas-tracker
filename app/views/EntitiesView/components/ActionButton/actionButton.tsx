import { JSX } from "react";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { Button, ButtonProps } from "@mui/material";
import { useFormManager } from "../../../../hooks/useFormManager/useFormManager";

export const ActionButton = (props: ButtonProps): JSX.Element | null => {
  const {
    access: { canEdit },
  } = useFormManager();

  if (!canEdit) return null;

  return <Button {...BUTTON_PROPS.PRIMARY_CONTAINED} {...props} />;
};
