import { SourceDatasetId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { SOURCE_DATASET } from "./constants";

export type QueryKey = [typeof SOURCE_DATASET, SourceDatasetId | undefined];
