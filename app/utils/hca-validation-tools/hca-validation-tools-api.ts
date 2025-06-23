import { METHOD } from "../../common/entities";
import { EntrySheetValidationResponse } from "./hca-validation-tools";

interface EntrySheetValidationRequestBody {
  sheet_id: string;
}

export async function fetchEntrySheetValidationResults(
  googleSheetId: string
): Promise<EntrySheetValidationResponse> {
  const validationApiUrl = process.env.HCA_VALIDATION_TOOLS_URL;
  if (!validationApiUrl)
    throw new Error("HCA_VALIDATION_TOOLS_URL not specified in environment");
  const body: EntrySheetValidationRequestBody = {
    sheet_id: googleSheetId,
  };
  return await (
    await fetch(validationApiUrl, {
      body: JSON.stringify(body),
      method: METHOD.POST,
    })
  ).json();
}
