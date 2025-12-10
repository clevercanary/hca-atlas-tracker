import { createComponentAtlas } from "app/services/component-atlases";
import { endPgPool } from "app/services/database";
import { ATLAS_DRAFT, EMPTY_COMPONENT_INFO } from "testing/constants";
import { getAtlasFromDatabase, resetDatabase } from "testing/db-utils";
import { expectIsDefined } from "testing/utils";

jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config"
);
jest.mock("../app/services/hca-projects");
jest.mock("../app/services/cellxgene");
jest.mock("../app/utils/pg-app-connect-config");

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  endPgPool();
});

describe("createComponentAtlas", () => {
  it("throws error when creating component atlas for non-existent atlas", async () => {
    await expect(
      createComponentAtlas("ea885ef9-54ae-42c7-8a7a-75c32e4703a6")
    ).rejects.toThrow();
  });

  it("creates component atlas with empty values in component info", async () => {
    const result = await createComponentAtlas(ATLAS_DRAFT.id);

    expect(result).toBeDefined();
    expect(result.component_info).toEqual(EMPTY_COMPONENT_INFO);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();

    const atlas = await getAtlasFromDatabase(ATLAS_DRAFT.id);
    if (!expectIsDefined(atlas)) return;
    expect(atlas.component_atlases).toContain(result.id);
  });
});
