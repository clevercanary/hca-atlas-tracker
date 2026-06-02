import { NotImplementedError } from "app/utils/api-errors";
import { METHOD } from "../../app/common/entities";
import { handler, method } from "../../app/utils/api-handler";

export default handler(method(METHOD.POST), async () => {
  throw new NotImplementedError(
    "S3 sync via this endpoint is disabled. File ingest is driven by " +
      "S3 event notifications (processS3NotificationMessage). This route " +
      "is preserved for possible future re-enablement.",
  );
});
