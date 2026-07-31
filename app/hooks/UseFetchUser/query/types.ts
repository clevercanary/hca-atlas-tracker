import { UserId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { USER } from "./constants";

export type QueryKey = [typeof USER, UserId | undefined];
