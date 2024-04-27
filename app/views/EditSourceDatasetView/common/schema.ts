import { object, string } from "yup";
import { newSourceDatasetSchema } from "../../../apis/catalog/hca-atlas-tracker/common/schema";

export const sourceDatasetEditSchema = newSourceDatasetSchema.concat(
  object({
    cellxgeneCollectionId: string().default("").notRequired(),
    hcaProjectId: string().default("").notRequired(),
    title: string().default("").required("Title is required"),
  })
);
