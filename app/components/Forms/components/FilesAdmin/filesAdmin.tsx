import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { BUTTON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/button";
import { METHOD } from "../../../../common/entities";
import { useAdminAction } from "../../../../hooks/useAdminAction";
import { AdminFormResults } from "../../../common/AdminForm/components/AdminFormResults/adminFormResults";

export const FilesAdminForm = (): JSX.Element => {
  const {
    errors: syncErrors,
    isRequesting: syncIsRequesting,
    onAction: onSync,
    requestCompleted: syncStarted,
  } = useAdminAction("/api/sync-files", METHOD.POST);

  const {
    errors: validateErrors,
    isRequesting: validateIsRequesting,
    onAction: onValidate,
    requestCompleted: validateStarted,
  } = useAdminAction("/api/validate-files", METHOD.POST);

  return (
    <>
      <h2>Sync files from S3</h2>
      <div>
        <ButtonPrimary
          disabled={syncIsRequesting}
          onClick={onSync}
          size={BUTTON_PROPS.SIZE.SMALL}
        >
          Sync
        </ButtonPrimary>
      </div>
      <AdminFormResults
        errors={syncErrors}
        success={syncStarted ? "Sync started" : null}
      />

      <h2>Validate all files</h2>
      <div>
        <ButtonPrimary
          disabled={validateIsRequesting}
          onClick={onValidate}
          size={BUTTON_PROPS.SIZE.SMALL}
        >
          Validate
        </ButtonPrimary>
      </div>
      <AdminFormResults
        errors={validateErrors}
        success={validateStarted ? "Validation started" : null}
      />
    </>
  );
};
