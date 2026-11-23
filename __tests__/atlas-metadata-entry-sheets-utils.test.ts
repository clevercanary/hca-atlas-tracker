import { getRowId } from "@/app/views/AtlasMetadataEntrySheetsView/common/utils";

describe("getRowId", () => {
  it("returns the entry sheet ID", () => {
    expect(getRowId({ id: "entry-sheet-id" })).toBe("entry-sheet-id");
  });
});
