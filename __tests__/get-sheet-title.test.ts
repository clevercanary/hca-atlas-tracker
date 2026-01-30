import { InvalidSheetError } from "app/utils/google-sheets";
import { getSheetTitle } from "app/utils/google-sheets-api";
import { withConsoleErrorHiding } from "testing/utils";

jest.mock("googleapis");

describe("getSheetTitle", () => {
  it("throws InvalidSheetError when URL is not a Google Sheets URL", async () => {
    await expect(getSheetTitle("https://example.com")).rejects.toThrow(
      InvalidSheetError,
    );
  });

  it("throws InvalidSheetError when has no ID following `/d/`", async () => {
    await expect(
      getSheetTitle("https://docs.google.com/spreadsheets/d/"),
    ).rejects.toThrow(InvalidSheetError);
  });

  it("throws InvalidSheetError when sheet doesn't exist", async () => {
    await expect(
      getSheetTitle("https://docs.google.com/spreadsheets/d/nonexistent/edit"),
    ).rejects.toThrow(InvalidSheetError);
  });

  it("throws InvalidSheetError when sheet isn't shared", async () => {
    await expect(
      getSheetTitle(
        "https://docs.google.com/spreadsheets/d/sheet-unshared/edit",
      ),
    ).rejects.toThrow(InvalidSheetError);
  });

  it("returns null when credentials are missing", async () => {
    await withConsoleErrorHiding(async () => {
      const credentials = process.env.GOOGLE_SERVICE_ACCOUNT;
      process.env.GOOGLE_SERVICE_ACCOUNT = "";
      await expect(
        getSheetTitle("https://docs.google.com/spreadsheets/d/sheet-foo"),
      ).resolves.toBeNull();
      process.env.GOOGLE_SERVICE_ACCOUNT = credentials;
    });
  });

  it("returns sheet title for valid URL with nothing following ID", async () => {
    await expect(
      getSheetTitle("https://docs.google.com/spreadsheets/d/sheet-foo"),
    ).resolves.toEqual("Sheet Foo");
  });

  it("returns sheet title for valid URL with subpath following ID", async () => {
    await expect(
      getSheetTitle("https://docs.google.com/spreadsheets/d/sheet-foo/edit"),
    ).resolves.toEqual("Sheet Foo");
  });

  it("returns sheet title for valid URL with query string following ID", async () => {
    await expect(
      getSheetTitle("https://docs.google.com/spreadsheets/d/sheet-foo?gid=0"),
    ).resolves.toEqual("Sheet Foo");
  });

  it("returns sheet title for valid URL with fragment following ID", async () => {
    await expect(
      getSheetTitle("https://docs.google.com/spreadsheets/d/sheet-foo#gid=0"),
    ).resolves.toEqual("Sheet Foo");
  });

  it("returns sheet title for valid URL with subpath, query string, and fragment", async () => {
    await expect(
      getSheetTitle(
        "https://docs.google.com/spreadsheets/d/sheet-foo/edit?gid=0#gid=0",
      ),
    ).resolves.toEqual("Sheet Foo");
  });
});
