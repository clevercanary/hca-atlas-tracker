import { type UserId } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type USER } from "./constants";

export type QueryKey = [typeof USER, UserId | undefined];
