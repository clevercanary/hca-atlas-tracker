import { useFormManager } from "@/app/hooks/useFormManager/useFormManager";
import { BUTTON_PRESETS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/presets";
import { Button, type ButtonProps } from "@mui/material";
import { type JSX } from "react";

export const ActionButton = (props: ButtonProps): JSX.Element | null => {
  const {
    access: { canEdit },
  } = useFormManager();

  if (!canEdit) return null;

  return <Button {...BUTTON_PRESETS.PRIMARY_CONTAINED} {...props} />;
};
