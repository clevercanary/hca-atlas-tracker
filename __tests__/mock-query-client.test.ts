import { mockQueryClient } from "@/testing/query";
import { isPending } from "@/testing/utils";

describe("mockQueryClient", () => {
  it("tells apart keys that serialize identically", async () => {
    // `JSON.stringify` turns undefined into null, so a string-keyed resolver
    // map would let ["list", null] overwrite ["list", undefined] and leave the
    // first invalidation hanging forever.
    const { queryClient, resolve } = mockQueryClient();
    const withUndefined = queryClient.invalidateQueries({
      queryKey: ["list", undefined],
    });
    const withNull = queryClient.invalidateQueries({
      queryKey: ["list", null],
    });

    resolve(["list", null]);
    await expect(withNull).resolves.toBeUndefined();
    expect(await isPending(withUndefined)).toBe(true);

    resolve(["list", undefined]);
    await expect(withUndefined).resolves.toBeUndefined();
  });
});
