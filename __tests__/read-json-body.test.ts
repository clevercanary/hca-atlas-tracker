import { readJsonBody } from "@/app/common/utils";

/**
 * Builds a mock Response whose body is the given raw text.
 * @param text - Raw body text.
 * @returns mock response.
 */
function responseWithText(text: string): Response {
  return { text: async (): Promise<string> => text } as Response;
}

describe("readJsonBody", () => {
  it("parses a JSON body", async () => {
    await expect(readJsonBody(responseWithText('{"id":"a"}'))).resolves.toEqual(
      { id: "a" },
    );
  });

  it("reads an empty body as undefined", async () => {
    await expect(readJsonBody(responseWithText(""))).resolves.toBeUndefined();
  });

  it("parses a JSON null as null, not as an empty body", async () => {
    await expect(readJsonBody(responseWithText("null"))).resolves.toBeNull();
  });

  it("rejects a non-empty body that isn't JSON", async () => {
    await expect(
      readJsonBody(responseWithText("<html>")),
    ).rejects.toBeInstanceOf(SyntaxError);
  });
});
