import { METHOD } from "@/app/common/entities";
import { AdminFormResults } from "@/app/components/common/AdminForm/components/AdminFormResults/adminFormResults";
import { useAdminAction } from "@/app/hooks/useAdminAction";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/constants";
import { BUTTON_PRESETS } from "@databiosphere/findable-ui/lib/contracts/mui/Button/presets";
import { Button } from "@mui/material";
import { type JSX } from "react";

export const FilesAdminForm = (): JSX.Element => {
  const {
    errors: validateErrors,
    isRequesting: validateIsRequesting,
    onAction: onValidate,
    requestCompleted: validateStarted,
  } = useAdminAction("/api/validate-files", METHOD.POST);

  return (
    <>
      <h2>Validate all files</h2>
      <div>
        <Button
          {...BUTTON_PRESETS.PRIMARY_CONTAINED}
          disabled={validateIsRequesting}
          onClick={onValidate}
          size={BUTTON_PROPS.SIZE.SMALL}
        >
          Validate
        </Button>
      </div>
      <AdminFormResults
        errors={validateErrors}
        success={validateStarted ? "Validation started" : null}
      />
    </>
  );
};
