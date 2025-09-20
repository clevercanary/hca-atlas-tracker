import { useCallback, useState } from "react";
import { METHOD } from "../common/entities";
import { fetchResource } from "../common/utils";
import { FormResponseErrors } from "./useForm/common/entities";

interface UseAdminAction<T> {
  data: T | null;
  errors: FormResponseErrors | null;
  isRequesting: boolean;
  onAction: () => void;
  requestCompleted: boolean;
}

export function useAdminAction<T = never>(
  apiRoute: string,
  apiMethod: METHOD,
  getBody?: () => unknown
): UseAdminAction<T> {
  const [requestCompleted, setRequestCompleted] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [errors, setErrors] = useState<FormResponseErrors | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const onAction = useCallback(() => {
    (async (): Promise<void> => {
      try {
        setIsRequesting(true);
        const res = await fetchResource(apiRoute, apiMethod, getBody?.());
        if (200 <= res.status && res.status < 300) {
          const d = await getDataFromResponse<T>(res);
          setErrors(null);
          setRequestCompleted(true);
          setData(d);
        } else {
          setErrors(
            await res.json().catch(() => ({
              message: `Received ${res.status} ${res.statusText} response`,
            }))
          );
        }
      } catch (e) {
        setErrors({
          message: e instanceof Error ? e.message : String(e),
        });
      } finally {
        setIsRequesting(false);
      }
    })();
  }, [apiMethod, apiRoute, getBody]);

  return {
    data,
    errors,
    isRequesting,
    onAction,
    requestCompleted,
  };
}

async function getDataFromResponse<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (text.trim()) return JSON.parse(text);
  return null;
}
