import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/components/common/Button/constants";
import { Button, type ButtonProps } from "@mui/material";
import { type JSX } from "react";

export const ActionButton = (props: ButtonProps): JSX.Element | null => {
  const {
    access: { canEdit },
  } = useFormManager();

  if (!canEdit) return null;

  return <Button {...BUTTON_PROPS.PRIMARY_CONTAINED} {...props} />;
};
