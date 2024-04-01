import fsp from "fs/promises";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import path from "path";
import { AtlasBase } from "./entities";

const MDX_DIR = "files/mdx/descriptions/";

export async function buildAtlasDescription(
  atlasBase: AtlasBase
): Promise<MDXRemoteSerializeResult | null> {
  const { atlasKey } = atlasBase;
  // Read file.
  const file = await fsp.readFile(
    path.resolve(MDX_DIR, `${atlasKey}.mdx`),
    null
  );
  if (!file) {
    return null;
  }
  // Serialize buffer.
  return await serialize(file, {
    mdxOptions: { development: false }, // See https://github.com/hashicorp/next-mdx-remote/issues/307#issuecomment-1363415249 and https://github.com/hashicorp/next-mdx-remote/issues/307#issuecomment-1378362096.
  });
}
