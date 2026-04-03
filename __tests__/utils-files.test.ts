import { getFileBaseName, insertVersionInFilename } from "../app/utils/files";

describe("getFileBaseName", () => {
  it.each([
    {
      description: "plain filename",
      expected: "test-file.h5ad",
      filename: "test-file.h5ad",
    },
    {
      description: "revision and WIP suffix",
      expected: "cells.h5ad",
      filename: "cells-r1-wip-2.h5ad",
    },
    {
      description: "revision only suffix",
      expected: "data.h5ad",
      filename: "data-r2.h5ad",
    },
    {
      description: "revision, WIP, and edit suffix",
      expected: "cells.h5ad",
      filename: "cells-r1-wip-2-edit-2026-03-15-22-12-01.h5ad",
    },
    {
      description: "revision and edit suffix",
      expected: "data.h5ad",
      filename: "data-r2-edit-2026-03-15-22-12-01.h5ad",
    },
    {
      description: "edit only suffix",
      expected: "cells.h5ad",
      filename: "cells-edit-2026-03-15-22-12-01.h5ad",
    },
    {
      description: "version and edit with freeform text suffix",
      expected: "cells.h5ad",
      filename: "cells-r1-wip-3-edit-fixed-normalization.h5ad",
    },
    {
      description: "version and edit with period in suffix",
      expected: "cells.h5ad",
      filename: "cells-r1-wip-3-edit-fixed.normalization.h5ad",
    },
    {
      description: "plain filename containing period",
      expected: "test.file.h5ad",
      filename: "test.file.h5ad",
    },
    {
      description: "revision and WIP suffix with filename containing period",
      expected: "test.file.h5ad",
      filename: "test.file-r2-wip-3.h5ad",
    },
    {
      description: "edit containing period with filename containing period",
      expected: "test.file.h5ad",
      filename: "test.file-edit-foo.bar.h5ad",
    },
  ])("returns base name for $description", ({ expected, filename }) => {
    expect(getFileBaseName(filename)).toEqual(expected);
  });

  it.each([
    {
      filename: "cells.h5ad",
      versionString: "r1-wip-2",
    },
    {
      filename: "test.file.h5ad",
      versionString: "r2-wip-3",
    },
    {
      filename: "test.file.foo.h5ad",
      versionString: "r3-wip-4",
    },
  ])(
    "reverses insertVersionInFilename for $filename version $versionString",
    ({ filename, versionString }) => {
      expect(
        getFileBaseName(insertVersionInFilename(filename, versionString)),
      ).toEqual(filename);
    },
  );
});

describe("insertVersionInFilename", () => {
  it.each([
    {
      expected: "cells-r1-wip-2.h5ad",
      filename: "cells.h5ad",
      versionString: "r1-wip-2",
    },
    {
      expected: "test.file-r2-wip-3.h5ad",
      filename: "test.file.h5ad",
      versionString: "r2-wip-3",
    },
    {
      expected: "test.file.foo-r3-wip-4.h5ad",
      filename: "test.file.foo.h5ad",
      versionString: "r3-wip-4",
    },
  ])(
    'inserts version before final period in "$filename"',
    ({ expected, filename, versionString }) => {
      expect(insertVersionInFilename(filename, versionString)).toEqual(
        expected,
      );
    },
  );
});
