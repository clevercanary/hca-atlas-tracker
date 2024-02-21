import { HCAAtlasTrackerAtlas } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { NextApiRequest, NextApiResponse } from "next";

const testAtlases: Record<number, HCAAtlasTrackerAtlas> = {
  0: {
    atlasTitle: "The Foo Atlas",
  },
  1: {
    atlasTitle: "The Bar Atlas",
  },
  3: {
    atlasTitle: "The Baz Atlas",
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  res.json(testAtlases);
}
