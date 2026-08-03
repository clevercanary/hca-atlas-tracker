import { METHOD } from "@/app/common/entities";
import { AdminFormResults } from "@/app/components/common/AdminForm/components/AdminFormResults/adminFormResults";
import { useAdminAction } from "@/app/hooks/useAdminAction";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
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
          color={BUTTON_PROPS.COLOR.PRIMARY}
          disabled={validateIsRequesting}
          onClick={onValidate}
          size={BUTTON_PROPS.SIZE.SMALL}
          variant={BUTTON_PROPS.VARIANT.CONTAINED}
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
