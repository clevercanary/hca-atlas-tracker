import {
  ATLAS_STATUS,
  HCAAtlasTrackerAtlas,
} from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { NextApiRequest, NextApiResponse } from "next";

export const testAtlases: Record<number, HCAAtlasTrackerAtlas> = {
  0: {
    atlasTitle: "The Foo Atlas",
    bioNetwork: "musculoskeletal",
    integrationLead: "Foof Oofoo",
    publication: "Foofoo et al.",
    status: ATLAS_STATUS.PUBLISHED,
    version: "1.0",
  },
  1: {
    atlasTitle: "The Bar Atlas",
    bioNetwork: "heart",
    integrationLead: "Barb Arbar",
    publication: "Barbar et al.",
    status: ATLAS_STATUS.DRAFT,
    version: "2.0",
  },
  2: {
    atlasTitle: "The Baz Atlas",
    bioNetwork: "adipose",
    integrationLead: "Bazb Azbaz",
    publication: "Bazbaz et al.",
    status: ATLAS_STATUS.PUBLISHED,
    version: "3.0",
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  res.json(testAtlases);
}
