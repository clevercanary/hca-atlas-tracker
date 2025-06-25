import { NetworkKey } from "../../apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../common/entities";
import { EntrySheetValidationResponse } from "./hca-validation-tools";

interface EntrySheetValidationRequestBody {
  bionetwork: NetworkKey;
  sheet_id: string;
}

export async function fetchEntrySheetValidationResults(
  googleSheetId: string,
  bioNetwork: NetworkKey
): Promise<EntrySheetValidationResponse> {
  const validationApiUrl = process.env.HCA_VALIDATION_TOOLS_URL;
  if (!validationApiUrl)
    throw new Error("HCA_VALIDATION_TOOLS_URL not specified in environment");
  const body: EntrySheetValidationRequestBody = {
    bionetwork: bioNetwork,
    sheet_id: googleSheetId,
  };
  return await (
    await fetch(validationApiUrl, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      method: METHOD.POST,
    })
  ).json();
}
