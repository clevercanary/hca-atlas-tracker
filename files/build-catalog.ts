import fsp from "fs/promises";
import path from "path";
import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
} from "../app/apis/catalog/hca-atlas-tracker/common/entities";

const OUT_DIR = "./files/out";

const atlases: HCAAtlasTrackerAtlas[] = [
  {
    atlasTitle: "The Foo Atlas",
    bioNetwork: "musculoskeletal",
    integrationLead: "Foof Oofoo",
    publication: "Foofoo et al.",
    status: ATLAS_STATUS.PUBLISHED,
    version: "1.0",
  },
  {
    atlasTitle: "The Bar Atlas",
    bioNetwork: "heart",
    integrationLead: "Barb Arbar",
    publication: "Barbar et al.",
    status: ATLAS_STATUS.DRAFT,
    version: "2.0",
  },
  {
    atlasTitle: "The Baz Atlas",
    bioNetwork: "adipose",
    integrationLead: "Bazb Azbaz",
    publication: "Bazbaz et al.",
    status: ATLAS_STATUS.PUBLISHED,
    version: "3.0",
  },
];

buildCatalog();

async function buildCatalog(): Promise<void> {
  console.log("Building catalog");

  try {
    await fsp.mkdir(OUT_DIR);
  } catch (e) {
    // Assume it already exists
  }

  await fsp.writeFile(
    path.resolve(OUT_DIR, "atlases.json"),
    JSON.stringify(Object.fromEntries(atlases.entries()), undefined, 2)
  );

  console.log("Done");
}
