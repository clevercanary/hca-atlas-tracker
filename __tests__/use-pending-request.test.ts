import { METHOD, type RequestFn } from "@/app/common/entities";
import { usePendingRequest } from "@/app/hooks/UsePendingRequest/hook";
import { renderHook } from "@testing-library/react";
import { act } from "react";

// Test data
const TEST_REQUEST_URL = "/api/test-resource";

describe("usePendingRequest", () => {
  it("reports the request in flight and resets on success", async () => {
    const [pending, settle] = deferredRequest(true);
    const { result } = renderHook(() => usePendingRequest(pending.onRequest));
    expect(result.current.isRequesting).toBe(false);

    let request: Promise<boolean> | undefined;
    act(() => {
      request = result.current.onRequest(
        TEST_REQUEST_URL,
        METHOD.DELETE,
        undefined,
      );
    });
    expect(result.current.isRequesting).toBe(true);

    await act(async () => {
      settle();
      await request;
    });

    expect(result.current.isRequesting).toBe(false);
  });

  it("resets the flag when the wrapped request rejects, and rethrows", async () => {
    // The flag is the only thing standing between a rejection and a control
    // disabled for the rest of the session. Nothing wired up today can reject
    // — every path bottoms out in `performRequest`, which never does — so this
    // guards the wrapper's contract for whatever is wrapped next.
    const error = new Error("wrapped request threw");
    const onRequest: RequestFn = () => Promise.reject(error);
    const { result } = renderHook(() => usePendingRequest(onRequest));

    await act(async () => {
      await expect(
        result.current.onRequest(TEST_REQUEST_URL, METHOD.DELETE, undefined),
      ).rejects.toThrow(error);
    });

    expect(result.current.isRequesting).toBe(false);
  });
});

/**
 * A request function that stays in flight until it is settled.
 * @param success - Value the request resolves to.
 * @returns the request function, and a function that settles it.
 */
function deferredRequest(
  success: boolean,
): [{ onRequest: RequestFn }, () => void] {
  let settle: () => void = () => undefined;
  const settled = new Promise<void>((resolve) => {
    settle = resolve;
  });
  return [
    { onRequest: (): Promise<boolean> => settled.then(() => success) },
    (): void => settle(),
  ];
}
