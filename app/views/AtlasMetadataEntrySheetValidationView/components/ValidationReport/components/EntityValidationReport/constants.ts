import { GridProps } from "@mui/material";
import { EntityType } from "../../entities";

export const ENTITY_NAME: Record<EntityType, string> = {
  dataset: "Datasets",
  donor: "Donors",
  sample: "Samples",
};

export const GRID_PROPS: GridProps = {
  container: true,
  direction: "column",
  gap: 2,
};
