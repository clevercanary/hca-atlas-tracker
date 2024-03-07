import fsp from "fs/promises";
import path from "path";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
  HCAAtlasTrackerComponentAtlas,
  HCAAtlasTrackerSourceDataset,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { CXGCollection } from "./apis/cellxgene";
import { buildAtlasDescription } from "./build-atlas-description";
import { buildAtlasComponentAtlases } from "./build-component-atlases";
import { buildAtlasDatasets } from "./build-datasets";
import { AtlasBase } from "./entities";

const OUT_DIR = "./files/out";

const baseAtlases: AtlasBase[] = [
  {
    atlasKey: "lung-v1-0",
    atlasTitle: "The integrated Human Lung Cell Atlas (HLCA) v1.0",
    bioNetwork: "lung",
    code: "https://github.com/LungCellAtlas/HLCA",
    cxgCollectionId: "6f6d381a-7701-4781-935c-db10d30de293",
    integrationLead: "Malte D. Luecken",
    integrationLeadEmail: "malte.luecken@helmholtz-muenchen.de",
    networkCoordinator: {
      coordinatorNames: [
        "Pascal Barbry",
        "Alexander Misharin",
        "Martijn Nawijn",
        "Jay Rajagopal",
      ],
      email: "lung@humancellatlas.org",
    },
    publication: "Sikkema et al. (2023) Nat Med",
    publicationUrl: "https://www.nature.com/articles/s41591-023-02327-2",
    status: ATLAS_STATUS.PUBLISHED,
    version: "1.0",
  },
];

buildCatalog();

async function buildCatalog(): Promise<void> {
  console.log("Building catalog");

  console.log("Getting CELLxGENE collections");

  const cxgCollections = await getCxgCollections();

  console.log("Building entities");

  const atlases: HCAAtlasTrackerAtlas[] = [];
  const componentAtlases: HCAAtlasTrackerComponentAtlas[] = [];
  const sourceDatasets: HCAAtlasTrackerSourceDataset[] = [];

  for (const atlasBase of baseAtlases) {
    const atlas = {
      ...atlasBase,
      componentAtlases: await buildAtlasComponentAtlases(atlasBase),
      description: await buildAtlasDescription(atlasBase),
      sourceDatasets: await buildAtlasDatasets(atlasBase, cxgCollections),
    };
    atlases.push(atlas);
    componentAtlases.push(...atlas.componentAtlases);
    sourceDatasets.push(...atlas.sourceDatasets);
  }

  console.log("Writing output");

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

async function getCxgCollections(): Promise<CXGCollection[]> {
  return await (
    await fetch("https://api.cellxgene.cziscience.com/curation/v1/collections")
  ).json();
}
