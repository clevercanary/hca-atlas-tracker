import {
  AtlasId,
  FileId,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PRESIGNED_URL } from "./constants";

export type QueryKey = [
  typeof PRESIGNED_URL,
  AtlasId | undefined,
  FileId | undefined,
];
