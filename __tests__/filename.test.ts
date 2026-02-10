import { stripVersionSuffix } from "../app/utils/filename";

describe("stripVersionSuffix", () => {
  it("should strip -r1 suffix from filename", () => {
    expect(stripVersionSuffix("foo-r1.h5ad")).toBe("foo.h5ad");
  });

  it("should strip -r2 suffix from filename", () => {
    expect(stripVersionSuffix("foo-r2.h5ad")).toBe("foo.h5ad");
  });

  it("should strip -r1-wip-2 suffix from filename", () => {
    expect(stripVersionSuffix("foo-r1-wip-2.h5ad")).toBe("foo.h5ad");
  });

  it("should strip -r2-wip-3 suffix from filename", () => {
    expect(stripVersionSuffix("bar-r2-wip-3.h5ad")).toBe("bar.h5ad");
  });

  it("should strip -r10-wip-99 suffix from filename", () => {
    expect(stripVersionSuffix("test-r10-wip-99.h5ad")).toBe("test.h5ad");
  });

  it("should not modify filename without version suffix", () => {
    expect(stripVersionSuffix("foo.h5ad")).toBe("foo.h5ad");
  });

  it("should not modify filename with version-like text in the middle", () => {
    expect(stripVersionSuffix("foo-r1-bar.h5ad")).toBe("foo-r1-bar.h5ad");
  });

  it("should handle filenames with hyphens", () => {
    expect(stripVersionSuffix("my-dataset-name-r1.h5ad")).toBe(
      "my-dataset-name.h5ad",
    );
  });

  it("should handle filenames with underscores", () => {
    expect(stripVersionSuffix("my_dataset_name-r3-wip-1.h5ad")).toBe(
      "my_dataset_name.h5ad",
    );
  });

  it("should not modify filenames without .h5ad extension", () => {
    expect(stripVersionSuffix("foo-r1.txt")).toBe("foo-r1.txt");
  });

  it("should only strip suffix immediately before .h5ad", () => {
    expect(stripVersionSuffix("dataset-r5.h5ad")).toBe("dataset.h5ad");
  });

  it("should not strip version-like text in the middle of filename", () => {
    // If there's text after -r1, it's part of the name, not a version suffix
    expect(stripVersionSuffix("foo-r1-bar-r2.h5ad")).toBe("foo-r1-bar.h5ad");
  });
});
