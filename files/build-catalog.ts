import fsp from "fs/promises";
import path from "path";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { buildAtlasComponentAtlases } from "./build-component-atlases";
import { buildAtlasDatasets } from "./build-datasets";

const OUT_DIR = "./files/out";

const atlasesInfo: Omit<
  HCAAtlasTrackerAtlas,
  "componentAtlases" | "sourceDatasets"
>[] = [
  {
    atlasKey: "lung-v1-0",
    atlasTitle: "The integrated Human Lung Cell Atlas (HLCA) v1.0",
    bioNetwork: "lung",
    cxgId: "6f6d381a-7701-4781-935c-db10d30de293",
    datasetIds: [
      "01aacb68-4076-4fd9-9eb9-aba0f48c1b5a",
      "08fb10df-32e5-456c-9882-e33fcd49077a",
      "1538d572-bcb7-426b-8d2c-84f3a7f87bb0",
      "1c4cbdd4-33e3-4ded-ab43-5958de817123",
      "272b7602-66cd-4b02-a86b-2b7c9c51a9ea",
      "2f676143-80c2-4bc6-b7b4-2613fe0fadf0",
      "326b36bd-0975-475f-983b-56ddb8f73a4d",
      "34c9a62c-a610-4e31-b343-8fb7be676f8c",
      "453d7ee2-319f-496c-9862-99d397870b63",
      "457d0bfe-79e4-43f1-be5d-83bf080d809e",
      "4a95101c-9ffc-4f30-a809-f04518a23803",
      "58028aa8-0ed2-49ca-b60f-15e2ed5989d5",
      "5a54c617-0eed-486e-8c1a-8a8041fc1729",
      "61515820-5bb8-45d0-8d12-f0850222ecf0",
      "65cbfea5-5c54-4255-a1d0-14549a86a5c1",
      "6936da41-3692-46bb-bca1-cd0f507991e9",
      "92892ab2-1334-4b1c-9761-14f5a73548ea",
      "957261f7-2bd6-4358-a6ed-24ee080d5cfc",
      "b91c623b-1945-4727-b167-0a93027b0d3f",
      "bc5512cc-9544-4aa4-8b75-8af445ee2257",
      "c0518445-3b3b-49c6-b8fc-c41daa4eacba",
      "c16a754f-5da3-46ed-8c1e-6426af2ef625",
      "c1a9a93d-d9de-4e65-9619-a9cec1052eaa",
      "c4077b3c-5c98-4d26-a614-246d12c2e5d7",
      "daf9d982-7ce6-43f6-ab51-272577290606",
      "e526d91d-cf3a-44cb-80c5-fd7676b55a1d",
      "e5fe8274-3769-4d7d-aa35-6d33c226ab43",
      "ef1e3497-515e-4bbe-8d4c-10161854b699",
      "6735ff73-1a04-422e-b500-730202e46f8a",
    ],
    integrationLead: "",
    publication: "Sikkema et al. (2023) Nat Med",
    status: ATLAS_STATUS.PUBLISHED,
    version: "1.0",
  },
];

buildCatalog();

async function buildCatalog(): Promise<void> {
  console.log("Building catalog");

  const atlases: HCAAtlasTrackerAtlas[] = [];
  const componentAtlases: HCAAtlasTrackerComponentAtlas[] = [];
  const sourceDatasets: HCAAtlasTrackerSourceDataset[] = [];

  for (const atlasInfo of atlasesInfo) {
    const atlas = {
      ...atlasInfo,
      componentAtlases: await buildAtlasComponentAtlases(atlasInfo.cxgId),
      sourceDatasets: await buildAtlasDatasets(
        atlasInfo.atlasKey,
        atlasInfo.datasetIds
      ),
    };
    atlases.push(atlas);
    componentAtlases.push(...atlas.componentAtlases);
    sourceDatasets.push(...atlas.sourceDatasets);
  }

  try {
    await fsp.mkdir(OUT_DIR);
  } catch (e) {
    // Assume it already exists
  }

  await fsp.writeFile(
    path.resolve(OUT_DIR, "atlases.json"),
    JSON.stringify(Object.fromEntries(atlases.entries()), undefined, 2)
  );

  await fsp.writeFile(
    path.resolve(OUT_DIR, "component-atlases.json"),
    JSON.stringify(Object.fromEntries(componentAtlases.entries()), undefined, 2)
  );

  await fsp.writeFile(
    path.resolve(OUT_DIR, "source-datasets.json"),
    JSON.stringify(Object.fromEntries(sourceDatasets.entries()), undefined, 2)
  );

  console.log("Done");
}
