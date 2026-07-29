import { EntityType } from "@/app/views/AtlasMetadataEntrySheetValidationView/components/ValidationReport/entities";
import { GridProps } from "@mui/material";

export const ENTITY_NAME: Record<EntityType | "entrySheet", string> = {
  dataset: "Datasets",
  donor: "Donors",
  entrySheet: "Entry Sheet",
  sample: "Samples",
};

export const GRID_PROPS: GridProps = {
  container: true,
  direction: "column",
  gap: 2,
};
