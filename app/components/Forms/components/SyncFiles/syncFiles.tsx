import { ButtonPrimary } from "@databiosphere/findable-ui/lib/components/common/Button/components/ButtonPrimary/buttonPrimary";
import { METHOD } from "../../../../common/entities";
import { useAdminAction } from "../../../../hooks/useAdminAction";
import { AdminFormErrors } from "../../../common/AdminForm/components/AdminFormErrors/adminFormErrors";

export const SyncFilesForm = (): JSX.Element => {
  const {
    errors: syncErrors,
    isRequesting: syncIsRequesting,
    onAction: onSync,
    requestCompleted: syncStarted,
  } = useAdminAction("/api/sync-files", METHOD.POST);

  return (
    <>
      <div>
        <ButtonPrimary
          disabled={syncIsRequesting}
          onClick={onSync}
          size="small"
        >
          Sync
        </ButtonPrimary>
      </div>
      {syncErrors || syncStarted ? (
        <div style={{ marginTop: "1em" }}>
          {syncErrors ? (
            <AdminFormErrors errors={syncErrors} />
          ) : syncStarted ? (
            "Sync started"
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </>
  );
};
