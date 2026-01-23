import { getRequestURL } from "app/common/utils";
import { API } from "../../../../apis/catalog/hca-atlas-tracker/common/api";
import {
  FETCH_STATUS,
  METHOD,
  PathParameter,
} from "../../../../common/entities";

/**
 * Starts the entry sheets sync process for an atlas.
 * @param pathParameter - Path parameter.
 * @returns Promise that resolves when the entry sheet sync process is started.
 */
export async function startAtlasEntrySheetsSync(
  pathParameter: PathParameter,
): Promise<void> {
  const res = await fetch(
    getRequestURL(API.ATLAS_ENTRY_SHEETS_SYNC, pathParameter),
    { method: METHOD.POST },
  );
  if (res.status !== FETCH_STATUS.ACCEPTED) {
    const responseText = await res.text();
    let responseError: unknown;
    try {
      responseError = new Error(JSON.parse(responseText).message);
    } finally {
      if (!responseError) responseError = new Error(responseText);
    }
    throw responseError;
  }
}
