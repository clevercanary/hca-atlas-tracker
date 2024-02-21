import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
} from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { NextApiRequest, NextApiResponse } from "next";

const testAtlases: Record<number, HCAAtlasTrackerAtlas> = {
  0: {
    atlasTitle: "The Foo Atlas",
    bioNetwork: "Musculoskeletal",
    integrationLead: "Foof Oofoo",
    publication: "Foofoo et al.",
    status: ATLAS_STATUS.PUBLISHED,
    version: "1.0",
  },
  1: {
    atlasTitle: "The Bar Atlas",
    bioNetwork: "Heart",
    integrationLead: "Barb Arbar",
    publication: "Barbar et al.",
    status: ATLAS_STATUS.DRAFT,
    version: "2.0",
  },
  3: {
    atlasTitle: "The Baz Atlas",
    bioNetwork: "Adipose",
    integrationLead: "Bazb Azbaz",
    publication: "Bazbaz et al.",
    status: ATLAS_STATUS.PRIVATE,
    version: "3.0",
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  res.json(testAtlases);
}
