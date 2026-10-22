import {
  getUnlinkSuccessMessage,
  unlinkSourceDataset,
} from "@/app/views/IntegratedObjectSourceDatasetsView/components/Table/components/IconButton/hooks/UseUnlinkSourceDataset/utils";

const SOURCE_DATASET = {
  id: "source-dataset-id",
  title: "HGCA: James 2020 3p",
};
const INTEGRATED_OBJECT_TITLE = "Human Gut Cell Atlas (HGCA) v1 - Epithelial";
const SUCCESS_MESSAGE = `Unlinked ${SOURCE_DATASET.title} from ${INTEGRATED_OBJECT_TITLE}`;

describe("getUnlinkSuccessMessage", () => {
  it("names the source dataset and the integrated object", () => {
    expect(
      getUnlinkSuccessMessage(SOURCE_DATASET.title, INTEGRATED_OBJECT_TITLE),
    ).toBe(SUCCESS_MESSAGE);
  });

  it("names only the source dataset when the integrated object title is undefined", () => {
    expect(getUnlinkSuccessMessage(SOURCE_DATASET.title)).toBe(
      `Unlinked ${SOURCE_DATASET.title}`,
    );
  });

  it("names only the source dataset when the integrated object title is empty", () => {
    expect(getUnlinkSuccessMessage(SOURCE_DATASET.title, "")).toBe(
      `Unlinked ${SOURCE_DATASET.title}`,
    );
  });
});

describe("unlinkSourceDataset", () => {
  it("unlinks the one source dataset and confirms it, leaving the button disabled", async () => {
    // On success the row is removed by the refetch `onDelete` waited for, so
    // the pending flag is never cleared: re-enabling it would offer a second
    // unlink of a row that is on its way out.
    const onDelete = jest.fn().mockResolvedValue(true);
    const onOpenSuccess = jest.fn();
    const setIsPending = jest.fn();

    await unlinkSourceDataset(
      SOURCE_DATASET,
      INTEGRATED_OBJECT_TITLE,
      onDelete,
      onOpenSuccess,
      setIsPending,
    );

    expect(onDelete).toHaveBeenCalledWith({
      sourceDatasetIds: [SOURCE_DATASET.id],
    });
    expect(onOpenSuccess).toHaveBeenCalledTimes(1);
    expect(onOpenSuccess).toHaveBeenCalledWith(SUCCESS_MESSAGE);
    expect(setIsPending.mock.calls).toEqual([[true]]);
  });

  it("sets the pending flag before the request is made", async () => {
    const order: string[] = [];
    const onDelete = jest.fn(async () => {
      order.push("delete");
      return true;
    });
    const setIsPending = jest.fn((isPending: boolean) => {
      order.push(`pending:${isPending}`);
    });

    await unlinkSourceDataset(
      SOURCE_DATASET,
      INTEGRATED_OBJECT_TITLE,
      onDelete,
      jest.fn(),
      setIsPending,
    );

    expect(order).toEqual(["pending:true", "delete"]);
  });

  it("raises no confirmation on failure and re-enables the button for a retry", async () => {
    // The failure itself is raised on the error stack by the request layer.
    const onDelete = jest.fn().mockResolvedValue(false);
    const onOpenSuccess = jest.fn();
    const setIsPending = jest.fn();

    await unlinkSourceDataset(
      SOURCE_DATASET,
      INTEGRATED_OBJECT_TITLE,
      onDelete,
      onOpenSuccess,
      setIsPending,
    );

    expect(onOpenSuccess).not.toHaveBeenCalled();
    expect(setIsPending.mock.calls).toEqual([[true], [false]]);
  });
});
