import { getUnlinkSuccessMessage } from "@/app/views/IntegratedObjectSourceDatasetsView/components/Table/components/IconButton/utils";

describe("getUnlinkSuccessMessage", () => {
  it("names the source dataset and the integrated object", () => {
    expect(
      getUnlinkSuccessMessage(
        "HGCA: James 2020 3p",
        "Human Gut Cell Atlas (HGCA) v1 - Epithelial",
      ),
    ).toBe(
      "Unlinked HGCA: James 2020 3p from Human Gut Cell Atlas (HGCA) v1 - Epithelial",
    );
  });
});
