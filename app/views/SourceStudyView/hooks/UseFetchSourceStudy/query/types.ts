import { SourceStudyId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { SOURCE_STUDY } from "./constants";

export type QueryKey = [typeof SOURCE_STUDY, SourceStudyId | undefined];
