import { ROLE } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { issueApiToken } from "@/app/services/api-tokens";
import { ForbiddenError } from "@/app/utils/api-errors";
import {
  getRegisteredActiveUser,
  handler,
  isApiTokenRequest,
  method,
  role,
} from "@/app/utils/api-handler";

/**
 * API route for issuing a read-only API token acting as the signed-in user.
 * Always issues the token for the session user, taking no user ID, and refuses
 * requests authenticated with an API token, so a token can't be used to mint
 * its own successors and extend itself indefinitely.
 */
export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    // Bearer POSTs are already refused as API tokens are read-only; this keeps
    // the refusal from depending on this route never opting in to them.
    if (isApiTokenRequest(req))
      throw new ForbiddenError("API tokens can't be used to issue API tokens");
    const user = await getRegisteredActiveUser(req, res);
    if (!user.can_issue_api_tokens)
      throw new ForbiddenError("API tokens are not enabled for your account");
    res
      .status(201)
      .json(await issueApiToken({ email: user.email, userId: user.id }));
  },
);
